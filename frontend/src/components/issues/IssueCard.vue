<template>
  <div class="issue-card" :class="`priority-${issue.priority.toLowerCase()}`">
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
        <span class="value">{{ assigneeName }}</span>
      </span>
    </div>

    <div class="actions">
      <button 
        class="btn-small btn-edit"
        :disabled="!canModify"
        @click="$emit('edit')"
      >
        Éditer
      </button>
      <button 
        class="btn-small btn-delete"
        :disabled="!canModify"
        @click="$emit('delete')"
      >
        Supprimer
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { IssueResponse } from '../../services/projectService'
import userService from '../../services/userService'

interface IssueCardProps {
  issue: IssueResponse
  canModify: boolean
}

const props = defineProps<IssueCardProps>()

defineEmits<{
  edit: []
  delete: []
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
  box-shadow: 0 4px 12px rgba(187, 154, 247, 0.1);
  transform: translateY(-2px);
}

.issue-card.priority-high {
  border-left-color: #a78bfa;
}

.issue-card.priority-medium {
  border-left-color: #c4b5fd;
}

.issue-card.priority-low {
  border-left-color: #ddd6fe;
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
  background: rgba(187, 154, 247, 0.15);
  color: #c4b5fd;
}

.status-badge.status-in_progress {
  background: rgba(187, 154, 247, 0.2);
  color: #a78bfa;
}

.status-badge.status-closed {
  background: rgba(187, 154, 247, 0.1);
  color: #ddd6fe;
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
  background: rgba(167, 139, 250, 0.2);
  color: #a78bfa;
}

.priority-badge.priority-medium {
  background: rgba(196, 181, 253, 0.2);
  color: #c4b5fd;
}

.priority-badge.priority-low {
  background: rgba(221, 214, 254, 0.2);
  color: #ddd6fe;
}

.description {
  color: rgba(192, 202, 245, 0.7);
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
  color: rgba(192, 202, 245, 0.6);
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
  color: white;
}

.btn-edit:hover:not(:disabled) {
  background: var(--terminal-accent-dark);
  transform: translateY(-1px);
}

.btn-delete {
  background: rgba(196, 181, 253, 0.3);
  color: #c4b5fd;
}

.btn-delete:hover:not(:disabled) {
  background: rgba(196, 181, 253, 0.4);
  transform: translateY(-1px);
}

.btn-small:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
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
