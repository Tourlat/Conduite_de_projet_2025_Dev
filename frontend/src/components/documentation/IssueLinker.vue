<template>
  <div class="linked-issues-section">
    <label>Issues liées</label>
    <div class="linked-issues-list">
      <div v-if="linkedIssues.length === 0" class="no-issues">
        Aucune issue liée
      </div>
      <div
        v-for="link in linkedIssues"
        :key="link.id"
        class="linked-issue-item"
      >
        <div class="issue-info">
          <span class="issue-title">{{ link.issueTitle }}</span>
          <span :class="['issue-priority', `priority-${link.issuePriority.toLowerCase()}`]">
            {{ link.issuePriority }}
          </span>
          <span :class="['issue-status', `status-${link.issueStatus.toLowerCase()}`]">
            {{ link.issueStatus }}
          </span>
          <button
            @click="handleUnlink(link.issueId)"
            class="btn-unlink"
            title="Délier cette issue"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
    
    <div class="add-issue-section">
      <select v-model="selectedIssueId" class="issue-select">
        <option value="">Sélectionner une issue à lier...</option>
        <option
          v-for="issue in filteredAvailableIssues"
          :key="issue.id"
          :value="issue.id"
        >
          {{ issue.title }} ({{ issue.priority }})
        </option>
      </select>
      <button
        @click="handleLink"
        :disabled="!selectedIssueId"
        class="btn-link"
      >
        Lier
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { DocumentationIssueDto } from '../../services/documentationIssueService'

const props = defineProps<{
  linkedIssues: DocumentationIssueDto[]
  availableIssues: any[]
}>()

const emit = defineEmits<{
  (e: 'link', issueId: number): void
  (e: 'unlink', issueId: number): void
}>()

const selectedIssueId = ref<number | string>('')

const filteredAvailableIssues = computed(() => {
  const linkedIssueIds = new Set(props.linkedIssues.map(link => link.issueId))
  return props.availableIssues.filter(issue => !linkedIssueIds.has(issue.id))
})

const handleLink = () => {
  if (selectedIssueId.value) {
    emit('link', Number(selectedIssueId.value))
    selectedIssueId.value = ''
  }
}

const handleUnlink = (issueId: number) => {
  if (confirm('Êtes-vous sûr de vouloir délier cette issue ?')) {
    emit('unlink', issueId)
  }
}
</script>

<style scoped>
.linked-issues-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background: var(--terminal-bg);
  border: 1px solid var(--terminal-border);
  border-radius: 4px;
}

.linked-issues-section label {
  color: var(--terminal-accent);
  font-weight: 600;
  font-size: 0.95rem;
}

.linked-issues-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.no-issues {
  color: var(--terminal-fg);
  opacity: 0.6;
  font-style: italic;
  padding: 0.5rem;
}

.linked-issue-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--terminal-border);
  border-radius: 4px;
  transition: background-color 0.2s;
}

.linked-issue-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.issue-info {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex: 1;
}

.issue-title {
  color: var(--terminal-fg);
  font-weight: 500;
  flex: 1;
}

.issue-priority,
.issue-status {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.issue-priority.priority-high {
  background: rgba(224, 200, 255, 0.3);
  color: #e0c8ff;
  border: 1px solid #e0c8ff;
}

.issue-priority.priority-medium {
  background: rgba(187, 154, 247, 0.2);
  color: #bb9af7;
  border: 1px solid #bb9af7;
}

.issue-priority.priority-low {
  background: rgba(122, 93, 199, 0.1);
  color: #7a5dc7;
  border: 1px solid #7a5dc7;
}

.issue-status.status-todo,
.issue-status.status-open {
  background: rgba(187, 154, 247, 0.2);
  color: var(--terminal-accent);
  border: 1px solid var(--terminal-accent);
}

.issue-status.status-in_progress {
  background: rgba(224, 200, 255, 0.2);
  color: #e0c8ff;
  border: 1px solid #e0c8ff;
}

.issue-status.status-closed {
  background: rgba(150, 150, 150, 0.2);
  color: #aaa;
  border: 1px solid #aaa;
}

.btn-unlink {
  padding: 0.25rem 0.5rem;
  background: rgba(247, 118, 142, 0.2);
  color: #f7768e;
  border: 1px solid #f7768e;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  transition: all 0.2s;
}

.btn-unlink:hover {
  background: rgba(247, 118, 142, 0.3);
}

.add-issue-section {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.issue-select {
  flex: 1;
  padding: 0.5rem;
  background: var(--terminal-bg);
  color: var(--terminal-fg);
  border: 1px solid var(--terminal-border);
  border-radius: 4px;
  cursor: pointer;
  transition: border-color 0.2s;
}

.issue-select:focus {
  outline: none;
  border-color: var(--terminal-accent);
}

.btn-link {
  padding: 0.5rem 1rem;
  background: var(--terminal-accent);
  color: var(--terminal-bg);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: opacity 0.2s;
}

.btn-link:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-link:not(:disabled):hover {
  opacity: 0.9;
}
</style>
