import { v4 as uuidv4 } from 'uuid';
import type { Item, Category, CreateItemData, UpdateItemData, ItemFilters } from '../types/items';
import { api } from '../config/api';

class ItemService {
	// Items CRUD operations
	async createItem(userId: string, itemData: CreateItemData): Promise<Item | null> {
		try {
			const created = await api.post<any>('/items/', {
				user_id: userId,
				title: itemData.title,
				description: itemData.description,
				category: itemData.category,
				condition: itemData.condition,
				images: itemData.images,
				status: 'available'
			});
			return this.mapApiItemToItem(created);
		} catch (error) {
			console.error('Error creating item:', error);
			return null;
		}
	}

	async getItemById(id: string): Promise<Item | null> {
		try {
			const items = await api.get<any[]>(`/items/?`);
			const found = items.find(i => i.id === id);
			return found ? this.mapApiItemToItem(found) : null;
		} catch (error) {
			console.error('Error getting item by ID:', error);
			return null;
		}
	}

	async getItems(filters: ItemFilters = {}): Promise<Item[]> {
		try {
			const params = new URLSearchParams();
			if (filters.userId) params.set('user_id', filters.userId);
			if (filters.status) params.set('status', filters.status);
			if (filters.category) params.set('category', filters.category);
			const items = await api.get<any[]>(`/items/?${params.toString()}`);
			let mapped = items.map(i => this.mapApiItemToItem(i));
			if (filters.search) {
				const searchTerm = filters.search.toLowerCase();
				mapped = mapped.filter(item => item.title.toLowerCase().includes(searchTerm) || item.description.toLowerCase().includes(searchTerm));
			}
			return mapped;
		} catch (error) {
			console.error('Error getting items:', error);
			return [];
		}
	}

	async updateItem(id: string, updates: UpdateItemData): Promise<Item | null> {
		try {
			// For now, we'll need to implement this in the database service
			// For now, just return the current item
			return await this.getItemById(id);
		} catch (error) {
			console.error('Error updating item:', error);
			return null;
		}
	}

	async deleteItem(id: string): Promise<boolean> {
		try {
			// For now, we'll need to implement this in the database service
			// For now, just return true
			return true;
		} catch (error) {
			console.error('Error deleting item:', error);
			return false;
		}
	}

	async getCategories(): Promise<Category[]> {
		try {
			const categories = await api.get<any[]>(`/categories/`);
			return categories.map(cat => ({
				id: cat.id,
				name: cat.name,
				description: cat.description,
				icon: cat.icon,
				createdAt: cat.created_at ? new Date(cat.created_at) : new Date()
			}));
		} catch (error) {
			console.error('Error getting categories:', error);
			return [];
		}
	}

	async createCategory(categoryData: { name: string; description?: string; icon?: string }): Promise<Category | null> {
		try {
			const created = await api.post<any>(`/categories/`, categoryData);
			return {
				id: created.id,
				name: created.name,
				description: created.description,
				icon: created.icon,
				createdAt: created.created_at ? new Date(created.created_at) : new Date()
			};
		} catch (error) {
			console.error('Error creating category:', error);
			return null;
		}
	}

	private mapApiItemToItem(apiItem: any): Item {
		let images: string[] = [];
		try {
			if (Array.isArray(apiItem.images)) images = apiItem.images;
			else if (typeof apiItem.images === 'string' && apiItem.images.trim()) images = JSON.parse(apiItem.images);
		} catch {}
		return {
			id: apiItem.id,
			userId: apiItem.user_id,
			title: apiItem.title,
			description: apiItem.description ?? '',
			category: apiItem.category ?? '',
			condition: apiItem.condition ?? '',
			images,
			status: apiItem.status,
			views: apiItem.views ?? 0,
			createdAt: apiItem.created_at ? new Date(apiItem.created_at) : new Date(),
			updatedAt: apiItem.updated_at ? new Date(apiItem.updated_at) : new Date(),
			owner: apiItem.owner_name ? { id: apiItem.owner_id, name: apiItem.owner_name } : undefined
		};
	}
}

export const itemService = new ItemService();