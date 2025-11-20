import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { authStore } from '../stores/authStore'

const routes: RouteRecordRaw[] = [
  {
    path: '/auth',
    name: 'Auth',
    component: () => import('@/components/AuthInterface.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/components/auth/LoginForm.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/components/auth/RegisterForm.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/components/pages/DashBoard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/projects',
    name: 'Projects',
    component: () => import('@/components/projects/CreateProjectForm.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/projects/:id',
    name: 'ProjectDetails',
    component: () => import('@/components/pages/ProjectDetails.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/projects/:id/backlog',
    name: 'ProjectBacklog',
    component: () => import('@/components/pages/ProjectBacklog.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/projects/:id/sprints',
    name: 'ProjectSprints',
    component: () => import('@/components/pages/ProjectSprints.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/projects/:id/sprints/:sprintId',
    name: 'SprintDetails',
    component: () => import('@/components/pages/SprintDetails.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/projects/:id/releases',
    name: 'ProjectReleases',
    component: () => import('@/components/pages/ProjectReleases.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'UserProfile',
    component: () => import('@/components/pages/UserProfile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/',
    redirect: () => {
      return authStore.isLoggedIn() ? '/dashboard' : '/auth'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

/**
 * Garde de navigation global.
 * Vérifie si l'utilisateur est authentifié avant d'accéder aux routes protégées.
 */
router.beforeEach((to, _from, next) => {
  const isAuthenticated = authStore.isLoggedIn()

  // Redirection vers /auth si la route nécessite une authentification et que l'utilisateur n'est pas connecté
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/auth')
  } 
  // Redirection vers /dashboard si l'utilisateur est déjà connecté et tente d'accéder à /auth
  else if (!to.meta.requiresAuth && isAuthenticated && to.path === '/auth') {
    next('/dashboard')
  } else {
    next()
  }
})

export default router