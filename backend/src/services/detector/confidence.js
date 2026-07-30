import { predictClass, predictProbabilities } from './classifier.js';

/**
 * Map probabilities to a single confidence score for the winning label.
 */
export function computeConfidence(probabilities, prediction) {
  const raw = probabilities[prediction] ?? 0;
  const sorted = Object.values(probabilities).sort((a, b) => b - a);
  const margin = sorted[0] - (sorted[1] ?? 0);
  const confidence = Math.min(0.99, raw * 0.7 + margin * 0.3 + 0.15);
  return Number(confidence.toFixed(3));
}

export function aiProbability(probabilities) {
  return Number((probabilities.ai ?? 0).toFixed(3));
}
