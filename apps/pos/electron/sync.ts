import { getUnsyncedOrders, markOrderSynced } from './database.js';

// In production, this would be your Vercel URL (e.g. https://dawat-e-khaas.vercel.app)
// For local testing, we use the local web app
const API_URL = process.env.VITE_API_URL || 'http://localhost:3000';

export async function syncOfflineOrders() {
  const unsynced = getUnsyncedOrders();
  if (unsynced.length === 0) return { success: true, count: 0 };

  console.log(`Attempting to sync ${unsynced.length} offline orders...`);
  
  let syncedCount = 0;
  for (const order of unsynced) {
    try {
      const items = JSON.parse(order.itemsJson as string);
      
      const payload = {
        items: items.map((item: any) => ({
          menuItemId: item.id,
          quantity: item.quantity
        })),
        customerName: order.customerName || 'Walk-in Customer',
        customerPhone: order.customerPhone || '',
        orderType: order.type || 'PICKUP'
      };

      const res = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-pos-key': 'dawat-pos-secret-123'
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        markOrderSynced(order.id as string);
        syncedCount++;
        console.log(`Successfully synced order ${order.id}`);
      } else {
        console.error(`Failed to sync order ${order.id}`, await res.text());
      }
    } catch (e) {
      console.error(`Error syncing order ${order.id}:`, e);
      // Internet might be down, stop syncing and try again later
      break;
    }
  }

  return { success: true, count: syncedCount };
}

export async function fetchLiveOrders() {
  try {
    const res = await fetch(`${API_URL}/api/admin/orders`, {
      headers: {
        'x-pos-key': 'dawat-pos-secret-123'
      }
    });
    if (!res.ok) {
      const text = await res.text();
      console.error(`Failed to fetch orders. Status: ${res.status}. Body: ${text}`);
      throw new Error('Failed to fetch');
    }
    const data = await res.json();
    
    // Map backend format to POS format
    if (Array.isArray(data)) {
      return data.map((order: any) => {
        const isDelivery = order.notes?.toLowerCase().includes('delivery');
        return {
          id: order.id,
          items: order.orderItems?.map((item: any) => ({
            name: item.menuItem?.name || 'Unknown Item',
            quantity: item.quantity,
            price: parseFloat(item.unitPrice || '0')
          })) || [],
          totalAmount: parseFloat(order.totalAmount || '0'),
          status: order.status || 'PENDING',
          type: isDelivery ? 'DELIVERY' : 'TAKEAWAY',
          source: 'ONLINE', // Everything fetched from backend is online for now
          customerName: order.customer?.name || 'Walk-in Guest',
          customerPhone: order.customer?.phone || '',
          createdAt: order.createdAt
        };
      });
    }
    
    return data;
  } catch (e) {
    console.error('Error fetching live orders:', e);
    return null; // Return null if offline
  }
}

export async function fetchLiveMenu() {
  try {
    const res = await fetch(`${API_URL}/api/menu`);
    if (!res.ok) throw new Error('Failed to fetch menu');
    const data = await res.json();
    
    // Map backend format to POS format
    if (data && data.menuItems) {
      const posItems = data.menuItems.map((item: any) => {
        let iconName = 'Utensils';
        const catName = item.category?.name?.toLowerCase() || '';
        if (catName.includes('desi')) iconName = 'Flame';
        else if (catName.includes('burger') || catName.includes('fast')) iconName = 'Sandwich';
        else if (catName.includes('pizza')) iconName = 'Pizza';
        else if (catName.includes('drink')) iconName = 'CupSoda';
        else if (catName.includes('bread') || catName.includes('naan')) iconName = 'Circle';
        
        return {
          id: item.id,
          name: item.name,
          price: parseFloat(item.price),
          category: item.category?.name || 'Uncategorized',
          iconName,
          available: item.isAvailable
        };
      });
      return { menuItems: posItems };
    }
    return data;
  } catch (e) {
    console.error('Error fetching live menu:', e);
    return null;
  }
}

// Start background sync interval
export function startSyncEngine(webContents: Electron.WebContents) {
  setInterval(async () => {
    // 1. Try to push offline orders
    await syncOfflineOrders();

    // 2. Try to pull live orders
    const liveOrders = await fetchLiveOrders();
    if (liveOrders) {
      webContents.send('live-orders-updated', liveOrders);
    }

    // 3. Try to pull live menu
    const liveMenu = await fetchLiveMenu();
    if (liveMenu && liveMenu.menuItems) {
      webContents.send('live-menu-updated', liveMenu.menuItems);
    }
  }, 10000); // Check every 10 seconds
}
