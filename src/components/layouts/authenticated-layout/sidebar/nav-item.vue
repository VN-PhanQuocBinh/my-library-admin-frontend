<script setup lang="ts">
import { defineProps } from 'vue'
import IconSvg from '@/components/common/icons/IconSvg.vue'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: false,
    default: '',
  },
  active: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <div
    class="relative overflow-hidden flex items-center flex-row gap-2.5 px-2 py-2 rounded-lg group cursor-pointer"
    :class="props.active ? 'text-white bg-white/20' : ''"
  >
    <i
      v-if="props.icon"
      style="font-size: 1.5rem"
      :class="`pi ${props.icon} text-(--my-text-secondary-color) text-2xl group-hover:text-white ${props.active ? 'text-white' : ''}`"
    />

    <span
      class="text-(--my-text-secondary-color) group-hover:text-white font-medium text-nowrap"
      :class="{ 'text-white': props.active }"
      >{{ props.title }}</span
    >
  </div>
</template>
