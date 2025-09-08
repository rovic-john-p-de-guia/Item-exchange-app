<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/authStore';

	onMount(() => {
		// Subscribe to auth store
		const unsubscribe = authStore.subscribe((authState) => {
			// Redirect to discovery page (public) after a short delay
			if (!authState.isLoading) {
				setTimeout(() => {
					goto('/sign-in-up');
				}, 1000);
			}
		});

		// Initialize auth state
		authStore.initializeAuth();

		// Cleanup subscription
		return unsubscribe;
	});
</script>

<div class="min-h-screen bg-gray-50 flex items-center justify-center">
	<div class="text-center">
		<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
		<p class="text-gray-600">Loading Bayanihan Exchange...</p>
		<p class="text-sm text-gray-500 mt-2">Redirecting to Discovery page...</p>
	</div>
</div>