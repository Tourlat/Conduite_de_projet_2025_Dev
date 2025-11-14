<template>
  <div class="backlog-container">
    <div class="backlog-content">
      <div class="backlog-header">
        <button class="btn-back" @click="goBack">
            <font-awesome-icon :icon="['fas', 'angle-left']" /> Retour au projet
        </button>
        <h1>Backlog - {{ projectName }}</h1>
      </div>

      <div v-if="loading" class="loading">
        Chargement du backlog...
      </div>

      <div v-else>
        <div class="filters-bar">
          <div class="filter-group">
            <label for="priority-filter">Priorité:</label>
            <select id="priority-filter" v-model="priorityFilter" class="filter-select">
              <option value="all">Toutes</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <div class="filter-group">
            <label for="assignment-filter">Assignation:</label>
            <select id="assignment-filter" v-model="assignmentFilter" class="filter-select">
              <option value="all">Toutes</option>
              <option value="assigned">Assignées</option>
              <option value="unassigned">Non assignées</option>
            </select>
          </div>

          <div class="filter-group">
            <label for="sort-filter">Trier par:</label>
            <select id="sort-filter" v-model="sortBy" class="filter-select">
              <option value="alphabetical">Ordre alphabétique</option>
              <option value="priority-desc">Priorité (haute → basse)</option>
              <option value="priority-asc">Priorité (basse → haute)</option>
              <option value="storypoints">Story Points</option>
            </select>
          </div>
        </div>

        <div class="backlog-board">
        <BacklogColumn
          title="À faire"
          :issues="todoIssues"
          status="TODO"
          empty-message="Aucune issue à faire"
          @issue-click="openIssueModal"
        />
        
        <BacklogColumn
          title="En cours"
          :issues="inProgressIssues"
          status="IN_PROGRESS"
          empty-message="Aucune issue en cours"
          @issue-click="openIssueModal"
        />
        
        <BacklogColumn
          title="Fermé"
          :issues="closedIssues"
          status="CLOSED"
          empty-message="Aucune issue fermée"
          @issue-click="openIssueModal"
        />
      </div>
      </div>
       <IssueDetailModal
      v-if="selectedIssue"
      :project-id="projectId"
      :issue="selectedIssue"
      :can-modify="true"
      @close="selectedIssue = null"
    />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BacklogColumn from '../backlog/BacklogColumn.vue'
import IssueDetailModal from '../issues/IssueDetailModal.vue'
import projectService from '../../services/projectService'
import { projectStore } from '../../stores/projectStore'
import type { IssueResponse } from '../../services/projectService'

const route = useRoute()
const router = useRouter()
const projectId = route.params.id as string

const issues = ref<IssueResponse[]>([])
const projectName = ref('')
const loading = ref(true)
const selectedIssue = ref<IssueResponse | null>(null)

// Filtres
const priorityFilter = ref<'all' | 'HIGH' | 'MEDIUM' | 'LOW'>('all')
const assignmentFilter = ref<'all' | 'assigned' | 'unassigned'>('all')
const sortBy = ref<'alphabetical' | 'priority-desc' | 'priority-asc' | 'storypoints'>('alphabetical')

// Fonction pour trier les issues
const sortIssues = (issuesList: IssueResponse[]) => {
  const sorted = [...issuesList]
  
  if (sortBy.value === 'alphabetical') {
    sorted.sort((a, b) => a.title.localeCompare(b.title))
  } else if (sortBy.value === 'priority-desc') {
    const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 }
    sorted.sort((a, b) => {
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0
      return bPriority - aPriority
    })
  } else if (sortBy.value === 'priority-asc') {
    const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 }
    sorted.sort((a, b) => {
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0
      return aPriority - bPriority
    })
  } else if (sortBy.value === 'storypoints') {
    sorted.sort((a, b) => {
      const aPoints = a.storyPoints || 0
      const bPoints = b.storyPoints || 0
      return bPoints - aPoints
    })
  }
  
  return sorted
}

// Fonction pour filtrer les issues
const filterIssues = (issuesList: IssueResponse[]) => {
  let filtered = [...issuesList]
  
  // Filtre par priorité
  if (priorityFilter.value !== 'all') {
    filtered = filtered.filter(issue => issue.priority === priorityFilter.value)
  }
  
  // Filtre par assignation
  if (assignmentFilter.value === 'assigned') {
    filtered = filtered.filter(issue => issue.assigneeId != null)
  } else if (assignmentFilter.value === 'unassigned') {
    filtered = filtered.filter(issue => issue.assigneeId == null)
  }
  
  return filtered
}

const todoIssues = computed(() => {
  const filtered = filterIssues(issues.value.filter(issue => issue.status === 'TODO'))
  return sortIssues(filtered)
})

const inProgressIssues = computed(() => {
  const filtered = filterIssues(issues.value.filter(issue => issue.status === 'IN_PROGRESS'))
  return sortIssues(filtered)
})

const closedIssues = computed(() => {
  const filtered = filterIssues(issues.value.filter(issue => issue.status === 'CLOSED'))
  return sortIssues(filtered)
})

const loadBacklog = async () => {
  loading.value = true
  try {
    let projects = projectStore.state.projects
    if (!projects || projects.length === 0) {
      projects = await projectStore.getProjects()
    }
    const project = projects.find((p: any) => p.id === projectId)
    if (project) {
      projectName.value = project.name
    }

    const issuesData = await projectService.getIssuesByProject(projectId)
    issues.value = issuesData
  } catch (error) {
    console.error('Erreur lors du chargement du backlog:', error)
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push(`/projects/${projectId}`)
}

const openIssueModal = (issue: IssueResponse) => {
  selectedIssue.value = issue
}

onMounted(() => {
  loadBacklog()
})
</script>

<style scoped>
.backlog-container {
  min-height: 100vh;
  background: var(--terminal-bg);
  color: var(--terminal-fg);
}

.backlog-content {
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;
}

.backlog-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.btn-back {
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

.btn-back:hover {
  background: rgba(187, 154, 247, 0.1);
}

.backlog-header h1 {
  margin: 0;
  font-size: 1.8rem;
  color: var(--terminal-fg);
}

.filters-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  padding: 1.5rem;
  background: rgba(187, 154, 247, 0.05);
  border: 1px solid rgba(187, 154, 247, 0.2);
  border-radius: 8px;
  margin-bottom: 2rem;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.filter-group label {
  font-weight: 600;
  color: var(--terminal-accent);
  font-size: 0.9rem;
  white-space: nowrap;
}

.filter-select {
  padding: 0.6rem 2.5rem 0.6rem 1rem;
  background: var(--terminal-bg);
  color: var(--terminal-fg);
  border: 1px solid rgba(187, 154, 247, 0.3);
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23bb9af7' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  min-width: 180px;
}

.filter-select:hover {
  background-color: rgba(187, 154, 247, 0.05);
  border-color: var(--terminal-accent);
}

.filter-select:focus {
  outline: none;
  border-color: var(--terminal-accent);
  box-shadow: 0 0 0 2px rgba(187, 154, 247, 0.1);
}

.filter-select option {
  background: var(--terminal-bg);
  color: var(--terminal-fg);
  padding: 0.5rem;
}

.loading {
  text-align: center;
  padding: 3rem;
  font-size: 1.2rem;
  color: var(--terminal-accent);
}

.backlog-board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  align-items: start;
}

@media (max-width: 1200px) {
  .backlog-board {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .backlog-content {
    padding: 1rem;
  }

  .backlog-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .backlog-header h1 {
    font-size: 1.4rem;
  }

  .filters-bar {
    flex-direction: column;
    gap: 1rem;
  }

  .filter-group {
    width: 100%;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .filter-select {
    width: 100%;
  }
}
</style>
