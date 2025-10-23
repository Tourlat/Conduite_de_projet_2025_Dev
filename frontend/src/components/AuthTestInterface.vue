<template>
  <div id="auth-test-interface">
    <header>
      <h1>🚀 Conduite de Projet 2025</h1>
      <nav>
        <button 
          @click="currentView = 'login'" 
          :class="{ active: currentView === 'login' }"
        >
          Connexion
        </button>
        <button 
          @click="currentView = 'register'" 
          :class="{ active: currentView === 'register' }"
        >
          Inscription
        </button>
        <button 
          @click="currentView = 'project'" 
          :class="{ active: currentView === 'project' }"
        >
          Créer un Projet
        </button>
      </nav>
    </header>

    <main>
      <div class="form-container">
        <LoginForm 
          v-if="currentView === 'login'" 
          @login="handleLogin"
        />
        
        <RegisterForm 
          v-if="currentView === 'register'" 
          @register="handleRegister"
        />
        
        <CreateProjectForm 
          v-if="currentView === 'project'" 
          @createProject="handleCreateProject"
        />
      </div>
    </main>

    <footer>
      <p>Sprint 1 - Interface de test Frontend</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import LoginForm from './LoginForm.vue'
import RegisterForm from './RegisterForm.vue'
import CreateProjectForm from './CreateProjectForm.vue'

type View = 'login' | 'register' | 'project'

const currentView = ref<View>('login')

interface LoginData {
  email: string
  password: string
}

interface RegisterData {
  email: string
  username: string
  password: string
}

interface ProjectData {
  name: string
  description: string
}

const handleLogin = (data: LoginData) => {
  console.log('Login attempt with:', data)
  alert(`Connexion avec: ${data.email}`)
  // TODO: Appeler l'API backend pour la connexion
}

const handleRegister = (data: RegisterData) => {
  console.log('Registration attempt with:', data)
  alert(`Inscription réussie pour: ${data.username}`)
  // TODO: Appeler l'API backend pour l'inscription
  currentView.value = 'login'
}

const handleCreateProject = (data: ProjectData) => {
  console.log('Project creation with:', data)
  alert(`Projet créé: ${data.name}`)
  // TODO: Appeler l'API backend pour créer le projet
}
</script>

<style scoped>
#auth-test-interface {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

header h1 {
  margin: 0 0 1.5rem 0;
  font-size: 2rem;
}

nav {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

nav button {
  padding: 0.75rem 1.5rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

nav button:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
}

nav button.active {
  background: white;
  color: #667eea;
  border-color: white;
}

main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(to bottom, #f7fafc, #edf2f7);
}

.form-container {
  background: white;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

footer {
  background: #2d3748;
  color: white;
  text-align: center;
  padding: 1rem;
  font-size: 0.875rem;
}

footer p {
  margin: 0;
}
</style>
