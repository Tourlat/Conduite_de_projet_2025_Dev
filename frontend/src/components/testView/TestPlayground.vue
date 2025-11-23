<template>
  <div class="test-playground">
    <h1>Tests JavaScript</h1>
    
    <div class="info-banner">
      <span>Environnement d'exécution isolé et sécurisé avec Web Worker (timeout: 5s)</span>
    </div>

    <FileUploadSection
      @upload-code="handleCodeUpload"
      @upload-tests="handleTestsUpload"
      @download="downloadFiles"
    />
    
    <div class="playground-container">
      <CodeEditor
        v-model="userCode"
        title="Code"
        placeholder="Écrivez votre code JavaScript ici..."
        @reset="resetCode"
      />

      <CodeEditor
        v-model="userTests"
        title="Tests"
        placeholder="Écrivez vos tests ici..."
        @reset="resetTests"
      />
    </div>

    <div class="actions">
      <button class="btn-run" :disabled="isRunning" @click="runTests">
        {{ isRunning ? 'Exécution...' : 'Exécuter les tests' }}
      </button>
    </div>

    <TestResults :result="results" />
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import FileUploadSection from './FileUploadSection.vue'
import CodeEditor from './CodeEditor.vue'
import TestResults from './TestResults.vue'
import { defaultCode, defaultTests } from '../../utils/testDefaults'
import type { TestResult, WorkerResponse } from '../../types/testRunner'

const userCode = ref(defaultCode)
const userTests = ref(defaultTests)
const results = ref<TestResult | null>(null)
const isRunning = ref(false)

let worker: Worker | null = null

const resetCode = () => {
  userCode.value = defaultCode
}

const resetTests = () => {
  userTests.value = defaultTests
}

const handleCodeUpload = (content: string) => {
  userCode.value = content
}

const handleTestsUpload = (content: string) => {
  userTests.value = content
}

const downloadFiles = () => {
  // Télécharger le fichier de code
  const codeBlob = new Blob([userCode.value], { type: 'text/javascript' })
  const codeUrl = URL.createObjectURL(codeBlob)
  const codeLink = document.createElement('a')
  codeLink.href = codeUrl
  codeLink.download = 'code.js'
  codeLink.click()
  URL.revokeObjectURL(codeUrl)
  
  // Télécharger le fichier de tests
  setTimeout(() => {
    const testBlob = new Blob([userTests.value], { type: 'text/javascript' })
    const testUrl = URL.createObjectURL(testBlob)
    const testLink = document.createElement('a')
    testLink.href = testUrl
    testLink.download = 'tests.js'
    testLink.click()
    URL.revokeObjectURL(testUrl)
  }, 100)
}

const runTests = async () => {
  isRunning.value = true
  results.value = null

  try {
    // Terminer l'ancien worker s'il existe
    if (worker) {
      worker.terminate()
    }

    // Créer un nouveau worker
    worker = new Worker(
      new URL('../../workers/test-worker.ts', import.meta.url),
      { type: 'module' }
    )

    // Timeout de sécurité côté client aussi
    const timeout = setTimeout(() => {
      if (worker) {
        worker.terminate()
        results.value = {
          success: false,
          error: 'Timeout: L\'exécution a été interrompue après 5 secondes'
        }
        isRunning.value = false
      }
    }, 6000)

    // Écouter les résultats
    worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
      clearTimeout(timeout)
      const { success, output, error, stack } = e.data

      if (success) {
        results.value = {
          success: true,
          output
        }
      } else {
        results.value = {
          success: false,
          error: `${error}\n\nStack:\n${stack || 'Non disponible'}`
        }
      }

      isRunning.value = false
      worker?.terminate()
      worker = null
    }

    // Gérer les erreurs du worker
    worker.onerror = (error) => {
      clearTimeout(timeout)
      results.value = {
        success: false,
        error: `Erreur du worker: ${error.message}`
      }
      isRunning.value = false
      worker?.terminate()
      worker = null
    }

    // Envoyer le code et les tests au worker
    worker.postMessage({
      code: userCode.value,
      tests: userTests.value
    })

  } catch (error: unknown) {
    results.value = {
      success: false,
      error: `Erreur lors de la création du worker:\n${error instanceof Error ? error.message : String(error)}`
    }
    isRunning.value = false
  }
}

// Nettoyer le worker lors de la destruction du composant
onUnmounted(() => {
  if (worker) {
    worker.terminate()
  }
})
</script>

<style scoped>
.test-playground {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  color: var(--terminal-accent);
  margin-bottom: 1rem;
}

.info-banner {
  background: var(--terminal-bg-secondary);
  border: 1px solid var(--terminal-border);
  border-left: 4px solid var(--terminal-green);
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.info-banner {
  font-size: 1.5rem;
}

.playground-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.actions {
  text-align: center;
  margin: 2rem 0;
}

.btn-run {
  padding: 1rem 2rem;
  background: var(--terminal-accent);
  color: var(--terminal-bg);
  border: none;
  border-radius: 6px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-run:hover:not(:disabled) {
  background: var(--terminal-green);
  transform: translateY(-2px);
}

.btn-run:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 968px) {
  .playground-container {
    grid-template-columns: 1fr;
  }
}
</style>
