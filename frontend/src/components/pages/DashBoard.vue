<template>
  <div class="dashboard">
    <h1>Bienvenue, {{ user?.name }}!</h1>
    
    <div class="dashboard-grid">
      <ProfileCard :user="user" />
    </div>

    <div v-if="loading" class="loading">Chargement des projets...</div>
    
    <div v-else-if="error" class="error-message">{{ error }}</div>
    
    <div v-else>
      <!-- Mes projets créés -->
      <div class="projects-section">
        <h2>Mes Projets Créés</h2>
        
        <EmptyProject
          v-if="myProjects.length === 0"
          message="Vous n'avez créé aucun projet pour le moment."
          :show-create-button="true"
        />
        
        <ProjectGrid
          v-else
          :projects="myProjects"
          :current-user-id="userId"
          @project-click="handleProjectClick"
        />
      </div>

      <!-- Projets où je suis collaborateur -->
      <div class="projects-section">
        <h2>Projets en Collaboration</h2>
        
        <EmptyProject
          v-if="collaboratorProjects.length === 0"
          message="Vous n'êtes collaborateur sur aucun projet pour le moment."
          :show-create-button="false"
        />
        
        <ProjectGrid
          v-else
          :projects="collaboratorProjects"
          :current-user-id="userId"
          @project-click="handleProjectClick"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { projectStore } from '../../stores/projectStore'
import ProfileCard from '../dashboard/ProfileCard.vue'
import ProjectGrid from '../dashboard/ProjectGrid.vue'
import EmptyProject from '../dashboard/EmptyProject.vue'

interface Creator {
  id: number
  email: string
  name: string
}

interface Project {
  id: string
  name: string
  description?: string
  createdAt?: string
  creator?: Creator
}

const router = useRouter()

const userEmail = localStorage.getItem('userEmail') || ''
const userName = localStorage.getItem('userName') || ''
const userId = parseInt(localStorage.getItem('userId') || '0')

const user = computed(() => ({
  email: userEmail,
  name: userName
}))

const projects = ref<Project[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const myProjects = computed(() => {
  return projects.value.filter(project => 
    project.creator?.id === userId
  )
})

const collaboratorProjects = computed(() => {
  return projects.value.filter(project => 
    project.creator?.id !== userId
  )
})

const handleProjectClick = (project: Project) => {
  router.push(`/projects/${project.id}`)
}

const fetchProjects = async () => {
  loading.value = true
  error.value = null
  try {
    const data = await projectStore.getProjects()
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
</style>