import path from 'node:path';
import fs from 'node:fs';

const isDev = process.env.NODE_ENV === 'development';
// Store db in user data path, or local path during dev
const dbPath = isDev 
  ? path.join(process.cwd(), 'pos-local.json')
  : path.join(process.env.APPDATA || process.cwd(), 'dawat-e-khaas-pos', 'pos-local.json');

// Ensure directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize empty DB if it doesn't exist
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify({ local_orders: [], settings: {} }), 'utf-8');
}

function readDB() {
  try {
    const data = fs.readFileSync(dbPath, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return { local_orders: [], settings: {} };
  }
}

function writeDB(data: any) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
}

export function getLocalOrders() {
  const db = readDB();
  return db.local_orders.sort((a: any, b: any) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function saveLocalOrder(order: any) {
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
    createdAt: new Date().toISOString()
  };
  
  db.local_orders.push(newOrder);
  writeDB(db);
}

export function markOrderSynced(id: string) {
  const db = readDB();
  const order = db.local_orders.find((o: any) => o.id === id);
  if (order) {
    order.isSynced = 1;
    writeDB(db);
  }
}

export function getUnsyncedOrders() {
  const db = readDB();
  return db.local_orders.filter((o: any) => o.isSynced === 0);
}
