<script lang="ts">
	import { onMount } from 'svelte';
	import { authStore } from '$lib/stores/authStore';
	import type { User } from '$lib/types/auth';

	let user: User | null = null;
	let isLoading = true;


	onMount(() => {
		// Subscribe to auth store
		const unsubscribe = authStore.subscribe((authState) => {
			user = authState.user;
			isLoading = authState.isLoading;
		});

		// Initialize auth state
		authStore.initializeAuth();

		// Cleanup subscription
		return unsubscribe;
	});
</script>

<div class="p-6">
		{#if isLoading}
			<div class="text-center">
				<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
				<p class="text-gray-600">Loading your dashboard...</p>
			</div>
		{:else if user}
			<div class="text-center">
				<h2 class="text-3xl font-bold text-gray-900 mb-4">
					Welcome back, {user.name}! 🎉
				</h2>
				<p class="text-lg text-gray-600 mb-8">
					You have successfully signed in to Bayanihan Exchange
				</p>
			
				<div class="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
					<h3 class="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
					<div class="space-y-3">
						<button class="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors">
							Browse Items
						</button>
						<button class="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">
							Post an Item
						</button>
						<button class="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">
							View Profile
						</button>
					</div>
				</div>
			</div>
		{/if}
</div>
