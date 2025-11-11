<template>
  <div class="issue-modal issue-detail-modal">
    <div class="modal-overlay" @click="$emit('close')"></div>
    <div class="modal-content modal-large">
      <div class="modal-header">
        <div class="header-info">
          <span class="status-badge" :class="`status-${issue.status.toLowerCase()}`">
            {{ getStatusLabel(issue.status) }}
          </span>
          <h2>{{ issue.title }}</h2>
        </div>
        <button type="button" class="btn-close" @click="$emit('close')">&times;</button>
      </div>

      <div class="modal-body">
        <div class="issue-info-section">
          <div class="info-grid">
            <div class="info-item">
              <span class="label">Priorité</span>
              <span class="badge" :class="`priority-${issue.priority.toLowerCase()}`">
                {{ issue.priority }}
              </span>
            </div>
            <div class="info-item">
              <span class="label">Story Points</span>
              <span class="value">{{ issue.storyPoints }}</span>
            </div>
            <div class="info-item">
              <span class="label">Assigné à</span>
              <span class="value">{{ assigneeName }}</span>
            </div>
            <div class="info-item">
              <span class="label">Créé le</span>
              <span class="value">{{ formatDate(issue.createdAt) }}</span>
            </div>
          </div>

          <div v-if="issue.description" class="description-section">
            <h4>Description</h4>
            <p>{{ issue.description }}</p>
          </div>
        </div>

        <TaskDetails 
          :project-id="projectId"
          :issue-id="issue.id"
          :can-modify="canModify"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import TaskDetails from '../tasks/TaskDetails.vue'
import userService from '../../services/userService'
import type { IssueResponse } from '../../services/projectService'

interface IssueDetailModalProps {
  projectId: string
  issue: IssueResponse
  canModify: boolean
}

const props = defineProps<IssueDetailModalProps>()

defineEmits<{
  close: []
}>()

const assigneeName = ref<string>('Non assigné')

const getStatusLabel = (status: string): string => {
  const labels: { [key: string]: string } = {
    'TODO': 'À faire',
    'IN_PROGRESS': 'En cours',
    'CLOSED': 'Fermé'
  }
  return labels[status] || status
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const fetchAssigneeName = async (assigneeId: number | null | undefined): Promise<string> => {
  if (!assigneeId) return 'Non assigné'
  try {
    const user = await userService.getUser(assigneeId)
    return user.name
  } catch {
    return 'Non assigné'
  }
}

onMounted(async () => {
  assigneeName.value = await fetchAssigneeName(props.issue.assigneeId)
})
</script>

<style scoped>
@import './issues-shared.css';

.modal-content.modal-large {
  max-width: 900px;
  padding: 0;
}

.modal-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid var(--terminal-border);
}

.header-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: 1;
}

.header-info h2 {
  margin: 0;
  font-size: 1.5rem;
  line-height: 1.3;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  width: fit-content;
}

.status-badge.status-todo {
  background: rgba(157, 124, 216, 0.2);
  color: var(--terminal-accent-dark);
}

.status-badge.status-in_progress {
  background: rgba(187, 154, 247, 0.2);
  color: var(--terminal-accent);
}

.status-badge.status-closed {
  background: rgba(192, 202, 245, 0.2);
  color: var(--terminal-fg);
}

.modal-body {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-height: calc(90vh - 140px);
  overflow-y: auto;
}

.issue-info-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--terminal-border);
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
  padding: 1rem;
  background: rgba(192, 202, 245, 0.03);
  border-radius: 6px;
  border: 1px solid rgba(192, 202, 245, 0.1);
}

.info-item .label {
  color: rgba(192, 202, 245, 0.6);
  font-size: 0.85rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-item .value {
  color: var(--terminal-fg);
  font-size: 1rem;
  font-weight: 600;
}

.description-section {
  padding: 1.5rem;
  background: rgba(192, 202, 245, 0.05);
  border: 1px solid var(--terminal-border);
  border-radius: 6px;
}

.description-section h4 {
  margin: 0 0 1rem 0;
  color: var(--terminal-fg);
  font-size: 1rem;
  font-weight: 600;
}

.description-section p {
  margin: 0;
  color: rgba(192, 202, 245, 0.8);
  line-height: 1.7;
  white-space: pre-wrap;
}

@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
