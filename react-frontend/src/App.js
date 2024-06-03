import React, { useState, useEffect } from 'react';
import './App.css';
import io from 'socket.io-client';
import { openNotepad } from './socket';

const socket = io('http://192.168.0.18:3000');

function App() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    socket.on('chat message', (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    socket.on('private message', ({ from, message }) => {
      setMessages((prevMessages) => [...prevMessages, `Private from ${from}: ${message}`]);
    });

    socket.on('update users', (users) => {
      setUsers(users.filter((user) => user !== socket.id));
    });

    return () => {
      socket.off('chat message');
      socket.off('private message');
      socket.off('update users');
    };
  }, []);

  const sendMessage = () => {
    if (message.trim()) {
      if (selectedUser) {
        socket.emit('private message', { recipientId: selectedUser, message });
        openNotepad();
        setMessages((prevMessages) => [...prevMessages, `You (private to ${selectedUser}): ${message}`]);
      } else {
        socket.emit('chat message', message);
        openNotepad();
        setMessages((prevMessages) => [...prevMessages, `${message}`]); // Display the message in the React chat window
      }
      setMessage('');
    }
  };

  return (
    <div className="App">
      <div id="chat-container">
        <div id="chat-window">
          {messages.map((msg, idx) => (
            <div key={idx}>{msg}</div>
          ))}
        </div>
        <div id="input-container">
          <input
            type="text"
            id="message-input"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') sendMessage();
            }}
          />
          <button id="send-button" onClick={sendMessage}>Send</button>
        </div>
      </div>
      <div id="users-container">
        <h3>Connected Users</h3>
        <div id="users-list">
          {users.map((user) => (
            <div
              key={user}
              className={`user-item ${user === selectedUser ? 'selected' : ''}`}
              onClick={() => setSelectedUser(user)}
            >
              {user}
            </div>
          ))}
          <div
            className={`user-item group-chat-item ${selectedUser === null ? 'selected' : ''}`}
            onClick={() => setSelectedUser(null)}
          >
            Group Chat
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;