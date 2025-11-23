<template>
  <div class="test-playground">
    <h1>🧪 Terrain de Test JavaScript</h1>
    
    <div class="info-banner">
      <span class="icon">🔒</span>
      <span>Environnement d'exécution isolé et sécurisé avec Web Worker (timeout: 5s)</span>
    </div>

    <!-- Section d'upload de fichiers -->
    <div class="upload-section">
      <div class="upload-controls">
        <div class="upload-group">
          <label for="code-file-upload" class="upload-label">
            📄 Charger un fichier de code (.js, .txt)
          </label>
          <input
            id="code-file-upload"
            type="file"
            accept=".js,.txt,.mjs"
            @change="handleCodeFileUpload"
            class="file-input"
          />
        </div>
        <div class="upload-group">
          <label for="test-file-upload" class="upload-label">
            🧪 Charger un fichier de tests (.js, .txt)
          </label>
          <input
            id="test-file-upload"
            type="file"
            accept=".js,.txt,.mjs"
            @change="handleTestFileUpload"
            class="file-input"
          />
        </div>
        <button @click="downloadFiles" class="btn-download">
          💾 Télécharger les fichiers
        </button>
      </div>
    </div>
    
    <div class="playground-container">
      <!-- Section Code -->
      <div class="editor-section">
        <div class="section-header">
          <h2>📝 Code</h2>
          <button @click="resetCode" class="btn-reset">Réinitialiser</button>
        </div>
        <textarea
          v-model="userCode"
          class="code-editor"
          placeholder="Écrivez votre code JavaScript ici..."
          spellcheck="false"
        />
      </div>

      <!-- Section Test -->
      <div class="editor-section">
        <div class="section-header">
          <h2>🧪 Tests</h2>
          <button @click="resetTests" class="btn-reset">Réinitialiser</button>
        </div>
        <textarea
          v-model="userTests"
          class="code-editor"
          placeholder="Écrivez vos tests ici..."
          spellcheck="false"
        />
      </div>
    </div>

    <!-- Bouton d'exécution -->
    <div class="actions">
      <button @click="runTests" class="btn-run" :disabled="isRunning">
        {{ isRunning ? '⏳ Exécution...' : '▶️ Exécuter les tests' }}
      </button>
    </div>

    <!-- Résultats -->
    <div v-if="results" class="results-section">
      <h3>📊 Résultats</h3>
      <div :class="['results-content', results.success ? 'success' : 'error']">
        <pre v-if="results.success">{{ results.output }}</pre>
        <pre v-else class="error-message">{{ results.error }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'

interface TestResult {
  success: boolean
  output?: string
  error?: string
}

// ...existing code...

const defaultCode = `// Définir vos fonctions ici
function add(a, b) {
  return a + b
}

function multiply(a, b) {
  return a * b
}

function greet(name) {
  return "Hello, " + name + "!"
}

function divide(a, b) {
  if (b === 0) {
    throw new Error("Division par zéro")
  }
  return a / b
}`

const defaultTests = `// Écrire vos tests avec la fonction test()
// Syntaxe: test("description", () => { /* assertions */ })

test("add(2, 3) devrait retourner 5", () => {
  assertEquals(add(2, 3), 5)
})

test("add(-1, 1) devrait retourner 0", () => {
  assertEquals(add(-1, 1), 0)
})

test("multiply(3, 4) devrait retourner 12", () => {
  assertEquals(multiply(3, 4), 12)
})

test("multiply(0, 100) devrait retourner 0", () => {
  assertEquals(multiply(0, 100), 0)
})

test("greet('Alice') devrait retourner 'Hello, Alice!'", () => {
  assertEquals(greet("Alice"), "Hello, Alice!")
})

test("greet('Bob') ne devrait pas retourner 'Hello, Alice!'", () => {
  assertNotEquals(greet("Bob"), "Hello, Alice!")
})

test("divide(10, 2) devrait retourner 5", () => {
  assertEquals(divide(10, 2), 5)
})

test("divide par zéro devrait lever une erreur", () => {
  try {
    divide(10, 0)
    assert(false, "Une erreur aurait dû être levée")
  } catch(e) {
    assert(e.message === "Division par zéro", "Le message d'erreur est correct")
  }
})

test("le résultat de add devrait être un nombre", () => {
  assertTrue(typeof add(1, 1) === "number")
})

test("add(5, 3) ne devrait pas retourner 7", () => {
  assertNotEquals(add(5, 3), 7)
})

// Vous pouvez aussi utiliser console.log() pour afficher des infos
console.log("Tous les tests ont été exécutés !")`

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

// Gestion de l'upload de fichiers
const handleCodeFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      userCode.value = content
    }
    reader.onerror = () => {
      alert('Erreur lors de la lecture du fichier')
    }
    reader.readAsText(file)
    // Réinitialiser l'input pour permettre de recharger le même fichier
    target.value = ''
  }
}

const handleTestFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      userTests.value = content
    }
    reader.onerror = () => {
      alert('Erreur lors de la lecture du fichier')
    }
    reader.readAsText(file)
    // Réinitialiser l'input pour permettre de recharger le même fichier
    target.value = ''
  }
}

// Téléchargement des fichiers
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
    worker = new Worker('/test-worker.js')

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
    }, 6000) // 6s pour laisser le worker gérer son propre timeout de 5s

    // Écouter les résultats
    worker.onmessage = (e) => {
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

  } catch (error: any) {
    results.value = {
      success: false,
      error: `Erreur lors de la création du worker:\n${error.message}`
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

.info-banner .icon {
  font-size: 1.5rem;
}

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

.playground-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.editor-section {
  background: var(--terminal-bg-secondary);
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
  background: var(--terminal-bg-tertiary);
  color: var(--terminal-text);
  border: 1px solid var(--terminal-border);
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.btn-reset:hover {
  background: var(--terminal-border);
}

.code-editor {
  width: 100%;
  min-height: 400px;
  background: var(--terminal-bg);
  color: var(--terminal-text);
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

.results-section {
  background: var(--terminal-bg-secondary);
  border: 1px solid var(--terminal-border);
  border-radius: 8px;
  padding: 1.5rem;
}

.results-section h3 {
  color: var(--terminal-accent);
  margin-bottom: 1rem;
}

.results-content {
  background: var(--terminal-bg);
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

.results-content.success pre {
  color: var(--terminal-green);
}

.results-content.error pre {
  color: var(--terminal-magenta);
}

@media (max-width: 968px) {
  .playground-container {
    grid-template-columns: 1fr;
  }
}
</style>