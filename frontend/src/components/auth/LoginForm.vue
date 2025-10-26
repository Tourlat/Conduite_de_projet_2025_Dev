<template>
  <form @submit.prevent="handleSubmit">
    <h2>Connexion</h2>
    
    <div v-if="message" :class="['message', message.type]">{{ message.text }}</div>
    
    <div class="form-group">
      <label for="email">Email</label>
      <input 
        id="email"
        v-model="formData.email"
        type="email" 
        name="email"
        :class="{ error: errors.email }"
      />
      <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
    </div>

    <div class="form-group">
      <label for="password">Mot de passe</label>
      <input 
        id="password"
        v-model="formData.password"
        type="password" 
        name="password"
        :class="{ error: errors.password }"
      />
      <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
    </div>

    <button type="submit">Se connecter</button>
    
    <p class="signup-link">
      Pas encore de compte ? <a href="#" @click.prevent="$emit('switchToRegister')">Créer un compte</a>
    </p>
  </form>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { authStore } from '../../stores/authStore'

interface FormData {
  email: string
  password: string
}

interface Errors {
  email?: string
  password?: string
}

interface Message {
  text: string
  type: 'success' | 'error'
}

const emit = defineEmits<{
  switchToRegister: []
  loginSuccess: [token: string]
}>()

const formData = reactive<FormData>({
  email: '',
  password: ''
})

const errors = reactive<Errors>({})
const message = ref<Message | null>(null)

const validateForm = (): boolean => {
  errors.email = undefined
  errors.password = undefined

  if (!formData.email) {
    errors.email = 'L\'email est requis'
    return false
  }

  if (!formData.password) {
    errors.password = 'Le mot de passe est requis'
    return false
  }

  return true
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  message.value = null

  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
    
    if (response.ok) {
      const result = await response.json()
      
      authStore.login(result.token, result.user)
      emit('loginSuccess', result.token)
      
      message.value = { text: 'Connexion réussie ! Redirection...', type: 'success' }
      
      // Redirection vers le dashboard après connexion réussie
    } else {
      // Gestion des erreurs spécifiques
      if (response.status === 401) {
        errors.email = 'Email ou mot de passe incorrect'
        errors.password = ' '
      } else {
        const error = await response.json()
        message.value = { text: error.message || 'Une erreur est survenue lors de la connexion', type: 'error' }
      }
    }
  } catch (error) {
    console.error('Erreur de connexion:', error)
    message.value = { text: 'Erreur réseau. Veuillez vérifier votre connexion internet.', type: 'error' }
  }
}
</script>

<style scoped>
form {
  width: 100%;
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
}

input:focus {
  outline: none;
  border-color: var(--terminal-accent);
}

input.error {
  border-color: var(--terminal-error);
}

.error-message {
  color: var(--terminal-error);
  font-size: 0.85rem;
  margin-top: 0.4rem;
  display: block;
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

button:hover {
  background: var(--terminal-accent-dark);
  transform: translateY(-1px);
}

button:active {
  transform: translateY(0);
}

.signup-link {
  margin-top: 1.25rem;
  text-align: center;
  color: var(--terminal-fg);
  font-size: 0.9rem;
  opacity: 0.8;
}

.signup-link a {
  color: var(--terminal-accent);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.signup-link a:hover {
  color: var(--terminal-magenta);
}

.message {
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.message.success {
  background: rgba(187, 154, 247, 0.1);
  border: 1px solid var(--terminal-accent);
  color: var(--terminal-accent);
}

.message.error {
  background: rgba(247, 118, 142, 0.1);
  border: 1px solid var(--terminal-error);
  color: var(--terminal-error);
}
</style>
