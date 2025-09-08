<script lang="ts">
  import { authStore } from '$lib/stores/authStore';
  let user = $derived($state<any>(null));
  const unsubscribe = authStore.subscribe((s) => (user = s.user));
  $: unsubscribe;
</script>

<div class="p-6">
  <h1 class="text-2xl font-bold mb-4">My Profile</h1>
  {#if user}
    <div class="bg-white rounded-xl border p-4">
      <p class="font-semibold">{user.name}</p>
      <p class="text-gray-600 text-sm">{user.email}</p>
    </div>
  {:else}
    <p class="text-gray-600">Please sign in to view your profile.</p>
  {/if}
</div>


