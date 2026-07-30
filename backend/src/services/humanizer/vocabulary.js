import { contentWords, uniqueWordRatio } from '../nlp/textUtils.js';

const REPETITION_MAP = {
  experience: ['background', 'work', 'track record'],
  skills: ['strengths', 'capabilities'],
  team: ['group', 'crew'],
  project: ['initiative', 'build'],
  develop: ['build', 'create', 'shape'],
  implement: ['roll out', 'put in place', 'set up'],
  manage: ['run', 'oversee', 'handle'],
  improve: ['strengthen', 'tighten', 'raise'],
  work: ['collaborate', 'partner'],
  help: ['support', 'back'],
  use: ['apply', 'draw on'],
  good: ['strong', 'solid'],
  great: ['strong', 'useful'],
  important: ['key', 'central'],
  effectively: ['well', 'cleanly'],
};

/**
 * Lexical diversity score (type-token ratio on content words).
 */
export function lexicalDiversity(text) {
  const words = contentWords(text);
  if (!words.length) return 0;
  return new Set(words).size / words.length;
}

/**
 * Replace overused words with context-appropriate alternatives (one pass).
 */
export function diversifyVocabulary(text) {
  let out = String(text || '');
  const words = contentWords(out.toLowerCase());
  const freq = {};
  for (const w of words) {
    freq[w] = (freq[w] || 0) + 1;
  }

  for (const [word, count] of Object.entries(freq)) {
    if (count < 3 || !REPETITION_MAP[word]) continue;
    const alts = REPETITION_MAP[word];
    let altIdx = 0;
    const re = new RegExp(`\\b${word}\\b`, 'gi');
    let seen = 0;
    out = out.replace(re, (match) => {
      seen += 1;
      if (seen === 1) return match;
      const alt = alts[altIdx % alts.length];
      altIdx += 1;
      return match[0] === match[0].toUpperCase()
        ? alt.charAt(0).toUpperCase() + alt.slice(1)
        : alt;
    });
  }

  return out;
}

export function vocabularyMetrics(text) {
  return {
    lexicalDiversity: Number(uniqueWordRatio(text).toFixed(3)),
    contentLexicalDiversity: Number(lexicalDiversity(text).toFixed(3)),
  };
}
