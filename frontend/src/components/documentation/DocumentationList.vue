<template>
  <div class="documentation-list">
    <div class="header">
      <h2>Documentation du Projet</h2>
      <button @click="startCreating" class="btn-new">
        Nouveau Document
      </button>
    </div>

    <div v-if="isEditing" class="editor-container">
      <h3>{{ editingDoc?.id ? 'Modifier' : 'Créer' }} la Documentation</h3>
      <MarkdownEditor
        :initial-doc="editingDoc"
        @save="handleSave"
        @cancel="cancelEdit"
      />
    </div>

    <div v-else class="docs-grid">
      <div v-for="doc in docs" :key="doc.id" class="doc-card">
        <div class="doc-content" @click="viewDoc(doc)">
          <p class="doc-title">{{ doc.title }}</p>
          <p class="doc-date">
            Mis à jour: {{ new Date(doc.updatedAt || doc.createdAt || '').toLocaleDateString('fr-FR') }}
          </p>
        </div>
        <div class="doc-actions">
          <button @click.stop="editDoc(doc)" class="btn-edit">Modifier</button>
          <button @click.stop="deleteDoc(doc)" class="btn-delete">Supprimer</button>
        </div>
      </div>
      
      <div v-if="docs.length === 0" class="empty-state">
        Aucune documentation trouvée. Créez-en une pour commencer.
      </div>
    </div>

    <!-- Modal de visualisation -->
    <div v-if="viewingDoc" class="modal-overlay" @click="closeView">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ viewingDoc.title }}</h3>
          <button @click="closeView" class="btn-close">✕</button>
        </div>
        <div class="modal-body markdown-content" v-html="parsedViewingContent"></div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { marked } from 'marked'
import documentationService, { type DocumentationDto } from '../../services/documentationService'
import MarkdownEditor from './MarkdownEditor.vue'

const route = useRoute()
const projectId = route.params.id as string

const docs = ref<DocumentationDto[]>([])
const isEditing = ref(false)
const editingDoc = ref<DocumentationDto | undefined>(undefined)
const viewingDoc = ref<DocumentationDto | null>(null)

const loadDocs = async () => {
  try {
    docs.value = await documentationService.getDocumentationByProject(projectId)
  } catch (error) {
    console.error('Failed to load documentation', error)
  }
}

const startCreating = () => {
  editingDoc.value = { title: '', content: '' }
  isEditing.value = true
}

const editDoc = (doc: DocumentationDto) => {
  editingDoc.value = { ...doc }
  isEditing.value = true
}

const cancelEdit = () => {
  isEditing.value = false
  editingDoc.value = undefined
}

const handleSave = async (doc: DocumentationDto) => {
  try {
    if (doc.id) {
      await documentationService.updateDocumentation(projectId, doc.id, doc)
    } else {
      await documentationService.createDocumentation(projectId, doc)
    }
    await loadDocs()
    isEditing.value = false
    editingDoc.value = undefined
  } catch (error) {
    console.error('Failed to save documentation', error)
  }
}

const deleteDoc = async (doc: DocumentationDto) => {
    if (!doc.id) return
    if (!confirm('Are you sure you want to delete this documentation?')) return

    try {
        await documentationService.deleteDocumentation(projectId, doc.id)
        await loadDocs()
    } catch (error) {
        console.error('Failed to delete documentation', error)
    }
}

const viewDoc = (doc: DocumentationDto) => {
    viewingDoc.value = doc
}

const closeView = () => {
    viewingDoc.value = null
}

const parsedViewingContent = computed(() => {
    if (!viewingDoc.value) return ''
    return marked(viewingDoc.value.content)
})

onMounted(() => {
  loadDocs()
})
</script>

<style scoped>
.documentation-list {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header h2 {
  color: var(--terminal-accent);
  font-size: 2rem;
  margin: 0;
}

.btn-new {
  padding: 0.75rem 1.5rem;
  background: var(--terminal-accent);
  color: var(--terminal-bg);
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-new:hover {
  background: var(--terminal-accent-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--terminal-shadow);
}

.editor-container {
  background: var(--terminal-hover);
  border: 1px solid var(--terminal-border);
  border-radius: 8px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.editor-container h3 {
  color: var(--terminal-accent);
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.docs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

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

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 4rem 2rem;
  color: var(--terminal-fg);
  opacity: 0.7;
  font-size: 1.1rem;
}

/* Modal */
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
  color: var(--terminal-accent);
  font-size: 2em;
  font-weight: bold;
  margin-bottom: 0.5em;
  margin-top: 1em;
}

.markdown-content :deep(h2) {
  color: var(--terminal-accent);
  font-size: 1.5em;
  font-weight: bold;
  margin-bottom: 0.5em;
  margin-top: 0.8em;
}

.markdown-content :deep(h3) {
  color: var(--terminal-fg);
  font-size: 1.17em;
  font-weight: bold;
  margin-bottom: 0.5em;
  margin-top: 0.6em;
}

.markdown-content :deep(p) {
  color: var(--terminal-fg);
  margin-bottom: 1em;
  line-height: 1.6;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  color: var(--terminal-fg);
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
  color: var(--terminal-fg);
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
  color: var(--terminal-fg);
}

.markdown-content :deep(a) {
  color: var(--terminal-accent);
  text-decoration: underline;
}

.markdown-content :deep(a:hover) {
  color: var(--terminal-magenta);
}
</style>
