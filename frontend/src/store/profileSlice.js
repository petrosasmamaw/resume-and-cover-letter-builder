import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api, setStoredProfileId } from '../api/client.js';

const emptyCore = {
  full_name: '',
  title: '',
  email: '',
  phone: '',
  location: '',
  linkedin_url: '',
  github_url: '',
  portfolio_url: '',
  summary: '',
};

const initialState = {
  profileId: null,
  core: emptyCore,
  skills: [],
  experience: [],
  projects: [],
  education: [],
  certifications: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  mutationStatus: 'idle',
};

// ── Async Thunks ───────────────────────────────────────────

export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (profileId, { getState, rejectWithValue }) => {
    try {
      let targetId = profileId;
      if (!targetId) {
        const list = await api.listProfiles();
        if (list.length) targetId = list[0].id;
      }
      if (!targetId) return null;

      setStoredProfileId(targetId);
      const data = await api.getProfile(targetId);
      return { profileId: targetId, ...data };
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load profile');
    }
  },
  {
    // Caching check: skip network request if data is already fetched for this profileId
    condition: (profileId, { getState }) => {
      const { profile } = getState();
      if (profile.status === 'loading') return false; // Already fetching
      if (profile.status === 'succeeded' && profile.profileId && (profileId === profile.profileId || !profileId)) {
        return false; // Already loaded in Redux! Skip backend fetch.
      }
      return true;
    },
  }
);

export const saveCoreProfile = createAsyncThunk(
  'profile/saveCoreProfile',
  async ({ profileId, coreData }, { rejectWithValue }) => {
    try {
      let resultId = profileId;
      if (!resultId) {
        const created = await api.createProfile(coreData);
        resultId = created.id;
        setStoredProfileId(resultId);
      } else {
        await api.updateProfile(resultId, coreData);
      }
      const data = await api.getProfile(resultId);
      return { profileId: resultId, ...data };
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to save core profile');
    }
  }
);

export const parseProfileAi = createAsyncThunk(
  'profile/parseProfileAi',
  async ({ text, profileId }, { rejectWithValue }) => {
    try {
      const filled = await api.parseProfileAi({ text, profile_id: profileId || undefined });
      setStoredProfileId(filled.id);
      return filled;
    } catch (err) {
      return rejectWithValue(err.message || 'AI merge failed');
    }
  }
);

export const addSkill = createAsyncThunk(
  'profile/addSkill',
  async ({ profileId, skillForm }, { dispatch, getState, rejectWithValue }) => {
    try {
      let targetId = profileId;
      if (!targetId) {
        const core = getState().profile.core;
        const created = await api.createProfile(core);
        targetId = created.id;
        setStoredProfileId(targetId);
      }
      await api.addSkill(targetId, skillForm);
      const updated = await api.getProfile(targetId);
      return { profileId: targetId, ...updated };
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to add skill');
    }
  }
);

export const deleteSkill = createAsyncThunk(
  'profile/deleteSkill',
  async ({ profileId, skillId }, { rejectWithValue }) => {
    try {
      await api.deleteSkill(profileId, skillId);
      return skillId;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to delete skill');
    }
  }
);

export const addExperience = createAsyncThunk(
  'profile/addExperience',
  async ({ profileId, expForm }, { getState, rejectWithValue }) => {
    try {
      let targetId = profileId;
      if (!targetId) {
        const core = getState().profile.core;
        const created = await api.createProfile(core);
        targetId = created.id;
        setStoredProfileId(targetId);
      }
      await api.addExperience(targetId, { ...expForm, end_date: expForm.end_date || null });
      const updated = await api.getProfile(targetId);
      return { profileId: targetId, ...updated };
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to add experience');
    }
  }
);

export const deleteExperience = createAsyncThunk(
  'profile/deleteExperience',
  async ({ profileId, expId }, { rejectWithValue }) => {
    try {
      await api.deleteExperience(profileId, expId);
      return expId;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to delete experience');
    }
  }
);

export const addProject = createAsyncThunk(
  'profile/addProject',
  async ({ profileId, projectForm }, { getState, rejectWithValue }) => {
    try {
      let targetId = profileId;
      if (!targetId) {
        const core = getState().profile.core;
        const created = await api.createProfile(core);
        targetId = created.id;
        setStoredProfileId(targetId);
      }
      await api.addProject(targetId, {
        ...projectForm,
        tech_stack: projectForm.tech_stack.split(',').map((s) => s.trim()).filter(Boolean),
      });
      const updated = await api.getProfile(targetId);
      return { profileId: targetId, ...updated };
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to add project');
    }
  }
);

export const deleteProject = createAsyncThunk(
  'profile/deleteProject',
  async ({ profileId, projectId }, { rejectWithValue }) => {
    try {
      await api.deleteProject(profileId, projectId);
      return projectId;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to delete project');
    }
  }
);

export const addEducation = createAsyncThunk(
  'profile/addEducation',
  async ({ profileId, eduForm }, { getState, rejectWithValue }) => {
    try {
      let targetId = profileId;
      if (!targetId) {
        const core = getState().profile.core;
        const created = await api.createProfile(core);
        targetId = created.id;
        setStoredProfileId(targetId);
      }
      await api.addEducation(targetId, eduForm);
      const updated = await api.getProfile(targetId);
      return { profileId: targetId, ...updated };
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to add education');
    }
  }
);

export const deleteEducation = createAsyncThunk(
  'profile/deleteEducation',
  async ({ profileId, eduId }, { rejectWithValue }) => {
    try {
      await api.deleteEducation(profileId, eduId);
      return eduId;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to delete education');
    }
  }
);

export const addCertification = createAsyncThunk(
  'profile/addCertification',
  async ({ profileId, certForm }, { getState, rejectWithValue }) => {
    try {
      let targetId = profileId;
      if (!targetId) {
        const core = getState().profile.core;
        const created = await api.createProfile(core);
        targetId = created.id;
        setStoredProfileId(targetId);
      }
      await api.addCertification(targetId, certForm);
      const updated = await api.getProfile(targetId);
      return { profileId: targetId, ...updated };
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to add certification');
    }
  }
);

export const deleteCertification = createAsyncThunk(
  'profile/deleteCertification',
  async ({ profileId, certId }, { rejectWithValue }) => {
    try {
      await api.deleteCertification(profileId, certId);
      return certId;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to delete certification');
    }
  }
);

// ── Profile Slice Definition ─────────────────────────────

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setProfileIdState(state, action) {
      state.profileId = action.payload;
    },
    clearProfile(state) {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Profile
      .addCase(fetchProfile.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (action.payload) {
          state.profileId = action.payload.profileId;
          state.core = {
            full_name: action.payload.full_name || '',
            title: action.payload.title || '',
            email: action.payload.email || '',
            phone: action.payload.phone || '',
            location: action.payload.location || '',
            linkedin_url: action.payload.linkedin_url || '',
            github_url: action.payload.github_url || '',
            portfolio_url: action.payload.portfolio_url || '',
            summary: action.payload.summary || '',
          };
          state.skills = action.payload.skills || [];
          state.experience = action.payload.experience || [];
          state.projects = action.payload.projects || [];
          state.education = action.payload.education || [];
          state.certifications = action.payload.certifications || [];
        }
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Save Core Profile
      .addCase(saveCoreProfile.fulfilled, (state, action) => {
        state.profileId = action.payload.profileId;
        state.core = {
          full_name: action.payload.full_name || '',
          title: action.payload.title || '',
          email: action.payload.email || '',
          phone: action.payload.phone || '',
          location: action.payload.location || '',
          linkedin_url: action.payload.linkedin_url || '',
          github_url: action.payload.github_url || '',
          portfolio_url: action.payload.portfolio_url || '',
          summary: action.payload.summary || '',
        };
      })

      // Parse AI
      .addCase(parseProfileAi.fulfilled, (state, action) => {
        state.profileId = action.payload.id;
        state.core = {
          full_name: action.payload.full_name || '',
          title: action.payload.title || '',
          email: action.payload.email || '',
          phone: action.payload.phone || '',
          location: action.payload.location || '',
          linkedin_url: action.payload.linkedin_url || '',
          github_url: action.payload.github_url || '',
          portfolio_url: action.payload.portfolio_url || '',
          summary: action.payload.summary || '',
        };
        state.skills = action.payload.skills || [];
        state.experience = action.payload.experience || [];
        state.projects = action.payload.projects || [];
        state.education = action.payload.education || [];
        state.certifications = action.payload.certifications || [];
      })

      // Add & Delete items
      .addCase(addSkill.fulfilled, (state, action) => {
        state.profileId = action.payload.profileId;
        state.skills = action.payload.skills || [];
      })
      .addCase(deleteSkill.fulfilled, (state, action) => {
        state.skills = state.skills.filter((s) => s.id !== action.payload);
      })
      .addCase(addExperience.fulfilled, (state, action) => {
        state.profileId = action.payload.profileId;
        state.experience = action.payload.experience || [];
      })
      .addCase(deleteExperience.fulfilled, (state, action) => {
        state.experience = state.experience.filter((e) => e.id !== action.payload);
      })
      .addCase(addProject.fulfilled, (state, action) => {
        state.profileId = action.payload.profileId;
        state.projects = action.payload.projects || [];
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.projects = state.projects.filter((p) => p.id !== action.payload);
      })
      .addCase(addEducation.fulfilled, (state, action) => {
        state.profileId = action.payload.profileId;
        state.education = action.payload.education || [];
      })
      .addCase(deleteEducation.fulfilled, (state, action) => {
        state.education = state.education.filter((e) => e.id !== action.payload);
      })
      .addCase(addCertification.fulfilled, (state, action) => {
        state.profileId = action.payload.profileId;
        state.certifications = action.payload.certifications || [];
      })
      .addCase(deleteCertification.fulfilled, (state, action) => {
        state.certifications = state.certifications.filter((c) => c.id !== action.payload);
      });
  },
});

export const { setProfileIdState, clearProfile } = profileSlice.actions;
export default profileSlice.reducer;
