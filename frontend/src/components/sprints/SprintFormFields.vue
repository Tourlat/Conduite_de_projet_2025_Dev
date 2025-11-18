<template>
  <div>
    <div class="form-group">
      <label for="name">Nom du sprint *</label>
      <input
        id="name"
        :value="name"
        @input="$emit('update:name', ($event.target as HTMLInputElement).value)"
        type="text"
        placeholder="Ex: Sprint 1"
        required
      />
    </div>

    <div class="form-row">
      <div class="form-group">
        <label for="startDate">Date de début *</label>
        <input
          id="startDate"
          :value="startDate"
          @input="$emit('update:startDate', ($event.target as HTMLInputElement).value)"
          type="datetime-local"
          required
        />
      </div>

      <div class="form-group">
        <label for="endDate">Date de fin *</label>
        <input
          id="endDate"
          :value="endDate"
          @input="$emit('update:endDate', ($event.target as HTMLInputElement).value)"
          type="datetime-local"
          required
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
