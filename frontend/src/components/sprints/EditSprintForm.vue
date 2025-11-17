<template>
  <div class="sprint-modal">
    <div class="modal-overlay" @click="$emit('close')"></div>
    <div class="modal-content">
      <div class="modal-header">
        <h2>Modifier le Sprint</h2>
        <button class="btn-close" @click="$emit('close')">&times;</button>
      </div>

      <form @submit.prevent="handleSubmit" class="sprint-form">
        <div v-if="message" :class="['message', message.type]">{{ message.text }}</div>

        <div class="form-group">
          <label for="sprint-name">Nom du Sprint <span class="required">*</span></label>
          <input
            id="sprint-name"
            v-model="formData.name"
            type="text"
            placeholder="Ex: Sprint 1"
            :class="{ error: errors.name }"
            required
          />
          <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
        </div>

        <div class="form-group">
          <label for="start-date">Date de début <span class="required">*</span></label>
          <input
            id="start-date"
            v-model="formData.startDate"
            type="datetime-local"
            :class="{ error: errors.startDate }"
            required
          />
          <span v-if="errors.startDate" class="error-message">{{ errors.startDate }}</span>
        </div>

        <div class="form-group">
          <label for="end-date">Date de fin <span class="required">*</span></label>
          <input
            id="end-date"
            v-model="formData.endDate"
            type="datetime-local"
            :class="{ error: errors.endDate }"
            required
          />
          <span v-if="errors.endDate" class="error-message">{{ errors.endDate }}</span>
        </div>

        <div class="form-group">
          <label>Issues associées</label>
          <div class="issues-selector">
            <div v-if="loadingIssues" class="loading-issues">
              Chargement des issues...
            </div>
            <div v-else-if="availableIssues.length === 0" class="no-issues">
              Aucune issue disponible
            </div>
            <div v-else class="issues-list">
              <label v-for="issue in availableIssues" :key="issue.id" class="issue-checkbox">
                <input
                  type="checkbox"
                  :value="issue.id"
                  v-model="formData.issueIds"
                />
                <div class="issue-info">
                  <span class="issue-title">{{ issue.title }}</span>
                  <div class="issue-meta">
                    <span :class="['priority-badge', `priority-${issue.priority.toLowerCase()}`]">
                      {{ issue.priority }}
                    </span>
                    <span class="status-badge">{{ issue.status }}</span>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-cancel" @click="$emit('close')">
            Annuler
          </button>
          <button type="submit" class="btn-submit" :disabled="isSubmitting">
            {{ isSubmitting ? 'Mise à jour...' : 'Mettre à jour' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import projectService from '../../services/projectService'
import type { UpdateSprintRequest, SprintResponse, IssueResponse } from '../../services/projectService'

interface EditSprintFormProps {
  projectId: string
  sprint: SprintResponse
}

interface Message {
  text: string
  type: 'success' | 'error'
}

const props = defineProps<EditSprintFormProps>()
const emit = defineEmits<{
  close: []
  sprintUpdated: [sprint: SprintResponse]
}>()

const formData = reactive({
  name: props.sprint.name,
  startDate: props.sprint.startDate,
  endDate: props.sprint.endDate,
  issueIds: props.sprint.issueIds || []
})

const errors = reactive<Record<string, string>>({})
const message = ref<Message | null>(null)
const isSubmitting = ref(false)
const availableIssues = ref<IssueResponse[]>([])
const loadingIssues = ref(false)

const loadIssues = async () => {
  try {
    loadingIssues.value = true
    const issues = await projectService.getIssuesByProject(props.projectId)
    availableIssues.value = issues
  } catch (error: any) {
    console.error('Erreur lors du chargement des issues:', error)
  } finally {
    loadingIssues.value = false
  }
}

const validateForm = (): boolean => {
  Object.keys(errors).forEach(key => delete errors[key])

  if (!formData.name.trim()) {
    errors.name = 'Le nom du sprint est requis'
    return false
  }

  if (!formData.startDate) {
    errors.startDate = 'La date de début est requise'
    return false
  }

  if (!formData.endDate) {
    errors.endDate = 'La date de fin est requise'
    return false
  }

  const start = new Date(formData.startDate)
  const end = new Date(formData.endDate)

  if (end <= start) {
    errors.endDate = 'La date de fin doit être après la date de début'
    return false
  }

  return true
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  isSubmitting.value = true
  message.value = null

  try {
    const sprintData: UpdateSprintRequest = {
      name: formData.name,
      startDate: formData.startDate,
      endDate: formData.endDate,
      issueIds: formData.issueIds
    }

    const updatedSprint = await projectService.updateSprint(
      props.projectId,
      props.sprint.id,
      sprintData
    )

    message.value = {
      text: 'Sprint mis à jour avec succès',
      type: 'success'
    }

    setTimeout(() => {
      emit('sprintUpdated', updatedSprint)
      emit('close')
    }, 500)
  } catch (error: any) {
    message.value = {
      text: error.message || 'Erreur lors de la mise à jour du sprint',
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
@import './sprints-shared.css';

/* Styles spécifiques à EditSprintForm si nécessaire */
</style>
