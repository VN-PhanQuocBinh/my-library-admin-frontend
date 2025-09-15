<template>
   <div class="h-screen flex items-center justify-center text-gray-800 dark:text-gray-200">
      <Card
         class="max-w-md w-full p-6 text-center hover:shadow-lg! transition-shadow! duration-200 cursor-pointer rounded-xl"
      >
         <template #header>
            <div class="text-[--p-success-500] text-8xl font-bold mb-4">404</div>
         </template>
         <template #title>
            <h1 class="text-3xl font-semibold">Page Not Found</h1>
         </template>
         <template #content>
            <p class="text-lg text-gray-600 dark:text-gray-400">
               The page you are looking for might have been removed, had its name changed, or is
               temporarily unavailable.
            </p>
         </template>
         <template #footer>
            <router-link to="/">
               <Button
                  label="Go Back to Home"
                  icon="pi pi-home"
                  class="bg-[--p-success-500] hover:bg-[--p-success-600] text-white"
               />
            </router-link>
         </template>
      </Card>
   </div>
</template>

<script setup lang="ts">
import Card from 'primevue/card'
import Button from 'primevue/button'
</script>
