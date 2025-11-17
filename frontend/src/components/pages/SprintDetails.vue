<template>
  <div class="sprint-details-container">
    <div class="sprint-details-content">
      <div class="sprint-header">
        <button class="btn-back" @click="goBack">
          < Retour aux sprints
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
        <div class="sprint-info-card">
          <h2>Informations du sprint</h2>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Date de début</span>
              <span class="info-value">{{ formatDate(sprint.startDate) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Date de fin</span>
              <span class="info-value">{{ formatDate(sprint.endDate) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Nombre d'issues</span>
              <span class="info-value">{{ issues.length }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Créé le</span>
              <span class="info-value">{{ formatDate(sprint.createdAt) }}</span>
            </div>
          </div>
        </div>

        <div class="issues-section">
          <h2>Issues du sprint</h2>
          <div v-if="issues.length === 0" class="empty-state">
            Aucune issue assignée à ce sprint
          </div>
          <div v-else class="issues-list">
            <div
              v-for="issue in issues"
              :key="issue.id"
              class="issue-card"
              @click="goToIssue(issue.id)"
            >
              <div class="issue-header">
                <h3>{{ issue.title }}</h3>
                <span class="priority-badge" :class="`priority-${issue.priority.toLowerCase()}`">
                  {{ getPriorityLabel(issue.priority) }}
                </span>
              </div>
              <p v-if="issue.description" class="issue-description">
                {{ issue.description }}
              </p>
              <div class="issue-footer">
                <span class="status-badge" :class="`status-${issue.status.toLowerCase()}`">
                  {{ getStatusLabel(issue.status) }}
                </span>
                <span v-if="issue.storyPoints" class="story-points">
                  {{ issue.storyPoints }} pts
                </span>
              </div>
            </div>
          </div>
        </div>
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

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getPriorityLabel = (priority: string): string => {
  const labels: Record<string, string> = {
    LOW: 'Basse',
    MEDIUM: 'Moyenne',
    HIGH: 'Haute'
  }
  return labels[priority] || priority
}

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    TODO: 'À faire',
    IN_PROGRESS: 'En cours',
    CLOSED: 'Fermé'
  }
  return labels[status] || status
}

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

.sprint-info-card {
  background: var(--terminal-bg-light);
  border: 2px solid var(--terminal-border);
  border-radius: 8px;
  padding: 2rem;
}

.sprint-info-card h2 {
  margin: 0 0 1.5rem 0;
  color: var(--terminal-accent);
  font-size: 1.3rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-label {
  font-size: 0.9rem;
  color: var(--terminal-fg-muted);
  font-weight: 600;
}

.info-value {
  color: var(--terminal-fg);
  font-weight: 500;
  font-size: 1.1rem;
}

.issues-section h2 {
  margin: 0 0 1.5rem 0;
  color: var(--terminal-accent);
  font-size: 1.3rem;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--terminal-fg-muted);
  background: var(--terminal-bg-light);
  border: 2px dashed var(--terminal-border);
  border-radius: 8px;
}

.issues-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.issue-card {
  background: var(--terminal-bg-light);
  border: 2px solid var(--terminal-border);
  border-radius: 8px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.issue-card:hover {
  border-color: var(--terminal-accent);
  transform: translateX(4px);
}

.issue-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.8rem;
}

.issue-header h3 {
  margin: 0;
  color: var(--terminal-fg);
  font-size: 1.2rem;
  font-weight: 600;
}

.priority-badge {
  padding: 0.3rem 0.8rem;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 600;
}

.priority-high {
  background: rgba(224, 200, 255, 0.3);
  color: #e0c8ff;
}

.priority-medium {
  background: rgba(187, 154, 247, 0.2);
  color: #bb9af7;
}

.priority-low {
  background: rgba(122, 93, 199, 0.1);
  color: #7a5dc7;
}

.issue-description {
  margin: 0.8rem 0;
  color: var(--terminal-fg-muted);
  line-height: 1.5;
}

.issue-footer {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
}

.status-badge {
  padding: 0.3rem 0.8rem;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 600;
}

.status-todo {
  background: rgba(187, 154, 247, 0.2);
  color: var(--terminal-accent);
}

.status-in_progress {
  background: rgba(224, 200, 255, 0.2);
  color: #e0c8ff;
}

.status-closed {
  background: rgba(150, 150, 150, 0.2);
  color: #aaa;
}

.story-points {
  background: rgba(187, 154, 247, 0.1);
  padding: 0.3rem 0.8rem;
  border-radius: 4px;
  font-size: 0.85rem;
  color: var(--terminal-accent);
  font-weight: 600;
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

  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
