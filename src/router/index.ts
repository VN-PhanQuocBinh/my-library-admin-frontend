import DefaultLayout from '@/layouts/default-layout.vue'
import authenticatedLayout from '@/layouts/authenticated-layout.vue'
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes: Array<RouteRecordRaw> = [
   {
      path: '/',
      name: 'login',
      component: () => import('@/pages/auth/login.vue'),
      meta: { layout: DefaultLayout },
   },
   // {
   //    path: '/login',
   //    name: 'login',
   //    component: () => import('@/pages/auth/login.vue'),
   //    meta: { layout: DefaultLayout },
   // },
   {
      path: '/register',
      name: 'register',
      component: () => import('@/pages/auth/register.vue'),
      meta: { layout: DefaultLayout },
   },
   {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/pages/dashboard/dashboard.vue'),
      meta: { layout: authenticatedLayout, requireAuth: true },
      children: [
         {
            path: 'book',
            name: 'book',
            component: () => import('@/pages/dashboard/book.vue'),
            meta: { title: 'Book' },
         },
         {
            path: 'publisher',
            name: 'publisher',
            component: () => import('@/pages/dashboard/publisher.vue'),
            meta: { title: 'Publisher' },
         },
         {
            path: 'borrowing-registration',
            name: 'borrowing-registration',
            component: () => import('@/pages/dashboard/borrowing-registration.vue'),
            meta: { title: 'Borrowing Registration' },
         },
      ],
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

router.beforeEach((to, from, next) => {
   const { isAuthenticated } = useAuthStore()

   if (isAuthenticated && (to.name === 'login' || to.name === 'register')) {
      next({ name: 'dashboard' })
   } else if (to.meta.requireAuth && !isAuthenticated) {
      next({ name: 'login' })
   } else {
      next()
   }
})

export default router
