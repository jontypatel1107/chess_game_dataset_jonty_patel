import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  users: [],
  currentUser: null,
  loading: false,
  error: null,
  stats: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    fetchUsersStart: (state) => {
      state.loading = true;
    },
    fetchUsersSuccess: (state, action) => {
      state.loading = false;
      state.users = action.payload;
    },
    fetchUsersFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
    },
    setUserStats: (state, action) => {
      state.stats = action.payload;
    },
  },
});

export const { 
  fetchUsersStart, 
  fetchUsersSuccess, 
  fetchUsersFailure, 
  setCurrentUser,
  setUserStats 
} = userSlice.actions;

export default userSlice.reducer;
