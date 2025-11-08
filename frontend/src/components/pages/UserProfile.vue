<template>
  <div class="user-profile-container">
    <div v-if="loading" class="loading">Chargement...</div>

    <div v-else-if="error" class="message error">{{ error }}</div>

    <div v-else class="user-profile-wrapper">
      <!-- Section Informations Personnelles -->
      <form class="profile-form" @submit.prevent="handleSubmit">
        <h2>Mes Informations</h2>

        <div class="form-group">
          <label for="name">Nom</label>
          <input
            id="name"
            v-model="formData.name"
            type="text"
            placeholder="Votre nom"
            required
          />
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="formData.email"
            type="email"
            placeholder="Votre email"
            disabled
          />
          <small>L'email ne peut pas être modifié</small>
        </div>

        <button type="button" :disabled="updatingInfo" @click="updateUserInfo">
          {{ updatingInfo ? 'Mise à jour...' : 'Mettre à jour' }}
        </button>
        <div v-if="successMessage" class="message success">{{ successMessage }}</div>
      </form>

      <!-- Section Changement de Mot de Passe -->
      <form class="profile-form" @submit.prevent="handleSubmit">
        <h2>Changer le Mot de Passe</h2>

        <div class="form-group">
          <label for="currentPassword">Mot de passe actuel</label>
          <input
            id="currentPassword"
            v-model="passwordData.currentPassword"
            type="password"
            placeholder="Entrez votre mot de passe actuel"
            required
          />
        </div>

        <div class="form-group">
          <label for="newPassword">Nouveau mot de passe</label>
          <input
            id="newPassword"
            v-model="passwordData.newPassword"
            type="password"
            placeholder="Entrez votre nouveau mot de passe"
            required
          />
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirmer le mot de passe</label>
          <input
            id="confirmPassword"
            v-model="passwordData.confirmPassword"
            type="password"
            placeholder="Confirmez votre nouveau mot de passe"
            required
          />
        </div>

        <button type="button" :disabled="changingPassword" @click="changePassword">
          {{ changingPassword ? 'Changement en cours...' : 'Changer le mot de passe' }}
        </button>
        <div v-if="passwordError" class="message error">{{ passwordError }}</div>
        <div v-if="passwordSuccess" class="message success">{{ passwordSuccess }}</div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import userService from '../../services/userService'

interface FormData {
  name: string
  email: string
}

interface PasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

const formData = ref<FormData>({
  name: '',
  email: ''
})

const passwordData = ref<PasswordData>({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const loading = ref(true)
const error = ref('')
const successMessage = ref('')
const passwordError = ref('')
const passwordSuccess = ref('')
const updatingInfo = ref(false)
const changingPassword = ref(false)


/**
 * Retrieves the user ID from localStorage
 * @returns {number} The parsed user ID, or 0 if not found
 */
const getUserId = (): number => {
  const id = localStorage.getItem('userId')
  return id ? parseInt(id) : 0
}

/**
 * Lifecycle hook that runs when the component is mounted.
 * Fetches the user data from the API and populates the form.
 * Sets appropriate error messages if user is not authenticated or if the request fails.
 */
onMounted(async () => {
  try {
    const userId = getUserId()
    if (!userId) {
      error.value = 'Utilisateur non identifié'
      loading.value = false
      return
    }

    const user = await userService.getUser(userId)
    formData.value = {
      name: user.name,
      email: user.email
    }
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value = false
  }
})

/**
 * Updates user information (name).
 * Validates the form, calls the userService to update the user on the backend,
 * and updates localStorage with the new name.
 * Displays a success message that disappears after 3 seconds.
 * @throws {Error} If the update request fails
 */
const updateUserInfo = async () => {
  try {
    updatingInfo.value = true
    successMessage.value = ''
    error.value = ''

    await userService.updateUser({
      email: formData.value.email,
      name: formData.value.name
    })

    localStorage.setItem('userName', formData.value.name)

    successMessage.value = 'Vos informations ont été mises à jour avec succès'
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (err: any) {
    error.value = err.message
  } finally {
    updatingInfo.value = false
  }
}

/**
 * Changes the user's password.
 * Validates that both new password fields match and meet minimum length requirement (8 characters).
 * Calls the userService to change the password on the backend.
 * Clears password input fields on success and displays a success message for 3 seconds.
 * @throws {Error} If validation fails or the password change request fails
 */
const changePassword = async () => {
  try {
    
    if (passwordData.value.newPassword !== passwordData.value.confirmPassword) {
      passwordError.value = 'Les mots de passe ne correspondent pas'
      return
    }

    if (passwordData.value.newPassword.length < 8) {
      passwordError.value = 'Le nouveau mot de passe doit contenir au moins 8 caractères'
      return
    }

    changingPassword.value = true
    passwordError.value = ''
    passwordSuccess.value = ''

    await userService.changePassword({
      email: formData.value.email,
      currentPassword: passwordData.value.currentPassword,
      newPassword: passwordData.value.newPassword
    })

    passwordSuccess.value = 'Votre mot de passe a été changé avec succès'
    passwordData.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }

    setTimeout(() => {
      passwordSuccess.value = ''
    }, 3000)
  } catch (err: any) {
    passwordError.value = err.message
  } finally {
    changingPassword.value = false
  }
}

/**
 * Handles form submission events.
 * Prevents the default form submission behavior.
 * @param {Event} e - The form submission event
 */
const handleSubmit = (e: Event) => {
  e.preventDefault()
}
</script>

<style scoped>
.user-profile-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 1.5rem;
  background: var(--terminal-bg);
}

.user-profile-wrapper {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 500px;
  width: 100%;
}

.profile-form {
  width: 100%;
  padding: 2rem;
  background: var(--terminal-bg);
  border: 1px solid var(--terminal-border);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

h2 {
  margin: 0 0 1.5rem 0;
  color: var(--terminal-fg);
  font-size: 1.5rem;
  font-weight: 600;
}

.form-group {
  margin-bottom: 1.25rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--terminal-fg);
  font-weight: 500;
  font-size: 0.9rem;
}

input {
  width: 100%;
  padding: 0.65rem;
  border: 1px solid var(--terminal-border);
  border-radius: 6px;
  background-color: var(--terminal-bg);
  color: var(--terminal-fg);
  font-size: 0.95rem;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: var(--terminal-accent);
}

input:disabled {
  background-color: rgba(0, 0, 0, 0.1);
  cursor: not-allowed;
  opacity: 0.6;
}

small {
  display: block;
  color: var(--terminal-fg);
  opacity: 0.7;
  font-size: 0.8rem;
  margin-top: 0.4rem;
}

button {
  width: 100%;
  background: var(--terminal-accent);
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  margin-top: 0.5rem;
  transition: background-color 0.2s ease, transform 0.1s ease;
}

button:hover:not(:disabled) {
  background: var(--terminal-accent-dark);
  transform: translateY(-1px);
}

button:active:not(:disabled) {
  transform: translateY(0);
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.message {
  padding: 0.75rem;
  border-radius: 6px;
  margin-top: 1rem;
  font-size: 0.9rem;
}

.message.success {
  background: rgba(187, 154, 247, 0.1);
  border: 1px solid var(--terminal-accent);
  color: var(--terminal-accent);
}

.message.error {
  background: rgba(247, 118, 142, 0.1);
  border: 1px solid var(--terminal-magenta);
  color: var(--terminal-magenta);
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  color: var(--terminal-fg);
  font-size: 1.1rem;
}
</style>
