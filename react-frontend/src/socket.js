export function openNotepad() {
    fetch('http://localhost:3000/open-notepad', { method: 'POST' })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to open Notepad');
        }
      })
      .catch(error => {
        console.error('Error opening Notepad:', error);
      });
  }
  