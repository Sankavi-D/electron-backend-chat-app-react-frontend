// src/components/Button.js
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const Button = () => {
  const [connectionStatus, setConnectionStatus] = useState('Not Connected');

  useEffect(() => {
    const socket = io('http://localhost:8080');
    socket.on('connect', () => {
      setConnectionStatus('Connected');
    });
    socket.on('disconnect', () => {
      setConnectionStatus('Not Connected');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <button style={{ backgroundColor: connectionStatus === 'Connected' ? 'green' : 'red' }}>
      {connectionStatus}
    </button>
  );
};

export default Button;
