<template>
  <div class="no-projects">
    <p>{{ message }}</p>
    <router-link v-if="showCreateButton" to="/projects" class="btn">
      Créer un projet
    </router-link>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  message: string
  showCreateButton?: boolean
}>()
</script>

<style scoped>
.no-projects {
  text-align: center;
  padding: 3rem 1rem;
  background: var(--terminal-bg);
  border: 1px solid var(--terminal-border);
  border-radius: 8px;
  margin-bottom: 2rem;
}

.no-projects p {
  color: var(--terminal-fg);
  margin-bottom: 1.5rem;
}

.btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: var(--terminal-accent);
  color: var(--terminal-bg);
  text-decoration: none;
  border-radius: 4px;
  font-weight: 600;
  transition: background 0.2s;
}

.btn:hover {
  background: var(--terminal-accent-hover);
}
</style>
