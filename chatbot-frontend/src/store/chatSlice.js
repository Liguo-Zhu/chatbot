import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
  name: "allMsgs",
  initialState: {
    chatMsgs: [
      {
        message: "Hi, I'm ChatGPT! Ask me anything!",
        sentTime: "just now",
        sender: "ChatGPT",
      },
    ],
    assistantMsgs: [
      {
        message: "Hi, I'm ChatGPT Assistant! Play with me!",
        sentTime: "just now",
        sender: "ChatGPT",
      },
    ],
  },
  reducers: {
    addChatMsgs: (state, action) => {
      return {
        ...state,
        chatMsgs: action.payload,
      };
    },
    addAssistantMsgs: (state, action) => {
      return {
        ...state,
        assistantMsgs: action.payload,
      };
    },
  },
});

export const { addChatMsgs, addAssistantMsgs } = chatSlice.actions;
export const selectMessages = (state) => state.allMsgs;
export default chatSlice.reducer;
