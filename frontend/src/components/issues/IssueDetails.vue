<template>
  <div class="issue-details">
    <div class="header">
      <h2>Issues</h2>
      <button 
        class="btn-toggle"
        @click="showCreateForm = !showCreateForm"
      >
        {{ showCreateForm ? 'Annuler' : 'Créer une issue' }}
      </button>
    </div>

    <CreateIssueForm 
      v-if="showCreateForm"
      :project-id="projectId"
      :collaborators="collaborators"
      :creator="creator"
      @issue-created="handleIssueCreated"
    />

    <IssueList 
      :project-id="projectId"
      :issues="issues"
      :is-owner="isOwner"
      :user-id="userId"
      :loading="loadingIssues"
      :assignees="allAssignees"
      :selected-issue-id="selectedIssueId"
      @issue-updated="loadIssues"
      @issue-deleted="loadIssues"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import CreateIssueForm from './CreateIssueForm.vue'
import IssueList from './IssueList.vue'
import projectService from '../../services/projectService'
import type { IssueResponse } from '../../services/projectService'

interface Creator {
  id: number
  name: string
  email: string
}

interface IssueDetailsProps {
  projectId: string
  collaborators: Array<{ id: number; name: string; email: string }>
  creator: Creator | null
  isOwner: boolean
  userId: number
}
const props = defineProps<IssueDetailsProps>()

const route = useRoute()
const issues = ref<IssueResponse[]>([])
const loadingIssues = ref(false)
const showCreateForm = ref(false)
const selectedIssueId = computed(() => {
  const issueParam = route.query.issue
  return issueParam ? parseInt(issueParam as string) : null
})

const allAssignees = computed(() => {
  const assignees = [...props.collaborators]
  if (props.creator && !assignees.some(c => c.id === props.creator?.id)) {
    assignees.unshift(props.creator)
  }
  return assignees
})

const loadIssues = async () => {
  loadingIssues.value = true
  try {
    issues.value = await projectService.getIssuesByProject(props.projectId)
  } catch {
    // Empty catch block
  } finally {
    loadingIssues.value = false
  }
}

const handleIssueCreated = async () => {
  showCreateForm.value = false
  await loadIssues()
}

onMounted(() => {
  loadIssues()
})
</script>

<style scoped>
.issue-details {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

h2 {
  margin: 0;
  color: var(--terminal-fg);
  font-size: 1.5rem;
}

.btn-toggle {
  padding: 0.75rem 1.5rem;
  background: var(--terminal-bg);
  color: var(--terminal-accent);
  border: 2px solid var(--terminal-accent);
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.2s;
}

.btn-toggle:hover {
  opacity: 0.9;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
  }

  .btn-toggle {
    width: 100%;
  }
}
</style>
