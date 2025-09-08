<script lang="ts">
  import { API_BASE_URL } from '$lib/config/api';
  import { onMount } from 'svelte';
  let user: any = $state(null);
  let error: string | null = $state(null);
  onMount(async () => {
    try {
      const token = localStorage.getItem('bayanihan_token');
      if (!token) return;
      const res = await fetch(`${API_BASE_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(await res.text());
      user = await res.json();
    } catch (e: any) {
      error = e.message || 'Failed to load profile';
    }
  });
</script>

<div class="p-6">
  <h1 class="text-2xl font-bold mb-4">My Profile</h1>
  {#if error}
    <p class="text-red-600">{error}</p>
  {:else if user}
    <div class="bg-white rounded-xl border p-4">
      <p class="font-semibold">{user.name}</p>
      <p class="text-gray-600 text-sm">{user.email}</p>
    </div>
  {:else}
    <p class="text-gray-600">Please sign in to view your profile.</p>
  {/if}
</div>


