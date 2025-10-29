<template>
  <div id="auth-interface">
    <div class="container">
      <nav class="tabs">

        <button 
          :class="{ active: currentView === 'login' }" 
          @click="currentView = 'login'"
        >
          Connexion
        </button>

        <button 
          :class="{ active: currentView === 'register' }" 
          @click="currentView = 'register'"
        >
          Inscription
        </button>

      </nav>

      <div class="form-container">
        <LoginForm 
          v-if="currentView === 'login'" 
          @switch-to-register="currentView = 'register'"
        />
        
        <RegisterForm 
          v-if="currentView === 'register'" 
          @switch-to-login="currentView = 'login'"
        />

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import LoginForm from './auth/LoginForm.vue'
import RegisterForm from './auth/RegisterForm.vue'

type View = 'login' | 'register' | 'project'

const currentView = ref<View>('login')
</script>

<style scoped>
#auth-interface {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--terminal-bg);
  padding: 2rem;
}

.container {
  width: 100%;
  max-width: 450px;
}

.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.tabs button {
  flex: 1;
  padding: 0.65rem 1rem;
  border: none;
  background: var(--terminal-hover);
  color: var(--terminal-fg);
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
  opacity: 0.6;
}

.tabs button:hover {
  opacity: 0.8;
}

.tabs button.active {
  background: var(--terminal-accent);
  color: white;
  opacity: 1;
}

.form-container {
  background: var(--terminal-hover);
  padding: 2rem;
  border-radius: 8px;
  border: 1px solid var(--terminal-border);
}
</style>
