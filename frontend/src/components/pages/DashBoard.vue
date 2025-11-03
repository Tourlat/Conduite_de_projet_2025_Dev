<template>
  <div class="dashboard">
    <h1>Bienvenue, {{ user?.name }}!</h1>
    
    <div class="dashboard-grid">
      <div class="card">
        <h2>Profil</h2>
        <p>{{ user?.email }}</p>
        <p>{{ user?.name }}</p>
      </div>
    </div>

    <div v-if="loading" class="loading">Chargement des projets...</div>
    
    <div v-else-if="error" class="error-message">{{ error }}</div>
    
    <div v-else>
      <!-- Mes projets créés -->
      <div class="projects-section">
        <h2>Mes Projets Créés</h2>
        
        <div v-if="myProjects.length === 0" class="no-projects">
          <p>Vous n'avez créé aucun projet pour le moment.</p>
          <router-link to="/projects" class="btn">Créer un projet</router-link>
        </div>
        
        <div v-else class="projects-grid">
          <div v-for="project in myProjects" :key="project.id" class="project-card">
            <div class="project-badge creator-badge">Créateur</div>
            <h3>{{ project.name }}</h3>
            <p v-if="project.description" class="project-description">{{ project.description }}</p>
            <p v-else class="project-description no-description">Pas de description</p>
            <div class="project-footer">
              <span class="project-date">Créé le {{ formatDate(project.createdAt) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Projets où je suis collaborateur -->
      <div class="projects-section">
        <h2>Projets en Collaboration</h2>
        
        <div v-if="collaboratorProjects.length === 0" class="no-projects">
          <p>Vous n'êtes collaborateur sur aucun projet pour le moment.</p>
        </div>
        
        <div v-else class="projects-grid">
          <div v-for="project in collaboratorProjects" :key="project.id" class="project-card">
            <div class="project-badge collaborator-badge">Collaborateur</div>
            <h3>{{ project.name }}</h3>
            <p v-if="project.description" class="project-description">{{ project.description }}</p>
            <p v-else class="project-description no-description">Pas de description</p>
            <div class="project-footer">
              <span class="project-creator">Par {{ project.creator?.name || 'Inconnu' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { authStore } from '../../stores/authStore'

interface Creator {
  id: number
  email: string
  name: string
}

interface Project {
  id: number
  name: string
  description?: string
  createdAt?: string
  creator?: Creator
}

const userEmail = localStorage.getItem('userEmail') || ''
const userName = localStorage.getItem('userName') || ''
const userId = localStorage.getItem('userId') || ''

const user = computed(() => ({
  email: userEmail,
  name: userName
}))

const projects = ref<Project[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const myProjects = computed(() => {
  return projects.value.filter(project => 
    project.creator?.id === parseInt(userId)
  )
})

const collaboratorProjects = computed(() => {
  return projects.value.filter(project => 
    project.creator?.id !== parseInt(userId)
  )
})

const formatDate = (dateString?: string) => {
  if (!dateString) return 'Date inconnue'
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

const fetchProjects = async () => {
  loading.value = true
  error.value = null
  try {
    const data = await authStore.getProjects()
    projects.value = data
  } catch (err: any) {
    error.value = err.message || 'Erreur lors du chargement des projets'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchProjects()
})
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  color: var(--terminal-accent);
  margin-bottom: 2rem;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
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

.projects-section {
  margin-top: 3rem;
}

.projects-section h2 {
  color: var(--terminal-accent);
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.loading {
  text-align: center;
  color: var(--terminal-fg);
  padding: 2rem;
}

.error-message {
  color: #ff6b6b;
  padding: 1rem;
  background: rgba(255, 107, 107, 0.1);
  border: 1px solid #ff6b6b;
  border-radius: 4px;
  margin-bottom: 1rem;
}

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

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.project-card {
  position: relative;
  background: var(--terminal-bg);
  border: 1px solid var(--terminal-border);
  padding: 1.5rem;
  border-radius: 8px;
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
  cursor: pointer;
}

.project-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(138, 43, 226, 0.2);
  border-color: var(--terminal-accent);
}

.project-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.creator-badge {
  background: rgba(138, 43, 226, 0.2);
  color: var(--terminal-accent);
  border: 1px solid var(--terminal-accent);
}

.collaborator-badge {
  background: rgba(52, 152, 219, 0.2);
  color: #3498db;
  border: 1px solid #3498db;
}

.project-card h3 {
  color: var(--terminal-accent);
  margin-bottom: 0.75rem;
  margin-top: 0.5rem;
  font-size: 1.25rem;
  padding-right: 6rem;
}

.project-description {
  color: var(--terminal-fg);
  margin-bottom: 1rem;
  font-size: 0.9rem;
  line-height: 1.5;
}

.project-description.no-description {
  color: var(--terminal-fg-muted);
  font-style: italic;
}

.project-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid var(--terminal-border);
}

.project-date,
.project-creator {
  color: var(--terminal-fg-muted);
  font-size: 0.85rem;
}

.project-creator {
  font-style: italic;
}
</style>