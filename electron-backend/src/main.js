const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { exec } = require('child_process');
const cors = require('cors');

const users = {}; // Object to track connected users

// Server setup
function createServer() {
  const serverApp = express();
  const server = http.createServer(serverApp);
  const io = socketIo(server);

  // Allow requests from localhost:3001 (React frontend)
  // Configure CORS
  const corsOptions = {
    origin: 'http://192.168.0.18:3001', // Allow requests from React frontend
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true,
  };

  serverApp.use(cors(corsOptions));

  serverApp.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
  });

  // Endpoint to open Notepad
  serverApp.post('/open-notepad', (req, res) => {
    exec('write.exe', (err) => {
      if (err) {
        console.error('Failed to open Notepad:', err);
        res.status(500).send('Failed to open Notepad');
      } else {
        res.sendStatus(200);
      }
    });
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    users[socket.id] = socket;

    // Notify all clients about the new connection
    io.emit('update users', Object.keys(users));

    socket.on('chat message', (msg) => {
      console.log('Message:', msg);
      io.emit('chat message', msg);
    });

    socket.on('private message', ({ recipientId, message }) => {
      console.log(`Private message from ${socket.id} to ${recipientId}: ${message}`);
      if (users[recipientId]) {
        users[recipientId].emit('private message', { from: socket.id, message });
        users[socket.id].emit('private message', { from: socket.id, message }); // Send to sender as well
        // socket.emit('private message', { from: socket.id, message }); // Send the message back to the sender
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      delete users[socket.id];

      // Notify all clients about the disconnection
      io.emit('update users', Object.keys(users));
    });
  });

  server.listen(3000, () => {
    console.log('Server listening on port 3000');
  });
}

// Electron window setup
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createServer();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle opening Notepad request from renderer process
ipcMain.on('open-notepad', () => {
  exec('write.exe', (err) => {
    if (err) {
      console.error('Failed to open Notepad:', err);
    }
  });
});
