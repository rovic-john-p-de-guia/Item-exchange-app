<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/authStore';
	import { messageService } from '$lib/services/messageService';
	import type { User } from '$lib/types/auth';
	import type { Conversation, Message } from '$lib/types/messages';

	let user: User | null = $state(null);
	let isAuthenticated = $state(false);
	let isLoading = $state(true);
	let selectedConversation: Conversation | null = $state(null);
	let searchQuery = $state('');
	let conversations: Conversation[] = $state([]);
	let messages: Message[] = $state([]);
	let error: string | null = $state(null);

	let filteredConversations = $derived(conversations.filter(conv => 
		conv.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
		(conv.tradeItem?.title || '').toLowerCase().includes(searchQuery.toLowerCase())
	));

	async function loadConversations() {
		if (!user) return;
		try {
			isLoading = true;
			error = null;
			const convs = await messageService.getConversations(user.id);
			conversations = convs;
		} catch (err) {
			error = 'Failed to load conversations. Please try again.';
			console.error('Error loading conversations:', err);
		} finally {
			isLoading = false;
		}
	}

	async function loadMessages(tradeId: string) {
		if (!user) return;
		try {
			const msgs = await messageService.getMessages({ tradeId });
			messages = msgs;
		} catch (err) {
			console.error('Error loading messages:', err);
		}
	}

	onMount(async () => {
		const unsubscribe = authStore.subscribe(async (authState) => {
			user = authState.user;
			isAuthenticated = authState.isAuthenticated;
			isLoading = authState.isLoading;
			if (!authState.isLoading && !authState.isAuthenticated) {
				goto('/sign-in-up');
			} else if (authState.isAuthenticated && authState.user) {
				await loadConversations();
			}
		});
		return unsubscribe;
	});

	async function selectConversation(conversation: Conversation) {
		selectedConversation = conversation;
		await loadMessages(conversation.tradeId);
	}

	async function sendMessage() {
		if (!selectedConversation || !user) return;
		const messageInput = document.querySelector('#messageInput') as HTMLInputElement;
		const content = messageInput?.value?.trim();
		if (!content) return;
		try {
			await messageService.createMessage(user.id, {
				tradeId: selectedConversation.tradeId,
				receiverId: selectedConversation.otherUser.id,
				content
			});
			messageInput.value = '';
			await loadMessages(selectedConversation.tradeId);
		} catch (error) {
			console.error('Error sending message:', error);
		}
	}
</script>

<div class="p-4 lg:p-6">
	<!-- Header removed per request -->

	{#if isLoading}
		<div class="flex flex-col items-center justify-center py-16">
			<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
			<span class="text-gray-600 font-medium">Loading your messages...</span>
		</div>
	{:else if isAuthenticated}
		<div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
			<div class="flex flex-col lg:flex-row h-[600px]">
				<!-- Conversations List -->
				<div class="w-full lg:w-1/3 border-b lg:border-b-0 lg:border-r border-gray-200 flex flex-col">
					<!-- Search -->
					<div class="p-4 border-b border-gray-200">
						<div class="relative">
							<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
								<svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
								</svg>
							</div>
							<input
								type="text"
								bind:value={searchQuery}
								placeholder="Search conversations..."
								class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm transition-colors"
							/>
						</div>
					</div>

					<!-- Conversations -->
					<div class="flex-1 overflow-y-auto">
						{#each filteredConversations as conversation}
							<button
								on:click={() => selectConversation(conversation)}
								class="w-full p-4 text-left hover:bg-gray-50 border-b border-gray-100 transition-colors group
									{selectedConversation?.tradeId === conversation.tradeId ? 'bg-red-50 border-red-200' : ''}"
							>
								<div class="flex items-center space-x-3">
									<div class="relative">
										<img 
											src={conversation.otherUser.avatar} 
											alt={conversation.otherUser.name}
											class="w-12 h-12 rounded-full object-cover"
										/>
										{#if conversation.otherUser.online}
											<div class="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
										{/if}
									</div>
									<div class="flex-1 min-w-0">
										<div class="flex items-center justify-between mb-1">
											<h3 class="font-medium text-gray-900 truncate">{conversation.otherUser.name}</h3>
											<span class="text-xs text-gray-500">{conversation.lastMessageTime}</span>
										</div>
										<p class="text-sm text-gray-600 truncate mb-1">{conversation.lastMessage}</p>
										<div class="flex items-center justify-between">
											<span class="text-xs text-gray-500">{conversation.tradeItem?.title}</span>
											{#if conversation.unreadCount > 0}
												<span class="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
													{conversation.unreadCount}
												</span>
											{/if}
										</div>
									</div>
								</div>
							</button>
						{/each}
					</div>
				</div>

				<!-- Chat Area -->
				<div class="flex-1 flex flex-col">
					{#if selectedConversation}
						<!-- Chat Header -->
						<div class="p-4 border-b border-gray-200 bg-gray-50">
							<div class="flex items-center space-x-3">
								<div class="relative">
									<img 
										src={selectedConversation.user.avatar} 
										alt={selectedConversation.user.name}
										class="w-10 h-10 rounded-full object-cover"
									/>
									{#if selectedConversation.user.online}
										<div class="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
									{/if}
								</div>
								<div class="flex-1 min-w-0">
									<h3 class="font-semibold text-gray-900 truncate">{selectedConversation.user.name}</h3>
									<p class="text-sm text-gray-500 truncate">
										{selectedConversation.user.online ? 'Online' : 'Offline'} • {selectedConversation.tradeItem}
									</p>
								</div>
							</div>
						</div>

						<!-- Messages -->
						<div class="flex-1 overflow-y-auto p-4 space-y-4">
							{#each messages as message}
								<div class="flex {message.isOwn ? 'justify-end' : 'justify-start'}">
									<div class="max-w-xs lg:max-w-md px-4 py-2 rounded-lg
										{message.isOwn 
											? 'bg-red-600 text-white' 
											: 'bg-gray-200 text-gray-900'}"
									>
										<p class="text-sm">{message.content}</p>
										<p class="text-xs mt-1 opacity-70">{message.timestamp}</p>
									</div>
								</div>
							{/each}
						</div>

						<!-- Message Input -->
						<div class="p-4 border-t border-gray-200 bg-gray-50">
							<div class="flex items-center space-x-3">
								<input
									id="messageInput"
									type="text"
									placeholder="Type a message..."
									class="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
									on:keydown={(e) => e.key === 'Enter' && sendMessage()}
								/>
								<button
									on:click={sendMessage}
									class="bg-red-600 text-white px-4 py-3 rounded-xl hover:bg-red-700 transition-colors shadow-sm hover:shadow-md"
									aria-label="Send message"
								>
									<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
									</svg>
								</button>
							</div>
						</div>
					{:else}
						<!-- No conversation selected -->
						<div class="flex-1 flex items-center justify-center">
							<div class="text-center">
								<svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
								</svg>
								<h3 class="mt-2 text-sm font-medium text-gray-900">No conversation selected</h3>
								<p class="mt-1 text-sm text-gray-500">Choose a conversation to start messaging</p>
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>

		<!-- Empty State removed per request -->
	{/if}
</div>
