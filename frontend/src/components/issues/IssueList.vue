<template>
  <div class="issues-list">
    <div v-if="loading" class="loading">
      Chargement des issues...
    </div>

    <div v-else-if="!issues.length" class="no-issues">
      <p>Aucune issue pour le moment</p>
    </div>

    <div v-else class="issues-grid">
      <IssueCard 
        v-for="issue in sortedIssues" 
        :key="issue.id"
        :issue="issue"
        :can-modify="canModify(issue)"
        @view="openDetailModal(issue)"
        @edit="openEditModal(issue)"
        @delete="handleDelete(issue)"
        @status-change="handleStatusChange"
        @assign-click="openAssignModal(issue)"
      />
    </div>

    <!-- Modals -->
    <IssueDetailModal
      v-if="viewingIssue"
      :project-id="projectId"
      :issue="viewingIssue"
      :can-modify="canModify(viewingIssue)"
      @close="viewingIssue = null"
    />

    <EditIssueForm 
      v-if="editingIssue"
      :project-id="projectId"
      :issue="editingIssue"
      :assignees="assignees"
      @close="editingIssue = null"
      @updated="handleIssueUpdated"
    />

    <AssignIssueForm 
      v-if="assigningIssue"
      :project-id="projectId"
      :issue="assigningIssue"
      :assignees="assignees"
      @close="assigningIssue = null"
      @updated="handleIssueUpdated"
    />

    <!-- Delete Confirmation Modal -->
    <div v-if="deletingIssue" class="issue-modal delete-modal">
      <div class="modal-overlay" @click="deletingIssue = null"></div>
      <div class="modal-content modal-tiny">
        <h3>Confirmer la suppression</h3>
        <p>Êtes-vous sûr de vouloir supprimer l'issue <strong>{{ deletingIssue.title }}</strong> ?</p>
        <p class="message warning">Cette action est irréversible.</p>
        <div class="modal-actions">
          <button class="btn-cancel" @click="deletingIssue = null">Annuler</button>
          <button class="btn-delete" @click="confirmDelete" :disabled="isDeleting">
            {{ isDeleting ? 'Suppression...' : 'Supprimer' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { IssueResponse, IssueStatus } from '../../services/projectService'
import projectService from '../../services/projectService'
import IssueCard from './IssueCard.vue'
import IssueDetailModal from './IssueDetailModal.vue'
import EditIssueForm from './EditIssueForm.vue'
import AssignIssueForm from './AssignIssueForm.vue'

interface IssueListProps {
  projectId: string
  issues: IssueResponse[]
  isOwner: boolean
  userId: number
  loading: boolean
  assignees: Array<{ id: number; name: string; email: string }>
}

const props = defineProps<IssueListProps>()

const emit = defineEmits<{
  issueUpdated: []
  issueDeleted: []
}>()

const viewingIssue = ref<IssueResponse | null>(null)
const editingIssue = ref<IssueResponse | null>(null)
const assigningIssue = ref<IssueResponse | null>(null)
const deletingIssue = ref<IssueResponse | null>(null)
const isDeleting = ref(false)

const sortedIssues = computed(() => {
  return [...props.issues].sort((a, b) => {
    const priorityOrder = { 'HIGH': 0, 'MEDIUM': 1, 'LOW': 2 }
    const statusOrder = { 'TODO': 0, 'IN_PROGRESS': 1, 'CLOSED': 2 }
    
    const priorityDiff = priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder]
    if (priorityDiff !== 0) return priorityDiff
    
    return statusOrder[a.status as keyof typeof statusOrder] - statusOrder[b.status as keyof typeof statusOrder]
  })
})

const canModify = (issue: IssueResponse): boolean => {
  return props.isOwner || issue.creatorId === props.userId
}

const openDetailModal = (issue: IssueResponse) => {
  viewingIssue.value = issue
}

const openEditModal = (issue: IssueResponse) => {
  editingIssue.value = issue
}

const openAssignModal = (issue: IssueResponse) => {
  assigningIssue.value = issue
}

const handleStatusChange = async (issue: IssueResponse, newStatus: IssueStatus) => {
  try {
    await projectService.updateIssue(props.projectId, issue.id, { status: newStatus })
    emit('issueUpdated')
  } catch (error: any) {
    console.error('Erreur lors du changement de statut:', error)
  }
}

const handleIssueUpdated = () => {
  editingIssue.value = null
  assigningIssue.value = null
  emit('issueUpdated')
}

const handleDelete = (issue: IssueResponse) => {
  deletingIssue.value = issue
}

const confirmDelete = async () => {
  if (!deletingIssue.value) return
  
  isDeleting.value = true
  try {
    await projectService.deleteIssue(props.projectId, deletingIssue.value.id)
    deletingIssue.value = null
    emit('issueDeleted')
  } catch (error: any) {
    console.error('Erreur lors de la suppression:', error)
    alert(error.message || 'Erreur lors de la suppression de l\'issue')
  } finally {
    isDeleting.value = false
  }
}
</script>

<style scoped>
@import './issues-shared.css';

/* Styles spécifiques à IssueList */
.issues-list {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.loading {
  text-align: center;
  padding: 2rem;
  color: var(--terminal-fg-muted);
  font-size: 1rem;
}

.no-issues {
  text-align: center;
  padding: 3rem 2rem;
  background: var(--terminal-bg);
  border: 1px solid var(--terminal-border);
  border-radius: 4px;
  color: var(--terminal-fg-muted);
}

.no-issues p {
  margin: 0;
}

.issues-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
}

.delete-modal .modal-content {
  padding: 1.5rem;
}

@media (max-width: 768px) {
  .issues-grid {
    grid-template-columns: 1fr;
  }
}
</style>