<script setup lang="ts">

defineProps({
  toggleCollapse: {
    type: Function,
    required: false,
  },
  collapse: {
    type: Boolean,
    required: false,
    default: false,
  },
})
</script>

<template>
  <div class="text-(--my-primary-color) flex flex-col gap-3 items-start">
    <button class="p-2 rounded-lg hover:bg-(--my-hover-color) transition-colors duration-300">
      <i
        style="font-size: 1.5rem"
        class="pi pi-bars text-gray-500 hover:text-white transition-colors duration-300"
        @click="toggleCollapse && toggleCollapse()"
      ></i>
    </button>
  </div>
</template>
