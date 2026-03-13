const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

export interface AiOrderLine {
  medicationId: number;
  name: string;
  quantity: number;
}

export interface AiParseResult {
  lines: AiOrderLine[];
  careUnitId: number | null;
}

export async function parseOrderText(text: string): Promise<AiParseResult> {
  const res = await fetch(`${BASE}/api/ai/parse-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(body.error ?? `Request failed: ${res.status}`);
  }

  return res.json() as Promise<AiParseResult>;
}
