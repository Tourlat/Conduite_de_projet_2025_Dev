<template>
  <div class="test-playground">
    <h1>Tests JavaScript - Issue #{{ issueId }}</h1>
    
    <div v-if="error" class="error-banner">
      {{ error }}
    </div>

    <div class="info-banner">
      <span>Environnement d'exécution isolé et sécurisé avec Web Worker (timeout: 5s)</span>
    </div>

    <!-- Saved tests section -->
    <div v-if="savedTests.length > 0" class="saved-tests-section">
      <h2>Tests sauvegardés</h2>
      <div class="saved-tests-list">
        <div
          v-for="test in savedTests"
          :key="test.id"
          class="saved-test-card"
        >
          <div class="test-info">
            <span class="test-id">Test #{{ test.id }}</span>
            <span class="test-date">{{ new Date(test.createdAt).toLocaleDateString('fr-FR') }}</span>
          </div>
          <div class="test-actions">
            <button class="btn-load" @click="loadSavedTest(test)">
              Charger
            </button>
            <button class="btn-delete-test" @click="deleteSavedTest(test.id)">
              Supprimer
            </button>
          </div>
        </div>
      </div>
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
      <button class="btn-save" :disabled="loading" @click="saveTest">
        {{ loading ? 'Sauvegarde...' : 'Sauvegarder ce test' }}
      </button>
      <button class="btn-run" :disabled="isRunning" @click="runTests">
        {{ isRunning ? 'Exécution...' : 'Exécuter les tests' }}
      </button>
    </div>

    <TestResults :result="results" />
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import FileUploadSection from './FileUploadSection.vue'
import CodeEditor from './CodeEditor.vue'
import TestResults from './TestResults.vue'
import { defaultCode, defaultTests } from '../../utils/testDefaults'
import type { TestResult, WorkerResponse } from '../../types/testRunner'
import testService, { type TestResponse } from '../../services/testservice'

const route = useRoute()
const projectId = ref(route.params.id as string)
const issueId = ref(Number(route.params.issueId))

const userCode = ref(defaultCode)
const userTests = ref(defaultTests)
const results = ref<TestResult | null>(null)
const isRunning = ref(false)
const savedTests = ref<TestResponse[]>([])
const loading = ref(false)
const error = ref('')

let worker: Worker | null = null

// Load existing tests from the backend
const loadTests = async () => {
  if (!projectId.value || !issueId.value) return
  
  loading.value = true
  error.value = ''
  try {
    savedTests.value = await testService.getTestsByIssue(projectId.value, issueId.value)
  } catch {
    error.value = 'Erreur lors du chargement des tests'
  } finally {
    loading.value = false
  }
}

// Save in db a new test
const saveTest = async () => {
  if (!projectId.value || !issueId.value) {
    error.value = 'Projet ou issue manquant'
    return
  }

  if (!userCode.value || !userTests.value) {
    error.value = 'Le code et les tests ne peuvent pas être vides'
    return
  }

  loading.value = true
  error.value = ''
  try {
    const createdTest = await testService.createTest(
      projectId.value,
      issueId.value,
      {
        programCode: userCode.value,
        testCode: userTests.value
      }
    )
    savedTests.value.push(createdTest)
    alert('Test sauvegardé avec succès !')
    await loadTests()
  } catch {
    error.value = 'Erreur lors de la sauvegarde du test'
    alert('Erreur lors de la sauvegarde du test')
  } finally {
    loading.value = false
  }
}
// load a saved test into the editors
const loadSavedTest = (test: TestResponse) => {
  userCode.value = test.programCode
  userTests.value = test.testCode
}

// Delete a saved test
const deleteSavedTest = async (testId: number) => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer ce test ?')) return

  loading.value = true
  error.value = ''
  try {
    await testService.deleteTest(projectId.value, issueId.value, testId)
    savedTests.value = savedTests.value.filter(t => t.id !== testId)
  } catch {
    error.value = 'Erreur lors de la suppression du test'
  } finally {
    loading.value = false
  }
}

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
  // Download the code file
  const codeBlob = new Blob([userCode.value], { type: 'text/javascript' })
  const codeUrl = URL.createObjectURL(codeBlob)
  const codeLink = document.createElement('a')
  codeLink.href = codeUrl
  codeLink.download = 'code.js'
  codeLink.click()
  URL.revokeObjectURL(codeUrl)
  
  // Download the test file
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
    // Terminate the old worker if it exists
    if (worker) {
      worker.terminate()
    }

    // Create a new worker
    worker = new Worker(
      new URL('../../workers/test-worker.ts', import.meta.url),
      { type: 'module' }
    )

    // Client-side safety timeout
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

    // Listen for results
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

    // Manage worker errors
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

    // Send code and tests to the worker
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

/**
 * Lifecycle Hooks loading saved tests on mount
 */
onMounted(() => {
  loadTests()
})

/**
 * Cleanup the worker on unmount
 */
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
  background: var(--terminal-hover);
  border: 1px solid var(--terminal-border);
  border-left: 4px solid var(--terminal-accent);
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--terminal-fg);
}

.error-banner {
  background: var(--terminal-magenta);
  color: white;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  text-align: center;
  border: 1px solid rgba(247, 118, 142, 0.3);
}

.saved-tests-section {
  background: var(--terminal-hover);
  border: 1px solid var(--terminal-border);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.saved-tests-section h2 {
  color: var(--terminal-accent);
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.saved-tests-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.saved-test-card {
  background: var(--terminal-bg);
  border: 1px solid var(--terminal-border);
  border-radius: 4px;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.test-info {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.test-id {
  color: var(--terminal-accent);
  font-weight: bold;
}

.test-date {
  color: rgba(192, 202, 245, 0.6);
  font-size: 0.9rem;
}

.test-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-load {
  background: var(--terminal-accent);
  color: white;
  border: 1px solid var(--terminal-accent);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-load:hover {
  background: var(--terminal-accent-dark);
  border-color: var(--terminal-accent-dark);
  transform: translateY(-1px);
}

.btn-delete-test {
  background: var(--terminal-magenta);
  color: white;
  border: 1px solid var(--terminal-magenta);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-delete-test:hover {
  background: #e85d79;
  border-color: #e85d79;
  transform: translateY(-1px);
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
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin: 2rem 0;
}

.btn-save {
  padding: 1rem 2rem;
  background: var(--terminal-accent);
  color: white;
  border: 1px solid var(--terminal-accent);
  border-radius: 6px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-save:hover:not(:disabled) {
  background: var(--terminal-accent-dark);
  border-color: var(--terminal-accent-dark);
  transform: translateY(-2px);
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-run {
  padding: 1rem 2rem;
  background: var(--terminal-magenta);
  color: white;
  border: 1px solid var(--terminal-magenta);
  border-radius: 6px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-run:hover:not(:disabled) {
  background: #e85d79;
  border-color: #e85d79;
  transform: translateY(-2px);
}

.btn-run:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

@media (max-width: 968px) {
  .playground-container {
    grid-template-columns: 1fr;
  }
}
</style>
