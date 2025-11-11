<template>
  <form @submit.prevent="handleSubmit" class="create-task-form">
    <h3>Créer une nouvelle tâche</h3>
    
    <div v-if="message" :class="['message', message.type]">{{ message.text }}</div>
    
    <div class="form-group">
      <label for="title">Titre <span class="required">*</span></label>
      <input 
        id="title"
        v-model="formData.title"
        type="text" 
        placeholder="Ex: Implémenter l'authentification"
        :class="{ error: errors.title }"
      />
      <span v-if="errors.title" class="error-message">{{ errors.title }}</span>
    </div>

    <div class="form-group">
      <label for="description">Description</label>
      <textarea 
        id="description"
        v-model="formData.description"
        rows="3"
        placeholder="Détails de la tâche"
      />
    </div>

    <div class="form-group">
      <label for="status">Statut</label>
      <select 
        id="status"
        v-model="formData.status"
      >
        <option value="TODO">À faire</option>
        <option value="IN_PROGRESS">En cours</option>
        <option value="DONE">Terminé</option>
      </select>
    </div>

    <div class="form-actions">
      <button type="button" class="btn-cancel" @click="$emit('cancel')">
        Annuler
      </button>
      <button type="submit" class="btn-submit" :disabled="isSubmitting">
        {{ isSubmitting ? 'Création...' : 'Créer la tâche' }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import projectService from '../../services/projectService'
import type { CreateTaskRequest, TaskResponse } from '../../services/projectService'

interface CreateTaskFormProps {
  projectId: string
  issueId: number
}

interface FormData {
  title: string
  description: string
  status: 'TODO' | 'IN_PROGRESS' | 'DONE'
}

interface Errors {
  title?: string
}

interface Message {
  text: string
  type: 'success' | 'error'
}

const props = defineProps<CreateTaskFormProps>()
const emit = defineEmits<{
  taskCreated: [task: TaskResponse]
  cancel: []
}>()

const formData = reactive<FormData>({
  title: '',
  description: '',
  status: 'TODO'
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
  } else if (formData.title.length > 200) {
    errors.title = 'Le titre ne peut pas dépasser 200 caractères'
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
    const taskData: CreateTaskRequest = {
      title: formData.title,
      description: formData.description || undefined,
      status: formData.status
    }

    const createdTask = await projectService.createTask(
      props.projectId,
      props.issueId,
      taskData
    )

    message.value = {
      text: 'Tâche créée avec succès',
      type: 'success'
    }

    // Reset form
    formData.title = ''
    formData.description = ''
    formData.status = 'TODO'
    Object.keys(errors).forEach(key => delete errors[key as keyof Errors])

    setTimeout(() => {
      emit('taskCreated', createdTask)
    }, 500)
  } catch (error: any) {
    message.value = {
      text: error.message || 'Erreur lors de la création de la tâche',
      type: 'error'
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
@import '../issues/issues-shared.css';

.create-task-form {
  background: var(--terminal-bg);
  border: 1px solid var(--terminal-border);
  border-radius: 4px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.create-task-form h3 {
  margin: 0;
  color: var(--terminal-fg);
  font-size: 1.25rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--terminal-border);
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 0.5rem;
}
</style>
