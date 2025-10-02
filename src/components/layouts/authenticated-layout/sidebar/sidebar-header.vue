<script setup lang="ts">
import IconSvg from '@/components/common/icons/IconSvg.vue'

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
    <!-- <div :class="`flex-1 flex flex-row gap-3 items-center`">
      <IconSvg name="logo" width="28" height="28" :class="`text-(--my-primary-color) `" />
      <h1 v-if="!collapse" class="font-semibold text-xl">MY LIBRARY</h1>
    </div> -->
  </div>
</template>
