<template>
  <div class="projects-grid">
    <ProjectCard
      v-for="project in projects"
      :key="project.id"
      :project="project"
      :is-creator="isCreator(project)"
      @click="handleProjectClick"
    />
  </div>
</template>

<script setup lang="ts">
import ProjectCard from './ProjectCard.vue'

interface Creator {
  id: number
  email: string
  name: string
}

interface Project {
  id: string
  name: string
  description?: string
  createdAt?: string
  creator?: Creator
}

const props = defineProps<{
  projects: Project[]
  currentUserId: number
}>()

const emit = defineEmits<{
  'project-click': [project: Project]
}>()

const isCreator = (project: Project) => {
  return project.creator?.id === props.currentUserId
}

const handleProjectClick = (project: Project) => {
  emit('project-click', project)
}
</script>

<style scoped>
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}
</style>
