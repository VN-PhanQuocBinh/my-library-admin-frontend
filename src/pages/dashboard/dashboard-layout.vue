<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import dashboardHeader from './dashboard-header.vue'

const { user } = useAuthStore()
</script>

<template>
  <div class="flex flex-col h-full gap-3">
    <dashboardHeader />

    <div class="p-4 flex-1 overflow-auto">
      <router-view />
    </div>
  </div>
</template>
