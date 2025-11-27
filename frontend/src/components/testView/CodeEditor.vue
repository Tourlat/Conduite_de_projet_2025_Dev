<template>
  <div class="editor-section">
    <div class="section-header">
      <h2>{{ title }}</h2>
      <button class="btn-reset" @click="$emit('reset')">Réinitialiser</button>
    </div>
    <textarea
      :value="modelValue"
      class="code-editor"
      :placeholder="placeholder"
      spellcheck="false"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string
  title: string
  placeholder: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
  reset: []
}>()
</script>

<style scoped>
.editor-section {
  background: var(--terminal-hover);
  border: 1px solid var(--terminal-border);
  border-radius: 8px;
  padding: 1rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-header h2 {
  color: var(--terminal-accent);
  font-size: 1.2rem;
  margin: 0;
}

.btn-reset {
  padding: 0.4rem 0.8rem;
  background: var(--terminal-bg);
  color: var(--terminal-fg);
  border: 1px solid var(--terminal-border);
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-reset:hover {
  background: var(--terminal-hover);
  border-color: var(--terminal-accent);
  color: var(--terminal-accent);
}

.code-editor {
  width: 100%;
  min-height: 400px;
  background: var(--terminal-bg);
  color: var(--terminal-fg);
  border: 1px solid var(--terminal-border);
  border-radius: 4px;
  padding: 1rem;
  font-family: 'Courier New', monospace;
  font-size: 0.95rem;
  line-height: 1.5;
  resize: vertical;
}

.code-editor:focus {
  outline: none;
  border-color: var(--terminal-accent);
  box-shadow: 0 0 0 2px var(--terminal-shadow);
}
</style>
