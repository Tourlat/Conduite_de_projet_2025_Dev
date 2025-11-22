<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>{{ doc.title }}</h3>
        <button @click="$emit('close')" class="btn-close">✕</button>
      </div>
      <div class="modal-body markdown-content" v-html="parsedContent"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { marked } from 'marked'
import type { DocumentationDto } from '../../services/documentationService'

const props = defineProps<{
  doc: DocumentationDto
}>()

defineEmits<{
  (e: 'close'): void
}>()

// Configure marked to handle line breaks
marked.setOptions({
  breaks: true,
  gfm: true
})

const parsedContent = computed(() => {
  return marked(props.doc.content)
})
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

.modal-content {
  background: var(--terminal-bg);
  border: 2px solid var(--terminal-border);
  border-radius: 8px;
  max-width: 900px;
  width: 100%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid var(--terminal-border);
}

.modal-header h3 {
  color: var(--terminal-accent);
  margin: 0;
  font-size: 1.5rem;
}

.btn-close {
  background: transparent;
  border: none;
  color: var(--terminal-fg);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  transition: color 0.2s;
}

.btn-close:hover {
  color: var(--terminal-magenta);
}

.modal-body {
  padding: 2rem;
  overflow-y: auto;
  flex: 1;
}

/* Markdown Content Styling */
.markdown-content :deep(h1) {
  color: white;
  font-size: 2em;
  font-weight: bold;
  margin-bottom: 0.5em;
  margin-top: 1em;
}

.markdown-content :deep(h2) {
  color: white;
  font-size: 1.5em;
  font-weight: bold;
  margin-bottom: 0.5em;
  margin-top: 0.8em;
}

.markdown-content :deep(h3) {
  color: white;
  font-size: 1.17em;
  font-weight: bold;
  margin-bottom: 0.5em;
  margin-top: 0.6em;
}

.markdown-content :deep(p) {
  color: white;
  margin-bottom: 1em;
  line-height: 1.6;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  color: white;
  padding-left: 2em;
  margin-bottom: 1em;
}

.markdown-content :deep(ul) {
  list-style-type: disc;
}

.markdown-content :deep(ol) {
  list-style-type: decimal;
}

.markdown-content :deep(li) {
  margin-bottom: 0.5em;
}

.markdown-content :deep(blockquote) {
  border-left: 4px solid var(--terminal-accent);
  padding-left: 1em;
  margin-left: 0;
  color: white;
  opacity: 0.8;
  font-style: italic;
  margin-bottom: 1em;
}

.markdown-content :deep(code) {
  background: var(--terminal-hover);
  border: 1px solid var(--terminal-border);
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  color: var(--terminal-accent);
  font-size: 0.9em;
}

.markdown-content :deep(pre) {
  background: var(--terminal-hover);
  border: 1px solid var(--terminal-border);
  padding: 1em;
  border-radius: 5px;
  overflow-x: auto;
  margin-bottom: 1em;
}

.markdown-content :deep(pre code) {
  background: transparent;
  border: none;
  padding: 0;
  color: white;
}

.markdown-content :deep(a) {
  color: var(--terminal-accent);
  text-decoration: underline;
}

.markdown-content :deep(a:hover) {
  color: var(--terminal-magenta);
}
</style>
