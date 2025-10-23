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
          @login="handleLogin"
          @switch-to-register="currentView = 'register'"
        />
        
        <RegisterForm 
          v-if="currentView === 'register'" 
          @register="handleRegister"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import LoginForm from './auth/LoginForm.vue'
import RegisterForm from './auth/RegisterForm.vue'

type View = 'login' | 'register'

const currentView = ref<View>('login')

interface LoginData {
  email: string
  password: string
}

interface RegisterData {
  nom: string
  email: string
  password: string
}

const handleLogin = async (data: LoginData) => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    const result = await response.json()
    if (response.ok) {
      localStorage.setItem('token', result.token)
      //   // Redirection vers le dashboard
    }

    alert(`Connexion réussie pour: ${data.email}`)
  } catch (error) {
    console.error('Erreur de connexion:', error)
    alert('Erreur lors de la connexion')
  }
}

const handleRegister = async (data: RegisterData) => {
  try {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    const result = await response.json()
    if (response.ok) {
      alert(`Inscription réussie pour: ${result.email}`)
      currentView.value = 'login'
    }

    alert(`Inscription réussie pour: ${data.email}`)
    currentView.value = 'login'
  } catch (error) {
    console.error('Erreur d\'inscription:', error)
    alert('Erreur lors de l\'inscription')
  }
}
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
