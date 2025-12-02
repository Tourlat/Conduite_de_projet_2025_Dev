<template>
  <div class="release-card" @click="$emit('click')">
    <div class="release-header">
      <div class="release-version">
        <span class="version-badge">v{{ versionString }}</span>
        <span class="release-date">{{ formattedDate }}</span>
      </div>
      <div class="release-meta">
        <span class="issue-count" :title="issueCount > 0 ? 'Cliquez pour voir les issues' : ''" @click.stop="showIssues">{{ issueCount }} issue(s)</span>
      </div>
    </div>

    <div v-if="release.releaseNotes" class="release-notes">
      {{ truncatedNotes }}
    </div>
    <div v-else class="no-notes">
      Aucune note de release
    </div>
  </div>

  <Teleport to="body">
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Issues de la release v{{ versionString }}</h3>
          <button class="close-btn" @click="closeModal">&times;</button>
        </div>
        <div class="modal-body">
          <div v-if="loadingIssues" class="loading-state">
            <span>Chargement des issues...</span>
          </div>
          <div v-else-if="issuesError" class="error-state">
            <span>{{ issuesError }}</span>
          </div>
          <div v-else-if="issues.length === 0" class="empty-state">
            <span>Aucune issue dans cette release</span>
          </div>
          <ul v-else class="issues-list">
            <li v-for="issue in issues" :key="issue.id" class="issue-item">
              <div class="issue-info">
                <span class="issue-title">{{ issue.title }}</span>
                <span class="issue-id">#{{ issue.id }}</span>
              </div>
              <div class="issue-meta">
                <span class="issue-status" :class="`status-${issue.status.toLowerCase()}`">{{ formatStatus(issue.status) }}</span>
                <span class="issue-priority" :class="`priority-${issue.priority.toLowerCase()}`">{{ formatPriority(issue.priority) }}</span>
                <span class="issue-points">{{ issue.storyPoints }} pts</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ReleaseResponse } from '../../services/releaseService'
import projectService, { type IssueResponse } from '../../services/projectService'

interface ReleaseCardProps {
  release: ReleaseResponse
}

const props = defineProps<ReleaseCardProps>()

defineEmits<{
  click: []
}>()

const showModal = ref(false)
const issues = ref<IssueResponse[]>([])
const loadingIssues = ref(false)
const issuesError = ref<string | null>(null)

const showIssues = async () => {
  if (issueCount.value === 0) return
  
  showModal.value = true
  loadingIssues.value = true
  issuesError.value = null
  
  try {
    const allIssues = await projectService.getIssuesByProject(props.release.projectId)
    issues.value = allIssues.filter(issue => props.release.issueIds.includes(issue.id))
  } catch (error: any) {
    issuesError.value = error.message || 'Erreur lors du chargement des issues'
  } finally {
    loadingIssues.value = false
  }
}

const closeModal = () => {
  showModal.value = false
}

const formatStatus = (status: string) => {
  const statusMap: Record<string, string> = {
    'TODO': 'À faire',
    'IN_PROGRESS': 'En cours',
    'CLOSED': 'Terminé'
  }
  return statusMap[status] || status
}

const formatPriority = (priority: string) => {
  const priorityMap: Record<string, string> = {
    'LOW': 'Basse',
    'MEDIUM': 'Moyenne',
    'HIGH': 'Haute'
  }
  return priorityMap[priority] || priority
}

const versionString = computed(() => {
  const v = props.release.version
  if (!v || v.major === undefined || v.minor === undefined || v.patch === undefined) {
    return '0.0.0'
  }
  return `${v.major}.${v.minor}.${v.patch}`
})

const formattedDate = computed(() => {
  const date = new Date(props.release.createdAt)
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
})

const issueCount = computed(() => {
  return props.release.issueIds?.length || 0
})

const truncatedNotes = computed(() => {
  if (!props.release.releaseNotes) return ''
  const maxLength = 150
  if (props.release.releaseNotes.length <= maxLength) {
    return props.release.releaseNotes
  }
  return props.release.releaseNotes.substring(0, maxLength) + '...'
})
</script>

<style scoped>
.release-card {
  background: var(--terminal-bg);
  border: 1px solid var(--terminal-border);
  border-radius: 8px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.release-card:hover {
  border-color: var(--terminal-accent);
  background: rgba(187, 154, 247, 0.05);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(187, 154, 247, 0.15);
}

.release-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.release-version {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.version-badge {
  display: inline-block;
  background: var(--terminal-accent);
  color: var(--terminal-bg);
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  font-weight: 700;
  font-size: 1.1rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.release-date {
  color: var(--terminal-fg);
  opacity: 0.7;
  font-size: 0.9rem;
}

.release-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.issue-count {
  background: rgba(187, 154, 247, 0.15);
  color: var(--terminal-accent);
  padding: 0.35rem 0.7rem;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.issue-count:hover {
  background: rgba(187, 154, 247, 0.25);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--terminal-bg);
  border: 1px solid var(--terminal-border);
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--terminal-border);
}

.modal-header h3 {
  margin: 0;
  color: var(--terminal-fg);
  font-size: 1.25rem;
  font-weight: 700;
}

.close-btn {
  background: none;
  border: none;
  color: var(--terminal-fg);
  font-size: 2rem;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.close-btn:hover {
  color: var(--terminal-accent);
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--terminal-fg);
  opacity: 0.7;
}

.error-state {
  color: var(--terminal-accent);
  opacity: 1;
}

.issues-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.issue-item {
  background: transparent;
  border: 1px solid var(--terminal-border);
  border-radius: 6px;
  padding: 1rem;
}

.issue-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.issue-title {
  font-weight: 600;
  color: var(--terminal-fg);
  flex: 1;
}

.issue-id {
  color: var(--terminal-accent);
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.85rem;
  opacity: 0.8;
}

.issue-meta {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.issue-status,
.issue-priority,
.issue-points {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 600;
}

.issue-status {
  background: rgba(187, 154, 247, 0.15);
  color: var(--terminal-accent);
}

.status-in_progress {
  background: rgba(187, 154, 247, 0.2);
  color: var(--terminal-accent);
}

.status-closed {
  background: rgba(187, 154, 247, 0.25);
  color: var(--terminal-accent);
}

.issue-priority {
  background: rgba(187, 154, 247, 0.15);
  color: var(--terminal-accent);
}

.priority-high {
  background: rgba(187, 154, 247, 0.25);
  color: var(--terminal-accent);
  font-weight: 700;
}

.priority-medium {
  background: rgba(187, 154, 247, 0.2);
  color: var(--terminal-accent);
}

.priority-low {
  background: rgba(187, 154, 247, 0.15);
  color: var(--terminal-accent);
  opacity: 0.8;
}

.issue-points {
  background: rgba(187, 154, 247, 0.1);
  color: var(--terminal-fg);
}

.release-notes {
  color: var(--terminal-fg);
  line-height: 1.6;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: rgba(187, 154, 247, 0.03);
  border-left: 3px solid var(--terminal-accent);
  border-radius: 4px;
}

.no-notes {
  color: var(--terminal-fg);
  opacity: 0.5;
  font-style: italic;
  margin-bottom: 1rem;
}

@media (max-width: 768px) {
  .release-header {
    flex-direction: column;
    gap: 0.75rem;
  }

  .release-meta {
    align-self: flex-start;
  }
}
</style>
