import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { Provider } from "react-redux";
import store from "./store/store.js";
import "./index.css";
// import TestChatBot from "./ChatBot/TestChatBot.jsx";
ReactDOM.createRoot(document.getElementById("root")).render(
  // <React.StrictMode>
  <BrowserRouter>
    <Provider store={store}>
      <App />
      {/* <TestChatBot></TestChatBot> */}
    </Provider>
  </BrowserRouter>
  // </React.StrictMode>,
);
