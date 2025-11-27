<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Créer un sprint</h2>
        <button class="btn-close" @click="$emit('close')">×</button>
      </div>

      <form class="sprint-form" @submit.prevent="handleSubmit">
        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <SprintFormFields
          :name="formData.name"
          :start-date="formData.startDate"
          :end-date="formData.endDate"
          @update:name="formData.name = $event"
          @update:start-date="formData.startDate = $event"
          @update:end-date="formData.endDate = $event"
        />

        <IssueSelector
          :issues="availableIssues"
          :selected-issue-ids="formData.issueIds || []"
          :loading="loadingIssues"
          @update:selected-issue-ids="formData.issueIds = $event"
        />

        <div class="form-actions">
          <button type="button" class="btn-cancel" @click="$emit('close')">
            Annuler
          </button>
          <button type="submit" class="btn-submit" :disabled="loading">
            {{ loading ? 'Création...' : 'Créer le sprint' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import projectService from '../../services/projectService'
import type { CreateSprintRequest, IssueResponse } from '../../services/projectService'
import SprintFormFields from './SprintFormFields.vue'
import IssueSelector from './IssueSelector.vue'

interface Props {
  projectId: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  created: []
}>()

const formData = ref<CreateSprintRequest>({
  name: '',
  startDate: '',
  endDate: '',
  issueIds: []
})

const loading = ref(false)
const error = ref('')
const availableIssues = ref<IssueResponse[]>([])
const loadingIssues = ref(false)

const loadIssues = async () => {
  loadingIssues.value = true
  try {
    const issues = await projectService.getIssuesByProject(props.projectId)
    availableIssues.value = issues
  } catch (err) {
    console.error('Erreur lors du chargement des issues:', err)
  } finally {
    loadingIssues.value = false
  }
}

const handleSubmit = async () => {
  error.value = ''

  // Validates sprint name and ensures end date is after start date
  if (!formData.value.name.trim()) {
    error.value = 'Le nom du sprint est requis'
    return
  }

  if (!formData.value.startDate || !formData.value.endDate) {
    error.value = 'Les dates de début et de fin sont requises'
    return
  }

  const startDate = new Date(formData.value.startDate)
  const endDate = new Date(formData.value.endDate)

  if (endDate <= startDate) {
    error.value = 'La date de fin doit être après la date de début'
    return
  }

  loading.value = true

  try {
    await projectService.createSprint(props.projectId, formData.value)
    emit('created')
  } catch (err: any) {
    error.value = err.message || 'Erreur lors de la création du sprint'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadIssues()
})
</script>

<style scoped>
@import './sprints-shared.css';

/* Styles spécifiques à CreateSprintForm */
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
  z-index: 1000;
}

.modal-content {
  background: var(--terminal-bg);
  border: 2px solid var(--terminal-accent);
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
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

.sprint-form {
  padding: 1.5rem;
}

.error-message {
  background: rgba(224, 200, 255, 0.15);
  border: 1px solid #e0c8ff;
  color: #e0c8ff;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--terminal-accent);
  font-weight: 600;
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

  .form-row {
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
