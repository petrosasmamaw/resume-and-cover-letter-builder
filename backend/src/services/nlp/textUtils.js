import natural from 'natural';
import { removeStopwords } from 'stopword';

const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;

export function tokenizeWords(text) {
  return tokenizer.tokenize(String(text || '').toLowerCase()) || [];
}

export function stem(word) {
  return stemmer.stem(word);
}

export function stemTokens(words) {
  return words.map((w) => stem(w));
}

export function contentWords(text) {
  const words = tokenizeWords(text);
  return removeStopwords(words);
}

export function countWords(text) {
  return tokenizeWords(text).length;
}

export function uniqueWordRatio(text) {
  const words = tokenizeWords(text);
  if (!words.length) return 0;
  return new Set(words).size / words.length;
}

export function punctuationFrequency(text) {
  const t = String(text || '');
  if (!t.length) return 0;
  const matches = t.match(/[.,!?;:—–-]/g);
  return (matches?.length || 0) / t.length;
}

export function contractionRate(text) {
  const words = tokenizeWords(text);
  if (!words.length) return 0;
  const contractions = words.filter((w) =>
    /^(i'm|you're|we're|they're|it's|that's|don't|can't|won't|i've|we've|i'd|we'd|isn't|aren't|wasn't|weren't)$/.test(
      w
    )
  );
  return contractions.length / words.length;
}
