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
  font-size: 1.75rem;
  font-weight: 700;
  position: relative;
  padding-left: 1.5rem;
}

h2::before {
  content: '>';
  position: absolute;
  left: 0;
  color: var(--terminal-accent);
  font-weight: bold;
  animation: blink 1.5s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0.3; }
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--terminal-fg);
  font-weight: 600;
  font-size: 0.9rem;
  font-family: 'Fira Code', monospace;
}

label::before {
  content: '$ ';
  color: var(--terminal-accent);
  font-weight: bold;
}

input, textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid var(--terminal-border);
  border-radius: 4px;
  background-color: rgba(0, 0, 0, 0.3);
  color: var(--terminal-fg);
  font-size: 1rem;
  font-family: 'Fira Code', monospace;
  transition: all 0.3s ease;
  resize: vertical;
}

input:focus, textarea:focus {
  outline: none;
  border-color: var(--terminal-accent);
  box-shadow: 0 0 0 3px var(--terminal-shadow);
  background-color: rgba(0, 0, 0, 0.4);
}

input.error, textarea.error {
  border-color: var(--terminal-error);
  animation: shake 0.3s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.error-message {
  color: var(--terminal-error);
  font-size: 0.875rem;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Fira Code', monospace;
}

.error-message::before {
  content: '✗';
  font-weight: bold;
}

button {
  width: 100%;
  background: linear-gradient(135deg, var(--terminal-accent) 0%, var(--terminal-magenta) 100%);
  color: #ffffff;
  padding: 0.875rem 1.5rem;
  border: 2px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  font-family: 'Fira Code', monospace;
  margin-top: 1rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

button::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

button:hover::before {
  width: 300px;
  height: 300px;
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px var(--terminal-shadow);
  border-color: var(--terminal-accent);
}

button:active {
  transform: translateY(0);
}
</style>
