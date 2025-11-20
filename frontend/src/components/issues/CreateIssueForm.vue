<template>
  <form @submit.prevent="handleSubmit">
    <h2>Créer une nouvelle issue</h2>
    
    <div v-if="message" :class="['message', message.type]">{{ message.text }}</div>
    
    <div class="form-group">
      <label for="title">Titre <span class="required">*</span></label>
      <input 
        id="title"
        v-model="formData.title"
        type="text" 
        name="title"
        placeholder="Ex: Corriger bug login"
        :class="{ error: errors.title }"
      />
      <span v-if="errors.title" class="error-message">{{ errors.title }}</span>
    </div>

    <div class="form-group">
      <label for="description">Description</label>
      <textarea 
        id="description"
        v-model="formData.description"
        name="description"
        rows="4"
        placeholder="Détails de l'issue"
      />
    </div>

    <div class="form-group">
      <label for="priority">Priorité <span class="required">*</span></label>
      <select 
        id="priority"
        v-model="formData.priority"
        name="priority"
        :class="{ error: errors.priority }"
      >
        <option value="">Sélectionner une priorité</option>
        <option value="LOW">Basse</option>
        <option value="MEDIUM">Moyenne</option>
        <option value="HIGH">Haute</option>
      </select>
      <span v-if="errors.priority" class="error-message">{{ errors.priority }}</span>
    </div>

    <div class="form-group">
      <label for="storyPoints">Story Points <span class="required">*</span></label>
      <input 
        id="storyPoints"
        v-model.number="formData.storyPoints"
        type="number" 
        name="storyPoints"
        min="1"
        max="100"
        placeholder="5"
        :class="{ error: errors.storyPoints }"
      />
      <span v-if="errors.storyPoints" class="error-message">{{ errors.storyPoints }}</span>
    </div>

    <div class="form-group">
      <label for="assignee">Assigner à</label>
      <select 
        id="assignee"
        v-model.number="formData.assigneeId"
        name="assignee"
      >
        <option :value="null">Non assigné</option>
        <option v-for="assignee in allAssignees" :key="assignee.id" :value="assignee.id">
          {{ assignee.name }} ({{ assignee.email }})
        </option>
      </select>
    </div>

    <div class="form-group">
      <label for="status">Statut</label>
      <select 
        id="status"
        v-model="formData.status"
        name="status"
      >
        <option value="TODO">À faire</option>
        <option value="IN_PROGRESS">En cours</option>
        <option value="CLOSED">Fermé</option>
      </select>
    </div>

    <button type="submit" :disabled="isSubmitting">
      {{ isSubmitting ? 'Création en cours...' : 'Créer l\'issue' }}
    </button>
  </form>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import projectService from '../../services/projectService'
import type { CreateIssueRequest, IssueResponse, IssuePriority, IssueStatus } from '../../services/projectService'

interface CreateIssueFormProps {
  projectId: string
  collaborators: Array<{ id: number; name: string; email: string }>
  creator: { id: number; name: string; email: string } | null
}

interface FormData {
  title: string
  description: string
  priority: IssuePriority | ''
  storyPoints: number
  assigneeId: number | null
  status: IssueStatus
}

interface Errors {
  title?: string
  priority?: string
  storyPoints?: string
}

interface Message {
  text: string
  type: 'success' | 'error'
}

const props = defineProps<CreateIssueFormProps>()
const emit = defineEmits<{
  issueCreated: [issue: IssueResponse]
}>()

const allAssignees = computed(() => {
  // Combines collaborators and creator, ensuring creator is in the list
  const assignees = [...props.collaborators]
  if (props.creator && !assignees.some(c => c.id === props.creator?.id)) {
    assignees.unshift(props.creator)
  }
  return assignees
})

const formData = reactive<FormData>({
  title: '',
  description: '',
  priority: '',
  storyPoints: 5,
  assigneeId: null,
  status: 'TODO'
})

const errors = reactive<Errors>({})
const message = ref<Message | null>(null)
const isSubmitting = ref(false)


// Validates required fields: title, priority, and story points
const validateForm = (): boolean => {
  errors.title = formData.title.trim() ? '' : 'Le titre est requis'
  errors.priority = formData.priority ? '' : 'La priorité est requise'
  errors.storyPoints = formData.storyPoints > 0 ? '' : 'Les story points doivent être supérieurs à 0'

  return !errors.title && !errors.priority && !errors.storyPoints
}

const handleSubmit = async () => {
  message.value = null

  if (!validateForm()) {
    return
  }

  isSubmitting.value = true

  try {
    // Prepares data payload and calls API to create issue
    const issueData: CreateIssueRequest = {
      title: formData.title,
      description: formData.description || undefined,
      priority: formData.priority as 'LOW' | 'MEDIUM' | 'HIGH',
      storyPoints: formData.storyPoints,
      status: formData.status,
      assigneeId: formData.assigneeId || undefined
    }

    const createdIssue = await projectService.createIssue(props.projectId, issueData)

    message.value = {
      text: 'Issue créée avec succès !',
      type: 'success'
    }

    emit('issueCreated', createdIssue)

    // Resets form after successful creation
    formData.title = ''
    formData.description = ''
    formData.priority = ''
    formData.storyPoints = 5
    formData.assigneeId = null
    formData.status = 'TODO'

    setTimeout(() => {
      message.value = null
    }, 3000)
  } catch (error: any) {
    message.value = {
      text: error.message,
      type: 'error'
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
form {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  padding: 1.5rem;
  background: var(--terminal-bg);
  border: 1px solid var(--terminal-border);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

h2 {
  margin: 0 0 1.5rem 0;
  color: var(--terminal-fg);
  font-size: 1.5rem;
  font-weight: 600;
}

.form-group {
  margin-bottom: 1.25rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--terminal-fg);
  font-weight: 500;
  font-size: 0.9rem;
}

input, textarea, select {
  width: 100%;
  padding: 0.65rem;
  border: 1px solid var(--terminal-border);
  border-radius: 6px;
  background-color: var(--terminal-bg);
  color: var(--terminal-fg);
  font-size: 0.95rem;
  transition: border-color 0.2s ease;
  resize: vertical;
  font-family: inherit;
}

input:focus, textarea:focus, select:focus {
  outline: none;
  border-color: var(--terminal-accent);
}

input.error, textarea.error, select.error {
  border-color: var(--terminal-magenta);
}

.error-message {
  color: var(--terminal-magenta);
  font-size: 0.85rem;
  margin-top: 0.4rem;
  display: block;
}

button {
  width: 100%;
  background: var(--terminal-accent);
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  margin-top: 0.5rem;
  transition: background-color 0.2s ease, transform 0.1s ease;
}

button:hover {
  background: var(--terminal-accent-dark);
  transform: translateY(-1px);
}

button:active {
  transform: translateY(0);
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

button:disabled:hover {
  background: var(--terminal-accent);
  transform: none;
}

.message {
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.message.success {
  background: rgba(187, 154, 247, 0.1);
  border: 1px solid var(--terminal-accent);
  color: var(--terminal-accent);
}

.message.error {
  background: rgba(247, 118, 142, 0.1);
  border: 1px solid var(--terminal-magenta);
  color: var(--terminal-magenta);
}

.required {
  color: var(--terminal-magenta);
}
</style>