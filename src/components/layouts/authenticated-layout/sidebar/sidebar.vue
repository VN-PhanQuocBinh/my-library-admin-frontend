<script setup lang="ts">
// Layout Components
import { ref } from 'vue'

import SidebarHeader from './sidebar-header.vue'
import SidebarNavbar from './sidebar-navbar.vue'
import SidebarFooter from './sidebar-footer.vue'

// Composables
import { useAuthStore } from '@/stores/auth'

const collapse = ref<boolean>(false)

const toggleCollapse = () => {
  collapse.value = !collapse.value
}
</script>

<template>
  <div
    id="sidebar"
    :class="`${collapse ? 'w-[72px]' : 'w-[240px]'} transition-all duration-300 h-full flex flex-col gap-2.5 bg-(--my-secondary-color) p-4`"
  >
    <SidebarHeader :toggleCollapse="toggleCollapse" :collapse />
    <SidebarNavbar class="flex-1" />
    <SidebarFooter />
  </div>
</template>
