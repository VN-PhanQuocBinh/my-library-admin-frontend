<script setup lang="ts">
import { defineProps } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { Button } from 'primevue'

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
      <Button
         label="Logout"
         icon="pi pi-sign-out"
         iconPos="right"
         @click="logout"
         class="w-full bg-(--my-primary-color)! text-(--my-secondary-color)! hover:opacity-85!"
      />
   </div>
</template>
