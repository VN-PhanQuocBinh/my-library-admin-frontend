<script setup lang="ts">
import { defineProps } from 'vue'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  class: {
    type: String,
    default: '',
  },
})

const { logout } = useAuthStore()
</script>

<template>
  <div :class="`flex justify-center items-center h-[60px] ${props.class}`">
    <button
      @click="logout"
      class="overflow-hidden text-gray-400 p-2 w-full flex flex-row gap-2.5 rounded-md justify-start items-center hover:text-(--my-primary-color) transition-colors duration-300"
    >
      <i class="pi pi-sign-out" style="font-size: 1.5rem;"></i>
      <span class="text-base">Đăng xuất</span>
    </button>
  </div>
</template>
