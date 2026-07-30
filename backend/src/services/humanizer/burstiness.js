import { tokenizeWords } from '../nlp/textUtils.js';
import { splitSentences, joinSentences } from './sentenceSplitter.js';

function sentenceWordCounts(sentences) {
  return sentences.map((s) => tokenizeWords(s).length);
}

function stdDev(nums) {
  if (!nums.length) return 0;
  const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
  const variance =
    nums.reduce((sum, n) => sum + (n - mean) ** 2, 0) / nums.length;
  return Math.sqrt(variance);
}

/**
 * Burstiness metrics — sentence-length variance.
 */
export function burstinessMetrics(text) {
  const sentences = splitSentences(text);
  const lengths = sentenceWordCounts(sentences);
  return {
    sentenceCount: sentences.length,
    avgLength: lengths.length
      ? Number((lengths.reduce((a, b) => a + b, 0) / lengths.length).toFixed(2))
      : 0,
    stdDev: Number(stdDev(lengths).toFixed(2)),
    lengths,
  };
}

/**
 * Mix sentence lengths by splitting long sentences and merging short ones.
 */
export function mixSentenceLengths(sentences) {
  if (sentences.length < 2) return sentences;

  const mixed = [];
  let i = 0;
  while (i < sentences.length) {
    const current = sentences[i];
    const words = tokenizeWords(current).length;
    const next = sentences[i + 1];
    const nextWords = next ? tokenizeWords(next).length : 0;

    // Merge two very short sentences
    if (words <= 6 && next && nextWords <= 8) {
      mixed.push(`${current.replace(/[.!?]$/, '')}, and ${next.charAt(0).toLowerCase()}${next.slice(1)}`);
      i += 2;
      continue;
    }

    // Split an overly long sentence at a natural comma/conjunction
    if (words > 28) {
      const parts = current.split(/,\s+(?=(?:and|but|which|who|where)\s)/i);
      if (parts.length > 1) {
        mixed.push(...parts.map((p, idx) => (idx < parts.length - 1 && !/[.!?]$/.test(p) ? `${p}.` : p)));
        i += 1;
        continue;
      }
    }

    mixed.push(current);
    i += 1;
  }

  return mixed;
}

export function applyBurstinessMix(text) {
  const sentences = splitSentences(text);
  const mixed = mixSentenceLengths(sentences);
  return joinSentences(mixed);
}
