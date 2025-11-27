<template>
  <div ref="dropdownRef" class="status-dropdown">
    <button 
      class="status-button"
      :class="`status-${currentStatus.toLowerCase()}`"
      :disabled="disabled"
      @click="toggleDropdown"
    >
      <span>{{ getStatusLabel(currentStatus) }}</span>
      <svg 
        class="chevron" 
        :class="{ open: isOpen }"
        width="16" 
        height="16" 
        viewBox="0 0 16 16" 
        fill="none"
      >
        <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </button>

    <div v-if="isOpen" class="dropdown-menu">
      <button 
        v-for="status in statuses"
        :key="status.value"
        class="dropdown-item"
        :class="{ active: status.value === currentStatus }"
        @click="selectStatus(status.value)"
      >
        <span class="status-dot" :class="`status-${status.value.toLowerCase()}`"></span>
        <span>{{ status.label }}</span>
        <svg 
          v-if="status.value === currentStatus"
          class="check-icon"
          width="16" 
          height="16" 
          viewBox="0 0 16 16" 
          fill="none"
        >
          <path d="M3 8L6.5 11.5L13 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface StatusDropdownProps {
  modelValue: 'TODO' | 'IN_PROGRESS' | 'CLOSED'
  disabled?: boolean
}

const props = withDefaults(defineProps<StatusDropdownProps>(), {
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: 'TODO' | 'IN_PROGRESS' | 'CLOSED']
  'change': [value: 'TODO' | 'IN_PROGRESS' | 'CLOSED']
}>()

const currentStatus = ref(props.modelValue)
const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const statuses = [
  { value: 'TODO' as const, label: 'À faire' },
  { value: 'IN_PROGRESS' as const, label: 'En cours' },
  { value: 'CLOSED' as const, label: 'Fermé' }
]

const getStatusLabel = (status: string): string => {
  const statusObj = statuses.find(s => s.value === status)
  return statusObj?.label || status
}

const toggleDropdown = () => {
  if (!props.disabled) {
    isOpen.value = !isOpen.value
  }
}

const selectStatus = (status: 'TODO' | 'IN_PROGRESS' | 'CLOSED') => {
  if (status !== currentStatus.value) {
    currentStatus.value = status
    emit('update:modelValue', status)
    emit('change', status)
  }
  isOpen.value = false
}

const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.status-dropdown {
  position: relative;
  display: inline-block;
}

.status-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--terminal-border);
  border-radius: 4px;
  background: rgba(192, 202, 245, 0.05);
  color: var(--terminal-fg);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.status-button:hover:not(:disabled) {
  background: rgba(187, 154, 247, 0.1);
  border-color: var(--terminal-accent);
}

.status-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.status-button.status-todo {
  border-color: rgba(157, 124, 216, 0.3);
  background: rgba(157, 124, 216, 0.1);
  color: var(--terminal-accent-dark);
}

.status-button.status-in_progress {
  border-color: rgba(187, 154, 247, 0.3);
  background: rgba(187, 154, 247, 0.1);
  color: var(--terminal-accent);
}

.status-button.status-closed {
  border-color: rgba(192, 202, 245, 0.3);
  background: rgba(192, 202, 245, 0.1);
  color: var(--terminal-fg);
}

.chevron {
  transition: transform 0.2s;
}

.chevron.open {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  min-width: 200px;
  background: var(--terminal-bg);
  border: 1px solid var(--terminal-border);
  border-radius: 4px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  z-index: 100;
  overflow: hidden;
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  color: var(--terminal-fg);
  font-size: 0.9rem;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s;
}

.dropdown-item:hover {
  background: rgba(187, 154, 247, 0.1);
}

.dropdown-item.active {
  background: rgba(187, 154, 247, 0.15);
  color: var(--terminal-accent);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-dot.status-todo {
  background: var(--terminal-accent-dark);
}

.status-dot.status-in_progress {
  background: var(--terminal-accent);
}

.status-dot.status-closed {
  background: var(--terminal-fg);
}

.check-icon {
  margin-left: auto;
  color: var(--terminal-accent);
}
</style>
