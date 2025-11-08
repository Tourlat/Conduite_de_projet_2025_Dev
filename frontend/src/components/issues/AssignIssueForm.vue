<template>
  <div class="assign-issue-modal">
    <div class="modal-overlay" @click="$emit('close')"></div>
    <div class="modal-content">
      <form @submit.prevent="handleSubmit">
        <div class="modal-header">
          <h2>Assigner l'issue</h2>
          <button type="button" class="btn-close" @click="$emit('close')">&times;</button>
        </div>

        <div v-if="message" :class="['message', message.type]">{{ message.text }}</div>

        <div class="issue-info">
          <h3>{{ issue.title }}</h3>
          <p v-if="issue.description">{{ issue.description }}</p>
          <div class="meta">
            <span class="badge priority-{{ issue.priority.toLowerCase() }}">
              {{ issue.priority }}
            </span>
            <span class="badge">{{ issue.storyPoints }} SP</span>
          </div>
        </div>

        <div class="form-group">
          <label for="assignee">Assigner à</label>
          <select 
            id="assignee"
            v-model.number="selectedAssigneeId"
          >
            <option :value="null">Non assigné</option>
            <option v-for="assignee in assignees" :key="assignee.id" :value="assignee.id">
              {{ assignee.name }} ({{ assignee.email }})
            </option>
          </select>
        </div>

        <div class="current-assignee">
          <span class="label">Actuellement assigné à:</span>
          <span class="value">{{ currentAssigneeName }}</span>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn-cancel" @click="$emit('close')">
            Annuler
          </button>
          <button type="submit" class="btn-submit" :disabled="isSubmitting">
            {{ isSubmitting ? 'Attribution...' : 'Assigner' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import projectService from '../../services/projectService'
import userService from '../../services/userService'
import type { IssueResponse } from '../../services/projectService'

interface AssignIssueFormProps {
  projectId: string
  issue: IssueResponse
  assignees: Array<{ id: number; name: string; email: string }>
}

interface Message {
  text: string
  type: 'success' | 'error'
}

const props = defineProps<AssignIssueFormProps>()
const emit = defineEmits<{
  close: []
  updated: [issue: IssueResponse]
}>()

const selectedAssigneeId = ref<number | null>(props.issue.assigneeId || null)
const currentAssigneeName = ref<string>('Non assigné')
const message = ref<Message | null>(null)
const isSubmitting = ref(false)

const fetchAssigneeName = async (assigneeId: number | null | undefined): Promise<string> => {
  if (!assigneeId) return 'Non assigné'
  try {
    const user = await userService.getUser(assigneeId)
    return user.name
  } catch {
    return 'Non assigné'
  }
}

const handleSubmit = async () => {
  message.value = null
  isSubmitting.value = true

  try {
    const updateData = {
      assigneeId: selectedAssigneeId.value || undefined
    }

    const updatedIssue = await projectService.updateIssue(
      props.projectId,
      props.issue.id,
      updateData
    )

    message.value = {
      text: 'Issue assignée avec succès',
      type: 'success'
    }

    setTimeout(() => {
      emit('updated', updatedIssue)
      emit('close')
    }, 1000)
  } catch (error: any) {
    message.value = {
      text: error.message || 'Erreur lors de l\'assignation',
      type: 'error'
    }
  } finally {
    isSubmitting.value = false
  }
}

onMounted(async () => {
  currentAssigneeName.value = await fetchAssigneeName(props.issue.assigneeId)
})
</script>

<style scoped>
.assign-issue-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
}

.modal-content {
  position: relative;
  background: var(--terminal-bg);
  border: 1px solid var(--terminal-border);
  border-radius: 8px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

form {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

h2 {
  margin: 0;
  color: var(--terminal-fg);
  font-size: 1.5rem;
}

.btn-close {
  background: none;
  border: none;
  color: var(--terminal-fg);
  font-size: 2rem;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.btn-close:hover {
  background: rgba(187, 154, 247, 0.1);
  color: var(--terminal-accent);
}

.message {
  padding: 0.75rem;
  border-radius: 4px;
  font-size: 0.9rem;
}

.message.success {
  background: rgba(187, 154, 247, 0.15);
  color: var(--terminal-accent);
  border: 1px solid var(--terminal-border);
}

.message.error {
  background: rgba(247, 118, 142, 0.15);
  color: var(--terminal-magenta);
  border: 1px solid var(--terminal-border);
}

.issue-info {
  padding: 1rem;
  background: rgba(192, 202, 245, 0.05);
  border: 1px solid var(--terminal-border);
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.issue-info h3 {
  margin: 0;
  color: var(--terminal-fg);
  font-size: 1.1rem;
}

.issue-info p {
  margin: 0;
  color: rgba(192, 202, 245, 0.7);
  font-size: 0.9rem;
}

.meta {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  background: rgba(187, 154, 247, 0.15);
  color: var(--terminal-accent);
}

.badge.priority-high {
  background: rgba(247, 118, 142, 0.2);
  color: var(--terminal-magenta);
}

.badge.priority-medium {
  background: rgba(187, 154, 247, 0.2);
  color: var(--terminal-accent);
}

.badge.priority-low {
  background: rgba(157, 124, 216, 0.2);
  color: var(--terminal-accent-dark);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  color: var(--terminal-fg);
  font-weight: 500;
  font-size: 0.9rem;
}

select {
  padding: 0.75rem;
  background: var(--terminal-bg);
  border: 1px solid var(--terminal-border);
  border-radius: 4px;
  color: var(--terminal-fg);
  font-family: inherit;
  font-size: 0.95rem;
  transition: all 0.2s;
}

select:focus {
  outline: none;
  border-color: var(--terminal-accent);
  background: var(--terminal-bg);
}

.current-assignee {
  padding: 0.75rem;
  background: rgba(187, 154, 247, 0.05);
  border-radius: 4px;
  display: flex;
  gap: 0.5rem;
  align-items: center;
  font-size: 0.9rem;
}

.current-assignee .label {
  color: rgba(192, 202, 245, 0.7);
}

.current-assignee .value {
  color: var(--terminal-fg);
  font-weight: 600;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 0.5rem;
  border-top: 1px solid var(--terminal-border);
}

.btn-cancel,
.btn-submit {
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-size: 0.95rem;
}

.btn-cancel {
  background: rgba(192, 202, 245, 0.1);
  color: var(--terminal-fg);
}

.btn-cancel:hover {
  background: rgba(192, 202, 245, 0.15);
}

.btn-submit {
  background: var(--terminal-accent);
  color: var(--terminal-bg);
}

.btn-submit:hover:not(:disabled) {
  background: #a78bfa;
  transform: translateY(-1px);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
