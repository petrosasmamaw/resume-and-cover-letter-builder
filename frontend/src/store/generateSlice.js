import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  jobTitle: '',
  companyName: '',
  jobDescription: '',
  coverLetterLength: 1200,
  customLength: '',
  outputMode: 'both',
  resumeTemplate: 'color',
  includeContact: true,
  specialNotes: '',
  resume: null,
  coverLetter: '',
  generationId: null,
  humanizeStats: null,
  detectionStats: null,
};

const generateSlice = createSlice({
  name: 'generate',
  initialState,
  reducers: {
    setGenerateField(state, action) {
      const { key, value } = action.payload;
      if (key in state) state[key] = value;
    },
    setGenerateFields(state, action) {
      Object.assign(state, action.payload);
    },
    setGenerateResults(state, action) {
      const {
        resume = null,
        coverLetter = '',
        generationId = null,
        outputMode,
        resumeTemplate,
        includeContact,
        specialNotes,
      } = action.payload;
      state.resume = resume;
      state.coverLetter = coverLetter;
      state.generationId = generationId;
      if (outputMode) state.outputMode = outputMode;
      if (resumeTemplate) state.resumeTemplate = resumeTemplate;
      if (typeof includeContact === 'boolean') {
        state.includeContact = includeContact;
      }
      if (typeof specialNotes === 'string') {
        state.specialNotes = specialNotes;
      }
      state.humanizeStats = null;
      state.detectionStats = null;
    },
    setCoverLetter(state, action) {
      state.coverLetter = action.payload;
    },
    setHumanizeStats(state, action) {
      state.humanizeStats = action.payload;
    },
    setDetectionStats(state, action) {
      state.detectionStats = action.payload;
    },
    clearGenerateResults(state) {
      state.resume = null;
      state.coverLetter = '';
      state.generationId = null;
      state.humanizeStats = null;
      state.detectionStats = null;
    },
    resetGenerateSession() {
      return { ...initialState };
    },
  },
});

export const {
  setGenerateField,
  setGenerateFields,
  setGenerateResults,
  setCoverLetter,
  setHumanizeStats,
  setDetectionStats,
  clearGenerateResults,
  resetGenerateSession,
} = generateSlice.actions;

export default generateSlice.reducer;
