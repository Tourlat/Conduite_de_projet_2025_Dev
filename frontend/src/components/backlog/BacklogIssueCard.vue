<template>
  <div 
    class="backlog-issue-card" 
    :class="{ closed: isClosed }"
    @click="$emit('click', issue)"
  >
    <h3>{{ issue.title }}</h3>
    <p v-if="issue.description" class="issue-description">
      {{ truncate(issue.description, 100) }}
    </p>
    <div class="issue-footer">
      <div class="issue-meta">
        <span class="priority" :class="priorityClass">
          {{ priorityLabel }}
        </span>
        <span v-if="issue.storyPoints" class="story-points">
          {{ issue.storyPoints }} pts
        </span>
      </div>
      <span v-if="issue.assigneeId" class="assignee">
       Vous êtes assigné
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { IssueResponse } from '../../services/projectService'

interface BacklogIssueCardProps {
  issue: IssueResponse
  isClosed?: boolean
}

const props = defineProps<BacklogIssueCardProps>()
defineEmits<{
  'click': [IssueResponse]
}>()

const truncate = (text: string, length: number): string => {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

const priorityLabel = computed(() => {
  const labels: Record<string, string> = {
    LOW: 'Basse',
    MEDIUM: 'Moyenne',
    HIGH: 'Haute',
  }
  return labels[props.issue.priority] || props.issue.priority
})

const priorityClass = computed(() => {
  return props.issue.priority.toLowerCase()
})
</script>

<script lang="ts">
export default {
  name: 'BacklogIssueCard'
}
</script>

<style scoped>
.backlog-issue-card {
  background: var(--terminal-bg);
  border: 2px solid var(--terminal-border);
  border-radius: 6px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.backlog-issue-card:hover {
  border-color: var(--terminal-accent);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.backlog-issue-card.closed {
  opacity: 0.6;
}

.backlog-issue-card.closed:hover {
  opacity: 0.8;
}

.backlog-issue-card h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  color: var(--terminal-fg);
  font-weight: 600;
}

.issue-description {
  margin: 0.5rem 0;
  font-size: 0.9rem;
  color: var(--terminal-fg-muted);
  line-height: 1.4;
}

.issue-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.8rem;
}

.issue-meta {
  display: flex;
  gap: 0.8rem;
  align-items: center;
  flex-wrap: wrap;
}

.priority {
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  border: 1px solid;
}

.priority.low {
  background: rgba(157, 124, 216, 0.1);
  color: #7a5dc7;
  border-color: #7a5dc7;
}

.priority.medium {
  background: rgba(187, 154, 247, 0.2);
  color: #bb9af7;
  border-color: #bb9af7;
}

.priority.high {
  background: rgba(208, 176, 255, 0.3);
  color: #e0c8ff;
  border-color: #e0c8ff;
}

.story-points {
  font-size: 0.85rem;
  color: var(--terminal-fg-muted);
  padding: 0.2rem 0.5rem;
  background: rgba(187, 154, 247, 0.1);
  border-radius: 4px;
  border: 1px solid var(--terminal-border);
}

.assignee {
  font-size: 0.8rem;
  opacity: 0.7;
}
</style>
