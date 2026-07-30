import { extractFeatures, featuresToVector } from './featureExtractor.js';

/**
 * Build embedding vector from stylometric features.
 */
export function generateEmbedding(text) {
  const features = extractFeatures(text);
  return {
    features,
    vector: featuresToVector(features),
  };
}
