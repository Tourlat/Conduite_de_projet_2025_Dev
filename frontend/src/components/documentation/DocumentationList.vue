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
      <DocumentationCard
        v-for="doc in docs"
        :key="doc.id"
        :doc="doc"
        @view="viewDoc(doc)"
        @edit="editDoc(doc)"
        @delete="deleteDoc(doc)"
      />
      
      <div v-if="docs.length === 0" class="empty-state">
        Aucune documentation trouvée. Créez-en une pour commencer.
      </div>
    </div>

    <DocumentationViewModal
      v-if="viewingDoc"
      :doc="viewingDoc"
      @close="closeView"
    />

    <DocumentationDeleteModal
      v-if="deletingDoc"
      :doc="deletingDoc"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import documentationService, { type DocumentationDto } from '../../services/documentationService'
import MarkdownEditor from './MarkdownEditor.vue'
import DocumentationCard from './DocumentationCard.vue'
import DocumentationViewModal from './DocumentationViewModal.vue'
import DocumentationDeleteModal from './DocumentationDeleteModal.vue'

const route = useRoute()
const projectId = route.params.id as string

const docs = ref<DocumentationDto[]>([])
const isEditing = ref(false)
const editingDoc = ref<DocumentationDto | undefined>(undefined)
const viewingDoc = ref<DocumentationDto | null>(null)
const deletingDoc = ref<DocumentationDto | null>(null)

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

const deleteDoc = (doc: DocumentationDto) => {
    deletingDoc.value = doc
}

const confirmDelete = async () => {
    if (!deletingDoc.value?.id) return

    try {
        await documentationService.deleteDocumentation(projectId, deletingDoc.value.id)
        await loadDocs()
        deletingDoc.value = null
    } catch (error) {
        console.error('Failed to delete documentation', error)
    }
}

const cancelDelete = () => {
    deletingDoc.value = null
}

const viewDoc = (doc: DocumentationDto) => {
    viewingDoc.value = doc
}

const closeView = () => {
    viewingDoc.value = null
}

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

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 4rem 2rem;
  color: var(--terminal-fg);
  opacity: 0.7;
  font-size: 1.1rem;
}
</style>
