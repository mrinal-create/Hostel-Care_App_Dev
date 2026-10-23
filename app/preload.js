const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('hostelCare', {
  load: () => ipcRenderer.invoke('app:load'),
  unlockAdmin: password => ipcRenderer.invoke('admin:unlock', password),
  lockAdmin: () => ipcRenderer.invoke('admin:lock'),
  createComplaint: payload => ipcRenderer.invoke('complaints:create', payload),
  updateComplaint: (id, changes) => ipcRenderer.invoke('complaints:update', { id, changes }),
  createAnnouncement: payload => ipcRenderer.invoke('announcements:create', payload),
  updateAnnouncement: (id, changes) => ipcRenderer.invoke('announcements:update', { id, changes }),
  deleteAnnouncement: id => ipcRenderer.invoke('announcements:delete', id),
  confirm: message => ipcRenderer.invoke('app:confirm', message)
});
