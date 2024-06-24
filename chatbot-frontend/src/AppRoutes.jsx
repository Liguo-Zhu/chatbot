/* eslint-disable react/prop-types */
import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./HomePage";
import FormLogIn from "./Form/FormLogIn";
import FormRegister from "./Form/FormRegister";
import OpenAiChatBot from "./ChatBot/OpenAiChatBot";

const AppRoutes = ({ isAuthenticated }) => {
  return (
    <Routes>
      <Route
        path="/"
        element={isAuthenticated ? <HomePage /> : <Navigate to="/login" />}
      />
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" /> : <FormLogIn />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/" /> : <FormRegister />}
      />
      <Route
        path="/ChatBot"
        element={isAuthenticated ? <OpenAiChatBot /> : <Navigate to="/login" />}
      />
    </Routes>
  );
};

export default AppRoutes;
