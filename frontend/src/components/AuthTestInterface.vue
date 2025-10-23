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
          @switchToRegister="currentView = 'register'"
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
  nom: string
  email: string
  password: string
}

interface ProjectData {
  name: string
  description: string
}

const handleLogin = async (data: LoginData) => {
  console.log('Login attempt with:', data)
  try {
    // TODO: Remplacer par un véritable appel API POST /api/auth/login
    // const response = await fetch('/api/auth/login', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data)
    // })
    // const result = await response.json()
    // if (response.ok) {
    //   localStorage.setItem('token', result.token)
    //   // Redirection vers le dashboard
    // }
    
    alert(`Connexion avec: ${data.email}`)
  } catch (error) {
    console.error('Erreur de connexion:', error)
    alert('Erreur: Email ou mot de passe incorrect')
  }
}

const handleRegister = async (data: RegisterData) => {
  console.log('Registration attempt with:', data)
  try {
    // TODO: Remplacer par un véritable appel API POST /api/utilisateurs/inscription
    // const response = await fetch('/api/utilisateurs/inscription', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data)
    // })
    // const result = await response.json()
    // if (response.ok) {
    //   alert('Inscription réussie !')
    //   currentView.value = 'login'
    // } else if (response.status === 409) {
    //   alert('Cet email existe déjà')
    // }
    
    alert(`Inscription réussie pour: ${data.nom}`)
    currentView.value = 'login'
  } catch (error) {
    console.error('Erreur d\'inscription:', error)
    alert('Erreur lors de l\'inscription')
  }
}

const handleCreateProject = async (data: ProjectData) => {
  console.log('Project creation with:', data)
  try {
    // TODO: Remplacer par un véritable appel API POST /api/projets avec JWT
    // const token = localStorage.getItem('token')
    // const response = await fetch('/api/projets', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${token}`
    //   },
    //   body: JSON.stringify(data)
    // })
    // const result = await response.json()
    // if (response.ok) {
    //   alert(`Projet créé: ${result.nom}`)
    //   // Redirection vers la page du projet ou liste des projets
    // }
    
    alert(`Projet créé: ${data.name}`)
  } catch (error) {
    console.error('Erreur de création de projet:', error)
    alert('Erreur lors de la création du projet')
  }
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
  background: var(--terminal-hover);
  border-bottom: 1px solid var(--terminal-border);
  padding: 1.5rem 2rem;
}

header h1 {
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--terminal-fg);
}

nav {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

nav button {
  padding: 0.5rem 1rem;
  border: 1px solid var(--terminal-border);
  background: transparent;
  color: var(--terminal-fg);
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

nav button:hover {
  background: var(--terminal-hover);
  border-color: var(--terminal-accent);
}

nav button.active {
  background: var(--terminal-accent);
  color: white;
  border-color: var(--terminal-accent);
}

main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.form-container {
  background: var(--terminal-hover);
  padding: 2rem;
  border-radius: 8px;
  border: 1px solid var(--terminal-border);
  width: 100%;
  max-width: 450px;
}

footer {
  background: var(--terminal-hover);
  border-top: 1px solid var(--terminal-border);
  color: var(--terminal-fg);
  text-align: center;
  padding: 1rem;
  font-size: 0.875rem;
  opacity: 0.7;
}

footer p {
  margin: 0;
}
</style>
