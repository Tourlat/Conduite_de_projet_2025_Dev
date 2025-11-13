<template>
  <div class="issue-card" :class="`priority-${issue.priority.toLowerCase()}`">
    <div class="card-header">
      <div class="title-section">
        <StatusDropdown
          v-model="currentStatus"
          :disabled="!canModify"
          @change="handleStatusChange"
        />
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
        <span class="value assignee" @click="canModify && $emit('assign-click')">
          {{ assigneeName }}
          <svg 
            v-if="canModify"
            class="edit-icon"
            width="14" 
            height="14" 
            viewBox="0 0 16 16" 
            fill="none"
          >
            <path d="M11.5 2L14 4.5L5 13.5H2.5V11L11.5 2Z" stroke="currentColor" stroke-width="1.5"/>
          </svg>
        </span>
      </span>
    </div>

    <div class="actions">
      <button 
        class="btn-small btn-view"
        @click="$emit('view')"
      >
        Voir détails
      </button>
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
import { ref, onMounted, watch } from 'vue'
import type { IssueResponse, IssueStatus } from '../../services/projectService'
import userService from '../../services/userService'
import StatusDropdown from './StatusDropdown.vue'

interface IssueCardProps {
  issue: IssueResponse
  canModify: boolean
}

const props = defineProps<IssueCardProps>()

const emit = defineEmits<{
  edit: []
  delete: []
  view: []
  'status-change': [issue: IssueResponse, newStatus: IssueStatus]
  'assign-click': []
}>()

const assigneeName = ref<string>('Non assigné')
const currentStatus = ref<'TODO' | 'IN_PROGRESS' | 'CLOSED'>(props.issue.status)

const fetchAssigneeName = async (assigneeId: number | null | undefined): Promise<string> => {
  if (!assigneeId) return 'Non assigné'
  try {
    const user = await userService.getUser(assigneeId)
    return user.name
  } catch {
    return 'Non assigné'
  }
}

const handleStatusChange = (newStatus: 'TODO' | 'IN_PROGRESS' | 'CLOSED') => {
  emit('status-change', props.issue, newStatus)
}

watch(() => props.issue.assigneeId, async (newAssigneeId) => {
  assigneeName.value = await fetchAssigneeName(newAssigneeId)
})

watch(() => props.issue.status, (newStatus) => {
  currentStatus.value = newStatus
})

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
  border-left-color: #e0c8ff;
}

.issue-card.priority-medium {
  border-left-color: #bb9af7;
}

.issue-card.priority-low {
  border-left-color: #bb9af7;
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
  background: rgba(208, 176, 255, 0.3);
  color: #e0c8ff;
  border-color: #e0c8ff;
}

.priority-badge.priority-medium {
  background: rgba(187, 154, 247, 0.2);
  color: #bb9af7;
  border-color: #bb9af7;
}

.priority-badge.priority-low {
  background: rgba(187, 154, 247, 0.2);
  color: #bb9af7;
  border-color: #bb9af7;
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

.value.assignee {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;
  transition: color 0.2s;
}

.value.assignee:hover {
  color: var(--terminal-accent);
}

.edit-icon {
  opacity: 0.6;
  transition: opacity 0.2s;
}

.value.assignee:hover .edit-icon {
  opacity: 1;
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

.btn-view {
  background: rgba(192, 202, 245, 0.1);
  color: var(--terminal-fg);
}

.btn-view:hover {
  background: rgba(192, 202, 245, 0.2);
  transform: translateY(-1px);
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
  background: rgba(247, 118, 142, 0.2);
  color: var(--terminal-magenta);
}

.btn-delete:hover:not(:disabled) {
  background: rgba(247, 118, 142, 0.3);
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
