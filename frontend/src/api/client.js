const TOKEN_KEY = 'resumeforge_token';
const PROFILE_KEY = 'resumeforge_profile_id';
const USER_KEY = 'resumeforge_user';
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

if (!API_BASE_URL && import.meta.env.PROD) {
  console.error(
    '[ResumeForge] VITE_API_BASE_URL is missing. API calls will hit this site instead of your backend. Set it in Vercel Environment Variables and redeploy.'
  );
}

function buildApiUrl(path) {
  if (!path) return API_BASE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE_URL}${path}`;
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuth({ token, user, profile_id }) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  if (profile_id) localStorage.setItem(PROFILE_KEY, profile_id);
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(PROFILE_KEY);
}

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
  } catch {
    return null;
  }
}

export function getStoredProfileId() {
  return localStorage.getItem(PROFILE_KEY);
}

export function setStoredProfileId(id) {
  localStorage.setItem(PROFILE_KEY, id);
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(buildApiUrl(path), {
    ...options,
    headers,
  });

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await res.json() : await res.blob();

  if (!res.ok) {
    if (res.status === 401 && !path.startsWith('/api/auth/')) {
      clearAuth();
    }
    const message =
      isJson && data?.error ? data.error : `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.code = isJson ? data?.code : undefined;
    err.data = data;
    throw err;
  }

  return data;
}

export const api = {
  health: () => request('/api/health'),
  signup: (body) =>
    request('/api/auth/signup', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) =>
    request('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  forgotPassword: (body) =>
    request('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify(body) }),
  resetPassword: (body) =>
    request('/api/auth/reset-password', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/api/auth/me'),
  listProfiles: () => request('/api/profile'),
  getProfile: (id) => request(`/api/profile/${id}`),
  createProfile: (body) =>
    request('/api/profile', { method: 'POST', body: JSON.stringify(body) }),
  parseProfileAi: (body) =>
    request('/api/profile/parse-ai', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  updateProfile: (id, body) =>
    request(`/api/profile/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  addSkill: (id, body) =>
    request(`/api/profile/${id}/skills`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  deleteSkill: (id, skillId) =>
    request(`/api/profile/${id}/skills/${skillId}`, { method: 'DELETE' }),
  addExperience: (id, body) =>
    request(`/api/profile/${id}/experience`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  deleteExperience: (id, expId) =>
    request(`/api/profile/${id}/experience/${expId}`, { method: 'DELETE' }),
  addProject: (id, body) =>
    request(`/api/profile/${id}/projects`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  deleteProject: (id, projectId) =>
    request(`/api/profile/${id}/projects/${projectId}`, { method: 'DELETE' }),
  addEducation: (id, body) =>
    request(`/api/profile/${id}/education`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  deleteEducation: (id, eduId) =>
    request(`/api/profile/${id}/education/${eduId}`, { method: 'DELETE' }),
  addCertification: (id, body) =>
    request(`/api/profile/${id}/certifications`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  deleteCertification: (id, certId) =>
    request(`/api/profile/${id}/certifications/${certId}`, {
      method: 'DELETE',
    }),
  generate: (body) =>
    request('/api/generate', { method: 'POST', body: JSON.stringify(body) }),
  downloadPdf: async (generationId, resumeTemplate, includeContact) => {
    const headers = { 'Content-Type': 'application/json' };
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
    const body = {};
    if (resumeTemplate) body.resume_template = resumeTemplate;
    if (includeContact !== undefined) body.include_contact = includeContact;
    const res = await fetch(buildApiUrl(`/api/generate/${generationId}/pdf`), {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      if (res.status === 401) clearAuth();
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'PDF download failed');
    }
    return res.blob();
  },
  humanizeCoverLetter: (generationId, coverLetter) =>
    request(`/api/generate/${generationId}/humanize`, {
      method: 'POST',
      body: JSON.stringify(
        coverLetter ? { cover_letter: coverLetter } : {}
      ),
    }),
  detectCoverLetter: (generationId, coverLetter) =>
    request(`/api/generate/${generationId}/detect`, {
      method: 'POST',
      body: JSON.stringify(
        coverLetter ? { cover_letter: coverLetter } : {}
      ),
    }),
  listGenerations: (profileId) =>
    request(`/api/generations/${profileId}`),
  getGeneration: (id) => request(`/api/generations/item/${id}`),
  chat: (body) =>
    request('/api/chat', { method: 'POST', body: JSON.stringify(body) }),
};
