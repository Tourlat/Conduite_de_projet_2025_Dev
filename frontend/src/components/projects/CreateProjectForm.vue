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

      <!-- Selected collaborators as chips -->
      <div v-if="formData.collaborateurs && formData.collaborateurs.length" class="chips">
        <span v-for="email in formData.collaborateurs" :key="email" class="chip">
          {{ email }} <button type="button" class="chip-remove" @click="removeCollaborator(email)">×</button>
        </span>
      </div>

      <!-- Input with autocomplete suggestions -->
      <div class="autocomplete">
        <input
          id="collaborateurs"
          v-model="collaborateursInput"
          type="text"
          name="collaborateurs"
          placeholder="Rechercher un utilisateur par email"
          :class="{ error: errors.collaborateurs }"
          autocomplete="off"
          @input="onCollaborateurInput"
          @focus="showSuggestions = true; onCollaborateurInput()"
          @keydown.enter.prevent="maybeAddInputAsCollaborator"
        />

        <ul v-if="showSuggestions && suggestions.length" class="suggestions">
          <li v-for="s in suggestions" :key="s.email" @click="addCollaborator(s.email)">
            <strong>{{ s.email }}</strong>
            <div class="small">{{ s.nom || '' }}</div>
          </li>
        </ul>
      </div>

      <span v-if="errors.collaborateurs" class="error-message">{{ errors.collaborateurs }}</span>
      <span class="help-text">Cliquez dans le champ pour voir les suggestions ou tapez pour filtrer</span>
    </div>

    <button type="submit" :disabled="isSubmitting">
      {{ isSubmitting ? 'Création en cours...' : 'Créer le projet' }}
    </button>
  </form>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { projectStore } from '../../stores/projectStore'

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

const router = useRouter()

const formData = reactive<ProjectData>({
  name: '',
  description: '',
  collaborateurs: []
})

const errors = reactive<Errors>({})
const message = ref<Message | null>(null)
const collaborateursInput = ref('')
const allUsers = ref<Array<{ email: string; nom?: string }>>([])
const suggestions = ref<Array<{ email: string; nom?: string }>>([])
const showSuggestions = ref(false)
const isSubmitting = ref(false)

// Récupérer tous les utilisateurs au montage du composant
const fetchAllUsers = async () => {
  try {
    const data = await projectStore.getUsers()
    allUsers.value = Array.isArray(data) ? data : []
  } catch (e) {
    console.error('Erreur de récupération des utilisateurs', e)
  }
}

// Appeler au montage du composant
fetchAllUsers()

const onCollaborateurInput = () => {
  const cleanedCollaboratorsInput = collaborateursInput.value.trim()
  if (!cleanedCollaboratorsInput) {
    // Afficher les 5 premiers utilisateurs si aucune saisie
    suggestions.value = allUsers.value.slice(0, 5)
    return
  }
  // Filtrer côté client les emails qui commencent par la saisie
  const lower = cleanedCollaboratorsInput.toLowerCase()
  suggestions.value = allUsers.value
    .filter((user: any) => typeof user.email === 'string' && user.email.toLowerCase().startsWith(lower))
    .slice(0, 8)
}

const addCollaborator = (email: string) => {
  if (!email) return
  if (!formData.collaborateurs) formData.collaborateurs = []
  if (!formData.collaborateurs.includes(email)) {
    formData.collaborateurs.push(email)
  }
  collaborateursInput.value = ''
  suggestions.value = []
  showSuggestions.value = false
}

const removeCollaborator = (email: string) => {
  formData.collaborateurs = (formData.collaborateurs || []).filter(e => e !== email)
}

const maybeAddInputAsCollaborator = () => {
  const cleanedCollaborateursInput = collaborateursInput.value.trim()
  if (!cleanedCollaborateursInput) return
  // allow comma separated
  if (cleanedCollaborateursInput.includes(',')) {
    const parts = cleanedCollaborateursInput.split(',').map(p => p.trim()).filter(Boolean)
    for (const part of parts) addCollaborator(part)
  } else {
    addCollaborator(cleanedCollaborateursInput)
  }
}

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

  // If user left text in the input, try to add it (comma separated) before validating
  if (collaborateursInput.value.trim()) {
    const emails = collaborateursInput.value.split(',').map(e => e.trim()).filter(e => e)
    for (const email of emails) {
      if (!formData.collaborateurs) formData.collaborateurs = []
      if (!formData.collaborateurs.includes(email)) {
        formData.collaborateurs.push(email)
      }
    }
    collaborateursInput.value = ''
  }

  // Validation des collaborateurs (si fournis)
  if (formData.collaborateurs && formData.collaborateurs.length) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    for (const email of formData.collaborateurs) {
      if (!emailRegex.test(email)) {
        errors.collaborateurs = `Email invalide: ${email}`
        return false
      }
    }
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
    const result = await projectStore.createProject(formData)
    message.value = { text: 'Projet créé avec succès !', type: 'success' }
    
    emit('projectCreated', result.id)
    
    setTimeout(() => {
      router.push('/dashboard')
    }, 1500)
  } catch (error: any) {
    message.value = { text: error.message || 'Erreur lors de la création du projet', type: 'error' }
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

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.chip {
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--terminal-border);
  padding: 0.4rem 0.7rem;
  border-radius: 999px;
  font-size: 0.85rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.chip-remove {
  background: transparent;
  border: none;
  color: var(--terminal-fg);
  cursor: pointer;
  font-size: 1.1rem;
  padding: 0;
  margin: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;
}

.chip-remove:hover {
  color: var(--terminal-magenta);
  background: transparent;
}

.autocomplete { position: relative; }
.suggestions {
  position: absolute;
  left: 0;
  right: 0;
  margin-top: 0.25rem;
  background: var(--terminal-bg);
  border: 1px solid var(--terminal-border);
  border-radius: 6px;
  max-height: 220px;
  overflow: auto;
  z-index: 50;
}
.suggestions li {
  padding: 0.5rem;
  cursor: pointer;
}
.suggestions li:hover { background: rgba(255,255,255,0.02); }
.suggestions .small { font-size: 0.8rem; opacity: 0.7 }

</style>
