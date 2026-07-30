export { runHumanizerPipeline } from './pipeline.js';

import { runHumanizerPipeline } from './pipeline.js';

/**
 * Cover-letter humanizer entry point (resume is never modified).
 */
export async function humanizeCoverLetter(coverLetter, context = {}) {
  return runHumanizerPipeline(coverLetter, context);
}

export function isHumanizerReady() {
  return true;
}
