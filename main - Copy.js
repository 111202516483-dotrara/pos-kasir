const { app, BrowserWindow, ipcMain, dialog, shell, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

let win;
const hariIni = () => new Date().toLocaleDateString('sv-SE'); // YYYY-MM-DD, waktu lokal
const backupDir = () => path.join(app.getPath('userData'), 'backups');

function createWindow() {
  win = new BrowserWindow({
    width: 1280, height: 800, minWidth: 900, minHeight: 600,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  win.maximize();
  win.loadFile('pos-ksir.html'); // ganti di sini jika nama file HTML Anda berbeda
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.on('closed', () => { win = null; });
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (!win) return;
    if (win.isMinimized()) win.restore();
    win.focus();
  });
  app.whenReady().then(() => {
    // Versi terpasang: hilangkan menu (termasuk DevTools) agar kasir tidak salah klik
    if (app.isPackaged && process.platform !== 'darwin') Menu.setApplicationMenu(null);
    createWindow();
    app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
  });
  app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
}

/* ---------- Printer ---------- */
ipcMain.handle('printers', () => win.webContents.getPrintersAsync());

ipcMain.handle('print', (_e, opt) => new Promise(resolve => {
  win.webContents.print({
    silent: true,                       // tanpa dialog
    deviceName: opt.printer || '',      // kosong = printer default Windows
    printBackground: false,
    margins: { marginType: opt.paper === 'A4' ? 'default' : 'none' }
  }, (ok, reason) => resolve({ ok, error: ok ? '' : reason }));
}));

/* ---------- Backup ---------- */
ipcMain.handle('backup:export', async (_e, json) => {
  const r = await dialog.showSaveDialog(win, {
    defaultPath: `backup-pos-${hariIni()}.json`,
    filters: [{ name: 'Backup POS (JSON)', extensions: ['json'] }]
  });
  if (r.canceled) return { ok: false };
  fs.writeFileSync(r.filePath, json);
  return { ok: true, path: r.filePath };
});

ipcMain.handle('backup:import', async () => {
  const r = await dialog.showOpenDialog(win, {
    properties: ['openFile'],
    filters: [{ name: 'Backup POS (JSON)', extensions: ['json'] }]
  });
  if (r.canceled) return { ok: false };
  return { ok: true, data: fs.readFileSync(r.filePaths[0], 'utf8') };
});

// Backup otomatis: 1 file per hari, simpan 30 hari terakhir
ipcMain.handle('backup:auto', (_e, json) => {
  const dir = backupDir();
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `auto-${hariIni()}.json`), json);
  fs.readdirSync(dir).filter(f => f.startsWith('auto-')).sort().slice(0, -30)
    .forEach(f => fs.unlinkSync(path.join(dir, f)));
  return true;
});

ipcMain.handle('backup:folder', () => {
  fs.mkdirSync(backupDir(), { recursive: true });
  return shell.openPath(backupDir());
});
