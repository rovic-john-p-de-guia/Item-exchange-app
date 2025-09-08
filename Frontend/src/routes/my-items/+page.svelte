<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/authStore';
	import type { User } from '$lib/types/auth';

	let user: User | null = null;
	let isAuthenticated = false;
	let isLoading = true;
	let selectedTab = 'active';

	const tabs = [
		{ id: 'active', label: 'Active Items', count: 3 },
		{ id: 'pending', label: 'Pending Trades', count: 1 },
		{ id: 'completed', label: 'Completed', count: 5 },
		{ id: 'drafts', label: 'Drafts', count: 2 }
	];

	let myItems = [
		{
			id: '1',
			title: 'MacBook Pro 2020',
			description: '13-inch MacBook Pro in excellent condition, barely used',
			category: 'Electronics',
			condition: 'Excellent',
			image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
			status: 'active',
			views: 24,
			offers: 3,
			posted: '2 days ago'
		},
		{
			id: '2',
			title: 'Guitar Lessons',
			description: 'Professional guitar lessons for all skill levels',
			category: 'Services',
			condition: 'New',
			image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400',
			status: 'active',
			views: 18,
			offers: 1,
			posted: '1 week ago'
		},
		{
			id: '3',
			title: 'Vintage Camera',
			description: 'Canon AE-1 film camera with lens',
			category: 'Electronics',
			condition: 'Good',
			image: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400',
			status: 'pending',
			views: 45,
			offers: 2,
			posted: '3 days ago'
		}
	];

	let filteredItems = $derived(myItems.filter(item => {
		if (selectedTab === 'active') return item.status === 'active';
		if (selectedTab === 'pending') return item.status === 'pending';
		if (selectedTab === 'completed') return item.status === 'completed';
		if (selectedTab === 'drafts') return item.status === 'draft';
		return true;
	}));

	onMount(() => {
		const unsubscribe = authStore.subscribe((authState) => {
			user = authState.user;
			isAuthenticated = authState.isAuthenticated;
			isLoading = authState.isLoading;
			
			// Redirect if not authenticated
			if (!authState.isLoading && !authState.isAuthenticated) {
				goto('/sign-in-up');
			}
		});
		return unsubscribe;
	});

	function handleEditItem(item: any) {
		console.log('Edit item:', item);
		// TODO: Navigate to edit page
	}

	function handleDeleteItem(item: any) {
		console.log('Delete item:', item);
		// TODO: Show confirmation and delete
	}

	function handleViewOffers(item: any) {
		console.log('View offers for:', item);
		// TODO: Navigate to offers page
	}
</script>

<div class="p-4 lg:p-6">
	<!-- Header -->
	<div class="mb-6 lg:mb-8">
		<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
			<div>
				<h1 class="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">My Items</h1>
				<p class="text-gray-600">Manage your posted items and track their status</p>
			</div>
			
			<!-- Add Item Button -->
			<div class="mt-4 sm:mt-0">
				<button class="bg-red-600 text-white px-6 py-2 rounded-xl hover:bg-red-700 transition-all duration-200 font-semibold shadow-sm hover:shadow-md">
					Add New Item
				</button>
			</div>
		</div>
	</div>

	{#if isLoading}
		<div class="flex flex-col items-center justify-center py-16">
			<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
			<span class="text-gray-600 font-medium">Loading your items...</span>
		</div>
	{:else if isAuthenticated}
		<!-- Tabs -->
		<div class="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 lg:mb-8">
			<div class="border-b border-gray-200">
				<nav class="-mb-px flex overflow-x-auto px-4 lg:px-6">
					{#each tabs as tab}
						<button
							on:click={() => selectedTab = tab.id}
							class="flex items-center space-x-2 py-4 px-3 lg:px-6 border-b-2 font-medium text-sm transition-colors whitespace-nowrap
								{selectedTab === tab.id 
									? 'border-red-500 text-red-600' 
									: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
						>
							<span>{tab.label}</span>
							<span class="bg-gray-100 text-gray-600 py-1 px-2 rounded-full text-xs font-semibold">
								{tab.count}
							</span>
						</button>
					{/each}
				</nav>
			</div>
		</div>

		<!-- Action Bar -->
		<div class="flex justify-between items-center mb-6">
			<div class="text-sm text-gray-600">
				{filteredItems.length} {selectedTab} item{filteredItems.length !== 1 ? 's' : ''}
			</div>
			<button class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium">
				+ Post New Item
			</button>
		</div>

		<!-- Items Grid -->
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
			{#each filteredItems as item}
				<div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
					<!-- Item Image -->
					<div class="relative bg-gray-200 overflow-hidden">
						<img 
							src={item.image} 
							alt={item.title}
							class="w-full h-48 object-cover"
						/>
						<div class="absolute top-3 right-3">
							<span class="bg-white bg-opacity-90 text-gray-800 text-xs px-2 py-1 rounded-full font-medium">
								{item.condition}
							</span>
						</div>
					</div>

					<!-- Item Details -->
					<div class="p-4 lg:p-5">
						<div class="mb-3">
							<h3 class="font-semibold text-gray-900 text-lg mb-2 line-clamp-1">{item.title}</h3>
							<p class="text-gray-600 text-sm line-clamp-2">{item.description}</p>
						</div>
						
						<!-- Stats -->
						<div class="flex items-center justify-between text-sm text-gray-500 mb-4">
							<div class="flex items-center space-x-4">
								<div class="flex items-center">
									<svg class="h-4 w-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
									</svg>
									<span>{item.views} views</span>
								</div>
								<div class="flex items-center">
									<svg class="h-4 w-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
									</svg>
									<span>{item.offers} offers</span>
								</div>
							</div>
							<span class="text-xs">{item.posted}</span>
						</div>

						<!-- Actions -->
						<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-3 border-t border-gray-100 space-y-2 sm:space-y-0">
							<div class="flex space-x-3">
								<button 
									on:click={() => handleEditItem(item)}
									class="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
								>
									Edit
								</button>
								<button 
									on:click={() => handleDeleteItem(item)}
									class="text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
								>
									Delete
								</button>
							</div>
							{#if item.offers > 0}
								<button 
									on:click={() => handleViewOffers(item)}
									class="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors shadow-sm hover:shadow-md"
								>
									View Offers ({item.offers})
								</button>
							{/if}
						</div>
					</div>
				</div>
			{/each}
		</div>

		<!-- Empty State -->
		{#if filteredItems.length === 0}
			<div class="text-center py-12">
				<svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
				</svg>
				<h3 class="mt-2 text-sm font-medium text-gray-900">No {selectedTab} items</h3>
				<p class="mt-1 text-sm text-gray-500">
					{selectedTab === 'active' ? 'You haven\'t posted any items yet.' : `You don't have any ${selectedTab} items.`}
				</p>
				{#if selectedTab === 'active'}
					<button class="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium">
						Post Your First Item
					</button>
				{/if}
			</div>
		{/if}
	{/if}
</div>
