export interface Message {
	id: string;
	tradeId: string;
	senderId: string;
	receiverId: string;
	content: string;
	isRead: boolean;
	createdAt: Date;
	// Computed fields
	sender?: {
		id: string;
		name: string;
		avatar?: string;
	};
	receiver?: {
		id: string;
		name: string;
		avatar?: string;
	};
	timeAgo?: string;
}

export interface Conversation {
	id: string;
	tradeId: string;
	otherUser: {
		id: string;
		name: string;
		avatar?: string;
		online?: boolean;
	};
	lastMessage?: {
		content: string;
		senderId: string;
		createdAt: Date;
		timeAgo?: string;
	};
	unreadCount: number;
	tradeItem: {
		id: string;
		title: string;
		image?: string;
	};
	status: 'active' | 'pending' | 'completed';
}

export interface CreateMessageData {
	tradeId: string;
	receiverId: string;
	content: string;
}

export interface MessageFilters {
	tradeId?: string;
	userId?: string;
	limit?: number;
	offset?: number;
}
