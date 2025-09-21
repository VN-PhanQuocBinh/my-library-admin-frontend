<script setup lang="ts"></script>

<template>
   <div class="p-4 flex flex-col h-full gap-3">
      <div class="h-[42px] flex items-center justify-center">
         <h1 class="text-2xl font-bold text-(--my-secondary-color) uppercase">
            {{ $route.meta.title }}
         </h1>
      </div>
      <div class="w-full h-[0.5px] bg-(--my-text-secondary-color)"></div>

      <div class="flex-1 overflow-auto">
         <router-view />
      </div>
   </div>
</template>
