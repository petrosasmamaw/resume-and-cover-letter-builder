import nlp from 'compromise';
import { joinSentences } from './sentenceSplitter.js';

/**
 * Light grammar cleanup pass using compromise.
 */
export function grammarPass(text) {
  let out = String(text || '')
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,!?;:])/g, '$1')
    .replace(/([.!?])\s*([a-z])/g, (_, p, c) => `${p} ${c.toUpperCase()}`)
    .trim();

  const doc = nlp(out);
  out = doc.sentences().out('text');
  return joinSentences(
    out
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter(Boolean)
  );
}
