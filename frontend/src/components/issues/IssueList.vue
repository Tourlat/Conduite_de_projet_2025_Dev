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
        @edit="openEditModal(issue)"
        @delete="handleDelete(issue)"
        @status-change="handleStatusChange"
        @assign-click="openAssignModal(issue)"
      />
    </div>

    <!-- Modals -->
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
    <div v-if="deletingIssue" class="delete-modal">
      <div class="modal-overlay" @click="deletingIssue = null"></div>
      <div class="modal-content">
        <h3>Confirmer la suppression</h3>
        <p>Êtes-vous sûr de vouloir supprimer l'issue <strong>{{ deletingIssue.title }}</strong> ?</p>
        <p class="warning">Cette action est irréversible.</p>
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
import type { IssueResponse } from '../../services/projectService'
import projectService from '../../services/projectService'
import IssueCard from './IssueCard.vue'
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

const openEditModal = (issue: IssueResponse) => {
  editingIssue.value = issue
}

const openAssignModal = (issue: IssueResponse) => {
  assigningIssue.value = issue
}

const handleStatusChange = async (issue: IssueResponse, newStatus: 'TODO' | 'IN_PROGRESS' | 'CLOSED') => {
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

/* Delete Modal Styles */
.delete-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
}

.modal-content {
  position: relative;
  background: var(--terminal-bg);
  border: 1px solid var(--terminal-border);
  border-radius: 8px;
  max-width: 450px;
  width: 100%;
  padding: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.modal-content h3 {
  margin: 0 0 1rem 0;
  color: var(--terminal-fg);
  font-size: 1.25rem;
}

.modal-content p {
  margin: 0 0 1rem 0;
  color: rgba(192, 202, 245, 0.8);
  line-height: 1.5;
}

.modal-content p.warning {
  color: var(--terminal-magenta);
  font-size: 0.9rem;
  font-weight: 500;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid var(--terminal-border);
}

.btn-cancel,
.btn-delete {
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-size: 0.95rem;
}

.btn-cancel {
  background: rgba(192, 202, 245, 0.1);
  color: var(--terminal-fg);
}

.btn-cancel:hover {
  background: rgba(192, 202, 245, 0.15);
}

.btn-delete {
  background: var(--terminal-magenta);
  color: white;
}

.btn-delete:hover:not(:disabled) {
  background: var(--terminal-accent-dark);
  transform: translateY(-1px);
}

.btn-delete:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .issues-grid {
    grid-template-columns: 1fr;
  }
}
</style>