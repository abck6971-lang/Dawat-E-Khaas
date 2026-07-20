import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getLocalOrders, saveLocalOrder } from './database.js';
import { startSyncEngine, syncOfflineOrders, fetchLiveOrders } from './sync.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, '..');

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron');
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist');

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST;

let win: BrowserWindow | null;

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 680,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      // contextIsolation MUST be true for contextBridge to work
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  // Remove menu bar for a cleaner POS look
  win.setMenuBarVisibility(false);

  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString());
    // Start background sync every 10 seconds
    startSyncEngine(win!.webContents);
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
    // Open devtools only in dev mode - comment out if not needed
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'));
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
    win = null;
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(() => {
  createWindow();

  // IPC: Load local offline orders
  ipcMain.handle('get-local-orders', () => {
    return getLocalOrders();
  });

  // IPC: Save a new walk-in order locally
  ipcMain.handle('save-local-order', (_, order) => {
    saveLocalOrder(order);
    return { success: true };
  });

  // IPC: Force sync with cloud
  ipcMain.handle('force-sync', async () => {
    const syncRes = await syncOfflineOrders();
    const liveOrders = await fetchLiveOrders();
    return { syncRes, liveOrders };
  });

  // IPC: Get system printers
  ipcMain.handle('get-printers', async () => {
    return await win?.webContents.getPrintersAsync() || [];
  });

  // IPC: Test Print
  ipcMain.handle('test-print', async (_, { printerName, htmlContent }) => {
    return new Promise((resolve) => {
      let printWindow: BrowserWindow | null = new BrowserWindow({
        show: false,
        webPreferences: { nodeIntegration: false, contextIsolation: true }
      });

      const html = htmlContent || `<html><body style="font-family: monospace; padding: 20px;">
        <h2 style="text-align: center;">ePOSmatic</h2>
        <p style="text-align: center;">Printer Test Successful</p>
        <hr/>
        <p>Target Printer: ${printerName}</p>
        <p>Date: ${new Date().toLocaleString()}</p>
        <hr/>
        <p style="text-align: center;">Thank you!</p>
      </body></html>`;
      
      const dataUri = 'data:text/html;charset=utf-8,' + encodeURIComponent(html);
      printWindow.loadURL(dataUri);

      printWindow.webContents.on('did-finish-load', () => {
        printWindow?.webContents.print({
          silent: true,
          deviceName: printerName,
          printBackground: true,
        }, (success, failureReason) => {
          resolve({ success, error: failureReason });
          printWindow?.close();
          printWindow = null;
        });
      });
    });
  });
});
