import { v4 as uuidv4 } from 'uuid';
import type { Trade, CreateTradeData, UpdateTradeData, TradeFilters } from '../types/trades';
import { api } from '../config/api';

class TradeService {
	// Trades CRUD operations
	async createTrade(fromUserId: string, tradeData: CreateTradeData): Promise<Trade | null> {
		try {
			const created = await api.post<any>('/trades/', {
				from_user_id: fromUserId,
				to_user_id: tradeData.toUserId,
				from_item_id: tradeData.fromItemId,
				to_item_id: tradeData.toItemId,
				message: tradeData.message,
				status: 'pending'
			});
			return this.mapApiTradeToTrade(created);
		} catch (error) {
			console.error('Error creating trade:', error);
			return null;
		}
	}

	async getTradeById(id: string): Promise<Trade | null> { return null; }

	async getTrades(filters: TradeFilters = {}): Promise<Trade[]> {
		try {
			const params = new URLSearchParams();
			if (filters.userId) params.set('user_id', filters.userId);
			const trades = await api.get<any[]>(`/trades/?${params.toString()}`);
			let mapped = trades.map(t => this.mapApiTradeToTrade(t));
			if (filters.status) mapped = mapped.filter(t => t.status === filters.status);
			return mapped;
		} catch (error) {
			console.error('Error getting trades:', error);
			return [];
		}
	}

	async updateTrade(id: string, updates: UpdateTradeData): Promise<Trade | null> { return null; }

	async deleteTrade(id: string): Promise<boolean> { return true; }

	async acceptTrade(tradeId: string, userId: string): Promise<boolean> { return true; }

	async rejectTrade(tradeId: string, userId: string): Promise<boolean> { return true; }

	async completeTrade(tradeId: string, userId: string): Promise<boolean> { return true; }

	private mapApiTradeToTrade(t: any): Trade {
		return {
			id: t.id,
			fromUserId: t.from_user_id,
			toUserId: t.to_user_id,
			fromItemId: t.from_item_id,
			toItemId: t.to_item_id,
			message: t.message ?? '',
			status: t.status,
			expiresAt: t.expires_at ? new Date(t.expires_at) : undefined,
			meetingLocation: t.meeting_location,
			meetingTime: t.meeting_time ? new Date(t.meeting_time) : undefined,
			createdAt: t.created_at ? new Date(t.created_at) : new Date(),
			updatedAt: t.updated_at ? new Date(t.updated_at) : new Date()
		};
	}
}

export const tradeService = new TradeService();