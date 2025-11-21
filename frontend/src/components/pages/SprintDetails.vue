<template>
  <div class="sprint-details-container">
    <div class="sprint-details-content">
      <div class="sprint-header">
        <button class="btn-back" @click="goBack">
            <font-awesome-icon :icon="['fas', 'angle-left']" /> Retour au projet
        </button>
        <div class="header-content">
          <div class="header-info">
            <h1>{{ sprint?.name }}</h1>
            <span v-if="sprint" class="sprint-status" :class="statusClass">
              {{ statusLabel }}
            </span>
          </div>
          <button v-if="sprint" class="btn-edit" @click="showEditModal = true">
            Modifier
          </button>
        </div>
      </div>

      <div v-if="loading" class="loading">
        Chargement du sprint...
      </div>

      <div v-else-if="sprint" class="sprint-content">
        <SprintInfoCard
          :sprint="sprint"
          :issue-count="issues.length"
        />

        <SprintIssuesList
          :issues="issues"
          @issue-click="goToIssue"
        />
      </div>
    </div>

    <EditSprintForm
      v-if="showEditModal && sprint"
      :project-id="projectId"
      :sprint="sprint"
      @close="showEditModal = false"
      @sprint-updated="handleSprintUpdated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import projectService from '../../services/projectService'
import type { SprintResponse, IssueResponse } from '../../services/projectService'
import EditSprintForm from '../sprints/EditSprintForm.vue'
import SprintInfoCard from '../sprints/SprintInfoCard.vue'
import SprintIssuesList from '../sprints/SprintIssuesList.vue'

const route = useRoute()
const router = useRouter()

const projectId = route.params.id as string
const sprintId = parseInt(route.params.sprintId as string)

const sprint = ref<SprintResponse | null>(null)
const issues = ref<IssueResponse[]>([])
const loading = ref(true)
const showEditModal = ref(false)

const getSprintStatus = () => {
  if (!sprint.value) return 'planned'
  const now = new Date()
  const start = new Date(sprint.value.startDate)
  const end = new Date(sprint.value.endDate)

  if (now >= start && now <= end) return 'active'
  if (now > end) return 'completed'
  return 'planned'
}

const statusClass = computed(() => {
  return `status-${getSprintStatus()}`
})

const statusLabel = computed(() => {
  const status = getSprintStatus()
  const labels = {
    active: 'En cours',
    completed: 'Terminé',
    planned: 'Planifié'
  }
  return labels[status]
})

const loadSprintDetails = async () => {
  loading.value = true
  try {
    const [sprintData, issuesData] = await Promise.all([
      projectService.getSprint(projectId, sprintId),
      projectService.getIssuesBySprint(projectId, sprintId)
    ])
    
    sprint.value = sprintData
    issues.value = issuesData
  } catch (error) {
    console.error('Erreur lors du chargement du sprint:', error)
  } finally {
    loading.value = false
  }
}

const handleSprintUpdated = async (updatedSprint: SprintResponse) => {
  sprint.value = updatedSprint
  showEditModal.value = false
  await loadSprintDetails()
}

const goBack = () => {
  router.push(`/projects/${projectId}/sprints`)
}

const goToIssue = (issueId: number) => {
  router.push(`/projects/${projectId}?issue=${issueId}`)
}

onMounted(() => {
  loadSprintDetails()
})
</script>

<style scoped>
@import '../sprints/sprints-shared.css';

/* Styles spécifiques à SprintDetails */
.sprint-details-container {
  min-height: 100vh;
  background: var(--terminal-bg);
  color: var(--terminal-fg);
}

.sprint-details-content {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.sprint-header {
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
  margin-bottom: 1rem;
}

.btn-back:hover {
  background: rgba(187, 154, 247, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.header-info h1 {
  margin: 0;
  font-size: 2rem;
  color: var(--terminal-fg);
}

.btn-edit {
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

.btn-edit:hover {
  background: #a78bfa;
  transform: translateY(-1px);
}

.status-active {
  border: 1px solid #bb9af7;
}

.status-completed {
  border: 1px solid #9d7cd8;
}

.status-planned {
  border: 1px solid #7a5dc7;
}

.loading {
  text-align: center;
  padding: 3rem;
  font-size: 1.2rem;
  color: var(--terminal-accent);
}

.sprint-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

@media (max-width: 768px) {
  .sprint-details-content {
    padding: 1rem;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-info {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-info h1 {
    font-size: 1.5rem;
  }

  .btn-edit {
    width: 100%;
  }
}
</style>
