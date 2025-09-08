import { v4 as uuidv4 } from 'uuid';
import type { Message, Conversation, CreateMessageData, MessageFilters } from '../types/messages';
import { api } from '../config/api';

class MessageService {
	// Messages CRUD operations
	async createMessage(senderId: string, messageData: CreateMessageData): Promise<Message | null> {
		try {
			const created = await api.post<any>('/messages/', {
				trade_id: messageData.tradeId,
				sender_id: senderId,
				receiver_id: messageData.receiverId,
				content: messageData.content,
				is_read: false
			});
			return this.mapApiMessageToMessage(created);
		} catch (error) {
			console.error('Error creating message:', error);
			return null;
		}
	}

	async getMessageById(id: string): Promise<Message | null> { return null; }

	async getMessages(filters: MessageFilters): Promise<Message[]> {
		try {
			const msgs = await api.get<any[]>(`/messages/?trade_id=${encodeURIComponent(filters.tradeId)}`);
			return msgs.map(m => this.mapApiMessageToMessage(m));
		} catch (error) {
			console.error('Error getting messages:', error);
			return [];
		}
	}

	async getConversations(userId: string): Promise<Conversation[]> { return []; }

	async updateMessage(id: string, updates: Partial<Message>): Promise<Message | null> {
		try {
			// For now, we'll need to implement this in the database service
			// For now, just return null
			return null;
		} catch (error) {
			console.error('Error updating message:', error);
			return null;
		}
	}

	async deleteMessage(id: string): Promise<boolean> {
		try {
			// For now, we'll need to implement this in the database service
			// For now, just return true
			return true;
		} catch (error) {
			console.error('Error deleting message:', error);
			return false;
		}
	}

	async markAsRead(messageId: string): Promise<boolean> {
		try {
			// For now, we'll need to implement this in the database service
			// For now, just return true
			return true;
		} catch (error) {
			console.error('Error marking message as read:', error);
			return false;
		}
	}

	private mapApiMessageToMessage(m: any): Message {
		return {
			id: m.id,
			tradeId: m.trade_id,
			senderId: m.sender_id,
			receiverId: m.receiver_id,
			content: m.content,
			isRead: !!m.is_read,
			createdAt: m.created_at ? new Date(m.created_at) : new Date()
		};
	}
}

export const messageService = new MessageService();