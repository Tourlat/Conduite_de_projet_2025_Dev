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
  background: var(--terminal-bg);
}

header {
  background: linear-gradient(135deg, var(--terminal-purple) 0%, var(--terminal-accent-dark) 50%, var(--terminal-magenta) 100%);
  color: var(--terminal-fg);
  padding: 2rem;
  text-align: center;
  box-shadow: 0 4px 20px rgba(185, 103, 255, 0.3);
  border-bottom: 2px solid var(--terminal-accent);
  position: relative;
}

header::before {
  content: '>';
  position: absolute;
  left: 2rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 2rem;
  color: var(--terminal-success);
  animation: blink 1.5s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

header h1 {
  margin: 0 0 1.5rem 0;
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, #ffffff 0%, var(--terminal-fg) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 30px var(--terminal-shadow);
}

nav {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

nav button {
  padding: 0.75rem 1.5rem;
  border: 2px solid var(--terminal-border);
  background: rgba(185, 103, 255, 0.1);
  color: var(--terminal-fg);
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  font-family: 'Fira Code', monospace;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

nav button::before {
  content: '$ ';
  color: var(--terminal-accent);
  font-weight: bold;
}

nav button::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: var(--terminal-accent);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

nav button:hover {
  background: rgba(185, 103, 255, 0.2);
  border-color: var(--terminal-accent);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px var(--terminal-shadow);
}

nav button:hover::after {
  transform: scaleX(1);
}

nav button.active {
  background: linear-gradient(135deg, var(--terminal-accent) 0%, var(--terminal-magenta) 100%);
  color: #ffffff;
  border-color: var(--terminal-magenta);
  box-shadow: 0 0 20px var(--terminal-shadow);
}

nav button.active::before {
  color: #ffffff;
}

main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: var(--terminal-bg);
  position: relative;
}

main::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    linear-gradient(90deg, var(--terminal-border) 1px, transparent 1px),
    linear-gradient(0deg, var(--terminal-border) 1px, transparent 1px);
  background-size: 50px 50px;
  opacity: 0.03;
  pointer-events: none;
}

.form-container {
  background: rgba(41, 42, 45, 0.95);
  padding: 2.5rem;
  border-radius: 8px;
  border: 2px solid var(--terminal-border);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(185, 103, 255, 0.1),
    inset 0 0 20px rgba(185, 103, 255, 0.05);
  width: 100%;
  max-width: 500px;
  animation: fadeIn 0.4s ease;
  position: relative;
  overflow: hidden;
}

.form-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--terminal-accent) 0%, var(--terminal-magenta) 100%);
  animation: slideProgress 2s ease infinite;
}

@keyframes slideProgress {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

footer {
  background: var(--terminal-bg);
  color: var(--terminal-fg);
  text-align: center;
  padding: 1.5rem;
  font-size: 0.875rem;
  border-top: 2px solid var(--terminal-border);
  font-family: 'Fira Code', monospace;
}

footer p {
  margin: 0;
}

footer p::before {
  content: '// ';
  color: var(--terminal-accent);
  font-weight: bold;
}
</style>
