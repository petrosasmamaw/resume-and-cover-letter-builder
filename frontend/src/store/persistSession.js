import { CHAT_WELCOME } from './chatSlice.js';

const STORAGE_KEY = 'resumeforge_session_v1';

function sanitizeGenerate(generate) {
  if (!generate || typeof generate !== 'object') return undefined;
  return {
    jobTitle: generate.jobTitle || '',
    companyName: generate.companyName || '',
    jobDescription: generate.jobDescription || '',
    coverLetterLength: Number(generate.coverLetterLength) || 1200,
    customLength: generate.customLength || '',
    outputMode: generate.outputMode || 'both',
    resumeTemplate: generate.resumeTemplate || 'color',
    includeContact: generate.includeContact !== false,
    specialNotes: generate.specialNotes || '',
    resume: generate.resume ?? null,
    coverLetter: generate.coverLetter || '',
    generationId: generate.generationId || null,
    humanizeStats: generate.humanizeStats ?? null,
    detectionStats: generate.detectionStats ?? null,
  };
}

function sanitizeChat(chat) {
  if (!chat || typeof chat !== 'object') return undefined;
  const messages = Array.isArray(chat.messages)
    ? chat.messages
        .filter(
          (m) =>
            m &&
            (m.role === 'user' || m.role === 'assistant') &&
            m.content
        )
        .slice(-80)
        .map((m) => ({ role: m.role, content: String(m.content) }))
    : [];
  return {
    messages: messages.length
      ? messages
      : [{ role: 'assistant', content: CHAT_WELCOME }],
    jobTitle: chat.jobTitle || '',
    companyName: chat.companyName || '',
    jobDescription: chat.jobDescription || '',
    showJob: Boolean(chat.showJob),
    profileMeta: chat.profileMeta || null,
  };
}

export function loadPersistedSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    const generate = sanitizeGenerate(parsed.generate);
    const chat = sanitizeChat(parsed.chat);
    const preloaded = {};
    if (generate) preloaded.generate = generate;
    if (chat) preloaded.chat = chat;
    return Object.keys(preloaded).length ? preloaded : undefined;
  } catch {
    return undefined;
  }
}

export function subscribeSessionPersist(store) {
  let timer = null;
  let lastJson = '';

  const save = () => {
    try {
      const { generate, chat } = store.getState();
      const payload = {
        generate: sanitizeGenerate(generate),
        chat: sanitizeChat(chat),
      };
      const json = JSON.stringify(payload);
      if (json === lastJson) return;
      lastJson = json;
      localStorage.setItem(STORAGE_KEY, json);
    } catch {
      // Quota / private mode — ignore
    }
  };

  return store.subscribe(() => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(save, 250);
  });
}
