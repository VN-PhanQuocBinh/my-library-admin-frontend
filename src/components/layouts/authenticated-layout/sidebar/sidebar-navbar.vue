<script setup lang="ts">
import { de } from 'zod/locales'
import NavItem from './nav-item.vue'
import { defineProps } from 'vue'

const props = defineProps({
   class: {
      type: String,
      default: '',
   },
})

const items = [
   {
      title: 'Book',
      path: '/dashboard/book',
      icon: 'book',
   },
   {
      title: 'Publisher',
      path: '/dashboard/publisher',
      icon: 'publisher',
   },
   {
      title: 'Borrowing registration',
      path: '/dashboard/borrowing-registration',
      icon: 'borrowing-registration',
   },
]
</script>

<template>
   <div :class="`flex flex-col gap-1.5 ${props.class}`">
      <router-link v-for="value in items" :key="value.title" :to="value.path">
         <NavItem :title="value.title" :icon="value.icon" :active="value.path === $route.path" />
      </router-link>
   </div>
</template>
