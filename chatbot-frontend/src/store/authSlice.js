/* eslint-disable no-unused-vars */
import { createSlice } from "@reduxjs/toolkit";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebase";
import axios from "axios";

const authSlice = createSlice({
  name: "firebaseUser",
  initialState: {
    isAuthenticated: false,
    isLoading: true,
    currentId: null,
    currentUser: null,
    profile: null,
  },
  reducers: {
    setAuthState(state, action) {
      state.isAuthenticated = action.payload.isAuthenticated;
      state.isLoading = action.payload.isLoading;
      state.profile = action.payload.profile;
    },
  },
});

export const { setAuthState } = authSlice.actions;
export const checkAuthState = () => (dispatch) => {
  dispatch(
    setAuthState({
      isAuthenticated: false,
      isLoading: true,
      profile: null,
    })
  );
  onAuthStateChanged(auth, async (user) => {
    console.log("user: ");
    if (user) {
      // -----------------------------------------
      dispatch(
        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          profile: {
            email: user?.email,
          },
        })
      );
      // -----------------------------------------
    } else {
      dispatch(
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          currentId: null,
          currentUser: null,
        })
      );
    }
  });
};
export const selectFirebaseUser = (state) => state.authAuthentication; // .authAuthentication: the same name as in the store.js
export default authSlice.reducer;
