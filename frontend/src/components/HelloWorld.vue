<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const message = ref('');

onMounted(async () => {
  try {
    const response = await axios.get('/api/hello'); 
    message.value = response.data;
  } catch (err) {
    message.value = 'Erreur de connexion au backend';
    console.error(err);
  }
});
</script>

<template>
  <div>
    <h1>{{ message }}</h1>
  </div>
</template>
