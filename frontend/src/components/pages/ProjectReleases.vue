<template>
  <div class="releases-container">
    <div class="releases-content">
      <div class="releases-header">
        <button class="btn-back" @click="goBack">
          <font-awesome-icon :icon="['fas', 'arrow-left']" /> Retour au projet
        </button>
        <h1>Releases - {{ projectName }}</h1>
        <button class="btn-create" @click="showCreateModal = true">
          + Créer une release
        </button>
      </div>

      <div v-if="loading" class="loading">
        Chargement des releases...
      </div>

      <div v-else-if="error" class="error-message">
        {{ error }}
      </div>

      <div v-else>
        <div v-if="releases.length === 0" class="empty-state">
          <div class="empty-icon">📦</div>
          <h2>Aucune release</h2>
          <p>Créez votre première release pour marquer une version de votre projet</p>
          <button class="btn-create-empty" @click="showCreateModal = true">
            Créer une release
          </button>
        </div>

        <div v-else class="releases-list">
          <div class="releases-count">
            {{ releases.length }} release(s)
          </div>
          <ReleaseCard
            v-for="release in releases"
            :key="release.id"
            :release="release"
            @click="handleReleaseClick"
          />
        </div>
      </div>
    </div>

    <CreateReleaseForm
      v-if="showCreateModal"
      :project-id="projectId"
      @close="showCreateModal = false"
      @created="handleReleaseCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import ReleaseCard from '../releases/ReleaseCard.vue'
import CreateReleaseForm from '../releases/CreateReleaseForm.vue'
import releaseStore from '../../stores/releaseStore'
import projectService from '../../services/projectService'

const route = useRoute()
const router = useRouter()

const projectId = route.params.id as string
const projectName = ref<string>('')
const showCreateModal = ref(false)

const releases = computed(() => releaseStore.state.releases)
const loading = computed(() => releaseStore.state.loading)
const error = computed(() => releaseStore.state.error)

const loadReleases = async () => {
  await releaseStore.getReleases(projectId)
}

const loadProject = async () => {
  try {
    const projects = await projectService.getProjects()
    const project = projects.find(p => p.id === projectId)
    if (project) {
      projectName.value = project.name
    }
  } catch {
    // Erreur gérée silencieusement
  }
}

const handleReleaseCreated = async () => {
  showCreateModal.value = false
  await loadReleases()
}

const handleReleaseClick = () => {
  // Pour l'instant, ne fait rien, mais on pourrait ouvrir un modal de détails
}

const goBack = () => {
  router.push(`/projects/${projectId}`)
}

onMounted(() => {
  loadProject()
  loadReleases()
})
</script>

<style scoped>
.releases-container {
  min-height: 100vh;
  background: var(--terminal-bg);
  color: var(--terminal-fg);
}

.releases-content {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.releases-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.releases-header h1 {
  color: var(--terminal-accent);
  font-size: 2rem;
  margin: 0;
  flex: 1;
}

.btn-back {
  background: transparent;
  border: 2px solid rgba(187, 154, 247, 0.3);
  color: var(--terminal-fg);
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-back:hover {
  border-color: var(--terminal-accent);
  background: rgba(187, 154, 247, 0.1);
}

.btn-create,
.btn-create-empty {
  background: var(--terminal-accent);
  color: var(--terminal-bg);
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-create:hover,
.btn-create-empty:hover {
  background: #9d7cd8;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(187, 154, 247, 0.3);
}

.loading {
  text-align: center;
  padding: 3rem;
  color: var(--terminal-fg);
  font-size: 1.1rem;
}

.error-message {
  background: rgba(244, 67, 54, 0.15);
  border: 1px solid #f44336;
  color: #f44336;
  padding: 1rem;
  border-radius: 4px;
  text-align: center;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: rgba(187, 154, 247, 0.05);
  border: 2px dashed var(--terminal-border);
  border-radius: 8px;
  margin-top: 2rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h2 {
  color: var(--terminal-accent);
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
}

.empty-state p {
  color: var(--terminal-fg);
  opacity: 0.7;
  margin: 0 0 2rem 0;
}

.releases-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.releases-count {
  color: var(--terminal-fg);
  opacity: 0.7;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

@media (max-width: 768px) {
  .releases-header {
    flex-direction: column;
    align-items: stretch;
  }

  .releases-header h1 {
    order: -1;
    text-align: center;
  }

  .btn-back,
  .btn-create {
    width: 100%;
    justify-content: center;
  }

  .releases-content {
    padding: 1rem;
  }
}
</style>
