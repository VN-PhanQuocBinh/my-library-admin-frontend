<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import defaultLayout from './layouts/default-layout.vue'

import '@/assets/css/custom.css'

const route = useRoute()
const layout = computed(() => {
   return route.meta.layout || defaultLayout
})
</script>

<template>
   <component :is="layout">
      <router-view />
   </component>
</template>
