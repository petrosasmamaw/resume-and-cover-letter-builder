import { configureStore } from '@reduxjs/toolkit';
import profileReducer from './profileSlice.js';
import historyReducer from './historySlice.js';
import generateReducer from './generateSlice.js';
import chatReducer from './chatSlice.js';
import { loadPersistedSession, subscribeSessionPersist } from './persistSession.js';

const preloaded = loadPersistedSession();

export const store = configureStore({
  reducer: {
    profile: profileReducer,
    history: historyReducer,
    generate: generateReducer,
    chat: chatReducer,
  },
  preloadedState: preloaded,
});

subscribeSessionPersist(store);
