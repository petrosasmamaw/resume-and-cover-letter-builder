import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../api/client.js';

const initialState = {
  items: [],
  selected: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

// ── Async Thunks ───────────────────────────────────────────

export const fetchHistory = createAsyncThunk(
  'history/fetchHistory',
  async (profileId, { rejectWithValue }) => {
    try {
      if (!profileId) return [];
      const gens = await api.listGenerations(profileId);
      return gens;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load history');
    }
  },
  {
    // Smart Caching condition: skip backend refetch if history is already loaded!
    condition: (profileId, { getState }) => {
      const { history } = getState();
      if (history.status === 'loading') return false; // Fetching in progress
      if (history.status === 'succeeded' && history.items.length > 0) {
        return false; // History already cached in Redux store! Skip backend fetch.
      }
      return true;
    },
  }
);

// ── History Slice Definition ─────────────────────────────

const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    setSelectedGeneration(state, action) {
      state.selected = action.payload;
    },
    addGenerationToHistory(state, action) {
      const gen = action.payload;
      if (gen && gen.id) {
        // Unshift new generation to top of list
        state.items = [gen, ...state.items.filter((i) => i.id !== gen.id)];
        state.status = 'succeeded';
      }
    },
    invalidateHistory(state) {
      state.status = 'idle';
    },
    clearHistory(state) {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHistory.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchHistory.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload || [];
      })
      .addCase(fetchHistory.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const {
  setSelectedGeneration,
  addGenerationToHistory,
  invalidateHistory,
  clearHistory,
} = historySlice.actions;

export default historySlice.reducer;
