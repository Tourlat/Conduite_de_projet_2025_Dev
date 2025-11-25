<template>
  <div class="markdown-editor">
    <div class="editor-layout">
      <div class="input-section">
        <label for="title">Titre</label>
        <input
          id="title"
          v-model="localDoc.title"
          type="text"
          placeholder="Titre de la documentation"
        />
        
        <label for="content">Contenu (Markdown)</label>
        <textarea
          id="content"
          v-model="localDoc.content"
          placeholder="# Votre contenu Markdown ici"
        ></textarea>

        <!-- Section de liaison avec les issues -->
        <IssueLinker
          :linked-issues="linkedIssues"
          :available-issues="availableIssues"
          @link="handleLinkIssue"
          @unlink="handleUnlinkIssue"
        />
      </div>
      
      <div class="preview-section">
        <h3>Aperçu</h3>
        <div v-html="parsedContent" class="markdown-preview"></div>
      </div>
    </div>
    
    <div class="actions">
      <button @click="$emit('cancel')" class="btn-cancel">
        Annuler
      </button>
      <button @click="save" class="btn-save">
        Enregistrer
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { marked } from 'marked'
import type { DocumentationDto } from '../../services/documentationService'
import documentationIssueService, {
  type DocumentationIssueDto
} from '../../services/documentationIssueService'
import axios from 'axios'
import IssueLinker from './IssueLinker.vue'

const props = defineProps<{
  initialDoc?: DocumentationDto
}>()

const emit = defineEmits<{
  (e: 'save', doc: DocumentationDto, issueIds: number[]): void
  (e: 'cancel'): void
}>()

const route = useRoute()
const projectId = route.params.id as string

const localDoc = ref<DocumentationDto>({
  title: '',
  content: '',
  ...props.initialDoc
})

const linkedIssues = ref<DocumentationIssueDto[]>([])
const availableIssues = ref<any[]>([])
const pendingIssueIds = ref<number[]>([])

// Configure marked to handle line breaks
marked.setOptions({
  breaks: true,
  gfm: true
})

const parsedContent = computed(() => {
  return marked(localDoc.value.content || '')
})

const loadLinkedIssues = async () => {
  if (localDoc.value.id) {
    try {
      linkedIssues.value = await documentationIssueService.getIssuesByDocumentation(
        localDoc.value.id
      )
    } catch (error) {
      console.error('Error loading linked issues:', error)
    }
  }
}

const loadAvailableIssues = async () => {
  try {
    const response = await axios.get(`/api/projects/${projectId}/issues`)
    availableIssues.value = response.data
  } catch (error) {
    console.error('Error loading available issues:', error)
  }
}

const handleLinkIssue = async (issueId: number) => {
  // Si le document existe déjà, lier immédiatement
  if (localDoc.value.id) {
    try {
      await documentationIssueService.linkDocumentationToIssue(
        localDoc.value.id,
        issueId
      )
      await loadLinkedIssues()
    } catch (error: any) {
      console.error('Error linking issue:', error)
      if (error.response?.status === 500) {
        alert('Cette issue est déjà liée à cette documentation')
      } else {
        alert('Erreur lors de la liaison de l\'issue')
      }
    }
  } else {
    // Si le document n'existe pas encore, ajouter à la liste pending
    if (!pendingIssueIds.value.includes(issueId)) {
      pendingIssueIds.value.push(issueId)
      // Simuler un linkedIssue pour l'affichage
      const issue = availableIssues.value.find(i => i.id === issueId)
      if (issue) {
        linkedIssues.value.push({
          id: 0,
          documentationId: 0,
          issueId: issue.id,
          issueTitle: issue.title,
          issuePriority: issue.priority,
          issueStatus: issue.status
        })
      }
    }
  }
}

const handleUnlinkIssue = async (issueId: number) => {
  // Si le document existe déjà, délier immédiatement
  if (localDoc.value.id) {
    try {
      await documentationIssueService.unlinkDocumentationFromIssue(localDoc.value.id, issueId)
      await loadLinkedIssues()
    } catch (error) {
      console.error('Error unlinking issue:', error)
      alert('Erreur lors de la suppression de la liaison')
    }
  } else {
    // Si le document n'existe pas encore, retirer de la liste pending
    pendingIssueIds.value = pendingIssueIds.value.filter(id => id !== issueId)
    linkedIssues.value = linkedIssues.value.filter(link => link.issueId !== issueId)
  }
}

const save = () => {
  emit('save', localDoc.value, pendingIssueIds.value)
}

watch(
  () => props.initialDoc,
  (newVal) => {
    if (newVal) {
      localDoc.value = { ...newVal }
      loadLinkedIssues()
      pendingIssueIds.value = []
    }
  },
  { deep: true }
)

onMounted(() => {
  loadLinkedIssues()
  loadAvailableIssues()
})
</script>

<style scoped>
.markdown-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 1.5rem;
}

.editor-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  flex: 1;
  min-height: 500px;
}

.input-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.input-section label {
  color: var(--terminal-accent);
  font-weight: 600;
  font-size: 0.95rem;
}

.input-section input {
  padding: 0.75rem;
  background: var(--terminal-bg);
  color: var(--terminal-fg);
  border: 1px solid var(--terminal-border);
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.input-section input:focus {
  outline: none;
  border-color: var(--terminal-accent);
}

.input-section textarea {
  flex: 1;
  padding: 1rem;
  background: var(--terminal-bg);
  color: var(--terminal-fg);
  border: 1px solid var(--terminal-border);
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.95rem;
  line-height: 1.6;
  resize: none;
  transition: border-color 0.2s;
}

.input-section textarea:focus {
  outline: none;
  border-color: var(--terminal-accent);
}

.preview-section {
  display: flex;
  flex-direction: column;
  background: var(--terminal-hover);
  border: 1px solid var(--terminal-border);
  border-radius: 4px;
  padding: 1.5rem;
  overflow-y: auto;
}

.preview-section h3 {
  color: var(--terminal-accent);
  margin-bottom: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
}

.markdown-preview {
  flex: 1;
  overflow-y: auto;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--terminal-border);
}

.btn-cancel,
.btn-save {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background: transparent;
  color: var(--terminal-fg);
  border: 1px solid var(--terminal-border);
}

.btn-cancel:hover {
  background: var(--terminal-hover);
  border-color: var(--terminal-accent);
}

.btn-save {
  background: var(--terminal-accent);
  color: var(--terminal-bg);
}

.btn-save:hover {
  background: var(--terminal-accent-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--terminal-shadow);
}

/* Markdown Preview Styling */
.markdown-preview :deep(h1) {
  color: white;
  font-size: 2em;
  font-weight: bold;
  margin-bottom: 0.5em;
  margin-top: 1em;
}

.markdown-preview :deep(h2) {
  color: white;
  font-size: 1.5em;
  font-weight: bold;
  margin-bottom: 0.5em;
  margin-top: 0.8em;
}

.markdown-preview :deep(h3) {
  color: white;
  font-size: 1.17em;
  font-weight: bold;
  margin-bottom: 0.5em;
  margin-top: 0.6em;
}

.markdown-preview :deep(p) {
  color: white;
  margin-bottom: 1em;
  line-height: 1.6;
}

.markdown-preview :deep(ul),
.markdown-preview :deep(ol) {
  color: white;
  padding-left: 2em;
  margin-bottom: 1em;
}

.markdown-preview :deep(ul) {
  list-style-type: disc;
}

.markdown-preview :deep(ol) {
  list-style-type: decimal;
}

.markdown-preview :deep(li) {
  margin-bottom: 0.5em;
}

.markdown-preview :deep(blockquote) {
  border-left: 4px solid var(--terminal-accent);
  padding-left: 1em;
  margin-left: 0;
  color: white;
  opacity: 0.8;
  font-style: italic;
  margin-bottom: 1em;
}

.markdown-preview :deep(code) {
  background: var(--terminal-bg);
  border: 1px solid var(--terminal-border);
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  color: var(--terminal-accent);
  font-size: 0.9em;
}

.markdown-preview :deep(pre) {
  background: var(--terminal-bg);
  border: 1px solid var(--terminal-border);
  padding: 1em;
  border-radius: 5px;
  overflow-x: auto;
  margin-bottom: 1em;
}

.markdown-preview :deep(pre code) {
  background: transparent;
  border: none;
  padding: 0;
  color: white;
}

.markdown-preview :deep(a) {
  color: var(--terminal-accent);
  text-decoration: underline;
}

.markdown-preview :deep(a:hover) {
  color: var(--terminal-magenta);
}
</style>
