import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  games: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },
  loading: false,
  error: null,
  currentData: null,
  analytics: null,
};

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    fetchDataStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess: (state, action) => {
      state.loading = false;
      state.games = action.payload.games;
      state.pagination = action.payload.pagination;
    },
    fetchDataFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setAnalytics: (state, action) => {
      state.analytics = action.payload;
    },
    setCurrentData: (state, action) => {
      state.currentData = action.payload;
    },
    clearDataError: (state) => {
      state.error = null;
    },
  },
});

export const {
  fetchDataStart,
  fetchDataSuccess,
  fetchDataFailure,
  setAnalytics,
  setCurrentData,
  clearDataError,
} = dataSlice.actions;

export default dataSlice.reducer;
