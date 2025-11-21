<template>
  <div class="project-details">
    <div v-if="loading" class="loading">Chargement...</div>
    
    <div v-else-if="error" class="error-message">{{ error }}</div>
    
    <div v-else-if="project" class="details-container">

      <div class="project-header">
        <button class="btn-back" @click="goBack">
          <font-awesome-icon :icon="['fas', 'angle-left']" /> Retour au tableau de bord
        </button>
        <h1>{{ project.name }}</h1>
        <div class="header-actions">
          <button class="btn-backlog" @click="goToBacklog">
           Backlog
          </button>
          <button class="btn-sprints" @click="goToSprints">
           Sprints
          </button>
          <button class="btn-releases" @click="goToReleases">
           Releases
          </button>
          <button class="btn-docs" @click="goToDocs">
           Documentation
          </button>
          <span class="badge" :class="isOwner ? 'creator-badge' : 'collaborator-badge'">
            {{ isOwner ? 'Créateur' : 'Collaborateur' }}
          </span>
        </div>
      </div>

      <div class="tabs">
        <button 
          class="tab" 
          :class="{ active: activeTab === 'overview' }"
          @click="activeTab = 'overview'"
        >
          Aperçu
        </button>
        <button 
          class="tab" 
          :class="{ active: activeTab === 'members' }"
          @click="activeTab = 'members'"
        >
          Membres ({{ membersCount }})
        </button>
        <button 
          class="tab" 
          :class="{ active: activeTab === 'issues' }"
          @click="activeTab = 'issues'"
        >
          Issues 
        </button>
        <button 
          v-if="isOwner"
          class="tab" 
          :class="{ active: activeTab === 'settings' }"
          @click="activeTab = 'settings'"
        >
          Paramètres
        </button>
      </div>

      <div class="tab-content">
        <div v-if="activeTab === 'overview'" class="overview">
          <div class="info-card">
            <h2>Description</h2>
            <p v-if="project.description">{{ project.description }}</p>
            <p v-else class="no-description">Aucune description disponible</p>
          </div>
          
          <div class="info-card">
            <h2>Informations</h2>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Créateur</span>
                <span class="info-value">{{ project.creator?.name || 'Inconnu' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Date de création</span>
                <span class="info-value">{{ formatDate(project.createdAt) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Nombre de membres</span>
                <span class="info-value">{{ membersCount }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'members'" class="members-tab">
          <ProjectMembers 
            :project-id="project.id"
            :creator-id="project.creator?.id || 0"
            :is-owner="isOwner"
            @members-updated="handleMembersUpdated"
          />
        </div>

        <div v-if="activeTab === 'settings' && isOwner" class="settings-tab">
          <ProjectSettings 
            :project="project"
            @updated="handleProjectUpdated"
          />
        </div>

        <div v-if="activeTab === 'issues'" class="issues-tab">
          <IssueDetails 
            :project-id="project.id"
            :collaborators="collaborators"
            :creator="project.creator || null"
            :is-owner="isOwner"
            :user-id="userId"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { projectStore } from '../../stores/projectStore'
import ProjectMembers from '../projects/ProjectMembers.vue'
import ProjectSettings from '../projects/ProjectSettings.vue'
import IssueDetails from '../issues/IssueDetails.vue'

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

const route = useRoute()
const router = useRouter()

const project = ref<Project | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const activeTab = ref<'overview' | 'members' | 'issues' | 'settings'>('overview')
const membersCount = ref(0)
const collaborators = ref<Array<{ id: number; name: string; email: string }>>([])

const userId = parseInt(localStorage.getItem('userId') || '0')

const isOwner = computed(() => {
  return project.value?.creator?.id === userId
})

const formatDate = (dateString?: string) => {
  if (!dateString) return 'Date inconnue'
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const goBack = () => {
  router.push('/dashboard')
}

const goToBacklog = () => {
  router.push(`/projects/${route.params.id}/backlog`)
}

const goToSprints = () => {
  router.push(`/projects/${route.params.id}/sprints`)
}

const goToReleases = () => {
  router.push(`/projects/${project.value?.id}/releases`)
}

const goToDocs = () => {
  router.push(`/projects/${project.value?.id}/docs`)
}

const handleProjectUpdated = (updatedProject: Project) => {
  project.value = { ...project.value, ...updatedProject }
  fetchProjects()
}

const handleMembersUpdated = async () => {
  await fetchMembersCount()
}

const fetchProject = async () => {
  const projectId = route.params.id as string
  
  if (!projectId) {
    error.value = 'ID de projet invalide'
    return
  }

  loading.value = true
  error.value = null

  try {
    let projects = projectStore.state.projects
    if (!projects || projects.length === 0) {
      projects = await projectStore.getProjects()
    }

    const foundProject = projects.find((p: any) => p.id === projectId)
    
    if (!foundProject) {
      error.value = 'Projet non trouvé'
      return
    }

    project.value = foundProject
    await fetchMembersCount()
  } catch (err: any) {
    error.value = err.message || 'Erreur lors du chargement du projet'
  } finally {
    loading.value = false
  }
}

const fetchMembersCount = async () => {
  if (!project.value) return
  
  try {
    const members = await projectStore.getProjectCollaborators(project.value.id)
    membersCount.value = members.length
    collaborators.value = members
  } catch {
    console.error('Erreur lors de la récupération des collaborateurs')
  }
}

const fetchProjects = async () => {
  try {
    await projectStore.getProjects()
  } catch {
    console.error('Erreur lors de la récupération des projets')
  }
}

onMounted(() => {
  fetchProject()
  
  if (route.query.issue) {
    activeTab.value = 'issues'
  }
})
</script>

<style scoped>
.project-details {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: var(--terminal-accent);
  font-size: 1.2rem;
}

.error-message {
  padding: 1rem;
  background-color: rgba(247, 118, 142, 0.1);
  color: var(--terminal-magenta);
  border: 1px solid var(--terminal-magenta);
  border-radius: 4px;
  margin-bottom: 1rem;
}

.details-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.project-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn-back {
  padding: 0.5rem 1rem;
  background-color: transparent;
  color: var(--terminal-text);
  border: 1px solid var(--terminal-border);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
}

.btn-back:hover {
  border-color: var(--terminal-accent);
  background-color: rgba(187, 154, 247, 0.1);
}

.project-header h1 {
  flex: 1;
  color: var(--terminal-accent);
  margin: 0;
  font-size: 2rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-backlog {
  padding: 0.6rem 1.2rem;
  background: var(--terminal-bg);
  color: var(--terminal-accent);
  border: 2px solid var(--terminal-accent);
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.btn-backlog:hover {
  background: rgba(187, 154, 247, 0.1);
}

.btn-sprints,
.btn-releases,
.btn-docs {
  padding: 0.6rem 1.2rem;
  background: var(--terminal-bg);
  color: var(--terminal-accent);
  border: 2px solid var(--terminal-accent);
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.btn-sprints:hover,
.btn-releases:hover,
.btn-docs:hover {
  background: rgba(187, 154, 247, 0.1);
}

.badge {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 600;
}

.creator-badge {
  background-color: rgba(187, 154, 247, 0.15);
  color: var(--terminal-accent);
  border: 1px solid var(--terminal-accent);
}

.collaborator-badge {
  background-color: rgba(0, 150, 255, 0.2);
  color: var(--terminal-accent);
  border: 1px solid var(--terminal-accent);
}

.tabs {
  display: flex;
  gap: 0.5rem;
  border-bottom: 2px solid var(--terminal-border);
  padding-bottom: 0;
}

.tab {
  padding: 0.75rem 1.5rem;
  background-color: transparent;
  color: var(--terminal-text);
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.2s;
  margin-bottom: -2px;
}

.tab:hover {
  color: var(--terminal-accent);
  background-color: rgba(187, 154, 247, 0.05);
}

.tab.active {
  color: var(--terminal-accent);
  border-bottom-color: var(--terminal-accent);
}

.tab-content {
  padding-top: 1rem;
}

.overview {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.info-card {
  background-color: var(--terminal-bg);
  border: 2px solid var(--terminal-border);
  border-radius: 4px;
  padding: 2rem;
}

.info-card h2 {
  color: var(--terminal-accent);
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.info-card p {
  color: var(--terminal-text);
  line-height: 1.6;
  margin: 0;
}

.no-description {
  color: var(--terminal-text);
  opacity: 0.6;
  font-style: italic;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-label {
  color: var(--terminal-text);
  opacity: 0.7;
  font-size: 0.875rem;
  font-weight: 500;
}

.info-value {
  color: var(--terminal-accent);
  font-size: 1.1rem;
  font-weight: 600;
}

.members-tab,
.settings-tab {
  animation: fadeIn 0.3s ease-in;
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

@media (max-width: 768px) {
  .project-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .project-header h1 {
    font-size: 1.5rem;
  }

  .tabs {
    overflow-x: auto;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
