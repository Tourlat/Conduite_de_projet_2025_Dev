<script setup lang="ts">
import { authStore } from '../stores/authStore'
import { useRouter } from 'vue-router'

const router = useRouter()

const handleLogout = () => {
  authStore.logout()
  router.push('/auth')
}
</script>

<template>
  <nav v-if="authStore.isLoggedIn()" class="navbar">
    <div class="nav-brand">Conduite de Projet</div>
    <div class="nav-links">
      <router-link to="/dashboard">Dashboard</router-link>
      <router-link to="/projects">Création de Projet</router-link>
      <button class="logout-btn" @click="handleLogout">Déconnexion</button>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--terminal-bg);
  border-bottom: 2px solid var(--terminal-accent);
  padding: 1rem 2rem;
  box-shadow: 0 2px 8px var(--terminal-shadow);
}

.nav-brand {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--terminal-accent);
  letter-spacing: 0.5px;
}

.nav-links {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.nav-links a {
  color: var(--terminal-fg);
  text-decoration: none;
  transition: all 0.2s ease;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 4px;
}

.nav-links a:hover {
  color: var(--terminal-accent);
  background-color: var(--terminal-hover);
}

.logout-btn {
  background:  var(--terminal-accent);
  color: white;
  border: none;
  padding: 0.5rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  font-size: 0.95rem;
}

.logout-btn:hover {
  background: var(--terminal-accent-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(247, 118, 142, 0.2);
}

.logout-btn:active {
  transform: translateY(0);
}
</style>
