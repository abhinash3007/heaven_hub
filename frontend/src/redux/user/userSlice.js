import { createSlice } from "@reduxjs/toolkit";

const initialState = {
   currentUser: null,
   error: null,
   loading: false,
};

const userSlice = createSlice({
   name: "User",
   initialState,
   reducers: {
      signInStart: (state) => {
         state.loading = true;
      },
      signInSuccess: (state, action) => {
         state.currentUser = action.payload;
         state.loading = false;
         state.error = null;
      },
      signInFailure: (state, action) => {
         state.loading = false;
         state.error = action.payload;
      },
      updateUserStart: (state) => {
         state.loading = true;
      },
      updateUserSuccess: (state, action) => {
         state.currentUser = action.payload;
         state.loading = false;
         state.error = null;
      },
      updateUserFailure: (state, action) => {
         state.error = action.payload;
         state.loading = false;
      },
      deleteUserStart: (state) => {
         state.loading = true;
      },
      deleteUserSuccess: (state) => {
         state.currentUser = null;
         state.loading = false;
         state.error = null;
      },
      deleteUserFailure: (state, action) => {
         state.error = action.payload;
         state.loading = false;
      },
      signOutUserStart: (state) => {
         state.loading = true;
      },
      signOutUserSuccess: (state) => {
         state.currentUser = null;
         state.loading = false;
         state.error = null;
      },
      signOutUserFailure: (state, action) => {
         state.error = action.payload;
         state.loading = false;
      },
      clearError: (state) => {
         state.error = null;
      }
   }
});

export const { 
   signInStart, 
   signInSuccess, 
   signInFailure, 
   updateUserStart, 
   updateUserFailure, 
   updateUserSuccess, 
   deleteUserFailure, 
   deleteUserStart, 
   deleteUserSuccess,
   signOutUserFailure,
   signOutUserStart,
   signOutUserSuccess, 
   clearError 
} = userSlice.actions;

export default userSlice.reducer;