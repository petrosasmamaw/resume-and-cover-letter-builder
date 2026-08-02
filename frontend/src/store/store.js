import { configureStore } from '@reduxjs/toolkit';
import profileReducer from './profileSlice.js';
import historyReducer from './historySlice.js';

export const store = configureStore({
  reducer: {
    profile: profileReducer,
    history: historyReducer,
  },
});
