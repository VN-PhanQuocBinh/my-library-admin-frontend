<script setup lang="ts">
import { Button, ButtonGroup } from 'primevue'
</script>

<template>
   <header
      class="bg-gray-800 text-white p-4 fixed left-0 right-0 h-16 z-[100] flex flex-row items-center justify-between gap-4"
   >
      <h1 class="text-2xl font-bold">MY LIBRARY ADMIN</h1>

      <nav class="flex-1 flex flex-row justify-end gap-1.5">
         <router-link to="/">
            <Button label="Home" variant="text" />
         </router-link>
         <router-link to="/">
            <Button label="Books" variant="text" />
         </router-link>
      </nav>

      <div class="flex flex-row gap-2">
         <router-link to="/login">
            <Button label="Login" />
         </router-link>

         <router-link to="/register">
            <Button label="Sign up" variant="outlined" />
         </router-link>
      </div>
   </header>
</template>
