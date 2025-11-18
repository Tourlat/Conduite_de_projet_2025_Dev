<template>
  <div class="release-modal">
    <div class="modal-overlay" @click="$emit('close')"></div>
    <div class="modal-content">
      <div class="modal-header">
        <h2>Créer une Release</h2>
        <button class="btn-close" @click="$emit('close')">&times;</button>
      </div>

      <form @submit.prevent="handleSubmit" class="release-form">
        <div v-if="message" :class="['message', message.type]">{{ message.text }}</div>

        <div class="form-section">
          <h3>Version</h3>
          <div class="version-inputs">
            <div class="form-group version-field">
              <label for="major">Major *</label>
              <input
                id="major"
                v-model.number="formData.version.major"
                type="number"
                min="0"
                required
                :class="{ error: errors.major }"
              />
              <span v-if="errors.major" class="error-message">{{ errors.major }}</span>
            </div>

            <div class="form-group version-field">
              <label for="minor">Minor *</label>
              <input
                id="minor"
                v-model.number="formData.version.minor"
                type="number"
                min="0"
                required
                :class="{ error: errors.minor }"
              />
              <span v-if="errors.minor" class="error-message">{{ errors.minor }}</span>
            </div>

            <div class="form-group version-field">
              <label for="patch">Patch *</label>
              <input
                id="patch"
                v-model.number="formData.version.patch"
                type="number"
                min="0"
                required
                :class="{ error: errors.patch }"
              />
              <span v-if="errors.patch" class="error-message">{{ errors.patch }}</span>
            </div>
          </div>
          <div class="version-preview">
            Version: <strong>{{ versionString }}</strong>
          </div>
        </div>

        <div class="form-group">
          <label for="releaseNotes">Notes de release</label>
          <textarea
            id="releaseNotes"
            v-model="formData.releaseNotes"
            rows="6"
            placeholder="Décrivez les changements de cette release..."
          />
        </div>

        <div class="form-group">
          <label for="issueSearch">Issues incluses</label>
          
          <div v-if="formData.issueIds && formData.issueIds.length" class="selected-issues">
            <div
              v-for="issueId in formData.issueIds"
              :key="issueId"
              class="issue-chip"
            >
              <span class="chip-text">{{ getIssueTitleById(issueId) }}</span>
              <button type="button" class="chip-remove" @click="removeIssue(issueId)">×</button>
            </div>
          </div>

          <div class="autocomplete">
            <input
              id="issueSearch"
              v-model="issueSearchInput"
              type="text"
              placeholder="Rechercher une issue..."
              @input="filterIssues"
              @focus="showIssueSuggestions = true"
            />
            
            <div v-if="loadingIssues" class="loading-issues">
              Chargement des issues...
            </div>
            <ul v-else-if="showIssueSuggestions && filteredIssues.length" class="suggestions">
              <li
                v-for="issue in filteredIssues"
                :key="issue.id"
                @click="selectIssue(issue.id)"
              >
                <span class="suggestion-title">{{ issue.title }}</span>
                <span class="suggestion-meta">
                  <span class="priority-badge" :class="`priority-${issue.priority.toLowerCase()}`">
                    {{ issue.priority }}
                  </span>
                  <span class="status-badge">{{ issue.status }}</span>
                </span>
              </li>
            </ul>
            <div v-if="showIssueSuggestions && issueSearchInput && !filteredIssues.length && !loadingIssues" class="no-results">
              Aucune issue trouvée
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-cancel" @click="$emit('close')">
            Annuler
          </button>
          <button type="submit" class="btn-submit" :disabled="isSubmitting">
            {{ isSubmitting ? 'Création...' : 'Créer la Release' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import releaseStore from '../../stores/releaseStore'
import projectService from '../../services/projectService'
import type { IssueResponse } from '../../services/projectService'
import type { CreateReleaseRequest } from '../../services/releaseService'

interface CreateReleaseFormProps {
  projectId: string
}

interface Message {
  text: string
  type: 'success' | 'error'
}

const props = defineProps<CreateReleaseFormProps>()
const emit = defineEmits<{
  close: []
  created: []
}>()

const formData = reactive<CreateReleaseRequest>({
  version: {
    major: 1,
    minor: 0,
    patch: 0
  },
  releaseNotes: '',
  issueIds: []
})

const errors = reactive<Record<string, string>>({})
const message = ref<Message | null>(null)
const isSubmitting = ref(false)
const availableIssues = ref<IssueResponse[]>([])
const loadingIssues = ref(false)
const issueSearchInput = ref('')
const showIssueSuggestions = ref(false)

const versionString = computed(() => {
  return `${formData.version.major}.${formData.version.minor}.${formData.version.patch}`
})

const filteredIssues = computed(() => {
  if (!issueSearchInput.value) return availableIssues.value.slice(0, 5)
  
  const query = issueSearchInput.value.toLowerCase()
  const selectedIds = new Set(formData.issueIds || [])
  
  return availableIssues.value
    .filter(issue => !selectedIds.has(issue.id)) // Exclure les issues déjà sélectionnées
    .filter(issue => issue.title.toLowerCase().includes(query))
    .slice(0, 10)
})

const loadIssues = async () => {
  loadingIssues.value = true
  try {
    const allIssues = await projectService.getIssuesByProject(props.projectId)
    
    // Get issue IDs already used in existing releases
    const existingReleases = releaseStore.state.releases
    const usedIssueIds = new Set<number>()
    for (const release of existingReleases) {
      if (release.issueIds) {
        for (const issueId of release.issueIds) {
          usedIssueIds.add(issueId)
        }
      }
    }
    
    // Filter out used issues
    availableIssues.value = allIssues.filter(issue => !usedIssueIds.has(issue.id))
  } finally {
    loadingIssues.value = false
  }
}

const getIssueTitleById = (issueId: number): string => {
  const issue = availableIssues.value.find(i => i.id === issueId)
  return issue ? issue.title : `Issue #${issueId}`
}

const selectIssue = (issueId: number) => {
  if (!formData.issueIds) {
    formData.issueIds = []
  }
  if (!formData.issueIds.includes(issueId)) {
    formData.issueIds.push(issueId)
  }
  issueSearchInput.value = ''
  showIssueSuggestions.value = false
}

const removeIssue = (issueId: number) => {
  if (!formData.issueIds) return
  formData.issueIds = formData.issueIds.filter(id => id !== issueId)
}

const filterIssues = () => {
  showIssueSuggestions.value = true
}

const validateForm = (): boolean => {
  for (const key of Object.keys(errors)) {
    delete errors[key]
  }

  // Vérifier que les valeurs sont définies et valides
  if (formData.version.major === undefined || formData.version.major === null || formData.version.major < 0) {
    errors.major = 'La version major est requise et doit être >= 0'
    return false
  }

  if (formData.version.minor === undefined || formData.version.minor === null || formData.version.minor < 0) {
    errors.minor = 'La version minor est requise et doit être >= 0'
    return false
  }

  if (formData.version.patch === undefined || formData.version.patch === null || formData.version.patch < 0) {
    errors.patch = 'La version patch est requise et doit être >= 0'
    return false
  }

  // Vérifier si la version existe déjà
  const existingVersions = releaseStore.state.releases
  const versionExists = existingVersions.some(release => 
    release.version.major === formData.version.major &&
    release.version.minor === formData.version.minor &&
    release.version.patch === formData.version.patch
  )

  if (versionExists) {
    message.value = {
      text: `La version ${versionString.value} existe déjà pour ce projet`,
      type: 'error'
    }
    return false
  }

  return true
}

const handleSubmit = async () => {
  message.value = null

  if (!validateForm()) {
    return
  }

  isSubmitting.value = true

  try {
    await releaseStore.createRelease(props.projectId, formData)

    message.value = {
      text: 'Release créée avec succès !',
      type: 'success'
    }

    setTimeout(() => {
      emit('created')
      emit('close')
    }, 500)
  } catch (error: any) {
    message.value = {
      text: error.message || 'Erreur lors de la création de la release',
      type: 'error'
    }
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  loadIssues()
})
</script>

<style scoped>
.release-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: var(--terminal-bg);
  border: 2px solid var(--terminal-accent);
  border-radius: 8px;
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  z-index: 1001;
  margin: auto;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 2px solid rgba(187, 154, 247, 0.2);
}

.modal-header h2 {
  margin: 0;
  color: var(--terminal-accent);
  font-size: 1.5rem;
}

.btn-close {
  background: none;
  border: none;
  color: var(--terminal-fg);
  font-size: 2rem;
  cursor: pointer;
  padding: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.btn-close:hover {
  color: var(--terminal-accent);
}

.release-form {
  padding: 1.5rem;
}

.form-section {
  margin-bottom: 2rem;
  padding: 1rem;
  background: rgba(187, 154, 247, 0.05);
  border-radius: 6px;
}

.form-section h3 {
  margin: 0 0 1rem 0;
  color: var(--terminal-accent);
  font-size: 1.1rem;
}

.version-inputs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.version-field {
  margin-bottom: 0.5rem;
}

.version-preview {
  margin-top: 1rem;
  padding: 0.75rem;
  background: var(--terminal-bg);
  border: 1px solid var(--terminal-border);
  border-radius: 4px;
  color: var(--terminal-fg);
  text-align: center;
}

.version-preview strong {
  color: var(--terminal-accent);
  font-size: 1.2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--terminal-accent);
  font-weight: 600;
}

input, textarea {
  width: 100%;
  padding: 0.75rem;
  background: var(--terminal-bg);
  border: 1px solid var(--terminal-border);
  border-radius: 4px;
  color: var(--terminal-fg);
  font-family: inherit;
}

input:focus, textarea:focus {
  outline: none;
  border-color: var(--terminal-accent);
}

input.error {
  border-color: #ff6b6b;
}

.error-message {
  color: #ff6b6b;
  font-size: 0.85rem;
  margin-top: 0.25rem;
  display: block;
}

.message {
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.message.success {
  background: rgba(187, 154, 247, 0.15);
  border: 1px solid var(--terminal-accent);
  color: var(--terminal-accent);
}

.message.error {
  background: rgba(187, 154, 247, 0.1);
  border: 1px solid #bb9af7;
  color: #e0c8ff;
}

.loading-issues {
  padding: 0.75rem;
  text-align: center;
  color: var(--terminal-fg);
  opacity: 0.7;
  font-size: 0.9rem;
}

.no-results {
  padding: 0.75rem;
  color: var(--terminal-fg);
  font-style: italic;
  text-align: center;
  opacity: 0.7;
}

.selected-issues {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.issue-chip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(187, 154, 247, 0.2);
  border: 1px solid var(--terminal-accent);
  border-radius: 20px;
  padding: 0.4rem 0.75rem;
}

.chip-text {
  color: var(--terminal-fg);
  font-size: 0.9rem;
}

.chip-remove {
  background: none;
  border: none;
  color: var(--terminal-accent);
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.chip-remove:hover {
  background: rgba(187, 154, 247, 0.3);
}

.autocomplete {
  position: relative;
}

.suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--terminal-bg);
  border: 2px solid var(--terminal-accent);
  border-top: none;
  border-radius: 0 0 4px 4px;
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 300px;
  overflow-y: auto;
  z-index: 1000;
}

.suggestions li {
  padding: 0.75rem;
  cursor: pointer;
  border-bottom: 1px solid var(--terminal-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background 0.2s;
}

.suggestions li:last-child {
  border-bottom: none;
}

.suggestions li:hover {
  background: rgba(187, 154, 247, 0.1);
}

.suggestion-title {
  color: var(--terminal-fg);
  font-weight: 500;
}

.suggestion-meta {
  display: flex;
  gap: 0.5rem;
  font-size: 0.85rem;
}

.priority-badge,
.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 3px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.priority-badge.priority-low {
  background: rgba(157, 124, 216, 0.1);
  color: #7a5dc7;
  border-color: #7a5dc7;
}

.priority-badge.priority-medium {
  background: rgba(187, 154, 247, 0.2);
  color: #bb9af7;
  border-color: #bb9af7;
}

.priority-badge.priority-high {
  background: rgba(208, 176, 255, 0.3);
  color: #e0c8ff;
  border-color: #e0c8ff;
}

.status-badge {
  background: rgba(187, 154, 247, 0.2);
  color: var(--terminal-accent);
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid var(--terminal-border);
}

.btn-cancel,
.btn-submit {
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-cancel {
  background: transparent;
  color: var(--terminal-fg);
  border: 2px solid rgba(187, 154, 247, 0.3);
}

.btn-cancel:hover {
  border-color: var(--terminal-accent);
  background: rgba(187, 154, 247, 0.1);
}

.btn-submit {
  background: var(--terminal-accent);
  color: var(--terminal-bg);
}

.btn-submit:hover:not(:disabled) {
  background: #9d7cd8;
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .modal-content {
    width: 95%;
  }

  .version-inputs {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-cancel,
  .btn-submit {
    width: 100%;
  }
}
</style>
