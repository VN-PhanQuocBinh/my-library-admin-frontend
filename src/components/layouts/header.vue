<script setup lang="ts">
import { Button, ButtonGroup } from 'primevue'
</script>

<template>
  <header
    class="bg-(--my-secondary-color) text-white px-4 fixed left-0 right-0 h-16 z-[100] flex flex-row items-center justify-between gap-4"
  >
    <h1 class="text-2xl font-bold">MY LIBRARY ADMIN</h1>

    <div class="flex flex-row gap-2 h-full items-center">
      <router-link to="/">
        <Button label="Đăng nhập" class="bg-(--my-primary-color)! px-6 py-2 h-full rounded-md hover:bg-(--my-primary-color)/90!" unstyled />
      </router-link>

      <router-link to="/register">
        <Button label="Đăng ký" variant="outlined" unstyled class="px-6 py-2 h-full rounded-md hover:bg-(--my-primary-color)/30" />
      </router-link>
    </div>
  </header>
</template>
