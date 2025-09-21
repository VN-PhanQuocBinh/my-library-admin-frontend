<script setup lang="ts">
import { watch, ref } from 'vue'
import {
   DataTable,
   Column,
   Image,
   Tag,
   IconField,
   InputIcon,
   InputText,
   Button,
   Popover,
} from 'primevue'

import { fetchBooks } from '@/services/book.service'
import type { Book } from '@/types/book'

import { formatVND } from '@/utils/format-currency'

// State variables
const books = ref<Book[]>([])
const pagination = ref({
   page: 1,
   limit: 10,
   total: 0,
   totalPages: 0,
})
const searchQuery = ref('')
const open = ref(false)

// Fetch books from the API
const loadBooks = async () => {
   try {
      const response = await fetchBooks()

      books.value = response.data.list
      pagination.value = response.data.pagination

      console.log('Books fetched:', response.data)
   } catch (error) {
      console.error('Error fetching books:', error)
   }
}

loadBooks()

watch([books, pagination], (newValues) => {
   const [newBooks, newPagination] = newValues
   console.log('Books updated:', newBooks)
   console.log('Pagination updated:', newPagination)
})

const toggleOpen = (event: any) => {
   open.value.toggle(event)
}
</script>

<template>
   <DataTable
      :value="[...books, ...books]"
      :paginator="true"
      :rows="pagination.limit"
      :totalRecords="pagination.total"
   >
      <template #header>
         <div class="flex flex-row items-center justify-between gap-2.5">
            <h2 class="flex-1 text-lg font-semibold text-(--my-secondary-color)">Book List</h2>
            <IconField>
               <InputIcon class="pi pi-search" />
               <InputText v-model="searchQuery" placeholder="Search" />
            </IconField>
            <Button
               icon="pi pi-plus"
               label="Add Book"
               class="bg-(--my-primary-color)! border-none! hover:opacity-85! text-(--my-secondary-color)!"
            />
         </div>
      </template>

      <Column field="coverImage" header="Cover">
         <template #body="slotProps">
            <Image
               :src="slotProps.data.coverImage"
               alt="Cover Image"
               width="30"
               preview
               class="aspect-[150/200] object-cover rounded-xs overflow-hidden"
            />
         </template>
      </Column>
      <Column field="name" header="Title" />
      <Column field="author" header="Author" />
      <Column field="genre" header="Genre" />
      <Column field="price">
         <template #header>
            <div class="text-right w-full font-semibold">Price (đ)</div>
         </template>
         <template #body="slotProps">
            <div class="text-right">{{ formatVND(slotProps.data.price.original) }}</div>
         </template>
      </Column>
      <Column field="quantity">
         <template #header>
            <div class="text-right w-full font-semibold">Remaining</div>
         </template>
         <template #body="slotProps">
            <div class="text-right">{{ slotProps.data.quantity }}</div>
         </template>
      </Column>
      <Column field="status" header="Status">
         <template #body="slotProps">
            <Tag
               :value="slotProps.data.status ? 'Available' : 'Out of stock'"
               :severity="slotProps.data.status ? 'success' : 'danger'"
               class="uppercase"
            />
         </template>
      </Column>

      <Column>
         <template #header>
            <div class="text-center w-full font-semibold">Actions</div>
         </template>
         <template #body="slotProps">
            <div class="flex flex-row items-center justify-center gap-2.5">
               <Button
                  icon="pi pi-ellipsis-v"
                  @click="toggleOpen"
                  unstyled
                  class="size-8 rounded-xs"
               />
               <Popover ref="open" placement="top" class="w-[300px]">
                  <!-- <template #header>
                     <Button
                        icon="pi pi-trash"
                        class="bg-red-600! border-none! hover:opacity-85! text-(--my-secondary-color)!"
                     />
                  </template> -->
                  <div class="p-4 flex flex-col gap-3">
                     <h3 class="text-lg font-semibold text-(--my-secondary-color)">
                        Confirm Deletion
                     </h3>
                     <p class="text-(--my-secondary-color)!">
                        Are you sure you want to delete the book
                        <span class="font-semibold">{{ slotProps.data.name }}</span
                        >? This action cannot be undone.
                     </p>
                     <div class="flex flex-row items-center justify-end gap-2.5">
                        <Button
                           label="Cancel"
                           class="border-none! text-(--my-secondary-color)! hover:opacity-85!"
                        />
                        <Button
                           label="Delete"
                           class="bg-red-600! border-none! hover:opacity-85! text-(--my-secondary-color)!"
                        />
                     </div>
                  </div>
               </Popover>
            </div>
         </template>
      </Column>

      <template #footer>In total there are {{ books ? books.length : 0 }} books.</template>
   </DataTable>
</template>
