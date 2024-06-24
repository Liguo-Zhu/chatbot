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
import { addAssistantMsgs, selectMessages } from "../store/chatSlice";
import { useDispatch, useSelector } from "react-redux";
import { selectFirebaseUser } from "../store/authSlice";

const systemMessage = {
  //  Explain things like you're talking to a software professional with 5 years of experience.
  role: "system",
  content: "",
};

function getLastElement(array) {
  if (array.length === 0) {
    return undefined; // or you can return null or any other value that indicates the array is empty
  }
  return array[array.length - 1];
}

export default function OpenAiAssistants() {
  const user = useSelector(selectFirebaseUser);
  const { assistantMsgs } = useSelector(selectMessages);
  const dispatch = useDispatch();
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState(assistantMsgs);

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
    const url = import.meta.env.VITE_REACT_APP_API_URL + "/function";
    await axios
      .post(
        url,
        {
          messages: getLastElement(apiRequestBody.messages),
        },
        {
          headers: {
            Authorization: `Bearer ${user?.profile.accessToken}`,
          },
        }
      )
      .then((response) => {
        const msg = [
          ...chatMessages,
          {
            message: response.data,
            sender: "ChatGPT",
          },
        ];
        setMessages(msg);
        dispatch(addAssistantMsgs(msg));
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
