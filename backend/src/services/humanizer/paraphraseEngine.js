import { GoogleGenerativeAI } from '@google/generative-ai';
import { isPlaceholderGeminiKey, generateWithModelFallback } from '../gemini.js';
import { splitSentences } from './sentenceSplitter.js';
import { findAiPhrases } from './aiPatternDetector.js';

/**
 * LLM-assisted rewrite — preserves meaning, varies rhythm, removes AI tells.
 */
export async function rewriteWithLlm(text, context = {}) {
  if (isPlaceholderGeminiKey()) {
    const err = new Error('GEMINI_API_KEY is required for the rewrite stage.');
    err.code = 'PLACEHOLDER_KEY';
    throw err;
  }

  const sentences = splitSentences(text);
  const aiPhrases = findAiPhrases(text);
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const systemInstruction = `You rewrite cover letters to sound naturally human-written.
Rules:
- Preserve every fact, employer name, skill, and metric exactly.
- Avoid AI clichés: passionate, leverage, delve, furthermore, moreover, robust, cutting-edge, transformative, spearheaded.
- Mix short and long sentences; use contractions where natural.
- Do not add markdown, headings, or commentary.
- Return ONLY the rewritten letter text.`;

  const prompt = `Rewrite this cover letter for a ${context.jobTitle || 'role'} at ${context.companyName || 'the company'}.

Sentences to rewrite (${sentences.length}):
${sentences.map((s, i) => `${i + 1}. ${s}`).join('\n')}

AI phrases detected (remove/replace): ${aiPhrases.join(', ') || 'none'}

Original full text:
"""
${text}
"""`;

  const result = await generateWithModelFallback(genAI, {
    systemInstruction,
    prompt,
  });
  const out = result
    .replace(/^```[\w]*\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  if (!out) {
    throw new Error('Rewrite engine returned empty text.');
  }
  return out;
}
