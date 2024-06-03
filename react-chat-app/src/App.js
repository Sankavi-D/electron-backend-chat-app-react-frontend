import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';

const App = () => {
  const [socket, setSocket] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const newSocket = io('http://localhost:8080');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to Electron socket server');
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from Electron socket server');
    });

    newSocket.on('message', () => {
      console.log('Received instruction to open Notepad');
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };

  const handleSendMessage = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      if (message.trim() !== '') {
        socket.emit('message', message);
        setMessages([...messages, message]);
        setMessage('');
      }
    }
  };

  return (
    <div className="app">
      <h1>Chat App</h1>
      <div className="chat-window">
        <ul>
          {messages.map((msg, index) => (
            <li key={index} className="message">
              {msg}
            </li>
          ))}
        </ul>
      </div>
      <div className="input-container">
        <input
          type="text"
          value={message}
          onChange={handleMessageChange}
          onKeyPress={handleSendMessage}
          placeholder="Type your message..."
          className="input-field"
        />
        <button onClick={handleSendMessage} className="send-button">
          Send
        </button>
      </div>
    </div>
  );
};

export default App;