<template>
  <div class="modal-overlay" @click="$emit('cancel')">
    <div class="delete-modal" @click.stop>
      <h3>Supprimer la documentation ?</h3>
      <p>Êtes-vous sûr de vouloir supprimer <strong>{{ doc.title }}</strong> ?</p>
      <p class="warning-text">Cette action est irréversible.</p>
      <div class="delete-actions">
        <button class="btn-cancel-delete" @click="$emit('cancel')">Annuler</button>
        <button class="btn-confirm-delete" @click="$emit('confirm')">Supprimer</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DocumentationDto } from '../../services/documentationService'

defineProps<{
  doc: DocumentationDto
}>()

defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.delete-modal {
  background: var(--terminal-bg);
  border: 2px solid var(--terminal-border);
  border-radius: 8px;
  padding: 2rem;
  max-width: 450px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.delete-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.delete-modal h3 {
  color: var(--terminal-magenta);
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.delete-modal p {
  color: var(--terminal-fg);
  margin-bottom: 0.75rem;
  line-height: 1.6;
}

.delete-modal strong {
  color: var(--terminal-accent);
  font-weight: 600;
}

.warning-text {
  color: var(--terminal-magenta);
  font-size: 0.875rem;
  font-style: italic;
  margin-bottom: 1.5rem;
}

.delete-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn-cancel-delete,
.btn-confirm-delete {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;
}

.btn-cancel-delete {
  background: transparent;
  color: var(--terminal-fg);
  border: 1px solid var(--terminal-border);
}

.btn-cancel-delete:hover {
  background: var(--terminal-hover);
  border-color: var(--terminal-accent);
}

.btn-confirm-delete {
  background: var(--terminal-magenta);
  color: var(--terminal-bg);
  border: 1px solid var(--terminal-magenta);
}

.btn-confirm-delete:hover {
  background: #f7768e;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(247, 118, 142, 0.4);
}
</style>
