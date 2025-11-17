<template>
  <div class="sprints-container">
    <div class="sprints-content">
      <div class="sprints-header">
        <button class="btn-back" @click="goBack">
          < Retour au projet
        </button>
        <h1>Sprints - {{ projectName }}</h1>
        <button class="btn-create" @click="showCreateModal = true">
          + Créer un sprint
        </button>
      </div>

      <div v-if="loading" class="loading">
        Chargement des sprints...
      </div>

      <div v-else>
        <div class="filters-bar">
          <div class="filter-group">
            <label for="status-filter">Statut:</label>
            <select id="status-filter" v-model="statusFilter" class="filter-select">
              <option value="all">Tous</option>
              <option value="active">Actifs</option>
              <option value="completed">Terminés</option>
              <option value="planned">Planifiés</option>
            </select>
          </div>
          <div class="sprint-count">
            {{ filteredSprints.length }} sprint(s)
          </div>
        </div>

        <div v-if="filteredSprints.length === 0" class="empty-state">
          <p>Aucun sprint trouvé</p>
        </div>

        <div v-else class="sprints-grid">
          <SprintCard
            v-for="sprint in filteredSprints"
            :key="sprint.id"
            :sprint="sprint"
            @click="goToSprint(sprint.id)"
          />
        </div>
      </div>
    </div>

    <CreateSprintForm
      v-if="showCreateModal"
      :project-id="projectId"
      @close="showCreateModal = false"
      @created="handleSprintCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SprintCard from '../sprints/SprintCard.vue'
import CreateSprintForm from '../sprints/CreateSprintForm.vue'
import projectService from '../../services/projectService'
import { projectStore } from '../../stores/projectStore'
import type { SprintResponse } from '../../services/projectService'

const route = useRoute()
const router = useRouter()

const projectId = route.params.id as string
const projectName = ref('')
const sprints = ref<SprintResponse[]>([])
const loading = ref(true)
const showCreateModal = ref(false)
const statusFilter = ref<'all' | 'active' | 'completed' | 'planned'>('all')

const getSprintStatus = (sprint: SprintResponse): 'active' | 'completed' | 'planned' => {
  const now = new Date()
  const start = new Date(sprint.startDate)
  const end = new Date(sprint.endDate)

  if (now >= start && now <= end) return 'active'
  if (now > end) return 'completed'
  return 'planned'
}

const filteredSprints = computed(() => {
  if (statusFilter.value === 'all') return sprints.value
  
  return sprints.value.filter(sprint => {
    const status = getSprintStatus(sprint)
    return status === statusFilter.value
  })
})

const loadSprints = async () => {
  loading.value = true
  try {
    let projects = projectStore.state.projects
    if (!projects || projects.length === 0) {
      projects = await projectStore.getProjects()
    }

    const project = projects.find((p: any) => p.id === projectId)
    if (project) {
      projectName.value = project.name
    }

    const sprintsData = await projectService.getSprintsByProject(projectId)
    sprints.value = sprintsData
  } catch (error) {
    console.error('Erreur lors du chargement des sprints:', error)
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push(`/projects/${projectId}`)
}

const goToSprint = (sprintId: number) => {
  router.push(`/projects/${projectId}/sprints/${sprintId}`)
}

const handleSprintCreated = async () => {
  showCreateModal.value = false
  await loadSprints()
}

onMounted(() => {
  loadSprints()
})
</script>

<style scoped>
@import '../sprints/sprints-shared.css';

/* Styles spécifiques à ProjectSprints */
.sprints-container {
  min-height: 100vh;
  background: var(--terminal-bg);
  color: var(--terminal-fg);
}

.sprints-content {
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;
}

.sprints-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.btn-back {
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

.btn-back:hover {
  background: rgba(187, 154, 247, 0.1);
}

.sprints-header h1 {
  margin: 0;
  font-size: 1.8rem;
  color: var(--terminal-fg);
  flex: 1;
}

.btn-create {
  padding: 0.6rem 1.2rem;
  background: var(--terminal-accent);
  color: var(--terminal-bg);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.btn-create:hover {
  background: #9d7cd8;
}

.filters-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: rgba(187, 154, 247, 0.05);
  border: 1px solid rgba(187, 154, 247, 0.2);
  border-radius: 8px;
  margin-bottom: 2rem;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.filter-group label {
  font-weight: 600;
  color: var(--terminal-accent);
  font-size: 0.9rem;
  white-space: nowrap;
}

.filter-select {
  padding: 0.6rem 2.5rem 0.6rem 1rem;
  background: var(--terminal-bg);
  color: var(--terminal-fg);
  border: 1px solid rgba(187, 154, 247, 0.3);
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23bb9af7' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  min-width: 180px;
}

.filter-select:hover {
  background-color: rgba(187, 154, 247, 0.05);
  border-color: var(--terminal-accent);
}

.filter-select:focus {
  outline: none;
  border-color: var(--terminal-accent);
  box-shadow: 0 0 0 2px rgba(187, 154, 247, 0.1);
}

.filter-select option {
  background: var(--terminal-bg);
  color: var(--terminal-fg);
  padding: 0.5rem;
}

.sprint-count {
  color: var(--terminal-accent);
  font-weight: 600;
}

.loading {
  text-align: center;
  padding: 3rem;
  font-size: 1.2rem;
  color: var(--terminal-accent);
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--terminal-fg-muted);
}

.sprints-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .sprints-content {
    padding: 1rem;
  }

  .sprints-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .sprints-header h1 {
    font-size: 1.4rem;
  }

  .filters-bar {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .filter-select {
    width: 100%;
  }

  .sprints-grid {
    grid-template-columns: 1fr;
  }
}
</style>
