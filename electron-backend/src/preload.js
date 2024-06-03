const { contextBridge, ipcRenderer } = require('electron');

window.addEventListener('DOMContentLoaded', () => {
  ipcRenderer.on('socket-status', (event, status) => {
    const statusButton = document.getElementById('status-button');
    if (status === 'connected') {
      statusButton.textContent = 'Activated';
      statusButton.style.backgroundColor = 'green';
    } else {
      statusButton.textContent = 'Not Activated';
      statusButton.style.backgroundColor = 'red';
    }
  });
});

contextBridge.exposeInMainWorld('api', {
  openNotepad: () => ipcRenderer.send('open-notepad')
});
