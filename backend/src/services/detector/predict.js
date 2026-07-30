import { generateEmbedding } from './embedding.js';
import { predictClass, predictProbabilities } from './classifier.js';
import { computeConfidence, aiProbability } from './confidence.js';
import { burstinessMetrics } from '../humanizer/burstiness.js';
import { readabilityMetrics } from '../humanizer/readability.js';

/**
 * Run full detector pipeline on text.
 */
export function detectText(text) {
  const { features, vector } = generateEmbedding(text);
  const prediction = predictClass(vector);
  const probabilities = predictProbabilities(vector);
  const confidence = computeConfidence(probabilities, prediction);
  const burstiness = burstinessMetrics(text);
  const readability = readabilityMetrics(text);

  return {
    prediction,
    confidence,
    aiProbability: aiProbability(probabilities),
    probabilities,
    features,
    burstiness: {
      stdDev: burstiness.stdDev,
      avgLength: burstiness.avgLength,
      lengths: burstiness.lengths,
    },
    readability: {
      fleschReadingEase: readability.fleschReadingEase,
      avgSentenceLength: readability.avgSentenceLength,
    },
    perplexity: null,
  };
}
