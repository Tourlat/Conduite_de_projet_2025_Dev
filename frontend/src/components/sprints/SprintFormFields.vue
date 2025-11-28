<template>
  <div>
    <div class="form-group">
      <label for="name">Nom du sprint *</label>
      <input
        id="name"
        :value="name"
        type="text"
        placeholder="Ex: Sprint 1"
        required
        @input="$emit('update:name', ($event.target as HTMLInputElement).value)"
      />
    </div>

    <div class="form-row">
      <div class="form-group">
        <label for="startDate">Date de début *</label>
        <input
          id="startDate"
          :value="startDate"
          type="datetime-local"
          required
          @input="$emit('update:startDate', ($event.target as HTMLInputElement).value)"
        />
      </div>

      <div class="form-group">
        <label for="endDate">Date de fin *</label>
        <input
          id="endDate"
          :value="endDate"
          type="datetime-local"
          required
          @input="$emit('update:endDate', ($event.target as HTMLInputElement).value)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  name: string
  startDate: string
  endDate: string
}

defineProps<Props>()
defineEmits<{
  'update:name': [value: string]
  'update:startDate': [value: string]
  'update:endDate': [value: string]
}>()
</script>

<style scoped>
@import './sprints-shared.css';

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
