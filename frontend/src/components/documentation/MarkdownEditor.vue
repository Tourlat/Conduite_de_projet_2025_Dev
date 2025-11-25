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
        <div v-if="localDoc.id" class="linked-issues-section">
          <label>Issues liées</label>
          <div class="linked-issues-list">
            <div v-if="linkedIssues.length === 0" class="no-issues">
              Aucune issue liée
            </div>
            <div
              v-for="link in linkedIssues"
              :key="link.id"
              class="linked-issue-item"
            >
              <div class="issue-info">
                <span class="issue-title">{{ link.issueTitle }}</span>
                <span :class="['issue-priority', `priority-${link.issuePriority.toLowerCase()}`]">
                  {{ link.issuePriority }}
                </span>
                <span :class="['issue-status', `status-${link.issueStatus.toLowerCase()}`]">
                  {{ link.issueStatus }}
                </span>
              </div>
              <button
                @click="unlinkIssue(link.issueId)"
                class="btn-unlink"
                title="Délier cette issue"
              >
                ✕
              </button>
            </div>
          </div>
          
          <div class="add-issue-section">
            <select v-model="selectedIssueId" class="issue-select">
              <option value="">Sélectionner une issue à lier...</option>
              <option
                v-for="issue in availableIssues"
                :key="issue.id"
                :value="issue.id"
              >
                {{ issue.title }} ({{ issue.priority }})
              </option>
            </select>
            <button
              @click="linkIssue"
              :disabled="!selectedIssueId"
              class="btn-link"
            >
              Lier
            </button>
          </div>
        </div>
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

const props = defineProps<{
  initialDoc?: DocumentationDto
}>()

const emit = defineEmits<{
  (e: 'save', doc: DocumentationDto): void
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
const selectedIssueId = ref<number | string>('')

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

const linkIssue = async () => {
  if (!localDoc.value.id || !selectedIssueId.value) return

  try {
    await documentationIssueService.linkDocumentationToIssue(
      localDoc.value.id,
      Number(selectedIssueId.value)
    )
    selectedIssueId.value = ''
    await loadLinkedIssues()
  } catch (error: any) {
    console.error('Error linking issue:', error)
    if (error.response?.status === 500) {
      alert('Cette issue est déjà liée à cette documentation')
    } else {
      alert('Erreur lors de la liaison de l\'issue')
    }
  }
}

const unlinkIssue = async (issueId: number) => {
  if (!localDoc.value.id) return

  if (confirm('Êtes-vous sûr de vouloir délier cette issue ?')) {
    try {
      await documentationIssueService.unlinkDocumentationFromIssue(localDoc.value.id, issueId)
      await loadLinkedIssues()
    } catch (error) {
      console.error('Error unlinking issue:', error)
      alert('Erreur lors de la suppression de la liaison')
    }
  }
}

const save = () => {
  emit('save', localDoc.value)
}

watch(
  () => props.initialDoc,
  (newVal) => {
    if (newVal) {
      localDoc.value = { ...newVal }
      loadLinkedIssues()
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

/* Linked Issues Section */
.linked-issues-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--terminal-bg);
  border: 1px solid var(--terminal-border);
  border-radius: 4px;
}

.linked-issues-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
}

.no-issues {
  color: var(--terminal-fg);
  opacity: 0.6;
  font-style: italic;
  padding: 0.5rem;
  text-align: center;
}

.linked-issue-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: var(--terminal-hover);
  border: 1px solid var(--terminal-border);
  border-radius: 4px;
  transition: background 0.2s;
}

.linked-issue-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.issue-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.issue-title {
  color: var(--terminal-fg);
  font-weight: 500;
}

.issue-priority,
.issue-status {
  padding: 0.25rem 0.5rem;
  border-radius: 3px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.priority-high {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.priority-medium {
  background: rgba(251, 146, 60, 0.2);
  color: #fb923c;
}

.priority-low {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
}

.status-todo {
  background: rgba(148, 163, 184, 0.2);
  color: #94a3b8;
}

.status-in_progress {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
}

.status-closed {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
}

.btn-unlink {
  padding: 0.25rem 0.5rem;
  background: transparent;
  color: var(--terminal-fg);
  border: 1px solid var(--terminal-border);
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
}

.btn-unlink:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: #ef4444;
  color: #ef4444;
}

.add-issue-section {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.issue-select {
  flex: 1;
  padding: 0.5rem;
  background: var(--terminal-bg);
  color: var(--terminal-fg);
  border: 1px solid var(--terminal-border);
  border-radius: 4px;
  cursor: pointer;
  transition: border-color 0.2s;
}

.issue-select:focus {
  outline: none;
  border-color: var(--terminal-accent);
}

.btn-link {
  padding: 0.5rem 1rem;
  background: var(--terminal-accent);
  color: var(--terminal-bg);
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-link:hover:not(:disabled) {
  background: var(--terminal-accent-dark);
}

.btn-link:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
