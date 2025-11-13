<template>
  <div class="backlog-container">
    <div class="backlog-content">
      <div class="backlog-header">
        <button class="btn-back" @click="goBack">
          ← Retour au projet
        </button>
        <h1>Backlog - {{ projectName }}</h1>
      </div>

      <div v-if="loading" class="loading">
        Chargement du backlog...
      </div>

      <div v-else class="backlog-board">
        <BacklogColumn
          title="À faire"
          :issues="todoIssues"
          status="TODO"
          empty-message="Aucune issue à faire"
          @issue-click="goToIssue"
        />
        
        <BacklogColumn
          title="En cours"
          :issues="inProgressIssues"
          status="IN_PROGRESS"
          empty-message="Aucune issue en cours"
          @issue-click="goToIssue"
        />
        
        <BacklogColumn
          title="Fermé"
          :issues="closedIssues"
          status="CLOSED"
          empty-message="Aucune issue fermée"
          @issue-click="goToIssue"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BacklogColumn from '../backlog/BacklogColumn.vue'
import projectService from '../../services/projectService'
import { projectStore } from '../../stores/projectStore'
import type { IssueResponse } from '../../services/projectService'

const route = useRoute()
const router = useRouter()
const projectId = route.params.id as string

const issues = ref<IssueResponse[]>([])
const projectName = ref('')
const loading = ref(true)

const todoIssues = computed(() => 
  issues.value.filter(issue => issue.status === 'TODO')
)

const inProgressIssues = computed(() => 
  issues.value.filter(issue => issue.status === 'IN_PROGRESS')
)

const closedIssues = computed(() => 
  issues.value.filter(issue => issue.status === 'CLOSED')
)

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

const goToIssue = (issueId: number) => {
  router.push(`/projects/${projectId}#issue-${issueId}`)
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
}
</style>
