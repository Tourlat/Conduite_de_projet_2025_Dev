<template>
  <form @submit.prevent="handleSubmit">
    <h2>Connexion</h2>
    
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
      Pas encore de compte ? <a href="/inscription">Créer un compte</a>
    </p>
  </form>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

interface FormData {
  email: string
  password: string
}

interface Errors {
  email?: string
  password?: string
}

const emit = defineEmits<{
  login: [data: FormData]
}>()

const formData = reactive<FormData>({
  email: '',
  password: ''
})

const errors = reactive<Errors>({})

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

const handleSubmit = () => {
  if (validateForm()) {
    emit('login', { ...formData })
  }
}
</script>

<style scoped>
.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
}

input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

input.error {
  border-color: red;
}

.error-message {
  color: red;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: block;
}

button {
  background-color: #42b983;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #35a372;
}

.signup-link {
  margin-top: 1rem;
  text-align: center;
}

.signup-link a {
  color: #42b983;
  text-decoration: none;
}

.signup-link a:hover {
  text-decoration: underline;
}
</style>
