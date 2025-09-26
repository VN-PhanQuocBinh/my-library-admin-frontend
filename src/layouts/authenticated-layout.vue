<script setup lang="ts">
import Sidebar from '@/components/layouts/authenticated-layout/sidebar/sidebar.vue'
</script>

<template>
   <div class="h-screen flex flex-row">
      <Sidebar />
      <main class="flex-1">
         <slot />
      </main>
   </div>
</template>
