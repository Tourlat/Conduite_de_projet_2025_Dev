<template>
  <form @submit.prevent="handleSubmit">
    <h2>Créer un nouveau projet</h2>
    
    <div v-if="message" :class="['message', message.type]">{{ message.text }}</div>
    
    <div class="form-group">
      <label for="projectName">Nom du projet <span class="required">*</span></label>
      <input 
        id="projectName"
        v-model="formData.name"
        type="text" 
        name="projectName"
        placeholder="Ex: Application de gestion"
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

    <div class="form-group">
      <label for="collaborateurs">Collaborateurs</label>
      <input 
        id="collaborateurs"
        v-model="collaborateursInput"
        type="text" 
        name="collaborateurs"
        placeholder="Entrez les emails des collaborateurs (séparés par des virgules)"
        :class="{ error: errors.collaborateurs }"
      />
      <span v-if="errors.collaborateurs" class="error-message">{{ errors.collaborateurs }}</span>
      <span class="help-text">Ex: user1@example.com, user2@example.com</span>
    </div>

    <button type="submit" :disabled="isSubmitting">
      {{ isSubmitting ? 'Création en cours...' : 'Créer le projet' }}
    </button>
  </form>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

interface ProjectData {
  name: string
  description: string
  collaborateurs?: string[]
}

interface Errors {
  name?: string
  description?: string
  collaborateurs?: string
}

interface Message {
  text: string
  type: 'success' | 'error'
}

const emit = defineEmits<{
  createProject: [data: ProjectData]
  projectCreated: [projectId: number]
}>()

const formData = reactive<ProjectData>({
  name: '',
  description: '',
  collaborateurs: []
})

const errors = reactive<Errors>({})
const message = ref<Message | null>(null)
const collaborateursInput = ref('')
const isSubmitting = ref(false)

const validateForm = (): boolean => {
  errors.name = undefined
  errors.description = undefined
  errors.collaborateurs = undefined

  if (!formData.name) {
    errors.name = 'Le nom du projet est requis'
    return false
  }

  if (formData.name.length < 3) {
    errors.name = 'Le nom doit contenir au moins 3 caractères'
    return false
  }

  // Validation des collaborateurs (si fournis)
  if (collaborateursInput.value.trim()) {
    const emails = collaborateursInput.value.split(',').map(e => e.trim()).filter(e => e)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    
    for (const email of emails) {
      if (!emailRegex.test(email)) {
        errors.collaborateurs = `Email invalide: ${email}`
        return false
      }
    }
    
    formData.collaborateurs = emails
  } else {
    formData.collaborateurs = []
  }

  return true
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  message.value = null
  isSubmitting.value = true

  try {
    const response = await fetch('/api/projets', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(formData)
    })
    
    if (response.ok) {
      const result = await response.json()
      message.value = { text: 'Projet créé avec succès !', type: 'success' }
      
      // Émettre l'événement de création réussie
      emit('projectCreated', result.id)
      
      // Redirection après 1.5 secondes
      setTimeout(() => {
        // TODO: Implémenter la navigation avec Vue Router
        window.location.href = `/projets/${result.id}`
      }, 1500)
    } else {
      const error = await response.json()
      
      if (response.status === 400) {
        message.value = { text: error.message || 'Données du projet invalides', type: 'error' }
      } else if (response.status === 401) {
        message.value = { text: 'Vous devez être connecté pour créer un projet', type: 'error' }
      } else if (response.status === 403) {
        message.value = { text: 'Vous n\'avez pas les permissions pour créer un projet', type: 'error' }
      } else {
        message.value = { text: 'Erreur serveur. Veuillez réessayer plus tard.', type: 'error' }
      }
    }
  } catch (error) {
    console.error('Erreur de création de projet:', error)
    message.value = { text: 'Erreur de connexion. Vérifiez votre connexion internet.', type: 'error' }
  } finally {
    isSubmitting.value = false
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
  border: 1px solid var(--terminal-error);
  color: var(--terminal-error);
}

.help-text {
  display: block;
  font-size: 0.8rem;
  color: var(--terminal-fg);
  opacity: 0.6;
  margin-top: 0.3rem;
  font-style: italic;
}

.required {
  color: var(--terminal-error);
}

</style>
