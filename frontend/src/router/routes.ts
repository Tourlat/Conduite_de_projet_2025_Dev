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


router.beforeEach((to, _from, next) => {
  const isAuthenticated = authStore.isLoggedIn()

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/auth')
  } else if (!to.meta.requiresAuth && isAuthenticated && to.path === '/auth') {
    next('/dashboard')
  } else {
    next()
  }
})

export default router