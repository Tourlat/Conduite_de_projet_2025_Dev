<template>
  <div class="issues-section">
    <h2>Issues du sprint</h2>
    <div v-if="issues.length === 0" class="empty-state">
      Aucune issue assignée à ce sprint
    </div>
    <div v-else class="issues-list">
      <div
        v-for="issue in issues"
        :key="issue.id"
        class="issue-card"
        @click="$emit('issue-click', issue.id)"
      >
        <div class="issue-header">
          <h3>{{ issue.title }}</h3>
          <span class="priority-badge" :class="`priority-${issue.priority.toLowerCase()}`">
            {{ getPriorityLabel(issue.priority) }}
          </span>
        </div>
        <p v-if="issue.description" class="issue-description">
          {{ issue.description }}
        </p>
        <div class="issue-footer">
          <span class="status-badge" :class="`status-${issue.status.toLowerCase()}`">
            {{ getStatusLabel(issue.status) }}
          </span>
          <span v-if="issue.storyPoints" class="story-points">
            {{ issue.storyPoints }} pts
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IssueResponse } from '../../services/projectService'

interface Props {
  issues: IssueResponse[]
}

defineProps<Props>()
defineEmits<{
  'issue-click': [issueId: number]
}>()

const getPriorityLabel = (priority: string): string => {
  const labels: Record<string, string> = {
    LOW: 'Basse',
    MEDIUM: 'Moyenne',
    HIGH: 'Haute'
  }
  return labels[priority] || priority
}

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    TODO: 'À faire',
    IN_PROGRESS: 'En cours',
    CLOSED: 'Fermé'
  }
  return labels[status] || status
}
</script>

<style scoped>
.issues-section h2 {
  margin: 0 0 1.5rem 0;
  color: var(--terminal-accent);
  font-size: 1.3rem;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--terminal-fg-muted);
  background: var(--terminal-bg-light);
  border: 2px dashed var(--terminal-border);
  border-radius: 8px;
}

.issues-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.issue-card {
  background: var(--terminal-bg-light);
  border: 2px solid var(--terminal-border);
  border-radius: 8px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.issue-card:hover {
  border-color: var(--terminal-accent);
  transform: translateX(4px);
}

.issue-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.8rem;
}

.issue-header h3 {
  margin: 0;
  color: var(--terminal-fg);
  font-size: 1.2rem;
  font-weight: 600;
}

.priority-badge {
  padding: 0.3rem 0.8rem;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 600;
}

.priority-high {
  background: rgba(224, 200, 255, 0.3);
  color: #e0c8ff;
}

.priority-medium {
  background: rgba(187, 154, 247, 0.2);
  color: #bb9af7;
}

.priority-low {
  background: rgba(122, 93, 199, 0.1);
  color: #7a5dc7;
}

.issue-description {
  margin: 0.8rem 0;
  color: var(--terminal-fg-muted);
  line-height: 1.5;
}

.issue-footer {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
}

.status-badge {
  padding: 0.3rem 0.8rem;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 600;
}

.status-todo {
  background: rgba(187, 154, 247, 0.2);
  color: var(--terminal-accent);
}

.status-in_progress {
  background: rgba(224, 200, 255, 0.2);
  color: #e0c8ff;
}

.status-closed {
  background: rgba(150, 150, 150, 0.2);
  color: #aaa;
}

.story-points {
  background: rgba(187, 154, 247, 0.1);
  padding: 0.3rem 0.8rem;
  border-radius: 4px;
  font-size: 0.85rem;
  color: var(--terminal-accent);
  font-weight: 600;
}
</style>
