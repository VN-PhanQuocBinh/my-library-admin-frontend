import DefaultLayout from '@/layouts/default-layout.vue'
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
   {
      path: '/',
      name: 'home',
      component: () => import('@/pages/home-page.vue'),
      meta: { layout: DefaultLayout },
   },
   {
      path: '/login',
      name: 'login',
      component: () => import('@/pages/auth/login.vue'),
      meta: { layout: DefaultLayout },
   },
   {
      path: '/register',
      name: 'register',
      component: () => import('@/pages/auth/register.vue'),
      meta: { layout: DefaultLayout },
   },
   {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/pages/not-found.vue'),
      meta: { layout: DefaultLayout },
   },
]

const router = createRouter({
   history: createWebHistory(import.meta.env.BASE_URL),
   routes,
})

export default router
