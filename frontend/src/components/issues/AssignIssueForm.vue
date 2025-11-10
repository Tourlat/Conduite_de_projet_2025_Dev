<template>
  <div class="issue-modal assign-issue-modal">
    <div class="modal-overlay" @click="$emit('close')"></div>
    <div class="modal-content modal-small">
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
@import './issues-shared.css';

/* Styles spécifiques à AssignIssueForm */
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
</style>
