<template>
  <div class="issues-list">
    <div v-if="loading" class="loading">
      Chargement des issues...
    </div>

    <div v-else-if="!issues.length" class="no-issues">
      <p>Aucune issue pour le moment</p>
    </div>

    <div v-else class="issues-grid">
      <div v-for="issue in sortedIssues" :key="issue.id" class="issue-card" :class="`priority-${issue.priority.toLowerCase()}`">
        <div class="card-header">
          <div class="title-section">
            <span class="status-badge" :class="`status-${issue.status.toLowerCase()}`">
              {{ getStatusLabel(issue.status) }}
            </span>
            <h4>{{ issue.title }}</h4>
          </div>
          <span class="priority-badge" :class="`priority-${issue.priority.toLowerCase()}`">
            {{ issue.priority }}
          </span>
        </div>

        <p v-if="issue.description" class="description">{{ issue.description }}</p>

        <div class="meta">
          <span class="meta-item">
            <span class="label">Story Points:</span>
            <span class="value">{{ issue.storyPoints }}</span>
          </span>
          <span class="meta-item">
            <span class="label">Assigné:</span>
            <span class="value">{{ issue.assigneeId ? `Utilisateur #${issue.assigneeId}` : 'Non assigné' }}</span>
          </span>
        </div>

        <div class="actions">
          <button 
            class="btn-small btn-edit"
            :disabled="!canModify(issue)"
            @click="handleEdit"
          >
            Éditer
          </button>
          <button 
            class="btn-small btn-delete"
            :disabled="!canModify(issue)"
            @click="handleDelete"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { IssueResponse } from '../../services/projectService'

interface IssueListProps {
  issues: IssueResponse[]
  isOwner: boolean
  userId: number
  loading: boolean
}

const props = defineProps<IssueListProps>()

const emit = defineEmits<{
  issueUpdated: []
  issueDeleted: []
}>()

const sortedIssues = computed(() => {
  return [...props.issues].sort((a, b) => {
    const priorityOrder = { 'HIGH': 0, 'MEDIUM': 1, 'LOW': 2 }
    const statusOrder = { 'TODO': 0, 'IN_PROGRESS': 1, 'CLOSED': 2 }
    
    const priorityDiff = priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder]
    if (priorityDiff !== 0) return priorityDiff
    
    return statusOrder[a.status as keyof typeof statusOrder] - statusOrder[b.status as keyof typeof statusOrder]
  })
})

const canModify = (issue: IssueResponse): boolean => {
  return props.isOwner || issue.creatorId === props.userId
}

const getStatusLabel = (status: string): string => {
  const labels: { [key: string]: string } = {
    'TODO': 'À faire',
    'IN_PROGRESS': 'En cours',
    'CLOSED': 'Fermé'
  }
  return labels[status] || status
}

const handleEdit = () => {
  // À implémenter : ouvrir modal d'édition
}

const handleDelete = async () => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cette issue ?')) return
  
  try {
    // À implémenter : appeler le service pour supprimer
    emit('issueDeleted')
  } catch {
    // Gérer l'erreur
  }
}
</script>

<style scoped>
.issues-list {
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

.loading {
  text-align: center;
  padding: 2rem;
  color: var(--terminal-fg-muted);
  font-size: 1rem;
}

.no-issues {
  text-align: center;
  padding: 3rem 2rem;
  background: var(--terminal-bg);
  border: 1px solid var(--terminal-border);
  border-radius: 4px;
  color: var(--terminal-fg-muted);
}

.no-issues p {
  margin: 0;
}

.issues-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
}

.issue-card {
  background: var(--terminal-bg);
  border: 1px solid var(--terminal-border);
  border-left: 4px solid var(--terminal-accent);
  border-radius: 4px;
  padding: 1.25rem;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.issue-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.issue-card.priority-high {
  border-left-color: #dc3545;
}

.issue-card.priority-medium {
  border-left-color: #ffc107;
}

.issue-card.priority-low {
  border-left-color: #28a745;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.title-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  width: fit-content;
  background: var(--terminal-border);
  color: var(--terminal-fg);
}

.status-badge.status-todo {
  background: rgba(187, 154, 247, 0.1);
  color: var(--terminal-accent);
}

.status-badge.status-in_progress {
  background: rgba(0, 150, 255, 0.1);
  color: #0096ff;
}

.status-badge.status-closed {
  background: rgba(40, 167, 69, 0.1);
  color: #28a745;
}

h4 {
  margin: 0;
  color: var(--terminal-fg);
  font-size: 1.1rem;
  line-height: 1.3;
}

.priority-badge {
  padding: 0.35rem 0.85rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  white-space: nowrap;
}

.priority-badge.priority-high {
  background: #dc3545;
  color: white;
}

.priority-badge.priority-medium {
  background: #ffc107;
  color: #000;
}

.priority-badge.priority-low {
  background: #28a745;
  color: white;
}

.description {
  color: var(--terminal-fg-muted);
  font-size: 0.9rem;
  line-height: 1.4;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  font-size: 0.85rem;
  padding: 0.75rem 0;
  border-top: 1px solid var(--terminal-border);
  border-bottom: 1px solid var(--terminal-border);
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.label {
  color: var(--terminal-fg-muted);
  font-weight: 500;
}

.value {
  color: var(--terminal-fg);
  font-weight: 600;
}

.actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.btn-small {
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-edit {
  background: var(--terminal-accent);
  color: var(--terminal-bg);
}

.btn-edit:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-delete {
  background: #dc3545;
  color: white;
}

.btn-delete:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-small:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .issues-grid {
    grid-template-columns: 1fr;
  }

  .card-header {
    flex-direction: column;
  }

  .priority-badge {
    align-self: flex-start;
  }

  .actions {
    flex-direction: column;
  }

  .btn-small {
    width: 100%;
    justify-content: center;
  }
}
</style>
