<template>
  <div class="release-card" @click="$emit('click')">
    <div class="release-header">
      <div class="release-version">
        <span class="version-badge">v{{ versionString }}</span>
        <span class="release-date">{{ formattedDate }}</span>
      </div>
      <div class="release-meta">
        <span class="issue-count">{{ issueCount }} issue(s)</span>
      </div>
    </div>

    <div v-if="release.releaseNotes" class="release-notes">
      {{ truncatedNotes }}
    </div>
    <div v-else class="no-notes">
      Aucune note de release
    </div>

    <div class="release-footer">
      <span class="creator">Par {{ creatorName }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ReleaseResponse } from '../../services/releaseService'

interface ReleaseCardProps {
  release: ReleaseResponse
}

const props = defineProps<ReleaseCardProps>()

defineEmits<{
  click: []
}>()

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

const creatorName = computed(() => {
  return `Créateur #${props.release.creatorId}`
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

.release-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 0.75rem;
  border-top: 1px solid var(--terminal-border);
}

.creator {
  color: var(--terminal-fg);
  opacity: 0.6;
  font-size: 0.85rem;
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
