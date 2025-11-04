<template>
  <div class="card">
    <h2>Profil</h2>
    <p class="user-email">{{ user.email }}</p>
    <p class="user-name">{{ user.name }}</p>
  </div>
</template>

<script setup lang="ts">
interface User {
  email: string
  name: string
}

defineProps<{
  user: User
}>()
</script>

<style scoped>
.card {
  background: var(--terminal-bg);
  border: 1px solid var(--terminal-border);
  padding: 2rem;
  border-radius: 8px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card h2 {
  color: var(--terminal-accent);
  margin-bottom: 1rem;
}

.user-email,
.user-name {
  color: var(--terminal-fg);
  margin-bottom: 1rem;
}

.user-email {
  font-family: monospace;
  font-size: 0.95rem;
}

.user-name {
  font-weight: 600;
}
</style>
