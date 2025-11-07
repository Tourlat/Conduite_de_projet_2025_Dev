<template>
  <div class="project-settings">
    <h3>Paramètres du projet</h3>

    <div v-if="message" :class="['message', message.type]">{{ message.text }}</div>

    <form @submit.prevent="saveSettings" class="settings-form">
        
      <div class="form-group">
        <label for="projectName">Nom du projet *</label>
        <input
          id="projectName"
          v-model="formData.name"
          type="text"
          placeholder="Nom du projet"
          required
          :disabled="loading"
        />
        <span v-if="errors.name" class="error-text">{{ errors.name }}</span>
      </div>

      <div class="form-group">
        <label for="projectDescription">Description</label>
        <textarea
          id="projectDescription"
          v-model="formData.description"
          placeholder="Description du projet"
          rows="4"
          :disabled="loading"
        ></textarea>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? 'Enregistrement...' : 'Enregistrer' }}
        </button>
        <button type="button" class="btn btn-secondary" @click="resetForm" :disabled="loading">
          Annuler
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { projectStore } from '../../stores/projectStore'

interface Project {
  id: string
  name: string
  description?: string
}

interface Message {
  text: string
  type: 'success' | 'error'
}

interface FormErrors {
  name?: string
  description?: string
}

const props = defineProps<{
  project: Project
}>()

const emit = defineEmits<{
  updated: [project: Project]
}>()

const formData = reactive({
  name: '',
  description: ''
})

const errors = reactive<FormErrors>({})
const loading = ref(false)
const message = ref<Message | null>(null)

const initializeForm = () => {
  formData.name = props.project.name
  formData.description = props.project.description || ''
  errors.name = undefined
  errors.description = undefined
}

const resetForm = () => {
  initializeForm()
  message.value = null
}

const validateForm = (): boolean => {
  errors.name = undefined
  errors.description = undefined

  if (!formData.name.trim()) {
    errors.name = 'Le nom du projet est requis'
    return false
  }

  if (formData.name.trim().length < 3) {
    errors.name = 'Le nom doit contenir au moins 3 caractères'
    return false
  }

  if (formData.name.trim().length > 100) {
    errors.name = 'Le nom ne peut pas dépasser 100 caractères'
    return false
  }

  if (formData.description && formData.description.length > 500) {
    errors.description = 'La description ne peut pas dépasser 500 caractères'
    return false
  }

  return true
}

const saveSettings = async () => {
  if (!validateForm()) {
    return
  }

  try {
    loading.value = true
    message.value = null

    const updatedProject = await projectStore.updateProject(props.project.id, {
      name: formData.name.trim(),
      description: formData.description?.trim() || undefined
    })

    message.value = {
      text: 'Paramètres enregistrés avec succès',
      type: 'success'
    }

    emit('updated', updatedProject)

    setTimeout(() => {
      message.value = null
    }, 3000)
  } catch (error) {
    message.value = {
      text: error instanceof Error ? error.message : 'Erreur lors de l\'enregistrement',
      type: 'error'
    }
  } finally {
    loading.value = false
  }
}

watch(() => props.project, () => {
  initializeForm()
}, { immediate: true })

onMounted(() => {
  initializeForm()
})
</script>

<style scoped>
.project-settings {
  padding: 2rem;
  background-color: var(--terminal-bg);
  border: 2px solid var(--terminal-border);
  border-radius: 4px;
}

h3 {
  color: var(--terminal-accent);
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.message {
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 4px;
  font-weight: 500;
}

.message.success {
  background-color: rgba(187, 154, 247, 0.1);
  color: var(--terminal-accent);
  border: 1px solid var(--terminal-accent);
}

.message.error {
  background-color: rgba(247, 118, 142, 0.1);
  color: var(--terminal-magenta);
  border: 1px solid var(--terminal-magenta);
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  color: var(--terminal-text);
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  padding: 0.75rem;
  background-color: rgba(187, 154, 247, 0.03);
  border: 1px solid var(--terminal-border);
  border-radius: 4px;
  color: var(--terminal-text);
  font-family: inherit;
  font-size: 1rem;
  transition: border-color 0.2s, background-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--terminal-accent);
  background-color: rgba(187, 154, 247, 0.08);
}

.form-group input:disabled,
.form-group textarea:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.error-text {
  color: var(--terminal-magenta);
  font-size: 0.875rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background-color: var(--terminal-accent);
  color: var(--terminal-bg);
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--terminal-accent-dark);
  box-shadow: 0 0 10px var(--terminal-accent);
}

.btn-secondary {
  background-color: transparent;
  color: var(--terminal-text);
  border: 1px solid var(--terminal-border);
}

.btn-secondary:hover:not(:disabled) {
  border-color: var(--terminal-accent);
  background-color: rgba(187, 154, 247, 0.1);
}
</style>
