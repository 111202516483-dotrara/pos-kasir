const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktop', {
  getPrinters:      ()     => ipcRenderer.invoke('printers'),
  print:            opt    => ipcRenderer.invoke('print', opt),
  exportBackup:     json   => ipcRenderer.invoke('backup:export', json),
  importBackup:     ()     => ipcRenderer.invoke('backup:import'),
  autoBackup:       json   => ipcRenderer.invoke('backup:auto', json),
  openBackupFolder: ()     => ipcRenderer.invoke('backup:folder')
});
