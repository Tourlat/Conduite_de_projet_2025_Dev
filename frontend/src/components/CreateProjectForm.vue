<template>
  <form @submit.prevent="handleSubmit">
    <h2>Créer un nouveau projet</h2>
    
    <div class="form-group">
      <label for="projectName">Nom du projet</label>
      <input 
        id="projectName"
        v-model="formData.name"
        type="text" 
        name="projectName"
        :class="{ error: errors.name }"
      />
      <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
    </div>

    <div class="form-group">
      <label for="description">Description</label>
      <textarea 
        id="description"
        v-model="formData.description"
        name="description"
        rows="4"
        :class="{ error: errors.description }"
      />
      <span v-if="errors.description" class="error-message">{{ errors.description }}</span>
    </div>

    <button type="submit">Créer le projet</button>
  </form>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

interface ProjectData {
  name: string
  description: string
}

interface Errors {
  name?: string
  description?: string
}

const emit = defineEmits<{
  createProject: [data: ProjectData]
}>()

const formData = reactive<ProjectData>({
  name: '',
  description: ''
})

const errors = reactive<Errors>({})

const validateForm = (): boolean => {
  errors.name = undefined
  errors.description = undefined

  if (!formData.name) {
    errors.name = 'Le nom du projet est requis'
    return false
  }

  if (formData.name.length < 3) {
    errors.name = 'Le nom doit contenir au moins 3 caractères'
    return false
  }

  return true
}

const handleSubmit = () => {
  if (validateForm()) {
    emit('createProject', { ...formData })
  }
}
</script>

<style scoped>
form {
  width: 100%;
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

input, textarea {
  width: 100%;
  padding: 0.65rem;
  border: 1px solid var(--terminal-border);
  border-radius: 6px;
  background-color: var(--terminal-bg);
  color: var(--terminal-fg);
  font-size: 0.95rem;
  transition: border-color 0.2s ease;
  resize: vertical;
}

input:focus, textarea:focus {
  outline: none;
  border-color: var(--terminal-accent);
}

input.error, textarea.error {
  border-color: var(--terminal-error);
}

.error-message {
  color: var(--terminal-error);
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
</style>
