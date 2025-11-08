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
        @edit="handleEdit"
        @delete="handleDelete"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { IssueResponse } from '../../services/projectService'
import IssueCard from './IssueCard.vue'

interface IssueListProps {
  issues: IssueResponse[]
  isOwner: boolean
  userId: number
  loading: boolean
}

const props = defineProps<IssueListProps>()

const emit = defineEmits<{
  issueUpdated: []
  issueDeleted: []
}>()

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

const handleEdit = () => {
  // À implémenter
}

const handleDelete = async () => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cette issue ?')) return
  
  try {
    emit('issueDeleted')
  } catch {
    // Gérer l'erreur
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

@media (max-width: 768px) {
  .issues-grid {
    grid-template-columns: 1fr;
  }
}
</style>
