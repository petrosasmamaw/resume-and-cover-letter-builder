import { GoogleGenerativeAI } from '@google/generative-ai';

const PLACEHOLDER_KEY = 'demo_gemini_key_replace_me';

const PRIMARY_MODEL = process.env.GEMINI_MODEL || 'gemini-3.1-pro-preview';
const FALLBACK_MODEL = 'gemini-flash-latest';

export function isPlaceholderGeminiKey() {
  const key = process.env.GEMINI_API_KEY;
  return !key || key === PLACEHOLDER_KEY;
}

export async function generateApplication({
  profile,
  jobDescription,
  jobTitle,
  companyName,
  coverLetterLength,
  outputMode = 'both',
  specialNotes = '',
}) {
  if (isPlaceholderGeminiKey()) {
    const err = new Error(
      'GEMINI_API_KEY is still the placeholder. Replace it in backend/.env with your real key from https://aistudio.google.com/apikey'
    );
    err.code = 'PLACEHOLDER_KEY';
    throw err;
  }

  const wantResume = outputMode === 'both' || outputMode === 'resume';
  const wantCover = outputMode === 'both' || outputMode === 'cover_letter';
  const notes = String(specialNotes || '').trim();

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const systemInstruction = `You are an expert executive resume writer and career coach. You write sharp, impact-driven resume content and cover letters that sound genuinely written by a human professional, NOT an AI.

STRICT WRITING RULES:
1. NEVER use AI fluff words or buzzwords, including: "spearheaded", "testament", "tapestry", "delve", "delved", "passionate", "synergy", "pivotal", "transformative", "beacon", "leverage" (as a verb), "robust", "cutting-edge", "dynamic professional", "results-driven professional".
2. Every resume bullet starts with a concrete action verb (e.g. "Built", "Managed", "Reduced", "Engineered", "Designed", "Automated", "Deployed").
3. Use the XYZ format for bullets where possible: "Accomplished [X], measured by [Y], by doing [Z]" — e.g. "Cut receipt-verification time from minutes to seconds by building an OCR/QR pipeline for Tamagn Check, now used by [N] verifications/month."
4. Vary sentence structure and length naturally — mix short punchy stats with slightly longer descriptive lines, the way a real person writing about their own work does. Do not make every bullet the same length or shape.
5. Keep tone professional, direct, and active. No poetic or overly formal phrasing.
6. Ground truth is the candidate profile PLUS any SPECIAL NOTES for this application. Prefer profile facts; if SPECIAL NOTES add or prioritize specific skills/experience for this one generation, follow them. Do not invent unrelated employers, fake metrics, or skills that are neither in the profile nor clearly stated in SPECIAL NOTES.`;

  const tasks = [];
  if (wantResume) {
    tasks.push(`RESUME TASKS:
1. Read the job description carefully and identify the concrete requirements: required skills, tools, responsibilities, and the underlying problem this role exists to solve for the company.
2. For each major requirement, find the candidate's closest real match from the profile data (exact tech match first, closest equivalent skill/experience second) and make sure that match is visible in the resume — don't just list skills, connect them to the requirement.
3. Select and reorder the candidate's real experience, projects, and skills to best match this specific job — leave out anything irrelevant to this particular application rather than including everything.
4. Naturally include keywords/terms from the job description where they genuinely match the candidate's real experience (for ATS matching) — never force a keyword that doesn't apply.
5. If SPECIAL NOTES are provided, apply them to this resume only (emphasize, omit, or include instructed items).
6. Write the RESUME content following all systemInstruction writing rules above.`);
  }
  if (wantCover) {
    tasks.push(`COVER LETTER TASKS:
Write the COVER LETTER as a direct pitch focused on the employer's problem, not a summary of the resume:
- Open by naming the specific problem/need implied by the job description (not "I am writing to express my interest").
- Explain how the candidate has already solved a similar problem, citing 1-2 specific real projects/experience from the profile with enough detail to be convincing (what was built, what tech, what outcome).
- Explain concretely how the candidate would approach this role's day-to-day responsibilities given their real skills/experience — not generic enthusiasm, actual reasoning about fit.
- Close with a short, confident call to action.
- Target length: approximately ${coverLetterLength} characters. Stay within about 10% of this target.
- If SPECIAL NOTES are provided, reflect them in the letter for this application only.`);
  }

  const outputShape = wantResume && wantCover
    ? `{
  "resume": {
    "headline": "role-specific headline",
    "summary": "2-3 sentence tailored summary",
    "skills": [{"category": "...", "items": ["...", "..."]}],
    "experience": [{"role": "...", "company": "...", "location": "...", "dates": "...", "bullets": ["...", "..."]}],
    "projects": [{"name": "...", "dates": "...", "bullets": ["...", "..."]}],
    "education": [{"institution": "...", "degree": "...", "field": "...", "start_date": "...", "end_date": "..."}],
    "certifications": [{"name": "...", "provider": "...", "issue_date": "..."}],
    "languages": ["English"],
    "achievements": ["optional real awards only if in profile"],
    "requirement_match": [
      {"requirement": "from job description", "candidate_match": "specific real skill/project that covers it"}
    ]
  },
  "cover_letter": "full plain-text cover letter"
}`
    : wantResume
      ? `{
  "resume": {
    "headline": "role-specific headline",
    "summary": "2-3 sentence tailored summary",
    "skills": [{"category": "...", "items": ["...", "..."]}],
    "experience": [{"role": "...", "company": "...", "location": "...", "dates": "...", "bullets": ["...", "..."]}],
    "projects": [{"name": "...", "dates": "...", "bullets": ["...", "..."]}],
    "education": [{"institution": "...", "degree": "...", "field": "...", "start_date": "...", "end_date": "..."}],
    "certifications": [{"name": "...", "provider": "...", "issue_date": "..."}],
    "languages": ["English"],
    "achievements": ["optional real awards only if in profile"],
    "requirement_match": [
      {"requirement": "from job description", "candidate_match": "specific real skill/project that covers it"}
    ]
  },
  "cover_letter": null
}`
      : `{
  "resume": null,
  "cover_letter": "full plain-text cover letter"
}`;

  const specialNotesBlock = notes
    ? `
SPECIAL NOTES FROM CANDIDATE (apply only to this generation — do not ignore):
"""
${notes}
"""
Use these notes to emphasize, de-emphasize, omit, or include specific skills/experience for this application.
`
    : `
SPECIAL NOTES FROM CANDIDATE: (none)
`;

  const prompt = `
CANDIDATE PROFILE (ground truth — use this as the main source of facts):
${JSON.stringify(profile)}

TARGET JOB:
Title: ${jobTitle}
Company: ${companyName}
Full job description: 
${jobDescription}
${specialNotesBlock}
OUTPUT MODE: ${outputMode}
Only produce the pieces required by this mode.

${tasks.join('\n\n')}

Output STRICT JSON only, no markdown, no preamble, in this shape:
${outputShape}`;

  const text = await generateWithModelFallback(genAI, {
    systemInstruction,
    prompt,
  });
  return parseJsonResponse(text);
}

function parseJsonResponse(text) {
  const cleaned = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  return JSON.parse(cleaned);
}

/**
 * Classify pasted free-form profile text into structured ResumeForge fields.
 * Does not invent facts — only extracts what is present in the paste.
 */
export async function parseProfileText(rawText) {
  if (isPlaceholderGeminiKey()) {
    const err = new Error(
      'GEMINI_API_KEY is still the placeholder. Replace it in backend/.env with your real key from https://aistudio.google.com/apikey'
    );
    err.code = 'PLACEHOLDER_KEY';
    throw err;
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const systemInstruction = `You extract structured resume/profile data from messy pasted text.
Rules:
- Only use facts explicitly present in the text. Never invent employers, dates, skills, metrics, or URLs.
- If a field is missing, use null (or [] for arrays).
- Normalize dates to YYYY-MM-DD when possible; otherwise keep the original string (e.g. "2022").
- For current roles, set end_date to null.
- Group skills into sensible categories (Frontend, Backend, Database, Auth, AI, DevOps, Tools, Soft Skills, etc.).
- Keep description fields as the person's real bullet points/notes, cleaned lightly for clarity but not rewritten into marketing fluff.
- Output STRICT JSON only — no markdown, no preamble.`;

  const prompt = `Parse the following pasted profile / resume / CV text into this exact JSON shape:

{
  "full_name": "string or null",
  "title": "string or null",
  "email": "string or null",
  "phone": "string or null",
  "location": "string or null",
  "linkedin_url": "string or null",
  "github_url": "string or null",
  "portfolio_url": "string or null",
  "summary": "string or null",
  "skills": [{"category": "Frontend", "name": "React"}],
  "experience": [{
    "role_title": "...",
    "company": "...",
    "location": "... or null",
    "start_date": "YYYY-MM-DD or year string or null",
    "end_date": "YYYY-MM-DD or year string or null",
    "description": "bullet notes / responsibilities"
  }],
  "projects": [{
    "name": "...",
    "url": "... or null",
    "description": "...",
    "tech_stack": ["React", "Node"]
  }],
  "education": [{
    "institution": "...",
    "degree": "...",
    "field": "...",
    "start_date": "...",
    "end_date": "..."
  }],
  "certifications": [{
    "name": "...",
    "provider": "...",
    "issue_date": "... or null",
    "expiry_date": "... or null",
    "credential_id": "... or null",
    "credential_url": "... or null"
  }]
}

PASTED TEXT:
"""
${rawText}
"""`;

  const text = await generateWithModelFallback(genAI, {
    systemInstruction,
    prompt,
  });
  return parseJsonResponse(text);
}

function shouldFallbackModel(error) {
  const msg = String(error?.message || '');
  return (
    msg.includes('[429') ||
    msg.toLowerCase().includes('quota exceeded') ||
    msg.toLowerCase().includes('not found') ||
    msg.toLowerCase().includes('no longer available')
  );
}

async function generateWithModelFallback(genAI, { systemInstruction, prompt }) {
  const primary = genAI.getGenerativeModel({
    model: PRIMARY_MODEL,
    systemInstruction,
  });
  try {
    const result = await primary.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    if (!shouldFallbackModel(error) || PRIMARY_MODEL === FALLBACK_MODEL) {
      throw error;
    }
    const fallback = genAI.getGenerativeModel({
      model: FALLBACK_MODEL,
      systemInstruction,
    });
    const result = await fallback.generateContent(prompt);
    return result.response.text();
  }
}

const CHAT_FAST_MODEL = process.env.GEMINI_CHAT_MODEL || FALLBACK_MODEL;
const CHAT_DEEP_MODEL = process.env.GEMINI_CHAT_FALLBACK_MODEL || PRIMARY_MODEL;

const RESUMEFORGE_PRODUCT_GUIDE = `RESUMEFORGE PRODUCT KNOWLEDGE (use when user asks how the app works or wants generate helpers):

Pages / flow:
1) Profile — user stores full_name, title, contact, summary, skills (by category), experience, projects, education, certifications. Can paste a CV and use AI parse to fill fields.
2) Generate — creates tailored resume and/or cover letter for ONE job using the saved profile + job title/company/description.
3) History — past generations; reopen, download PDF, humanize/detect cover letter.
4) Chat (you) — dual coach: (A) ResumeForge product guide + generation helpers, (B) general career/work talk not tied to the app.

Generate options the user can set:
- Output mode: both | resume only | cover letter only.
- Cover letter length presets: Short ~800, Medium ~1200, Long ~1600 characters.
- Resume template: "Modern single column" (color) or "Premium ATS" (simple) — both ATS-safe.
- Contact mode:
  • With contact — email, phone, address, LinkedIn, GitHub, portfolio on the resume.
  • Upwork-safe (no contact) — hides ALL contact channels (for marketplaces that ban off-site contact). Skills/experience/projects stay.
- Special notes (optional — this application only): free-text instructions injected into Gemini for THAT generation only. Use to emphasize/omit skills, highlight one job/project, add a skill for this application, exclude something, tone guidance, etc. Stored with the generation. Does NOT permanently change the Profile.

After generate:
- Preview resume + cover letter; download PDF.
- Humanize cover letter (local NLP pipeline) and AI-detect score — cover letter only.
- Requirement match list shows JD requirements vs candidate matches.

When to recommend features:
- User pastes a JD / wants tailored docs → Generate (+ offer Special notes if they want control).
- Marketplace / Upwork proposal → Upwork-safe contact + maybe cover_letter or proposal tone notes.
- Company/email apply → With contact + suitable template.
- Wants to tweak one application without editing Profile forever → Special notes.
- Cover letter feels robotic → Humanize on the generation result.
- Profile messy / pasted CV → Profile AI parse.
- Unsure fit → chat fit analysis using their profile + JD, then optional Special notes + Generate.

SPECIAL NOTES DRAFTING RULES (critical when user asks to create special notes):
- Output a ready-to-paste block under a clear heading like: Special notes (copy into Generate → Special notes).
- Ground every emphasize/omit instruction in the CANDIDATE PROFILE facts + the ACTIVE JOB CONTEXT / JD in the message. Do not invent employers, metrics, or skills.
- Prefer concrete bullets: what to EMPHASIZE (skills, one experience, projects), what to OMIT or de-emphasize, ATS keywords only if they truly match profile, cover-letter angle if relevant.
- Keep pasteable length ~800–2000 characters unless user asks otherwise.
- If profile or JD is missing, ask briefly for the missing piece OR draft using what you have and label assumptions.
- After the paste block, add 1–2 short lines: which Generate settings to pick (contact mode, output mode, template) when helpful.`;

function slimProfileForChat(profile) {
  if (!profile) return null;
  return {
    full_name: profile.full_name,
    title: profile.title,
    location: profile.location,
    summary: profile.summary,
    skills: (profile.skills || []).map((s) => ({
      category: s.category,
      name: s.name,
    })),
    experience: (profile.experience || []).map((e) => ({
      role_title: e.role_title,
      company: e.company,
      location: e.location,
      start_date: e.start_date,
      end_date: e.end_date,
      description: String(e.description || '').slice(0, 1200),
    })),
    projects: (profile.projects || []).map((p) => ({
      name: p.name,
      url: p.url,
      tech_stack: p.tech_stack,
      description: String(p.description || '').slice(0, 800),
    })),
    education: (profile.education || []).map((e) => ({
      institution: e.institution,
      degree: e.degree,
      field: e.field,
      start_date: e.start_date,
      end_date: e.end_date,
    })),
    certifications: (profile.certifications || []).map((c) => ({
      name: c.name,
      provider: c.provider,
      issue_date: c.issue_date,
    })),
  };
}

/**
 * Dual-mode ResumeForge + general career coach (fast Flash, optional Pro fallback).
 * messages: [{ role: 'user' | 'assistant', content: string }] — last must be user.
 */
export async function chatCareerCoach({
  messages,
  profile = null,
  jobTitle = '',
  companyName = '',
  jobDescription = '',
}) {
  if (isPlaceholderGeminiKey()) {
    const err = new Error(
      'GEMINI_API_KEY is still the placeholder. Replace it in backend/.env with your real key from https://aistudio.google.com/apikey'
    );
    err.code = 'PLACEHOLDER_KEY';
    throw err;
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const slim = slimProfileForChat(profile);

  const contextBits = [];
  if (slim) {
    contextBits.push(
      `CANDIDATE PROFILE (ground truth — never invent beyond this):\n${JSON.stringify(slim)}`
    );
  }
  if (jobTitle || companyName || jobDescription) {
    contextBits.push(`ACTIVE JOB CONTEXT (panel — may be empty; also read JDs pasted in chat):
Title: ${jobTitle || '(not set)'}
Company: ${companyName || '(not set)'}
Description:
${String(jobDescription || '(not set)').slice(0, 12000)}`);
  }

  const systemInstruction = `You are ResumeForge Assistant — a fast dual coach:
(1) Product expert for ResumeForge (features, settings, Special notes, contact/Upwork mode, templates, flow).
(2) Universal career coach (jobs, interviews, negotiations, career strategy) even when unrelated to ResumeForge.

Tone: direct, practical, short. Prefer bullets. No AI fluff ("synergy", "passionate", "delve", "testament", "leverage" as verb, etc.).

Speed rules:
- Answer in as few words as clarity allows (usually under ~200 words unless drafting Special notes or a longer deliverable).
- If the user asks to CREATE Special notes / generate helpers, deliver the paste-ready block immediately — do not over-explain first.
- If the question is general work advice with no app need, answer as a normal career coach — do not force ResumeForge features.

Mode detect:
- Product / generation requests ("special notes", "how do I generate", "Upwork", "template", "humanize", "what should I set") → use product knowledge + profile/JD.
- General career ("salary", "interview", "should I quit", workplace advice) → universal coach; mention ResumeForge only if it genuinely helps.

Grounding:
- Profile/experience facts come only from CANDIDATE PROFILE or what the user just typed.
- Match job requirements to real experience/projects/skills when recommending what to emphasize.

${RESUMEFORGE_PRODUCT_GUIDE}

${contextBits.length ? `\nLIVE CONTEXT:\n${contextBits.join('\n\n')}` : '\nLIVE CONTEXT: (no profile/job panel — ask if needed or use chat content)'}`;

  const normalized = [];
  for (const m of messages) {
    const role = m.role === 'assistant' || m.role === 'model' ? 'model' : 'user';
    const content = String(m.content || '').trim();
    if (!content) continue;
    if (normalized.length && normalized[normalized.length - 1].role === role) {
      normalized[normalized.length - 1].content += `\n\n${content}`;
    } else {
      normalized.push({ role, content });
    }
  }

  if (!normalized.length || normalized[normalized.length - 1].role !== 'user') {
    const err = new Error('Last chat message must be from the user');
    err.code = 'INVALID_CHAT';
    throw err;
  }

  while (normalized.length && normalized[0].role === 'model') {
    normalized.shift();
  }

  const lastUser = normalized[normalized.length - 1].content;
  const history = normalized.slice(0, -1).map((m) => ({
    role: m.role,
    parts: [{ text: m.content }],
  }));

  return chatWithModelFallback(genAI, {
    systemInstruction,
    history,
    message: lastUser,
  });
}

async function chatWithModelFallback(genAI, { systemInstruction, history, message }) {
  const generationConfig = {
    temperature: 0.55,
    maxOutputTokens: 1400,
  };

  async function run(modelName) {
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction,
      generationConfig,
    });
    const chat = model.startChat({ history });
    const result = await chat.sendMessage(message);
    return result.response.text();
  }

  // Prefer Flash for speed; fall back to Pro if Flash fails / quota issues
  try {
    return await run(CHAT_FAST_MODEL);
  } catch (error) {
    if (!shouldFallbackModel(error) || CHAT_FAST_MODEL === CHAT_DEEP_MODEL) {
      throw error;
    }
    return run(CHAT_DEEP_MODEL);
  }
}
