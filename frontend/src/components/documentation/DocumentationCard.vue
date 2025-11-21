<template>
  <div class="doc-card">
    <div class="doc-content" @click="$emit('view')">
      <p class="doc-title">{{ doc.title }}</p>
      <p class="doc-date">
        Mis à jour: {{ formatDate(doc.updatedAt || doc.createdAt) }}
      </p>
    </div>
    <div class="doc-actions">
      <button @click.stop="$emit('edit')" class="btn-edit">Modifier</button>
      <button @click.stop="$emit('delete')" class="btn-delete">Supprimer</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DocumentationDto } from '../../services/documentationService'

defineProps<{
  doc: DocumentationDto
}>()

defineEmits<{
  (e: 'view'): void
  (e: 'edit'): void
  (e: 'delete'): void
}>()

const formatDate = (date?: string) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('fr-FR')
}
</script>

<style scoped>
.doc-card {
  background: var(--terminal-hover);
  border: 1px solid var(--terminal-border);
  border-radius: 8px;
  padding: 1.5rem;
  transition: all 0.2s;
  cursor: pointer;
}

.doc-card:hover {
  border-color: var(--terminal-accent);
  transform: translateY(-4px);
  box-shadow: 0 8px 16px var(--terminal-shadow);
}

.doc-content {
  margin-bottom: 1rem;
}

.doc-title {
  color: var(--terminal-fg);
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.doc-date {
  color: var(--terminal-fg);
  opacity: 0.7;
  font-size: 0.875rem;
}

.doc-actions {
  display: flex;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid var(--terminal-border);
}

.btn-edit,
.btn-delete {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-edit {
  background: transparent;
  color: var(--terminal-accent);
  border: 1px solid var(--terminal-accent);
}

.btn-edit:hover {
  background: rgba(187, 154, 247, 0.1);
}

.btn-delete {
  background: transparent;
  color: var(--terminal-magenta);
  border: 1px solid var(--terminal-magenta);
}

.btn-delete:hover {
  background: rgba(247, 118, 142, 0.1);
}
</style>
