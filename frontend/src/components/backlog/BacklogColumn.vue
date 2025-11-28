<template>
  <div class="backlog-column">
    <div class="column-header" :class="statusClass">
      <h2>{{ title }}</h2>
      <span class="count">{{ issues.length }}</span>
    </div>
    <div class="column-content">
      <BacklogIssueCard
        v-for="issue in issues"
        :key="issue.id"
        :issue="issue"
        :is-closed="status === 'CLOSED'"
        @click="$emit('issue-click', issue)"
      />
      <div v-if="issues.length === 0" class="empty-column">
        {{ emptyMessage }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BacklogIssueCard from './BacklogIssueCard.vue'
import type { IssueResponse } from '../../services/projectService'

interface BacklogColumnProps {
  title: string
  issues: IssueResponse[]
  status: 'TODO' | 'IN_PROGRESS' | 'CLOSED'
  emptyMessage: string
}

const props = defineProps<BacklogColumnProps>()
defineEmits<{
  'issue-click': [issue: IssueResponse]
}>()

const statusClass = computed(() => {
  switch (props.status) {
    case 'TODO':
      return 'todo'
    case 'IN_PROGRESS':
      return 'in-progress'
    case 'CLOSED':
      return 'closed'
  }
  return 'TODO'
})
</script>

<script lang="ts">
import { computed } from 'vue'
export default {
  name: 'BacklogColumn'
}
</script>

<style scoped>
.backlog-column {
  background: var(--terminal-bg-light);
  border: 2px solid var(--terminal-border);
  border-radius: 8px;
  min-height: 500px;
  display: flex;
  flex-direction: column;
}

.column-header {
  padding: 1rem 1.5rem;
  border-bottom: 2px solid var(--terminal-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(187, 154, 247, 0.05);
}

.column-header h2 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--terminal-fg);
}

.column-header.todo h2 {
  color: var(--terminal-accent);
}

.column-header.in-progress h2 {
  color: #bb9af7;
}

.column-header.closed h2 {
  color: var(--terminal-fg-muted);
}

.count {
  background: var(--terminal-bg);
  padding: 0.3rem 0.8rem;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  border: 1px solid var(--terminal-border);
  color: var(--terminal-accent);
}

.column-content {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
}

.empty-column {
  text-align: center;
  padding: 2rem 1rem;
  color: var(--terminal-fg-muted);
  font-style: italic;
}
</style>
