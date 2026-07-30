import nlp from 'compromise';

export const AI_PHRASES = [
  'furthermore',
  'moreover',
  'in conclusion',
  'it is important to note',
  'overall',
  'significantly',
  'additionally',
  'consequently',
  'nevertheless',
  'thus',
  'hence',
  'in summary',
  'to summarize',
  'delve',
  'leverage',
  'passionate',
  'robust',
  'cutting-edge',
  'dynamic professional',
  'results-driven',
  'spearheaded',
  'testament',
  'tapestry',
  'pivotal',
  'transformative',
  'i am writing to express',
  'i am excited to apply',
  'thrilled to apply',
  'perfect fit',
  'unique opportunity',
];

const REPLACEMENTS = {
  furthermore: 'Also',
  moreover: 'On top of that',
  'in conclusion': 'To close',
  'it is important to note': '',
  overall: '',
  significantly: 'noticeably',
  additionally: 'Also',
  consequently: 'So',
  nevertheless: 'Still',
  thus: 'So',
  hence: 'So',
  'in summary': '',
  'to summarize': '',
  delve: 'look into',
  leverage: 'use',
  passionate: 'interested',
  robust: 'solid',
  'cutting-edge': 'modern',
  spearheaded: 'led',
  testament: 'sign',
  tapestry: 'mix',
  pivotal: 'key',
  transformative: 'major',
  'i am writing to express': "I'm reaching out about",
  'i am excited to apply': "I'd like to apply for",
  'thrilled to apply': "I'd like to apply for",
  'perfect fit': 'good match',
  'unique opportunity': 'role',
};

/**
 * Find AI-like phrases in text.
 */
export function findAiPhrases(text) {
  const lower = String(text || '').toLowerCase();
  const found = [];
  for (const phrase of AI_PHRASES) {
    if (lower.includes(phrase)) {
      found.push(phrase);
    }
  }
  return [...new Set(found)];
}

/**
 * Remove or replace common AI transition phrases.
 */
export function scrubAiPhrases(text) {
  let out = String(text || '');
  for (const [phrase, replacement] of Object.entries(REPLACEMENTS)) {
    const re = new RegExp(`\\b${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    out = out.replace(re, replacement);
  }
  return out
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([.,!?;:])/g, '$1')
    .replace(/^\s*[,.]\s*/gm, '')
    .trim();
}

/**
 * Grammar / structure analysis via compromise.
 */
export function analyzeGrammar(text) {
  const doc = nlp(String(text || ''));
  const sentences = doc.sentences().out('array');
  const passive = doc.sentences().filter((s) => s.has('#Passive')).length;
  const verbs = doc.verbs().length;
  const nouns = doc.nouns().length;

  return {
    sentenceCount: sentences.length,
    passiveVoiceRatio: sentences.length ? passive / sentences.length : 0,
    verbCount: verbs,
    nounCount: nouns,
    sentences,
  };
}
