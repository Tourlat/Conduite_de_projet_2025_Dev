import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { authStore } from '../stores/authStore'

/**
 * Application routes definition.
 * Each route is associated with a component and can have metadata (like requiresAuth).
 */
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
    path: '/projects/:id/docs',
    name: 'ProjectDocumentation',
    component: () => import('@/components/documentation/DocumentationList.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/projects/:id/issues/:issueId/tests',
    name: 'IssueTests',
    component: () => import('@/components/testView/TestPlayground.vue'),
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

/**
 * Vue Router instance.
 * Uses HTML5 history mode.
 */
const router = createRouter({
  history: createWebHistory(),
  routes
})

/**
 * Global navigation guard.
 * Checks if the user is authenticated before accessing protected routes.
 * @param to - The target route
 * @param from - The current route
 * @param next - Function to resolve the hook
 */
router.beforeEach((to, _from, next) => {
  const isAuthenticated = authStore.isLoggedIn()

  // Redirect to /auth if the route requires authentication and the user is not logged in
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/auth')
  } 
  // Redirect to /dashboard if the user is already logged in and tries to access /auth
  else if (!to.meta.requiresAuth && isAuthenticated && to.path === '/auth') {
    next('/dashboard')
  } else {
    next()
  }
})

export default router