<script setup lang="ts">
import Header from '@/components/layouts/header.vue'
import Footer from '@/components/layouts/footer.vue'
</script>

<template>
   <div class="min-h-screen max-h-screen flex flex-col custome-scrollbar overflow-y-scroll">
      <Header />

      <main class="flex-grow container mx-auto py-8 mt-16">
         <slot />
      </main>

      <Footer />
   </div>
</template>
