<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const { user } = useAuthStore()
</script>

<template>
  <div class="flex items-center justify-end py-3 px-4 border-b border-gray-200">
    <div class="flex items-center gap-3">
      <div class="size-10 bg-(--my-primary-color) rounded-full grid place-items-center">
        {{ user?.fullname.charAt(0).toUpperCase() }}
      </div>
      <div class="flex flex-col">
        <span class="text-(--my-secondary-color)">{{ user?.fullname }}</span>
        <span class="text-gray-400 text-xs">{{ user?.email }}</span>
      </div>
    </div>
  </div>
</template>
