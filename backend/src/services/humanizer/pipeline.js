import { scrubAiPhrases, findAiPhrases, analyzeGrammar } from './aiPatternDetector.js';
import { splitSentences, joinSentences } from './sentenceSplitter.js';
import { diversifyVocabulary, vocabularyMetrics } from './vocabulary.js';
import { applyBurstinessMix, burstinessMetrics } from './burstiness.js';
import { grammarPass } from './grammar.js';
import { readabilityMetrics } from './readability.js';
import { rewriteWithLlm } from './paraphraseEngine.js';
import { detectText } from '../detector/predict.js';

function semanticSimilarity(a, b) {
  const wordsA = new Set(String(a).toLowerCase().match(/\b[a-z']+\b/g) || []);
  const wordsB = new Set(String(b).toLowerCase().match(/\b[a-z']+\b/g) || []);
  if (!wordsA.size || !wordsB.size) return 0;
  let overlap = 0;
  for (const w of wordsA) {
    if (wordsB.has(w)) overlap += 1;
  }
  return Number((overlap / Math.max(wordsA.size, wordsB.size)).toFixed(3));
}

/**
 * Full humanizer pipeline for cover letters.
 */
export async function runHumanizerPipeline(text, context = {}) {
  const original = String(text || '').trim();
  if (!original) {
    const err = new Error('No cover letter text to humanize');
    err.code = 'EMPTY';
    throw err;
  }

  const beforeDetection = detectText(original);

  // Step 1–2: split
  let sentences = splitSentences(original);

  // Step 3: scrub AI phrases
  let working = scrubAiPhrases(original);
  const aiPhrasesFound = findAiPhrases(original);

  // Step 4: LLM rewrite
  working = await rewriteWithLlm(working, context);

  // Step 5: mix sentence lengths
  sentences = splitSentences(working);
  working = applyBurstinessMix(working);

  // Step 6: vocabulary diversification
  working = diversifyVocabulary(working);

  // Step 7: grammar pass
  working = grammarPass(working);

  // Step 8: readability metrics
  const readability = readabilityMetrics(working);
  const burstiness = burstinessMetrics(working);
  const vocabulary = vocabularyMetrics(working);
  const grammar = analyzeGrammar(working);

  const afterDetection = detectText(working);

  return {
    cover_letter: working,
    before: {
      detection: beforeDetection,
      burstiness: burstinessMetrics(original),
      readability: readabilityMetrics(original),
      vocabulary: vocabularyMetrics(original),
    },
    after: {
      detection: afterDetection,
      burstiness,
      readability,
      vocabulary,
      grammar,
    },
    metrics: {
      semanticSimilarity: semanticSimilarity(original, working),
      aiPhrasesRemoved: aiPhrasesFound,
      readability,
      burstiness,
      vocabulary,
    },
    passes: [
      'sentence_split',
      'ai_pattern_scrub',
      'llm_rewrite',
      'burstiness_mix',
      'vocabulary_diversify',
      'grammar_pass',
      'readability_score',
    ],
    improved: afterDetection.aiProbability < beforeDetection.aiProbability,
    engine: 'nlp_pipeline',
    warning: null,
  };
}
