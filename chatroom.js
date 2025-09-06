import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import EmojiPicker from "emoji-picker-react";
import "../App.css";

const socket = io("https://your-socket-server.com");

function ChatRoom() {
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const username = localStorage.getItem("username") || "Guest";

  const sendMessage = () => {
    if (message !== "") {
      socket.emit("send_message", {
        username,
        message,
        time: new Date().toLocaleTimeString(),
      });
      setMessage("");
    }
  };

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setChatMessages((list) => [...list, data]);
    });
  }, []);

  return (
    <div className="chat-container">
      <div className="chat-header">
        <img
          className="avatar-img"
          src="https://api.dicebear.com/6.x/pixel-art/svg?seed=" + username
          alt="avatar"
        />
        <span className="header-text">Welcome, {username}!</span>
      </div>
      <div className="chat-messages">
        {chatMessages.map((msg, idx) => (
          <div className={`chat-bubble ${msg.username === username ? 'self' : ''}`} key={idx}>
            <div className="bubble-content">
              <strong>{msg.username}: </strong>{msg.message}
            </div>
            <div className="bubble-time">{msg.time}</div>
          </div>
        ))}
      </div>
      {showEmoji && <EmojiPicker onEmojiClick={(e) => setMessage((prev) => prev + e.emoji)} />}
      <div className="chat-input">
        <button onClick={() => setShowEmoji(!showEmoji)}>😊</button>
        <input
          type="text"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>Send 🚀</button>
      </div>
    </div>
  );
}

export default ChatRoom;