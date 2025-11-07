<template>
  <div class="project-members">
    <h3>Gestion des membres</h3>

    <div v-if="message" :class="['message', message.type]">{{ message.text }}</div>

    <div class="add-member-section">
      <label for="newMember">Ajouter un membre</label>
      
      <div class="autocomplete">
        <input
          id="newMember"
          v-model="searchInput"
          type="text"
          placeholder="Rechercher un utilisateur par email"
          @input="filterUsers"
          @focus="showSuggestions = true"
        />
        
        <ul v-if="showSuggestions && filteredUsers.length" class="suggestions">
          <li
            v-for="user in filteredUsers"
            :key="user.id"
            @click="selectUser(user)"
          >
            {{ user.email }} <span class="user-name">{{ user.name }}</span>
          </li>
        </ul>
        <div v-if="showSuggestions && searchInput && !filteredUsers.length" class="no-results">
          Aucun utilisateur trouvé
        </div>
      </div>
    </div>

    <div class="members-list">
      <h4>Membres du projet ({{ members.length }})</h4>
      
      <div v-if="loading" class="loading">Chargement...</div>
      
      <ul v-else-if="members.length" class="member-items">
        <li v-for="member in members" :key="member.id" class="member-item">
          <div class="member-info">
            <span class="member-email">{{ member.email }}</span>
            <span class="member-name">{{ member.name }}</span>
            <span v-if="member.id === creatorId" class="badge creator-badge">Créateur</span>
          </div>
          <button
            v-if="isOwner && member.id !== creatorId"
            type="button"
            class="btn-remove"
            @click="removeMember(member.id)"
          >
            Retirer
          </button>
        </li>
      </ul>
      
      <div v-else class="no-members">
        Aucun membre dans ce projet
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { projectStore } from '../../stores/projectStore'

interface User {
  id: number
  email: string
  name: string
}

interface Member extends User {
  // Membres du projet
}

interface Message {
  text: string
  type: 'success' | 'error'
}

const props = defineProps<{
  projectId: string
  creatorId: number
  isOwner: boolean
}>()

const emit = defineEmits<{
  membersUpdated: []
}>()

const members = ref<Member[]>([])
const allUsers = ref<User[]>([])
const searchInput = ref('')
const showSuggestions = ref(false)
const loading = ref(false)
const message = ref<Message | null>(null)

const filteredUsers = computed(() => {
  if (!searchInput.value) return []
  
  const query = searchInput.value.toLowerCase()
  const memberIds = new Set(members.value.map(m => m.id))
  
  return allUsers.value
    .filter(user => !memberIds.has(user.id)) // Exclure les membres existants
    .filter(user => user.email.toLowerCase().startsWith(query))
    .slice(0, 5) // Limiter à 5 suggestions
})

const filterUsers = () => {
  showSuggestions.value = true
}

const selectUser = async (user: User) => {
  searchInput.value = ''
  showSuggestions.value = false
  await addCollaborator(user.email)
}

const addCollaborator = async (userEmail: string) => {
  try {
    loading.value = true
    message.value = null

    const updatedMembers = await projectStore.addProjectCollaborators(props.projectId, [userEmail])
    
    members.value = updatedMembers
    
    message.value = {
      text: 'Collaborateur ajouté avec succès',
      type: 'success'
    }

    emit('membersUpdated')
    
    setTimeout(() => {
      message.value = null
    }, 3000)
  } catch (error) {
    message.value = {
      text: error instanceof Error ? error.message : 'Erreur lors de l\'ajout du collaborateur',
      type: 'error'
    }
  } finally {
    loading.value = false
  }
}

const removeMember = async (userId: number) => {
  if (!confirm('Êtes-vous sûr de vouloir retirer ce collaborateur ?')) {
    return
  }

  try {
    loading.value = true
    message.value = null

    const updatedMembers = await projectStore.removeProjectCollaborator(props.projectId, userId)
    
    members.value = updatedMembers
    
    message.value = {
      text: 'Collaborateur retiré avec succès',
      type: 'success'
    }

    emit('membersUpdated')
    
    setTimeout(() => {
      message.value = null
    }, 3000)
  } catch (error) {
    message.value = {
      text: error instanceof Error ? error.message : 'Erreur lors de la suppression du collaborateur',
      type: 'error'
    }
  } finally {
    loading.value = false
  }
}

const fetchMembers = async () => {
  try {
    loading.value = true
    const data = await projectStore.getProjectCollaborators(props.projectId)
    members.value = data
  } catch (error) {
    message.value = {
      text: error instanceof Error ? error.message : 'Erreur lors du chargement des collaborateurs',
      type: 'error'
    }
  } finally {
    loading.value = false
  }
}

const fetchAllUsers = async () => {
  try {
    let users = projectStore.state.users
    
    if (!users || users.length === 0) {
      users = await projectStore.getUsers()
    }
    
    allUsers.value = [...users]
  } catch (error) {
    console.error('Erreur lors du chargement des utilisateurs:', error)
  }
}

// Fermer les suggestions en cliquant ailleurs
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.autocomplete')) {
    showSuggestions.value = false
  }
}

onMounted(async () => {
  await Promise.all([fetchMembers(), fetchAllUsers()])
  document.addEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.project-members {
  padding: 2rem;
  background-color: var(--terminal-bg);
  border: 2px solid var(--terminal-border);
  border-radius: 4px;
}

h3 {
  color: var(--terminal-accent);
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

h4 {
  color: var(--terminal-text);
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.message {
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 4px;
  font-weight: 500;
}

.message.success {
  background-color: rgba(187, 154, 247, 0.1);
  color: var(--terminal-accent);
  border: 1px solid var(--terminal-accent);
}

.message.error {
  background-color: rgba(247, 118, 142, 0.1);
  color: var(--terminal-magenta);
  border: 1px solid var(--terminal-magenta);
}

.add-member-section {
  margin-bottom: 2rem;
}

.add-member-section label {
  display: block;
  color: var(--terminal-text);
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.autocomplete {
  position: relative;
  width: 100%;
}

.autocomplete input {
  width: 100%;
  padding: 0.75rem;
  background-color: rgba(187, 154, 247, 0.03);
  border: 2px solid var(--terminal-border);
  color: var(--terminal-text);
  font-family: 'Courier New', monospace;
  font-size: 1rem;
  border-radius: 4px;
}

.autocomplete input:focus {
  outline: none;
  border-color: var(--terminal-accent);
  background-color: rgba(187, 154, 247, 0.08);
}

.suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: var(--terminal-bg);
  border: 2px solid var(--terminal-accent);
  border-top: none;
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
}

.suggestions li {
  padding: 0.75rem;
  cursor: pointer;
  color: var(--terminal-text);
  border-bottom: 1px solid var(--terminal-border);
}

.suggestions li:last-child {
  border-bottom: none;
}

.suggestions li:hover,
.suggestions li:focus {
  background-color: rgba(187, 154, 247, 0.1);
}

.user-name {
  color: var(--terminal-accent);
  margin-left: 0.5rem;
  font-style: italic;
}

.no-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: var(--terminal-bg);
  border: 2px solid var(--terminal-border);
  border-top: none;
  padding: 0.75rem;
  color: var(--terminal-text);
  font-style: italic;
}

.members-list {
  margin-top: 2rem;
}

.loading {
  color: var(--terminal-accent);
  text-align: center;
  padding: 1rem;
}

.member-items {
  list-style: none;
  padding: 0;
  margin: 0;
}

.member-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  margin-bottom: 0.5rem;
  background-color: rgba(187, 154, 247, 0.03);
  border: 1px solid var(--terminal-border);
  border-radius: 4px;
}

.member-item:hover {
  background-color: rgba(187, 154, 247, 0.08);
}

.member-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.member-email {
  color: var(--terminal-text);
  font-weight: 500;
}

.member-name {
  color: var(--terminal-accent);
  font-style: italic;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 500;
}

.creator-badge {
  background-color: rgba(187, 154, 247, 0.15);
  color: var(--terminal-accent);
  border: 1px solid var(--terminal-accent);
}

.btn-remove {
  padding: 0.5rem 1rem;
  background-color: transparent;
  color: var(--terminal-magenta);
  border: 2px solid var(--terminal-magenta);
  border-radius: 4px;
  cursor: pointer;
  font-family: 'Courier New', monospace;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-remove:hover {
  background-color: rgba(247, 118, 142, 0.1);
  transform: translateY(-2px);
}

.no-members {
  color: var(--terminal-text);
  text-align: center;
  padding: 2rem;
  font-style: italic;
}
</style>
