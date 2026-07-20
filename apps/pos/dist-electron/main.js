import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
const isDev = process.env.NODE_ENV === "development";
const dbPath = isDev ? path.join(process.cwd(), "pos-local.json") : path.join(process.env.APPDATA || process.cwd(), "dawat-e-khaas-pos", "pos-local.json");
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify({ local_orders: [], settings: {} }), "utf-8");
}
function readDB() {
  try {
    const data = fs.readFileSync(dbPath, "utf-8");
    return JSON.parse(data);
  } catch (e) {
    return { local_orders: [], settings: {} };
  }
}
function writeDB(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf-8");
}
function getLocalOrders() {
  const db = readDB();
  return db.local_orders.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
function saveLocalOrder(order) {
  const db = readDB();
  const newOrder = {
    id: order.id,
    customerName: order.customerName || null,
    customerPhone: order.customerPhone || null,
    totalAmount: order.totalAmount,
    status: order.status,
    type: order.type,
    itemsJson: JSON.stringify(order.items),
    isSynced: 0,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.local_orders.push(newOrder);
  writeDB(db);
}
function markOrderSynced(id) {
  const db = readDB();
  const order = db.local_orders.find((o) => o.id === id);
  if (order) {
    order.isSynced = 1;
    writeDB(db);
  }
}
function getUnsyncedOrders() {
  const db = readDB();
  return db.local_orders.filter((o) => o.isSynced === 0);
}
const API_URL = process.env.VITE_API_URL || "http://localhost:3000";
async function syncOfflineOrders() {
  const unsynced = getUnsyncedOrders();
  if (unsynced.length === 0) return { success: true, count: 0 };
  console.log(`Attempting to sync ${unsynced.length} offline orders...`);
  let syncedCount = 0;
  for (const order of unsynced) {
    try {
      const items = JSON.parse(order.itemsJson);
      const payload = {
        items: items.map((item) => ({
          menuItemId: item.id,
          quantity: item.quantity
        })),
        customerName: order.customerName || "Walk-in Customer",
        customerPhone: order.customerPhone || "",
        orderType: order.type || "PICKUP"
      };
      const res = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-pos-key": "dawat-pos-secret-123"
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        markOrderSynced(order.id);
        syncedCount++;
        console.log(`Successfully synced order ${order.id}`);
      } else {
        console.error(`Failed to sync order ${order.id}`, await res.text());
      }
    } catch (e) {
      console.error(`Error syncing order ${order.id}:`, e);
      break;
    }
  }
  return { success: true, count: syncedCount };
}
async function fetchLiveOrders() {
  try {
    const res = await fetch(`${API_URL}/api/admin/orders`, {
      headers: {
        "x-pos-key": "dawat-pos-secret-123"
      }
    });
    if (!res.ok) {
      const text = await res.text();
      console.error(`Failed to fetch orders. Status: ${res.status}. Body: ${text}`);
      throw new Error("Failed to fetch");
    }
    const data = await res.json();
    if (Array.isArray(data)) {
      return data.map((order) => {
        var _a, _b, _c, _d;
        const isDelivery = (_a = order.notes) == null ? void 0 : _a.toLowerCase().includes("delivery");
        return {
          id: order.id,
          items: ((_b = order.orderItems) == null ? void 0 : _b.map((item) => {
            var _a2;
            return {
              name: ((_a2 = item.menuItem) == null ? void 0 : _a2.name) || "Unknown Item",
              quantity: item.quantity,
              price: parseFloat(item.unitPrice || "0")
            };
          })) || [],
          totalAmount: parseFloat(order.totalAmount || "0"),
          status: order.status || "PENDING",
          type: isDelivery ? "DELIVERY" : "TAKEAWAY",
          source: "ONLINE",
          // Everything fetched from backend is online for now
          customerName: ((_c = order.customer) == null ? void 0 : _c.name) || "Walk-in Guest",
          customerPhone: ((_d = order.customer) == null ? void 0 : _d.phone) || "",
          createdAt: order.createdAt
        };
      });
    }
    return data;
  } catch (e) {
    console.error("Error fetching live orders:", e);
    return null;
  }
}
async function fetchLiveMenu() {
  try {
    const res = await fetch(`${API_URL}/api/menu`);
    if (!res.ok) throw new Error("Failed to fetch menu");
    const data = await res.json();
    if (data && data.menuItems) {
      const posItems = data.menuItems.map((item) => {
        var _a, _b, _c;
        let iconName = "Utensils";
        const catName = ((_b = (_a = item.category) == null ? void 0 : _a.name) == null ? void 0 : _b.toLowerCase()) || "";
        if (catName.includes("desi")) iconName = "Flame";
        else if (catName.includes("burger") || catName.includes("fast")) iconName = "Sandwich";
        else if (catName.includes("pizza")) iconName = "Pizza";
        else if (catName.includes("drink")) iconName = "CupSoda";
        else if (catName.includes("bread") || catName.includes("naan")) iconName = "Circle";
        return {
          id: item.id,
          name: item.name,
          price: parseFloat(item.price),
          category: ((_c = item.category) == null ? void 0 : _c.name) || "Uncategorized",
          iconName,
          available: item.isAvailable
        };
      });
      return { menuItems: posItems };
    }
    return data;
  } catch (e) {
    console.error("Error fetching live menu:", e);
    return null;
  }
}
function startSyncEngine(webContents) {
  setInterval(async () => {
    await syncOfflineOrders();
    const liveOrders = await fetchLiveOrders();
    if (liveOrders) {
      webContents.send("live-orders-updated", liveOrders);
    }
    const liveMenu = await fetchLiveMenu();
    if (liveMenu && liveMenu.menuItems) {
      webContents.send("live-menu-updated", liveMenu.menuItems);
    }
  }, 1e4);
}
const __dirname$1 = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname$1, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 680,
    webPreferences: {
      preload: path.join(__dirname$1, "preload.mjs"),
      // contextIsolation MUST be true for contextBridge to work
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });
  win.setMenuBarVisibility(false);
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
    startSyncEngine(win.webContents);
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.whenReady().then(() => {
  createWindow();
  ipcMain.handle("get-local-orders", () => {
    return getLocalOrders();
  });
  ipcMain.handle("save-local-order", (_, order) => {
    saveLocalOrder(order);
    return { success: true };
  });
  ipcMain.handle("force-sync", async () => {
    const syncRes = await syncOfflineOrders();
    const liveOrders = await fetchLiveOrders();
    return { syncRes, liveOrders };
  });
  ipcMain.handle("get-printers", async () => {
    return await (win == null ? void 0 : win.webContents.getPrintersAsync()) || [];
  });
  ipcMain.handle("test-print", async (_, { printerName, htmlContent }) => {
    return new Promise((resolve) => {
      let printWindow = new BrowserWindow({
        show: false,
        webPreferences: { nodeIntegration: false, contextIsolation: true }
      });
      const html = htmlContent || `<html><body style="font-family: monospace; padding: 20px;">
        <h2 style="text-align: center;">ePOSmatic</h2>
        <p style="text-align: center;">Printer Test Successful</p>
        <hr/>
        <p>Target Printer: ${printerName}</p>
        <p>Date: ${(/* @__PURE__ */ new Date()).toLocaleString()}</p>
        <hr/>
        <p style="text-align: center;">Thank you!</p>
      </body></html>`;
      const dataUri = "data:text/html;charset=utf-8," + encodeURIComponent(html);
      printWindow.loadURL(dataUri);
      printWindow.webContents.on("did-finish-load", () => {
        printWindow == null ? void 0 : printWindow.webContents.print({
          silent: true,
          deviceName: printerName,
          printBackground: true
        }, (success, failureReason) => {
          resolve({ success, error: failureReason });
          printWindow == null ? void 0 : printWindow.close();
          printWindow = null;
        });
      });
    });
  });
});
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
