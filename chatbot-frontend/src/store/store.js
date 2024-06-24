import { configureStore } from "@reduxjs/toolkit";
import authAuthenticationSlice from "./authSlice";
import allMsgs from "./chatSlice";

const store = configureStore({
  reducer: {
    authAuthentication: authAuthenticationSlice,
    allMsgs: allMsgs,
  },
});

export default store;
