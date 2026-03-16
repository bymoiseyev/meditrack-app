import OpenAI from 'openai';
import prisma from '../lib/prisma.js';

const apiKey = process.env.OPENAI_API_KEY;
export const openai = apiKey && apiKey !== 'your-openai-api-key-here'
  ? new OpenAI({ apiKey })
  : null;

export async function parseOrderText(text: string): Promise<{
  lines: { medicationId: number; name: string; quantity: number }[];
  careUnitId: number | null;
}> {
  if (!openai) throw new Error('not_configured');

  const [medications, careUnits] = await Promise.all([
    prisma.medication.findMany({ select: { id: true, name: true, form: true, strength: true } }),
    prisma.careUnit.findMany({ select: { id: true, name: true } }),
  ]);

  const medicationList = medications
    .map((m) => `ID ${m.id}: ${m.name} (${m.form}, ${m.strength})`)
    .join('\n');

  const careUnitList = careUnits
    .map((c) => `ID ${c.id}: ${c.name}`)
    .join('\n');

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `Du är en assistent för läkemedelsbeställningar på en vårdenhet i Sverige.
Din uppgift är att tolka fritext från en sjuksköterska och matcha mot tillgängliga läkemedel och vårdenheter.
Returnera ett JSON-objekt med:
- "lines": array där varje objekt har medicationId (number), name (string), quantity (number)
- "careUnitId": number om en vårdenhet nämns, annars null

Matcha bara mot läkemedel och vårdenheter som finns i listorna nedan. Om antal inte anges, använd 1.
Om inget läkemedel matchar, returnera { "lines": [], "careUnitId": null }.

Tillgängliga läkemedel:
${medicationList}

Tillgängliga vårdenheter:
${careUnitList}`,
      },
      {
        role: 'user',
        content: text.trim(),
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? '{"lines":[],"careUnitId":null}';

  let parsed: { lines: { medicationId: number; name: string; quantity: number }[]; careUnitId: number | null };
  try {
    parsed = JSON.parse(raw) as typeof parsed;
  } catch {
    throw new Error('invalid_json');
  }

  if (!Array.isArray(parsed.lines)) throw new Error('unexpected_shape');

  return { lines: parsed.lines, careUnitId: parsed.careUnitId ?? null };
}
