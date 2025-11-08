<template>
  <div class="issue-modal edit-issue-modal">
    <div class="modal-overlay" @click="$emit('close')"></div>
    <div class="modal-content">
      <form @submit.prevent="handleSubmit">
        <div class="modal-header">
          <h2>Modifier l'issue</h2>
          <button type="button" class="btn-close" @click="$emit('close')">&times;</button>
        </div>

        <div v-if="message" :class="['message', message.type]">{{ message.text }}</div>

        <div class="form-group">
          <label for="title">Titre <span class="required">*</span></label>
          <input 
            id="title"
            v-model="formData.title"
            type="text" 
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
            rows="4"
            placeholder="Détails de l'issue"
          />
        </div>

        <div class="form-group">
          <label for="priority">Priorité <span class="required">*</span></label>
          <select 
            id="priority"
            v-model="formData.priority"
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
          >
            <option :value="null">Non assigné</option>
            <option v-for="assignee in assignees" :key="assignee.id" :value="assignee.id">
              {{ assignee.name }} ({{ assignee.email }})
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="status">Statut</label>
          <select 
            id="status"
            v-model="formData.status"
          >
            <option value="TODO">À faire</option>
            <option value="IN_PROGRESS">En cours</option>
            <option value="CLOSED">Fermé</option>
          </select>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn-cancel" @click="$emit('close')">
            Annuler
          </button>
          <button type="submit" class="btn-submit" :disabled="isSubmitting">
            {{ isSubmitting ? 'Mise à jour...' : 'Mettre à jour' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import projectService from '../../services/projectService'
import type { IssueResponse } from '../../services/projectService'

interface EditIssueFormProps {
  projectId: string
  issue: IssueResponse
  assignees: Array<{ id: number; name: string; email: string }>
}

interface FormData {
  title: string
  description: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | ''
  storyPoints: number
  assigneeId: number | null
  status: 'TODO' | 'IN_PROGRESS' | 'CLOSED'
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

const props = defineProps<EditIssueFormProps>()
const emit = defineEmits<{
  close: []
  updated: [issue: IssueResponse]
}>()

const formData = reactive<FormData>({
  title: props.issue.title,
  description: props.issue.description || '',
  priority: props.issue.priority,
  storyPoints: props.issue.storyPoints,
  assigneeId: props.issue.assigneeId || null,
  status: props.issue.status
})

const errors = reactive<Errors>({})
const message = ref<Message | null>(null)
const isSubmitting = ref(false)

const validateForm = (): boolean => {
  Object.keys(errors).forEach(key => delete errors[key as keyof Errors])
  let isValid = true

  if (!formData.title.trim()) {
    errors.title = 'Le titre est obligatoire'
    isValid = false
  }

  if (!formData.priority) {
    errors.priority = 'La priorité est obligatoire'
    isValid = false
  }

  if (!formData.storyPoints || formData.storyPoints < 1) {
    errors.storyPoints = 'Les story points doivent être supérieurs à 0'
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  isSubmitting.value = true
  message.value = null

  try {
    const updateData = {
      title: formData.title,
      description: formData.description || undefined,
      priority: formData.priority as 'LOW' | 'MEDIUM' | 'HIGH',
      storyPoints: formData.storyPoints,
      assigneeId: formData.assigneeId || undefined,
      status: formData.status
    }

    const updatedIssue = await projectService.updateIssue(
      props.projectId,
      props.issue.id,
      updateData
    )

    message.value = {
      text: 'Issue mise à jour avec succès',
      type: 'success'
    }

    setTimeout(() => {
      emit('updated', updatedIssue)
      emit('close')
    }, 1000)
  } catch (error: any) {
    message.value = {
      text: error.message || 'Erreur lors de la mise à jour',
      type: 'error'
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
@import './issues-shared.css';

/* Styles spécifiques à EditIssueForm */
</style>
