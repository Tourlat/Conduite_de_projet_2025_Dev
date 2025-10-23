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
.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
}

input, textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-family: inherit;
}

input.error, textarea.error {
  border-color: red;
}

.error-message {
  color: red;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: block;
}

button {
  background-color: #42b983;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #35a372;
}
</style>
