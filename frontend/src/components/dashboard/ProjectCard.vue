<template>
  <div class="project-card" @click="$emit('click', project)">
    <div class="project-badge" :class="badgeClass">
      {{ badgeText }}
    </div>
    <h3>{{ project.name }}</h3>
    <p v-if="project.description" class="project-description">
      {{ project.description }}
    </p>
    <p v-else class="project-description no-description">
      Pas de description
    </p>
    <div class="project-footer">
      <span v-if="isCreator" class="project-date">
        Créé le {{ formatDate(project.createdAt) }}
      </span>
      <span v-else class="project-creator">
        Par {{ project.creator?.name || 'Inconnu' }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Creator {
  id: number
  email: string
  name: string
}

interface Project {
  id: string
  name: string
  description?: string
  createdAt?: string
  creator?: Creator
}

const props = defineProps<{
  project: Project
  isCreator: boolean
}>()

defineEmits<{
  click: [project: Project]
}>()

const badgeClass = computed(() => 
  props.isCreator ? 'creator-badge' : 'collaborator-badge'
)

const badgeText = computed(() => 
  props.isCreator ? 'Créateur' : 'Collaborateur'
)

const formatDate = (dateString?: string) => {
  if (!dateString) return 'Date inconnue'
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}
</script>

<style scoped>
.project-card {
  position: relative;
  background: var(--terminal-bg);
  border: 1px solid var(--terminal-border);
  padding: 1.5rem;
  border-radius: 8px;
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
  cursor: pointer;
}

.project-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(138, 43, 226, 0.2);
  border-color: var(--terminal-accent);
}

.project-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.creator-badge {
  background: rgba(138, 43, 226, 0.2);
  color: var(--terminal-accent);
  border: 1px solid var(--terminal-accent);
}

.collaborator-badge {
  background: rgba(52, 152, 219, 0.2);
  color: #3498db;
  border: 1px solid #3498db;
}

.project-card h3 {
  color: var(--terminal-accent);
  margin-bottom: 0.75rem;
  margin-top: 0.5rem;
  font-size: 1.25rem;
  padding-right: 6rem;
}

.project-description {
  color: var(--terminal-fg);
  margin-bottom: 1rem;
  font-size: 0.9rem;
  line-height: 1.5;
}

.project-description.no-description {
  color: var(--terminal-fg-muted);
  font-style: italic;
}

.project-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid var(--terminal-border);
}

.project-date,
.project-creator {
  color: var(--terminal-fg-muted);
  font-size: 0.85rem;
}

.project-creator {
  font-style: italic;
}
</style>
