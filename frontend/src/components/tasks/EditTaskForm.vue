<template>
  <div class="issue-modal edit-task-modal">
    <div class="modal-overlay" @click="$emit('close')"></div>
    <div class="modal-content">
      <div class="modal-header">
        <h3>Modifier la tâche</h3>
        <button type="button" class="btn-close" @click="$emit('close')">&times;</button>
      </div>

      <form class="modal-body" @submit.prevent="handleSubmit">
        <div v-if="message" :class="['message', message.type]">{{ message.text }}</div>
        
        <div class="form-group">
          <label for="title">Titre <span class="required">*</span></label>
          <input 
            id="title"
            v-model="formData.title"
            type="text" 
            placeholder="Titre de la tâche"
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
          <label for="definitionOfDone">Definition of Done</label>
          <textarea 
            id="definitionOfDone"
            v-model="formData.definitionOfDone"
            rows="2"
            placeholder="Critères d'acceptation"
          />
        </div>

        <div class="form-group">
          <label for="assignee">Assigner à</label>
          <select 
            id="assignee"
            v-model="formData.assigneeId"
          >
            <option :value="null">Non assigné</option>
            <option 
              v-for="user in assignableUsers" 
              :key="user.id" 
              :value="user.id"
            >
              {{ user.name }} ({{ user.email }})
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
            <option value="DONE">Terminé</option>
          </select>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn-cancel" @click="$emit('close')">
            Annuler
          </button>
          <button type="submit" class="btn-submit" :disabled="isSubmitting">
            {{ isSubmitting ? 'Mise à jour...' : 'Modifier' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import projectService from '../../services/projectService'
import type { TaskResponse } from '../../services/projectService'

interface User {
  id: number
  name: string
  email: string
}

interface EditTaskFormProps {
  projectId: string
  issueId: number
  task: TaskResponse
  assignableUsers: User[]
}

interface FormData {
  title: string
  description: string
  definitionOfDone: string
  status: 'TODO' | 'IN_PROGRESS' | 'DONE'
  assigneeId: number | null
}

interface Errors {
  title?: string
}

interface Message {
  text: string
  type: 'success' | 'error'
}

const props = defineProps<EditTaskFormProps>()
const emit = defineEmits<{
  taskUpdated: [task: TaskResponse]
  close: []
}>()

const formData = reactive<FormData>({
  title: '',
  description: '',
  definitionOfDone: '',
  status: 'TODO',
  assigneeId: null
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
    const taskData = {
      title: formData.title,
      description: formData.description || undefined,
      definitionOfDone: formData.definitionOfDone || undefined,
      status: formData.status,
      assigneeId: formData.assigneeId || undefined
    }

    const updatedTask = await projectService.updateTask(
      props.projectId,
      props.issueId,
      props.task.id,
      taskData
    )

    message.value = {
      text: 'Tâche modifiée avec succès',
      type: 'success'
    }

    setTimeout(() => {
      emit('taskUpdated', updatedTask)
    }, 500)
  } catch (error: any) {
    message.value = {
      text: error.message || 'Erreur lors de la modification de la tâche',
      type: 'error'
    }
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  formData.title = props.task.title
  formData.description = props.task.description || ''
  formData.definitionOfDone = props.task.definitionOfDone || ''
  formData.status = props.task.status
  formData.assigneeId = props.task.assigneeId || null
})
</script>

<style scoped>
@import '../issues/issues-shared.css';
</style>
