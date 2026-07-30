import { RandomForestClassifier } from 'ml-random-forest';
import { featuresToVector } from './featureExtractor.js';

const LABELS = ['human', 'ai', 'humanized'];

let classifier = null;

function synthSample(kind) {
  const templates = {
    human: [0.4, 0.48, 0.62, 0.58, 0.08, 0.02, 0.04, 0.72, 0.57, 0.02, 0.2, 0.2, 0.45],
    ai: [0.6, 0.54, 0.48, 0.42, 0.18, 0.22, 0.03, 0.55, 0.21, 0.16, 0.025, 0.1, 0.3],
    humanized: [0.47, 0.5, 0.56, 0.52, 0.12, 0.08, 0.035, 0.65, 0.47, 0.06, 0.125, 0.2, 0.4],
  };
  return templates[kind].map((v) =>
    Math.max(0, Math.min(1, v + (Math.random() - 0.5) * 0.08))
  );
}

function bootstrapTrainingData() {
  const X = [];
  const y = [];
  for (let i = 0; i < 40; i++) {
    X.push(synthSample('human'));
    y.push(0);
    X.push(synthSample('ai'));
    y.push(1);
    X.push(synthSample('humanized'));
    y.push(2);
  }
  return { X, y };
}

function getClassifier() {
  if (classifier) return classifier;
  const { X, y } = bootstrapTrainingData();
  classifier = new RandomForestClassifier({ nEstimators: 25, seed: 42 });
  classifier.train(X, y);
  return classifier;
}

export function predictClass(vector) {
  const clf = getClassifier();
  const predictions = clf.predict([vector]);
  const labelIdx = predictions[0];
  return LABELS[labelIdx] ?? 'ai';
}

export function predictProbabilities(vector) {
  const clf = getClassifier();
  return {
    human: clf.predictProbability([vector], 0)[0] ?? 0,
    ai: clf.predictProbability([vector], 1)[0] ?? 0,
    humanized: clf.predictProbability([vector], 2)[0] ?? 0,
  };
}

export { LABELS };
