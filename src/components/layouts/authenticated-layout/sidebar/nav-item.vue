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
      class="relative h-[48px] flex items-center flex-row gap-2.5 px-4 rounded-lg group cursor-pointer"
      :class="props.active ? 'text-white' : ''"
   >
      <div
         class="absolute left-0 h-1/12 w-1 rounded-r-lg bg-white transition-all duration-300"
         :class="{
            'opacity-100': props.active,
            'opacity-0': !props.active,
            // 'left-0!': props.active,
            'h-3/5': props.active,
         }"
      ></div>

      <IconSvg
         :name="props.icon"
         width="28"
         height="28"
         class="text-(--my-text-secondary-color) group-hover:text-white"
         :class="props.active ? 'text-white' : ''"
      />
      <span
         class="text-(--my-text-secondary-color) group-hover:text-white font-medium"
         :class="{ 'text-white': props.active }"
         >{{ props.title }}</span
      >
   </div>
</template>
