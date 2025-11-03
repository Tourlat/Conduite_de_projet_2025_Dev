<template>
  <div class="dashboard">
    <h1>Bienvenue, {{ user?.name }}!</h1>
    
    <div class="dashboard-grid">
      <div class="card">
        <h2>Projets</h2>
        <p>Gérez vos projets</p>
        <!-- <router-link to="/projects" class="btn">Voir les projets</router-link> -->
      </div>

      <div class="card">
        <h2>Profil</h2>
        <p>{{ user?.email }}</p>
        <p>{{ user?.name }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'


const userEmail = localStorage.getItem('userEmail') || ''
const userName = localStorage.getItem('userName') || ''

const user = computed(() => ({
  email: userEmail,
  name: userName
}))
</script>



<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  color: var(--terminal-accent);
  margin-bottom: 2rem;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

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

.card p {
  color: var(--terminal-fg);
  margin-bottom: 1rem;
}
</style>