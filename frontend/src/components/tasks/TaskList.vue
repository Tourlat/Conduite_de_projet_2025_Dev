<template>
  <div class="task-list">
    <div v-if="loading" class="loading">
      Chargement des tâches...
    </div>

    <div v-else-if="!tasks.length" class="no-tasks">
      <p>Aucune tâche pour cette issue</p>
    </div>

    <div v-else class="tasks">
      <div 
        v-for="task in sortedTasks" 
        :key="task.id"
        class="task-item"
        :class="`status-${task.status.toLowerCase()}`"
      >
        <div class="task-header">
          <div class="task-status">
            <span class="status-badge" :class="`status-${task.status.toLowerCase()}`">
              {{ getStatusLabel(task.status) }}
            </span>
          </div>
          <div class="task-actions">
            <button 
              v-if="canModify"
              class="btn-icon"
              @click="$emit('edit', task)"
              title="Modifier"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M11.5 2L14 4.5L5 13.5H2.5V11L11.5 2Z" stroke="currentColor" stroke-width="1.5"/>
              </svg>
            </button>
            <button 
              v-if="canModify"
              class="btn-icon btn-delete"
              @click="$emit('delete', task)"
              title="Supprimer"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" stroke-width="1.5"/>
              </svg>
            </button>
          </div>
        </div>
        
        <h4>{{ task.title }}</h4>
        <p v-if="task.description" class="task-description">{{ task.description }}</p>
        <p v-if="task.definitionOfDone" class="task-dod">
          <strong>DoD:</strong> {{ task.definitionOfDone }}
        </p>
        
        <div class="task-meta">
          <span v-if="task.assigneeId" class="task-assignee">
            Assigné à: ID {{ task.assigneeId }}
          </span>
          <span class="task-date">
            Créée le {{ formatDate(task.createdAt) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TaskResponse } from '../../services/projectService'

interface TaskListProps {
  tasks: TaskResponse[]
  loading: boolean
  canModify: boolean
}

const props = defineProps<TaskListProps>()

defineEmits<{
  edit: [task: TaskResponse]
  delete: [task: TaskResponse]
}>()

const sortedTasks = computed(() => {
  return [...props.tasks].sort((a, b) => {
    const statusOrder = { 'TODO': 0, 'IN_PROGRESS': 1, 'DONE': 2 }
    return statusOrder[a.status as keyof typeof statusOrder] - statusOrder[b.status as keyof typeof statusOrder]
  })
})

const getStatusLabel = (status: string): string => {
  const labels: { [key: string]: string } = {
    'TODO': 'À faire',
    'IN_PROGRESS': 'En cours',
    'DONE': 'Terminé'
  }
  return labels[status] || status
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date)
}
</script>

<style scoped>
.task-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.loading {
  text-align: center;
  padding: 1.5rem;
  color: rgba(192, 202, 245, 0.7);
  font-size: 0.9rem;
}

.no-tasks {
  text-align: center;
  padding: 2rem 1rem;
  background: rgba(192, 202, 245, 0.05);
  border: 1px dashed var(--terminal-border);
  border-radius: 4px;
  color: rgba(192, 202, 245, 0.7);
}

.no-tasks p {
  margin: 0;
  font-size: 0.9rem;
}

.tasks {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.task-item {
  background: var(--terminal-bg);
  border: 1px solid var(--terminal-border);
  border-left: 3px solid var(--terminal-accent);
  border-radius: 4px;
  padding: 1rem;
  transition: all 0.2s;
}

.task-item:hover {
  box-shadow: 0 2px 8px rgba(187, 154, 247, 0.1);
  transform: translateX(2px);
}

.task-item.status-done {
  opacity: 0.8;
  border-left-color: var(--terminal-fg);
}

.task-item.status-in_progress {
  border-left-color: var(--terminal-accent);
}

.task-item.status-todo {
  border-left-color: var(--terminal-accent-dark);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.task-status {
  flex: 1;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.status-todo {
  background: rgba(157, 124, 216, 0.2);
  color: var(--terminal-accent-dark);
}

.status-badge.status-in_progress {
  background: rgba(187, 154, 247, 0.2);
  color: var(--terminal-accent);
}

.status-badge.status-done {
  background: rgba(192, 202, 245, 0.2);
  color: var(--terminal-fg);
}

.task-actions {
  display: flex;
  gap: 0.25rem;
}

.btn-icon {
  padding: 0.35rem;
  background: rgba(192, 202, 245, 0.05);
  border: 1px solid var(--terminal-border);
  border-radius: 4px;
  color: var(--terminal-fg);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon:hover {
  background: rgba(187, 154, 247, 0.1);
  border-color: var(--terminal-accent);
  color: var(--terminal-accent);
}

.btn-icon.btn-delete:hover {
  background: rgba(247, 118, 142, 0.1);
  border-color: var(--terminal-magenta);
  color: var(--terminal-magenta);
}

.task-item h4 {
  margin: 0 0 0.5rem 0;
  color: var(--terminal-fg);
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.4;
}

.task-item.status-done h4 {
  text-decoration: line-through;
  opacity: 0.7;
}

.task-description {
  margin: 0 0 0.75rem 0;
  color: rgba(192, 202, 245, 0.7);
  font-size: 0.85rem;
  line-height: 1.4;
}

.task-dod {
  margin: 0 0 0.75rem 0;
  padding: 0.5rem;
  background: rgba(187, 154, 247, 0.05);
  border-left: 3px solid var(--terminal-accent);
  color: rgba(192, 202, 245, 0.8);
  font-size: 0.85rem;
  line-height: 1.4;
  border-radius: 2px;
}

.task-dod strong {
  color: var(--terminal-accent);
}

.task-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--terminal-border);
  flex-wrap: wrap;
}

.task-assignee {
  color: rgba(192, 202, 245, 0.7);
  font-size: 0.8rem;
}

.task-date {
  font-size: 0.75rem;
  color: rgba(192, 202, 245, 0.5);
}
</style>
