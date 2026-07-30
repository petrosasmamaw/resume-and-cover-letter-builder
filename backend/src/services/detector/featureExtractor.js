import winkNLP from 'wink-nlp';
import model from 'wink-eng-lite-web-model';
import { splitSentences } from '../humanizer/sentenceSplitter.js';
import { findAiPhrases, analyzeGrammar } from '../humanizer/aiPatternDetector.js';
import {
  tokenizeWords,
  uniqueWordRatio,
  punctuationFrequency,
  contractionRate,
  countWords,
} from '../nlp/textUtils.js';
import { burstinessMetrics } from '../humanizer/burstiness.js';
import { readabilityMetrics } from '../humanizer/readability.js';
import { lexicalDiversity } from '../humanizer/vocabulary.js';

const nlp = winkNLP(model);

/**
 * Extract stylometric features for ML classifier.
 */
export function extractFeatures(text) {
  const input = String(text || '').trim();
  const sentences = splitSentences(input);
  const words = tokenizeWords(input);
  const doc = nlp.readDoc(input);
  let entityCount = 0;
  try {
    entityCount = doc.entities().length();
  } catch {
    entityCount = 0;
  }
  const aiPhrases = findAiPhrases(input);
  const grammar = analyzeGrammar(input);
  const burstiness = burstinessMetrics(input);
  const readability = readabilityMetrics(input);

  const avgWordLength = words.length
    ? words.reduce((s, w) => s + w.length, 0) / words.length
    : 0;

  return {
    avgSentenceLength: sentences.length ? words.length / sentences.length : 0,
    avgWordLength,
    lexicalDiversity: uniqueWordRatio(input),
    contentLexicalDiversity: lexicalDiversity(input),
    passiveVoiceRatio: grammar.passiveVoiceRatio,
    transitionPhraseFrequency: aiPhrases.length / Math.max(sentences.length, 1),
    punctuationFrequency: punctuationFrequency(input),
    readabilityScore: readability.fleschReadingEase / 100,
    sentenceVariance: burstiness.stdDev,
    aiPhraseDensity: aiPhrases.length / Math.max(countWords(input), 1),
    contractionRate: contractionRate(input),
    entityCount: entityCount,
    verbNounRatio:
      grammar.nounCount > 0 ? grammar.verbCount / grammar.nounCount : 0,
  };
}

/**
 * Convert feature object to normalized vector for ML.
 */
export function featuresToVector(features) {
  return [
    Math.min(features.avgSentenceLength / 30, 1),
    Math.min(features.avgWordLength / 10, 1),
    features.lexicalDiversity,
    features.contentLexicalDiversity,
    features.passiveVoiceRatio,
    Math.min(features.transitionPhraseFrequency, 1),
    Math.min(features.punctuationFrequency * 20, 1),
    features.readabilityScore,
    Math.min(features.sentenceVariance / 15, 1),
    Math.min(features.aiPhraseDensity * 50, 1),
    features.contractionRate * 5,
    Math.min(features.entityCount / 10, 1),
    Math.min(features.verbNounRatio, 2) / 2,
  ];
}
