<template>
  <div class="sprint-card" @click="$emit('click')">
    <div class="sprint-header">
      <h3>{{ sprint.name }}</h3>
      <span class="sprint-status" :class="statusClass">
        {{ statusLabel }}
      </span>
    </div>

    <div class="sprint-details">
      <div class="sprint-dates">
        <div class="date-item">
          <span class="date-label">Début:</span>
          <span class="date-value">{{ formatDate(sprint.startDate) }}</span>
        </div>
        <div class="date-item">
          <span class="date-label">Fin:</span>
          <span class="date-value">{{ formatDate(sprint.endDate) }}</span>
        </div>
      </div>

      <div class="sprint-meta">
        <span class="issue-count">
          {{ sprint.issueIds.length }} issue(s)
        </span>
      </div>
    </div>

    <div class="sprint-footer">
      <button class="btn-view" @click.stop="$emit('click')">
        Voir les détails →
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SprintResponse } from '../../services/projectService'

interface Props {
  sprint: SprintResponse
}

const props = defineProps<Props>()
defineEmits<{
  click: []
}>()

const getSprintStatus = () => {
  const now = new Date()
  const start = new Date(props.sprint.startDate)
  const end = new Date(props.sprint.endDate)

  if (now >= start && now <= end) return 'active'
  if (now > end) return 'completed'
  return 'planned'
}

const statusClass = computed(() => {
  return `status-${getSprintStatus()}`
})

const statusLabel = computed(() => {
  const status = getSprintStatus()
  const labels = {
    active: 'En cours',
    completed: 'Terminé',
    planned: 'Planifié'
  }
  return labels[status]
})

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}
</script>

<style scoped>
@import './sprints-shared.css';

/* Styles spécifiques à SprintCard */
.sprint-card {
  background: var(--terminal-bg-light);
  border: 2px solid var(--terminal-border);
  border-radius: 8px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.sprint-card:hover {
  border-color: var(--terminal-accent);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(187, 154, 247, 0.2);
}

.sprint-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.sprint-header h3 {
  margin: 0;
  color: var(--terminal-fg);
  font-size: 1.3rem;
  font-weight: 700;
}

.sprint-status {
  padding: 0.3rem 0.8rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  white-space: nowrap;
}

.sprint-status.status-active {
  background: rgba(187, 154, 247, 0.3);
  color: #bb9af7;
  border: 1px solid #bb9af7;
}

.sprint-status.status-completed {
  background: rgba(157, 124, 216, 0.2);
  color: #9d7cd8;
  border: 1px solid #9d7cd8;
}

.sprint-status.status-planned {
  background: rgba(122, 93, 199, 0.2);
  color: #7a5dc7;
  border: 1px solid #7a5dc7;
}

.sprint-details {
  margin-bottom: 1.5rem;
}

.sprint-dates {
  display: flex;
  gap: 2rem;
  margin-bottom: 1rem;
}

.date-item {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.date-label {
  font-size: 0.85rem;
  color: var(--terminal-fg-muted);
  font-weight: 600;
}

.date-value {
  color: var(--terminal-fg);
  font-weight: 500;
}

.sprint-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.issue-count {
  background: rgba(187, 154, 247, 0.1);
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  font-size: 0.9rem;
  color: var(--terminal-accent);
  font-weight: 600;
}

.sprint-footer {
  padding-top: 1rem;
  border-top: 1px solid rgba(187, 154, 247, 0.2);
}

.btn-view {
  width: 100%;
  padding: 0.6rem;
  background: transparent;
  color: var(--terminal-accent);
  border: 2px solid var(--terminal-accent);
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-view:hover {
  background: rgba(187, 154, 247, 0.1);
}

@media (max-width: 768px) {
  .sprint-dates {
    flex-direction: column;
    gap: 0.8rem;
  }
}
</style>
