import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import ChatRoom from "./pages/ChatRoom";
import Login from "./pages/Login";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/chat" element={<ChatRoom />} />
      </Routes>
    </Router>
  );
}

export default App;
