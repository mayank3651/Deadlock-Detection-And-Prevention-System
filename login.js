import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    if (username.trim() !== "") {
      localStorage.setItem("username", username);
      navigate("/chat");
    }
  };

  return (
    <div className="login-container">
      <h1>🌸 Anime Chat Login</h1>
      <input
        type="text"
        placeholder="Enter your name..."
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button onClick={handleLogin}>Enter Chat</button>
    </div>
  );
}

export default Login;
