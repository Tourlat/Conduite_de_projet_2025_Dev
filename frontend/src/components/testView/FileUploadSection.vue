<template>
  <div class="upload-section">
    <div class="upload-controls">
      <div class="upload-group">
        <label for="code-file-upload" class="upload-label">
          Charger un fichier de code (.js, .txt)
        </label>
        <input
          id="code-file-upload"
          class="file-input"
          type="file"
          accept=".js,.txt,.mjs"
          @change="handleCodeFileUpload"
        />
      </div>
      <div class="upload-group">
        <label for="test-file-upload" class="upload-label">
          Charger un fichier de tests (.js, .txt)
        </label>
        <input
          id="test-file-upload"
          class="file-input"
          type="file"
          accept=".js,.txt,.mjs"
          @change="handleTestFileUpload"
        />
      </div>
      <button class="btn-download" @click="$emit('download')">
        Télécharger les fichiers
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  uploadCode: [content: string]
  uploadTests: [content: string]
  download: []
}>()

const handleFileUpload = async (event: Event, isCode: boolean) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    try {
      const content = await file.text()
      if (isCode) {
        emit('uploadCode', content)
      } else {
        emit('uploadTests', content)
      }
    } catch {
      alert('Erreur lors de la lecture du fichier')
    }
    // Réinitialiser l'input pour permettre de recharger le même fichier
    target.value = ''
  }
}

const handleCodeFileUpload = (event: Event) => {
  handleFileUpload(event, true)
}

const handleTestFileUpload = (event: Event) => {
  handleFileUpload(event, false)
}
</script>

<style scoped>
.upload-section {
  background: var(--terminal-bg-secondary);
  border: 1px solid var(--terminal-border);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.upload-controls {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
}

.upload-group {
  flex: 1;
  min-width: 250px;
}

.upload-label {
  display: block;
  padding: 0.6rem 1rem;
  background: var(--terminal-bg);
  color: var(--terminal-text);
  border: 1px solid var(--terminal-border);
  border-radius: 4px;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s;
  font-size: 0.9rem;
}

.upload-label:hover {
  background: var(--terminal-bg-tertiary);
  border-color: var(--terminal-accent);
}

.file-input {
  display: none;
}

.btn-download {
  padding: 0.6rem 1.5rem;
  background: var(--terminal-green);
  color: var(--terminal-bg);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-download:hover {
  background: var(--terminal-accent);
  transform: translateY(-2px);
}
</style>
