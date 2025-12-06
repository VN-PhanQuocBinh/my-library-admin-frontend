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
    title: 'Trang chủ',
    path: '/dashboard/home',
    icon: 'pi-home',
  },
  {
    title: 'Người dùng',
    path: '/dashboard/user',
    icon: 'pi-user',
  },
  {
    title: 'Sách',
    path: '/dashboard/book',
    icon: 'pi-book',
  },
  {
    title: 'Nhà xuất bản',
    path: '/dashboard/publisher',
    icon: 'pi-building',
  },
  {
    title: 'Mượn sách',
    path: '/dashboard/borrowings',
    icon: 'pi-list-check',
  },
]
</script>

<template>
  <div :class="`flex flex-col gap-2.5 ${props.class}`">
    <router-link v-for="value in items" :key="value.title" :to="value.path">
      <NavItem :title="value.title" :icon="value.icon" :active="value.path === $route.path" />
    </router-link>
  </div>
</template>
