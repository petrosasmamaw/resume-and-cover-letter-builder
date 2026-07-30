import { syllable } from 'syllable';
import { tokenizeWords } from '../nlp/textUtils.js';
import { splitSentences } from './sentenceSplitter.js';

/**
 * Flesch Reading Ease (higher = easier).
 */
export function fleschReadingEase(text) {
  const sentences = splitSentences(text);
  const words = tokenizeWords(text);
  if (!sentences.length || !words.length) return 0;

  const syllables = words.reduce((sum, w) => sum + syllable(w), 0);
  const asl = words.length / sentences.length;
  const asw = syllables / words.length;
  const score = 206.835 - 1.015 * asl - 84.6 * asw;
  return Number(Math.max(0, Math.min(100, score)).toFixed(1));
}

export function readabilityMetrics(text) {
  const words = tokenizeWords(text);
  const sentences = splitSentences(text);
  const syllables = words.reduce((sum, w) => sum + syllable(w), 0);

  return {
    fleschReadingEase: fleschReadingEase(text),
    avgSentenceLength: sentences.length
      ? Number((words.length / sentences.length).toFixed(2))
      : 0,
    avgSyllablesPerWord: words.length
      ? Number((syllables / words.length).toFixed(2))
      : 0,
    wordCount: words.length,
    sentenceCount: sentences.length,
  };
}
