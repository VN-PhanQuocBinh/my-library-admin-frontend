<script setup lang="ts">
import { watch, ref, onMounted } from 'vue'
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
   Dialog,
   Textarea,
   Select,
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
const open = ref<any>(null)

const addBookVisible = ref<boolean>(false)
const deleteConfirmVisible = ref<boolean>(false)
const editVisible = ref<boolean>(false)

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

onMounted(() => {
   loadBooks()
})

watch([books, pagination], (newValues) => {
   const [newBooks, newPagination] = newValues
   console.log('Books updated:', newBooks)
   console.log('Pagination updated:', newPagination)
})

const toggleOpen = (event: any) => {
   open.value?.toggle(event)
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
               @click="addBookVisible = true"
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

               <Popover ref="open" placement="top" class="min-w-[120px]">
                  <div class="flex flex-col">
                     <button
                        @click="editVisible = true"
                        class="flex flex-row items-center gap-2.5 p-2 rounded-md hover:bg-(--my-secondary-color) hover:text-white transition-all duration-200"
                     >
                        <i class="pi pi-pen-to-square"></i>
                        <span>Edit</span>
                     </button>
                     <button
                        @click="deleteConfirmVisible = true"
                        class="flex flex-row items-center gap-2.5 p-2 rounded-md hover:bg-(--my-secondary-color) hover:text-white transition-all duration-200"
                     >
                        <i class="pi pi-trash"></i>
                        <span>Delete</span>
                     </button>
                  </div>
               </Popover>
            </div>
         </template>
      </Column>

      <template #footer>In total there are {{ books ? books.length : 0 }} books.</template>
   </DataTable>

   <!-- Add Book Dialog -->
   <Dialog
      v-model:visible="addBookVisible"
      modal
      :draggable="false"
      header="Add a book"
      maximizable
      :style="{ minWidth: '40rem' }"
   >
      <div class="flex flex-row gap-5">
         <div class="flex-1">
            <Image
               src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAADICAMAAAA9W+hXAAAAMFBMVEXp7vG6vsHf5Ofl6u3X3N/R1tnAxMfm6+7Eyczc4eTJzdDZ3uHi5+rU2dzP09a+wsUUxpkcAAABWElEQVR4nO3Y63KDIBBAYfESJGDz/m9brcZoW0awdZdpz/efcBJlzVhVAAAAAAAAAAAAAAAAAAAAAACgXPXQ5RiCRJS9m1ydQFZ+lTHD5VXhRJV5XJ7VTl++yTH9vJffXsO4SX3xihPKzwrep1wc2ayPe8b0xxuKZjW35ZAd7iiatY6vW0lZ9jWUXEFZdXyEh7stMCvcTG+/WSGSFb2IYToKu64SbvkwH9BtVwEDYqnademP07Vq26X+8NlUbbq0H9W7qleXctanqrVLN+tL1bNLI6vpXbRq6VLImsaEi1aNXSpZ8/By0SpjrELWc6S6aJVGVrPGRKsUspp4jGJWUpV4VlqVdFZilXSWS6sii6y/kmXrNJX2/61fXHFCoVl+3KRLvIIzkZeUp17pHr7V+bm3E1n++qz8rkcrUDU+pn2bw9vjjwQAAAAAAAAAAAAAAAAAAADwX70DqxAQLbZn9QkAAAAASUVORK5CYII="
               alt="Cover Image"
               preview
               class="aspect-[150/200] object-cover rounded-xs overflow-hidden mb-4 w-full!"
            />
         </div>

         <div class="flex-3">
            <div class="grid grid-cols-2 gap-3">
               <div class="flex flex-col">
                  <label for="title" class="font-semibold mb-1">Book name</label>
                  <InputText size="small" id="title" class="w-full" />
               </div>
               <div class="flex flex-col">
                  <label for="price" class="font-semibold mb-1">Price (đ)</label>
                  <InputText size="small" id="price" class="w-full" />
               </div>

               <div class="col-span-2 row-span-2 flex flex-col">
                  <label for="description" class="font-semibold mb-1">Description</label>
                  <Textarea
                     size="small"
                     id="description"
                     class="w-full"
                     placeholder="Enter book description"
                  />
               </div>

               <div class="flex flex-col">
                  <label for="publisher" class="font-semibold mb-1">Publisher</label>
                  <Select
                     id="publisher"
                     size="small"
                     class="w-full"
                     placeholder="Select a publisher"
                     :options="['Publisher A', 'Publisher B', 'Publisher C']"
                  />
               </div>
               <div class="flex flex-col">
                  <label for="genre" class="font-semibold mb-1">Genre</label>
                  <Select
                     id="genre"
                     size="small"
                     class="w-full"
                     placeholder="Select a Genre"
                     :options="['Genre A', 'Genre B', 'Genre C']"
                  />
               </div>
               <div class="flex flex-col">
                  <label for="quantity" class="font-semibold mb-1">Quantity</label>
                  <InputText size="small" id="quantity" class="w-full" />
               </div>
               <div class="flex flex-col">
                  <label for="status" class="font-semibold mb-1">Status</label>
                  <InputText size="small" id="status" class="w-full" />
               </div>
            </div>
         </div>
      </div>
      <template #footer>
         <div class="flex justify-end gap-2">
            <Button
               type="button"
               label="Cancel"
               severity="secondary"
               @click="addBookVisible = false"
            ></Button>
            <Button
               type="button"
               label="Add Book"
               @click="addBookVisible = false"
               class="bg-(--my-secondary-color)! text-white! border-none! hover:opacity-85!"
            ></Button>
         </div>
      </template>
   </Dialog>

   <!-- Delete Confirmation Dialog -->
   <Dialog
      v-model:visible="deleteConfirmVisible"
      modal
      :draggable="false"
      header="Delete Book"
      class="w-96"
   >
      <div>
         <h3 class="text-lg font-semibold mb-4">Confirm Deletion</h3>
         <p>Are you sure you want to delete this book?</p>
         <div class="flex flex-row justify-end gap-2.5 mt-4">
            <Button severity="secondary" label="Cancel" @click="deleteConfirmVisible = false" />
            <Button
               label="Delete"
               class="bg-red-600! border-none! hover:opacity-85! text-white!"
               @click="deleteConfirmVisible = false"
            />
         </div>
      </div>
   </Dialog>

   <!-- Edit Book Dialog -->
   <Dialog
      v-model:visible="editVisible"
      modal
      :draggable="false"
      header="Edit Profile"
      maximizable
      :style="{ width: '25rem' }"
   >
      <span class="text-surface-500 dark:text-surface-400 block mb-8"
         >Update your information.</span
      >
      <div class="flex items-center gap-4 mb-4">
         <label for="username" class="font-semibold w-24">Username</label>
         <InputText id="username" class="flex-auto" autocomplete="off" />
      </div>
      <div class="flex items-center gap-4 mb-8">
         <label for="email" class="font-semibold w-24">Email</label>
         <InputText id="email" class="flex-auto" autocomplete="off" />
      </div>
      <div class="flex justify-end gap-2">
         <Button
            type="button"
            label="Cancel"
            severity="secondary"
            @click="editVisible = false"
         ></Button>
         <Button type="button" label="Save" @click="editVisible = false"></Button>
      </div>
   </Dialog>
</template>
