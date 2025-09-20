<script setup lang="ts">
import { defineProps } from 'vue'
const props = defineProps({
   title: {
      type: String,
      required: true,
   },
})
</script>

<template>
   <div>
      <span class="text-white">{{ props.title }}</span>
   </div>
</template>
