<script setup lang="ts">
import { defineProps, onMounted, ref, computed } from 'vue'

const props = defineProps({
   name: {
      type: String,
      default: 'logo',
   },
   width: {
      type: [String, Number],
      default: 32,
   },
   height: {
      type: [String, Number],
      default: 32,
   },
   fill: {
      type: String,
      default: 'currentColor',
   },
   class: {
      type: String,
      default: '',
   },
})

const iconSvg = ref<string>('')

const processedSvg = computed(() => {
   if (!iconSvg.value) return ''

   // Replace fill attributes trong SVG content
   return iconSvg.value
      .replace(/fill="[^"]*"/g, `fill="${props.fill}"`)
      .replace(/<svg[^>]*>/g, (match) => {
         // Remove existing width, height, fill attributes from SVG tag
         return match
            .replace(/width="[^"]*"/g, '')
            .replace(/height="[^"]*"/g, '')
            .replace(/fill="[^"]*"/g, '')
      })
})

onMounted(async () => {
   try {
      const iconModule = await import(`@/assets/icons/${props.name}.svg?raw`)
      iconSvg.value = iconModule.default
   } catch (error) {
      console.error('Error loading SVG:', props.name)
   }
})
</script>

<template>
   <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      :width
      :height
      :class="props.class"
      v-html="processedSvg"
   ></svg>
</template>
