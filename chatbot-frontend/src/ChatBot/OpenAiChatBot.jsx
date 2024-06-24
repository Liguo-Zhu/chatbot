/* eslint-disable no-unused-vars */
import { useState } from "react";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
} from "@chatscope/chat-ui-kit-react";
import axios from "axios";
import { addChatMsgs, selectMessages } from "../store/chatSlice";
import { useDispatch, useSelector } from "react-redux";
import { selectFirebaseUser } from "../store/authSlice";

const systemMessage = {
  //  Explain things like you're talking to a software professional with 5 years of experience.
  role: "system",
  content: "",
};

export default function OpenAiChatBot() {
  const user = useSelector(selectFirebaseUser);
  const { chatMsgs } = useSelector(selectMessages);
  const dispatch = useDispatch();
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState(chatMsgs);

  const handleSendMsg = async (message) => {
    const newMessage = {
      message,
      direction: "outgoing",
      sender: "user",
    };
    const newMessages = [...messages, newMessage];
    setMessages(newMessages);
    setIsTyping(true);
    await processMessageToChatGPT(newMessages);
  };

  async function processMessageToChatGPT(chatMessages) {
    // Format messages for chatGPT API.
    let apiMessages = chatMessages.map((messageObject) => {
      let role = "";
      if (messageObject.sender === "ChatGPT") {
        role = "assistant";
      } else {
        role = "user";
      }
      return { role: role, content: messageObject.message };
    });

    // determine how we want chatGPT to act.
    const apiRequestBody = {
      model: "gpt-3.5-turbo",
      messages: [
        systemMessage, // The system message defines the logic of the chatGPT
        ...apiMessages, // The messages from our chat with ChatGPT
      ],
    };
    const url = import.meta.env.VITE_REACT_APP_API_URL + "/chat";
    await axios
      .post(url, apiRequestBody, {
        headers: {
          Authorization: `Bearer ${user?.profile.accessToken}`,
        },
      })
      .then((response) => {
        const msg = [
          ...chatMessages,
          {
            message: response.data,
            sender: "ChatGPT",
          },
        ];
        setMessages(msg);
        dispatch(addChatMsgs(msg));
        setIsTyping(false);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  return (
    <div
      style={{
        width: "70%",
        height: "100%",
      }}
    >
      <MainContainer>
        <ChatContainer>
          <MessageList
            scrollBehavior="smooth"
            typingIndicator={
              isTyping ? <TypingIndicator content="ChatGPT is typing" /> : null
            }
          >
            {messages.map((message, index) => {
              return <Message key={index} model={message} />;
            })}
          </MessageList>
          <MessageInput
            placeholder="Type message here"
            onSend={handleSendMsg}
          />
        </ChatContainer>
      </MainContainer>
    </div>
  );
}

// https://www.youtube.com/watch?v=dXsZp39L2Jk
