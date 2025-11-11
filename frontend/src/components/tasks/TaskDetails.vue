<template>
  <div class="task-details">
    <div class="header">
      <h3>Tâches</h3>
      <button 
        class="btn-toggle"
        @click="showCreateForm = !showCreateForm"
      >
        {{ showCreateForm ? 'Annuler' : 'Ajouter une tâche' }}
      </button>
    </div>

    <CreateTaskForm 
      v-if="showCreateForm"
      :project-id="projectId"
      :issue-id="issueId"
      :assignable-users="assignableUsers"
      @task-created="handleTaskCreated"
      @cancel="showCreateForm = false"
    />

    <TaskList 
      :tasks="tasks"
      :loading="loadingTasks"
      :can-modify="canModify"
      :assignable-users="assignableUsers"
      @edit="handleEdit"
      @delete="handleDelete"
    />

    <!-- Edit Task Modal -->
    <EditTaskForm
      v-if="editingTask"
      :project-id="projectId"
      :issue-id="issueId"
      :task="editingTask"
      :assignable-users="assignableUsers"
      @task-updated="handleTaskUpdated"
      @close="editingTask = null"
    />

    <!-- Delete Confirmation Modal -->
    <div v-if="deletingTask" class="issue-modal delete-modal">
      <div class="modal-overlay" @click="deletingTask = null"></div>
      <div class="modal-content modal-tiny">
        <h3>Confirmer la suppression</h3>
        <p>Êtes-vous sûr de vouloir supprimer la tâche <strong>{{ deletingTask.title }}</strong> ?</p>
        <p class="message warning">Cette action est irréversible.</p>
        <div class="modal-actions">
          <button class="btn-cancel" @click="deletingTask = null">Annuler</button>
          <button class="btn-delete" @click="confirmDelete" :disabled="isDeleting">
            {{ isDeleting ? 'Suppression...' : 'Supprimer' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import CreateTaskForm from './CreateTaskForm.vue'
import EditTaskForm from './EditTaskForm.vue'
import TaskList from './TaskList.vue'
import projectService from '../../services/projectService'
import type { TaskResponse } from '../../services/projectService'

interface User {
  id: number
  name: string
  email: string
}

interface TaskDetailsProps {
  projectId: string
  issueId: number
  canModify: boolean
  assignableUsers: User[]
}

const props = defineProps<TaskDetailsProps>()

const tasks = ref<TaskResponse[]>([])
const loadingTasks = ref(false)
const showCreateForm = ref(false)
const editingTask = ref<TaskResponse | null>(null)
const deletingTask = ref<TaskResponse | null>(null)
const isDeleting = ref(false)

const loadTasks = async () => {
  loadingTasks.value = true
  try {
    tasks.value = await projectService.getTasksByIssue(props.projectId, props.issueId)
  } catch (error) {
    console.error('Erreur lors du chargement des tâches:', error)
  } finally {
    loadingTasks.value = false
  }
}

const handleTaskCreated = async () => {
  showCreateForm.value = false
  await loadTasks()
}

const handleEdit = (task: TaskResponse) => {
  editingTask.value = task
}

const handleTaskUpdated = async () => {
  editingTask.value = null
  await loadTasks()
}

const handleDelete = (task: TaskResponse) => {
  deletingTask.value = task
}

const confirmDelete = async () => {
  if (!deletingTask.value) return
  
  isDeleting.value = true
  try {
    await projectService.deleteTask(
      props.projectId,
      props.issueId,
      deletingTask.value.id
    )
    deletingTask.value = null
    await loadTasks()
  } catch (error: any) {
    console.error('Erreur lors de la suppression:', error)
    alert(error.message || 'Erreur lors de la suppression de la tâche')
  } finally {
    isDeleting.value = false
  }
}

onMounted(() => {
  loadTasks()
})
</script>

<style scoped>
@import '../issues/issues-shared.css';

.task-details {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid var(--terminal-border);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.header h3 {
  margin: 0;
  color: var(--terminal-fg);
  font-size: 1.25rem;
}

.btn-toggle {
  padding: 0.6rem 1.2rem;
  background: var(--terminal-bg);
  color: var(--terminal-accent);
  border: 2px solid var(--terminal-accent);
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.btn-toggle:hover {
  background: rgba(187, 154, 247, 0.1);
}

.delete-modal .modal-content {
  padding: 1.5rem;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-toggle {
    width: 100%;
  }
}
</style>
