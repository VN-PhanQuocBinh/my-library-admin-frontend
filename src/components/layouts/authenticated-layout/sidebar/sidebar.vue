<script setup lang="ts">
// Layout Components
import SidebarHeader from './sidebar-header.vue'
import SidebarNavbar from './sidebar-navbar.vue'
import SidebarFooter from './sidebar-footer.vue'

// Composables
import { useAuthStore } from '@/stores/auth'
</script>

<template>
   <div id="sidebar" class="w-[300px] h-full flex flex-col gap-2.5 bg-(--my-secondary-color) p-4">
      <SidebarHeader />
      <div class="w-full h-[0.5px] bg-white"></div>
      <SidebarNavbar class="flex-1" />
      <SidebarFooter />
   </div>
</template>
