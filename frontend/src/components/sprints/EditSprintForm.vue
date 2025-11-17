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
import SprintFormFields from './SprintFormFields.vue'
import IssueSelector from './IssueSelector.vue'

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

</style>
