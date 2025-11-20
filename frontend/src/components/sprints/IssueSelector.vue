<template>
  <div class="form-group">
    <label for="issues">Issues à ajouter</label>
    <div class="issues-selector">
      <div v-if="loading" class="loading-issues">
        Chargement des issues...
      </div>
      <div v-else-if="issues.length === 0" class="no-issues">
        Aucune issue disponible
      </div>
      <div v-else class="issues-list">
        <label
          v-for="issue in issues"
          :key="issue.id"
          class="issue-checkbox"
        >
          <input
            type="checkbox"
            :value="issue.id"
            :checked="selectedIssueIds.includes(issue.id)"
            @change="toggleIssue(issue.id)"
          />
          <span class="issue-info">
            <span class="issue-title">{{ issue.title }}</span>
            <span class="issue-meta">
              <span class="priority-badge" :class="`priority-${issue.priority.toLowerCase()}`">
                {{ issue.priority }}
              </span>
              <span class="status-badge">{{ issue.status }}</span>
            </span>
          </span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IssueResponse } from '../../services/projectService'

interface Props {
  issues: IssueResponse[]
  selectedIssueIds: number[]
  loading?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:selectedIssueIds': [value: number[]]
}>()

// Toggles issue selection: adds if missing, removes if present
const toggleIssue = (issueId: number) => {
  const newSelection = props.selectedIssueIds.includes(issueId)
    ? props.selectedIssueIds.filter(id => id !== issueId)
    : [...props.selectedIssueIds, issueId]
  
  emit('update:selectedIssueIds', newSelection)
}
</script>

<style scoped>
@import './sprints-shared.css';
</style>
