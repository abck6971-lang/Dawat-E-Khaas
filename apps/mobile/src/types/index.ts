export interface Category {
  id: string;
  name: string;
  sortOrder: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  categoryId: string;
  category: Category;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MenuResponse {
  categories: Category[];
  menuItems: MenuItem[];
}
