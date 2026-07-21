import { API_BASE_URL } from '../config/api';
import { MenuResponse } from '../types';

export async function getMenuData(): Promise<MenuResponse | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/menu`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch menu data: ${response.status}`);
    }
    
    const data: MenuResponse = await response.json();
    
    // Images are always served from Vercel (production host), even in dev mode.
    // Dev API might point to local IP but images only exist on the deployed website.
    const IMAGE_BASE_URL = 'https://dawat-e-khaas-web.vercel.app';
    data.menuItems = data.menuItems.map(item => {
      if (item.imageUrl && item.imageUrl.startsWith('/')) {
        item.imageUrl = `${IMAGE_BASE_URL}${item.imageUrl}`;
      }
      return item;
    });

    return data;
  } catch (error) {
    console.error('Error fetching menu data:', error);
    return null;
  }
}
