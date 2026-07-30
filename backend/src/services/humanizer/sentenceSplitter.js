import { split } from 'sentence-splitter';

/**
 * Split text into sentence strings.
 */
export function splitSentences(text) {
  const input = String(text || '').trim();
  if (!input) return [];

  const nodes = split(input);
  return nodes
    .filter((n) => n.type === 'Sentence')
    .map((n) => n.raw.trim())
    .filter(Boolean);
}

/**
 * Join sentences back into a paragraph.
 */
export function joinSentences(sentences) {
  return sentences
    .map((s) => s.trim())
    .filter(Boolean)
    .join(' ')
    .replace(/\s+([.,!?;:])/g, '$1')
    .trim();
}
