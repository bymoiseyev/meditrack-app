import { request } from './request.js';

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
  return request<AiParseResult>('/api/ai/parse-order', {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
}
