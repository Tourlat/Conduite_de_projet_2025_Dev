<template>
  <div v-if="result" class="results-section">
    <h3>Résultats</h3>
    <div :class="['results-content', result.success ? 'success' : 'error']">
      <pre v-if="result.success">{{ result.output }}</pre>
      <pre v-else class="error-message">{{ result.error }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TestResult } from '../../types/testRunner'

defineProps<{
  result: TestResult | null
}>()
</script>

<style scoped>
.results-section {
  background: var(--terminal-hover);
  border: 1px solid var(--terminal-border);
  border-radius: 8px;
  padding: 1.5rem;
}

.results-section h3 {
  color: var(--terminal-accent);
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.results-content {
  background: var(--terminal-bg);
  border: 1px solid var(--terminal-border);
  border-radius: 4px;
  padding: 1rem;
  max-height: 400px;
  overflow-y: auto;
}

.results-content pre {
  margin: 0;
  font-family: 'Courier New', monospace;
  font-size: 0.95rem;
  line-height: 1.6;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.results-content.success {
  border-left: 4px solid var(--terminal-accent);
}

.results-content.success pre {
  color: var(--terminal-accent);
}

.results-content.error {
  border-left: 4px solid var(--terminal-magenta);
}

.results-content.error pre {
  color: var(--terminal-magenta);
}
</style>
