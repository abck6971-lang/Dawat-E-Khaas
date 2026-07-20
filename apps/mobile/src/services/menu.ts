import { API_BASE_URL } from '../config/api';
import { MenuResponse } from '../types';

export async function getMenuData(): Promise<MenuResponse | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/menu`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch menu data: ${response.status}`);
    }
    
    const data: MenuResponse = await response.json();
    
    // The web API returns relative URLs for images (e.g. /uploads/image.png)
    // The mobile app needs absolute URLs to display them.
    const baseUrl = API_BASE_URL.replace('/api', '');
    data.menuItems = data.menuItems.map(item => {
      if (item.imageUrl && item.imageUrl.startsWith('/')) {
        item.imageUrl = `${baseUrl}${item.imageUrl}`;
      }
      return item;
    });

    return data;
  } catch (error) {
    console.error('Error fetching menu data:', error);
    return null;
  }
}
