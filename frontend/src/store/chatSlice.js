import { createSlice } from '@reduxjs/toolkit';

export const CHAT_WELCOME =
  "I have full access to your saved Profile (skills, experience, projects). Paste an Upwork client question like “What experience do you have with SaaS?” and I’ll write a ready-to-send answer from your real work — or ask for Special notes / Generate help.";

const initialState = {
  messages: [{ role: 'assistant', content: CHAT_WELCOME }],
  jobTitle: '',
  companyName: '',
  jobDescription: '',
  showJob: false,
  profileMeta: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setChatMessages(state, action) {
      state.messages = action.payload;
    },
    appendChatMessage(state, action) {
      state.messages.push(action.payload);
    },
    appendChatMessages(state, action) {
      state.messages.push(...action.payload);
    },
    setChatJobField(state, action) {
      const { key, value } = action.payload;
      if (key in state) state[key] = value;
    },
    setChatShowJob(state, action) {
      state.showJob = Boolean(action.payload);
    },
    setChatProfileMeta(state, action) {
      state.profileMeta = action.payload;
    },
    clearChatSession() {
      return {
        ...initialState,
        messages: [{ role: 'assistant', content: CHAT_WELCOME }],
      };
    },
  },
});

export const {
  setChatMessages,
  appendChatMessage,
  appendChatMessages,
  setChatJobField,
  setChatShowJob,
  setChatProfileMeta,
  clearChatSession,
} = chatSlice.actions;

export default chatSlice.reducer;
