<script setup lang="ts">
import { de } from 'zod/locales'
import NavItem from './nav-item.vue'
import { defineProps } from 'vue'

const props = defineProps({
   class: {
      type: String,
      default: '',
   },
})

const items = [
   {
      title: 'item 1',
   },
   {
      title: 'item 2',
   },
   {
      title: 'item 3',
   },
]
</script>

<template>
   <div :class="['flex flex-col gap-6 px-4 py-6 border-b border-(--my-border-color)', props.class]">
      <NavItem v-for="item in items" :key="item.title" :title="item.title" />
   </div>
</template>
