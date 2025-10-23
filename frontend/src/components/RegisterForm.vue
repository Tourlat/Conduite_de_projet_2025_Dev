<template>
  <form @submit.prevent="handleSubmit">
    <h2>Créer un compte</h2>
    
    <div class="form-group">
      <label for="nom">Nom</label>
      <input 
        id="nom"
        v-model="formData.nom"
        type="text" 
        name="nom"
        :class="{ error: errors.nom }"
      />
      <span v-if="errors.nom" class="error-message">{{ errors.nom }}</span>
    </div>

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

    <div class="form-group">
      <label for="confirmPassword">Confirmer le mot de passe</label>
      <input 
        id="confirmPassword"
        v-model="formData.confirmPassword"
        type="password" 
        name="confirmPassword"
        :class="{ error: errors.confirmPassword }"
      />
      <span v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</span>
    </div>

    <button type="submit">S'inscrire</button>
  </form>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

interface FormData {
  nom: string
  email: string
  password: string
  confirmPassword: string
}

interface Errors {
  nom?: string
  email?: string
  password?: string
  confirmPassword?: string
}

const emit = defineEmits<{
  register: [data: Omit<FormData, 'confirmPassword'>]
}>()

const formData = reactive<FormData>({
  nom: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const errors = reactive<Errors>({})

const validateForm = (): boolean => {
  errors.nom = undefined
  errors.email = undefined
  errors.password = undefined
  errors.confirmPassword = undefined

  if (!formData.nom) {
    errors.nom = 'Le nom est requis'
    return false
  }

  if (!formData.email) {
    errors.email = 'L\'email est requis'
    return false
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(formData.email)) {
    errors.email = 'Format d\'email invalide'
    return false
  }

  if (!formData.password) {
    errors.password = 'Le mot de passe est requis'
    return false
  }

  if (formData.password.length < 8) {
    errors.password = 'Le mot de passe doit contenir au moins 8 caractères'
    return false
  }

  if (!formData.confirmPassword) {
    errors.confirmPassword = 'Veuillez confirmer votre mot de passe'
    return false
  }

  if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Les mots de passe ne correspondent pas'
    return false
  }

  return true
}

const handleSubmit = () => {
  if (validateForm()) {
    const { confirmPassword, ...dataToSend } = formData
    emit('register', { ...dataToSend })
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
</style>
