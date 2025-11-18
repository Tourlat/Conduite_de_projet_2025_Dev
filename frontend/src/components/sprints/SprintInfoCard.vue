<template>
  <div class="sprint-info-card">
    <h2>Informations du sprint</h2>
    <div class="info-grid">
      <div class="info-item">
        <span class="info-label">Date de début</span>
        <span class="info-value">{{ formatDate(sprint.startDate) }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Date de fin</span>
        <span class="info-value">{{ formatDate(sprint.endDate) }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Nombre d'issues</span>
        <span class="info-value">{{ issueCount }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Créé le</span>
        <span class="info-value">{{ formatDate(sprint.createdAt) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SprintResponse } from '../../services/projectService'

interface Props {
  sprint: SprintResponse
  issueCount: number
}

defineProps<Props>()

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.sprint-info-card {
  background: var(--terminal-bg-light);
  border: 2px solid var(--terminal-border);
  border-radius: 8px;
  padding: 2rem;
}

.sprint-info-card h2 {
  margin: 0 0 1.5rem 0;
  color: var(--terminal-accent);
  font-size: 1.3rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-label {
  font-size: 0.9rem;
  color: var(--terminal-fg-muted);
  font-weight: 600;
}

.info-value {
  color: var(--terminal-fg);
  font-weight: 500;
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
