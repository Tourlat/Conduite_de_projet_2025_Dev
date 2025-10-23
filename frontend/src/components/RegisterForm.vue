<template>
  <form @submit.prevent="handleSubmit">
    <h2>Créer un compte</h2>
    
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
      <label for="username">Nom d'utilisateur</label>
      <input 
        id="username"
        v-model="formData.username"
        type="text" 
        name="username"
        :class="{ error: errors.username }"
      />
      <span v-if="errors.username" class="error-message">{{ errors.username }}</span>
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

    <button type="submit">S'inscrire</button>
  </form>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

interface FormData {
  email: string
  username: string
  password: string
}

interface Errors {
  email?: string
  username?: string
  password?: string
}

const emit = defineEmits<{
  register: [data: FormData]
}>()

const formData = reactive<FormData>({
  email: '',
  username: '',
  password: ''
})

const errors = reactive<Errors>({})

const validateForm = (): boolean => {
  errors.email = undefined
  errors.username = undefined
  errors.password = undefined

  if (!formData.email) {
    errors.email = 'L\'email est requis'
    return false
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(formData.email)) {
    errors.email = 'Format d\'email invalide'
    return false
  }

  if (!formData.username) {
    errors.username = 'Le nom d\'utilisateur est requis'
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

  return true
}

const handleSubmit = () => {
  if (validateForm()) {
    emit('register', { ...formData })
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
  font-size: 1.75rem;
  font-weight: 700;
  position: relative;
  padding-left: 1.5rem;
}

h2::before {
  content: '>';
  position: absolute;
  left: 0;
  color: var(--terminal-accent);
  font-weight: bold;
  animation: blink 1.5s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0.3; }
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--terminal-fg);
  font-weight: 600;
  font-size: 0.9rem;
  font-family: 'Fira Code', monospace;
}

label::before {
  content: '$ ';
  color: var(--terminal-accent);
  font-weight: bold;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid var(--terminal-border);
  border-radius: 4px;
  background-color: rgba(0, 0, 0, 0.3);
  color: var(--terminal-fg);
  font-size: 1rem;
  font-family: 'Fira Code', monospace;
  transition: all 0.3s ease;
}

input:focus {
  outline: none;
  border-color: var(--terminal-accent);
  box-shadow: 0 0 0 3px var(--terminal-shadow);
  background-color: rgba(0, 0, 0, 0.4);
}

input.error {
  border-color: var(--terminal-error);
  animation: shake 0.3s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.error-message {
  color: var(--terminal-error);
  font-size: 0.875rem;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Fira Code', monospace;
}

.error-message::before {
  content: '✗';
  font-weight: bold;
}

button {
  width: 100%;
  background: linear-gradient(135deg, var(--terminal-accent) 0%, var(--terminal-magenta) 100%);
  color: #ffffff;
  padding: 0.875rem 1.5rem;
  border: 2px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  font-family: 'Fira Code', monospace;
  margin-top: 1rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

button::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

button:hover::before {
  width: 300px;
  height: 300px;
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px var(--terminal-shadow);
  border-color: var(--terminal-accent);
}

button:active {
  transform: translateY(0);
}
</style>
