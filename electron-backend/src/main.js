const { app, BrowserWindow } = require('electron');
const path = require('path');
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const { exec } = require('child_process');

let mainWindow;
let serverApp;
let server;
let io;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false // Disable web security for development only
    }
  });
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
  startServer();
}

function startServer() {
  serverApp = express();
  serverApp.use(cors()); // Enable CORS
  server = http.createServer(serverApp);
  io = socketIO(server, {
    cors: {
      origin: 'http://localhost:3000', // Allow requests from the React development server
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    mainWindow.webContents.send('socket-status', 'connected');

    socket.on('message', (message) => {
      console.log('Received message:', message);
      openNotepad();
      socket.emit('open-notepad');
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      mainWindow.webContents.send('socket-status', 'disconnected');
    });
  });

  server.listen(8080, () => {
    console.log('Server listening on port 8080');
  });
}

// function openNotepad() {
//   const notepadProcess = spawn('"C:\\Users\\DELL\\AppData\Roaming\\Microsoft\\Windows\\Start Menu\\Programs\\Zoom\\Zoom.lnk"', [], { detached: true, shell: true });
//   notepadProcess.on('error', (err) => {
//     console.error('Failed to open Notepad:', err);
//   });
//   notepadProcess.on('exit', (code) => {
//     console.log(`Notepad process exited with code ${code}`);
//   });
//   notepadProcess.unref(); // Prevent Electron from exiting when Notepad is closed
// }

function openNotepad(req, res) {
  let responseSent = false;

  exec('notepad.exe', (err) => {
    if (responseSent) return;

    if (err) {
      console.error('Failed to open Notepad:', err);
      // res.status(500).send('Failed to open Notepad');
    } else {
      // res.sendStatus(200);
      console.log('Notepad Opened Successfully')
    }

    responseSent = true;
  });
}

app.on('ready', createWindow);
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});