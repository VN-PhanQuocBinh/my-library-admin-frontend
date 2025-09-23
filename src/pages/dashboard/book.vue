<script setup lang="ts">
import { watch, ref, onMounted, onBeforeUnmount } from 'vue'
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
  FileUpload,
  Message,
  InputNumber,
  DatePicker,
  Toast,
  useToast,
} from 'primevue'

import { Form, FormField } from '@primevue/forms'

import { fetchBooks, createBook, updateBook } from '@/services/book.service'
import { fetchPublishers } from '@/services/publisher.service'

import type { Book } from '@/types/book'

import { formatVND } from '@/utils/format-currency'

import { BookSchema, type BookType } from '@/types/book-schema'
import { zodResolver } from '@primevue/forms/resolvers/zod'

import { useDebounce } from '@/utils/use-debounce'

// State variables
const resolver = zodResolver(BookSchema)
const inititalCreateValues = ref<BookType>({
  name: 'Book name',
  description: 'Book description',
  author: '',
  genre: '',
  price: 0,
  quantity: 1,
  publishedDate: new Date(),
  // coverImage: undefined,
  publisher: '',
  // detailedImages: [],
})
const initialEditValues = ref<BookType>({
  name: '',
  description: '',
  author: '',
  genre: '',
  price: 0,
  quantity: 1,
  publishedDate: new Date(),
  // coverImage: undefined,
  publisher: '',
  // detailedImages: [],
})

// Toast for notifications
const toast = useToast()

const books = ref<Book[]>([])
const publishers = ref<{ _id: string; name: string }[]>([])
const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
})
const [debouncedSearchQuery, setDebouncedSearchQuery] = useDebounce('', 300)
const searchQuery = ref('')
const searching = ref(false)

const open = ref<any>(null)
const formRef = ref<any>(null)
const isSubmitting = ref(false)

const addBookVisible = ref<boolean>(false)
const deleteConfirmVisible = ref<boolean>(false)
const editVisible = ref<boolean>(false)
const selectedBook = ref<{ _id: string; status: boolean }>({
  _id: '',
  status: false,
})

// Fetch books from the API
const loadData = async () => {
  try {
    const [booksResponse, publishersResponse] = await Promise.all([fetchBooks(), fetchPublishers()])

    books.value = booksResponse.data.list
    pagination.value = booksResponse.data.pagination
    publishers.value = publishersResponse.data.list
  } catch (error) {
    console.error('Error fetching books:', error)
  }
}

onMounted(() => {
  loadData()
})

watch(searchQuery, (newQuery) => {
  setDebouncedSearchQuery(newQuery)
})

watch(debouncedSearchQuery, async (newQuery) => {
  try {
    searching.value = true
    console.log('Searching books with query:', newQuery)
    const query = newQuery.toString().trim()

    const booksResponse = await fetchBooks({ query })

    books.value = booksResponse.data.list
    pagination.value = booksResponse.data.pagination
  } catch (error) {
    console.error('Error searching books:', error)
  } finally {
    searching.value = false
  }
})

watch([books, pagination], (newValues) => {
  const [newBooks, newPagination] = newValues
})

watch(editVisible, (newVal) => {
  if (newVal) {
    // Reset form values when dialog is opened
    const bookToEdit = books.value.find((book) => book._id === selectedBook.value._id)
    if (bookToEdit) {
      initialEditValues.value = {
        _id: bookToEdit._id,
        name: bookToEdit.name,
        description: bookToEdit.description,
        author: bookToEdit.author,
        genre: bookToEdit.genre,
        price: bookToEdit.price.original,
        quantity: bookToEdit.quantity,
        publishedDate: new Date(bookToEdit.publishedDate),
        publisher: bookToEdit.publisher._id,
      }
    }
  }
})

const toggleOpen = (
  event: any,
  selectedInfo: { _id: string; status: boolean } = { _id: '', status: false },
) => {
  selectedBook.value = selectedInfo
  open.value?.toggle(event)
}
const selectedCoverImage = ref<File | null>(null)
const previewCoverUrl = ref<string | null>(null)

const selectedDetailedImages = ref<File[]>([])
const previewDetailedUrls = ref<string[]>([])

function handleSelectCoverImage(e: any) {
  const file = e.files[0]
  if (file) {
    selectedCoverImage.value = file
    previewCoverUrl.value = URL.createObjectURL(file)
  }
}

function handleSelectDetailedImages(e: any) {
  const files = e.files
  if (files && files.length > 0) {
    selectedDetailedImages.value = Array.from(files)
    previewDetailedUrls.value = selectedDetailedImages.value.map((file) =>
      URL.createObjectURL(file),
    )
  }
}

function handleClearCoverImage() {
  previewCoverUrl.value = null
}

function handleClearDetailedImages() {
  previewDetailedUrls.value.forEach((url) => URL.revokeObjectURL(url))
  previewDetailedUrls.value = []
  selectedDetailedImages.value = []
}

const handleCreateBook = async (data: FormData) => {
  try {
    isSubmitting.value = true

    const response = await createBook(data)
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Book created successfully',
      life: 3000,
    })
    await loadData()
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to create book', life: 3000 })
  } finally {
    addBookVisible.value = false
    isSubmitting.value = false
  }
}

const handleUpdateBook = async (bookId: string, data: FormData) => {
  try {
    isSubmitting.value = true

    const response = await updateBook(bookId, data)
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Book updated successfully',
      life: 3000,
    })
    await loadData()
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to update book', life: 3000 })
  } finally {
    addBookVisible.value = false
    isSubmitting.value = false
    editVisible.value = false
  }
}

const handleSubmit = async (event: any) => {
  if (event.valid) {
    const formData = new FormData()

    const { values: formValues } = event

    formData.append('name', formValues.name)
    formData.append('description', formValues.description)
    formData.append('author', formValues.author)
    formData.append('genre', formValues.genre)
    formData.append('price', JSON.stringify({ original: formValues.price, sale: 0 }))
    formData.append('quantity', formValues.quantity.toString())
    formData.append('publishedDate', formValues.publishedDate.toISOString())
    formData.append('publisher', formValues.publisher)

    if (!editVisible.value) {
      if (selectedCoverImage.value) {
        formData.append('coverImage', selectedCoverImage.value)

        selectedDetailedImages.value.forEach((file, index) => {
          formData.append('detailedImages', file)
        })
      }
    }

    if (addBookVisible.value) {
      await handleCreateBook(formData)
    } else if (editVisible.value) {
      await handleUpdateBook(selectedBook.value._id, formData)
    }
  } else {
    toast.add({
      severity: 'error',
      summary: 'Validation Error',
      detail: 'Please correct the errors in the form.',
      life: 3000,
    })
  }
}

const handleOpenDeleteConfirm = () => {
  deleteConfirmVisible.value = true
}

const handleToggleBookStatus = async () => {
  try {
    isSubmitting.value = true
    if (!selectedBook.value) throw new Error('No book ID to delete')
    const { _id: bookId, status } = selectedBook.value

    if (!bookId || status === null) throw new Error('No book ID to delete')

    await updateBook(bookId, { status: !status })

    selectedBook.value = { _id: '', status: false }

    await loadData()
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Book updated successfully (not really, this is just a demo)',
      life: 3000,
    })
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to update book', life: 3000 })
  } finally {
    isSubmitting.value = false
    deleteConfirmVisible.value = false
  }
}

onBeforeUnmount(() => {
  if (previewCoverUrl.value) URL.revokeObjectURL(previewCoverUrl.value)
  if (previewDetailedUrls.value.length > 0) {
    previewDetailedUrls.value.forEach((url) => URL.revokeObjectURL(url))
    previewDetailedUrls.value = []
  }
})
</script>

<template>
  <Toast position="bottom-right" />

  <DataTable
    :value="books"
    :paginator="true"
    :rows="pagination.limit"
    :totalRecords="pagination.total"
  >
    <template #header>
      <div class="flex flex-row items-center justify-between gap-2.5">
        <h2 class="flex-1 text-lg font-semibold text-(--my-secondary-color)">Book List</h2>
        <div
          class="flex flex-row items-center gap-1 border-(--my-text-secondary-color) border rounded-md pl-2 h-[40px]!"
        >
          <InputText v-model="searchQuery" placeholder="Search" class="outline-none" unstyled />
          <Button
            :loading="searching"
            icon="pi pi-search "
            class="rounded-r-sm! rounded-l-none! h-full! bg-(--my-secondary-color)! border-none! hover:opacity-85!"
          />
        </div>
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
            @click="toggleOpen($event, { _id: slotProps.data._id, status: slotProps.data.status })"
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
                @click="handleOpenDeleteConfirm()"
                class="flex flex-row items-center gap-2.5 p-2 rounded-md hover:bg-(--my-secondary-color) hover:text-white transition-all duration-200"
              >
                <i :class="`pi ${slotProps.data.status ? 'pi-trash' : 'pi-check'}`"></i>
                <span>{{
                  slotProps.data.status ? 'Mark as Out of Stock' : 'Mark as Available'
                }}</span>
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
    :style="{ minWidth: '60rem' }"
    @maximize="
      (e) => {
        console.log('Maximized', e)
      }
    "
    @unmaximize="
      (e) => {
        console.log('Restored', e)
      }
    "
  >
    <Form
      ref="formRef"
      :initialValues="inititalCreateValues"
      :resolver
      @submit="handleSubmit"
      :validateOnSubmit="true"
      class="w-full max-h-full flex flex-col gap-5"
    >
      <div class="flex-1 grid grid-cols-4 gap-5 overflow-y-auto">
        <div class="col-span-1 flex flex-col gap-2">
          <FileUpload
            name="coverImage"
            accept="image/*"
            :maxFileSize="1000000"
            chooseLabel="Upload Cover"
            class="w-full"
            @select="handleSelectCoverImage"
          >
            <!-- Header -->
            <template #header="{ chooseCallback, clearCallback }">
              <div class="flex flex-row justify-end">
                <Button
                  size="small"
                  label="Choose"
                  icon="pi pi-plus"
                  class="mr-2 bg-(--my-secondary-color)! text-white! border-none! hover:opacity-85!"
                  @click="chooseCallback"
                />
                <Button
                  @click="
                    () => {
                      handleClearCoverImage()
                      clearCallback()
                    }
                  "
                  size="small"
                  label="Clear"
                  icon="pi pi-trash"
                  severity="danger"
                  class="border-none! hover:opacity-85!"
                />
              </div>
            </template>

            <!-- Content -->
            <template #content>
              <Image
                v-if="previewCoverUrl"
                :src="previewCoverUrl"
                alt="Cover Image"
                preview
                class="aspect-[150/200] rounded-xs overflow-hidden mb-4 w-full!"
              >
                <template #image>
                  <img
                    :src="previewCoverUrl"
                    alt="Cover Image"
                    class="w-full h-full object-contain"
                  />
                </template>
              </Image>
            </template>

            <!-- Empty -->
            <template #empty>
              <div class="text-center">
                <div class="flex items-center justify-center flex-col">
                  <i
                    class="pi pi-cloud-upload !border-2 border-(--my-text-secondary-color)! border-dashed !rounded-full !p-8 !text-4xl !text-(--my-text-secondary-color)"
                  />
                  <p class="mt-6 mb-0 text-(--my-text-primary-color)">
                    Drag and drop files to here to upload.
                  </p>
                </div>
              </div>
            </template>
          </FileUpload>

          <FileUpload
            name="detailedImages"
            accept="image/*"
            :maxFileSize="1000000"
            chooseLabel="Upload Detailed Images"
            multiple
            class="w-full"
            @select="handleSelectDetailedImages"
          >
            <!-- Header -->
            <template #header="{ chooseCallback, clearCallback }">
              <div class="flex flex-row justify-end">
                <Button
                  size="small"
                  label="Choose"
                  icon="pi pi-plus"
                  class="mr-2 bg-(--my-secondary-color)! text-white! border-none! hover:opacity-85!"
                  @click="chooseCallback"
                />
                <Button
                  @click="
                    () => {
                      handleClearDetailedImages()
                      clearCallback()
                    }
                  "
                  size="small"
                  label="Clear"
                  icon="pi pi-trash"
                  severity="danger"
                  class="border-none! hover:opacity-85!"
                />
              </div>
            </template>

            <!-- Content -->
            <template #content>
              <div v-if="previewDetailedUrls.length > 0" class="grid grid-cols-2 gap-2.5 mb-4">
                <Image
                  v-for="(url, index) in previewDetailedUrls"
                  :key="index"
                  :src="url"
                  alt="Detailed Image"
                  preview
                  class="aspect-[150/200] rounded-xs overflow-hidden w-full!"
                />
              </div>
            </template>

            <!-- Empty -->
            <template #empty>
              <div class="text-center">
                <div class="flex items-center justify-center flex-col">
                  <i
                    class="pi pi-cloud-upload !border-2 border-(--my-text-secondary-color)! border-dashed !rounded-full !p-8 !text-4xl !text-(--my-text-secondary-color)"
                  />
                  <p class="mt-6 mb-0 text-(--my-text-primary-color)">
                    Drag and drop files to here to upload.
                  </p>
                </div>
              </div>
            </template>
          </FileUpload>
        </div>

        <div class="col-span-3">
          <div class="grid grid-cols-2 gap-4">
            <!-- Book Name -->
            <FormField v-slot="$field" name="name" class="flex flex-col">
              <label for="title" class="font-semibold mb-1">Book name</label>
              <InputText size="small" id="title" class="w-full" />
              <Message v-if="$field.invalid" severity="error" size="small" variant="simple">
                {{ $field.error?.message }}
              </Message>
            </FormField>

            <!-- Price -->
            <FormField v-slot="$field" name="price" class="flex flex-col">
              <label for="price" class="font-semibold mb-1">Price (đ)</label>
              <InputNumber size="small" id="price" class="w-full" />
              <Message v-if="$field.invalid" severity="error" size="small" variant="simple">
                {{ $field.error?.message }}
              </Message>
            </FormField>

            <!-- Description -->
            <FormField
              v-slot="$field"
              name="description"
              class="col-span-2 row-span-2 flex flex-col"
            >
              <label for="description" class="font-semibold mb-1">Description</label>
              <Textarea
                size="small"
                id="description"
                class="w-full"
                placeholder="Enter book description"
                rows="4"
                :style="{ resize: 'none' }"
              />
              <Message v-if="$field.invalid" severity="error" size="small" variant="simple">
                {{ $field.error?.message }}
              </Message>
            </FormField>

            <!-- Publisher -->
            <FormField v-slot="$field" name="publisher" class="flex flex-col">
              <label for="publisher" class="font-semibold mb-1">Publisher</label>
              <Select
                id="publisher"
                size="small"
                class="w-full"
                placeholder="Select a publisher"
                :options="publishers"
                optionLabel="name"
                optionValue="_id"
              />
              <Message v-if="$field.invalid" severity="error" size="small" variant="simple">
                {{ $field.error?.message }}
              </Message>
            </FormField>

            <FormField v-slot="$field" name="author" class="flex flex-col">
              <label for="author" class="font-semibold mb-1">Author</label>
              <InputText id="author" size="small" class="w-full" placeholder="Select an author" />
              <Message v-if="$field.invalid" severity="error" size="small" variant="simple">
                {{ $field.error?.message }}
              </Message>
            </FormField>

            <!-- Author -->
            <FormField v-slot="$field" name="genre" class="flex flex-col">
              <label for="genre" class="font-semibold mb-1">Genre</label>
              <Select
                id="genre"
                size="small"
                class="w-full"
                placeholder="Select a Genre"
                :options="[
                  'fiction',
                  'nonFiction',
                  'scienceFiction',
                  'fantasy',
                  'mystery',
                  'biography',
                  'history',
                  'poetry',
                  'self-help',
                  'business',
                ]"
              />
              <Message v-if="$field.invalid" severity="error" size="small" variant="simple">
                {{ $field.error?.message }}
              </Message>
            </FormField>

            <div class="flex flex-row gap-2">
              <!-- Quantity -->
              <FormField v-slot="$field" name="quantity" class="flex-2 flex flex-col">
                <label for="quantity" class="font-semibold mb-1">Quantity</label>
                <InputNumber
                  id="quantity"
                  mode="decimal"
                  showButtons
                  size="small"
                  :min="1"
                  :max="100"
                  fluid
                />
                <Message v-if="$field.invalid" severity="error" size="small" variant="simple">
                  {{ $field.error?.message }}
                </Message>
              </FormField>

              <!-- Published Date -->
              <FormField v-slot="$field" name="publishedDate" class="flex-3 flex flex-col">
                <label for="publishedDate" class="font-semibold mb-1">Published Date</label>
                <DatePicker
                  size="small"
                  id="publishedDate"
                  showIcon
                  fluid
                  :showOnFocus="false"
                  format="dd/mm/yy"
                />
                <Message v-if="$field.invalid" severity="error" size="small" variant="simple">
                  {{ $field.error?.message }}
                </Message>
              </FormField>
            </div>
          </div>
        </div>
      </div>
    </Form>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button
          type="button"
          label="Cancel"
          severity="secondary"
          @click="addBookVisible = false"
          :disabled="isSubmitting"
        ></Button>
        <Button
          @click="!isSubmitting && formRef?.submit()"
          type="button"
          label="Add Book"
          :class="`bg-(--my-secondary-color)! text-white! border-none! ${!isSubmitting ? 'hover:opacity-85!' : ''}`"
          :loading="isSubmitting"
          :disabled="isSubmitting"
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
        <Button
          severity="secondary"
          label="Cancel"
          @click="deleteConfirmVisible = false"
          :disabled="isSubmitting"
        />
        <Button
          :label="selectedBook.status ? 'Mark as Out of Stock' : 'Mark as Available'"
          :class="[
            { 'bg-red-600!': selectedBook.status, 'bg-green-600!': !selectedBook.status },
            'text-white! border-none! hover:opacity-85!',
          ]"
          @click="handleToggleBookStatus"
          :loading="isSubmitting"
          :disabled="isSubmitting"
        />
      </div>
    </div>
  </Dialog>

  <!-- Edit Book Dialog -->
  <Dialog
    v-model:visible="editVisible"
    modal
    :draggable="false"
    header="Edit Book"
    maximizable
    :style="{ minWidth: '60rem' }"
    @maximize="
      (e) => {
        console.log('Maximized', e)
      }
    "
    @unmaximize="
      (e) => {
        console.log('Restored', e)
      }
    "
  >
    <Form
      ref="formRef"
      :initialValues="initialEditValues"
      :resolver
      @submit="handleSubmit"
      :validateOnSubmit="true"
      class="w-full max-h-full flex flex-col gap-5"
    >
      <div class="flex-1 grid grid-cols-4 gap-5 overflow-y-auto">
        <div class="col-span-1 flex flex-col gap-2">
          <FileUpload
            name="coverImage"
            accept="image/*"
            :maxFileSize="1000000"
            chooseLabel="Upload Cover"
            class="w-full"
            @select="handleSelectCoverImage"
          >
            <!-- Header -->
            <template #header="{ chooseCallback, clearCallback }">
              <div class="flex flex-row justify-end">
                <Button
                  size="small"
                  label="Choose"
                  icon="pi pi-plus"
                  class="mr-2 bg-(--my-secondary-color)! text-white! border-none! hover:opacity-85!"
                  @click="chooseCallback"
                />
                <Button
                  @click="
                    () => {
                      handleClearCoverImage()
                      clearCallback()
                    }
                  "
                  size="small"
                  label="Clear"
                  icon="pi pi-trash"
                  severity="danger"
                  class="border-none! hover:opacity-85!"
                />
              </div>
            </template>

            <!-- Content -->
            <template #content>
              <Image
                v-if="previewCoverUrl"
                :src="previewCoverUrl"
                alt="Cover Image"
                preview
                class="aspect-[150/200] rounded-xs overflow-hidden mb-4 w-full!"
              >
                <template #image>
                  <img
                    :src="previewCoverUrl"
                    alt="Cover Image"
                    class="w-full h-full object-contain"
                  />
                </template>
              </Image>
            </template>

            <!-- Empty -->
            <template #empty>
              <div class="text-center">
                <div class="flex items-center justify-center flex-col">
                  <i
                    class="pi pi-cloud-upload !border-2 border-(--my-text-secondary-color)! border-dashed !rounded-full !p-8 !text-4xl !text-(--my-text-secondary-color)"
                  />
                  <p class="mt-6 mb-0 text-(--my-text-primary-color)">
                    Drag and drop files to here to upload.
                  </p>
                </div>
              </div>
            </template>
          </FileUpload>

          <FileUpload
            name="detailedImages"
            accept="image/*"
            :maxFileSize="1000000"
            chooseLabel="Upload Detailed Images"
            multiple
            class="w-full"
            @select="handleSelectDetailedImages"
          >
            <!-- Header -->
            <template #header="{ chooseCallback, clearCallback }">
              <div class="flex flex-row justify-end">
                <Button
                  size="small"
                  label="Choose"
                  icon="pi pi-plus"
                  class="mr-2 bg-(--my-secondary-color)! text-white! border-none! hover:opacity-85!"
                  @click="chooseCallback"
                />
                <Button
                  @click="
                    () => {
                      handleClearDetailedImages()
                      clearCallback()
                    }
                  "
                  size="small"
                  label="Clear"
                  icon="pi pi-trash"
                  severity="danger"
                  class="border-none! hover:opacity-85!"
                />
              </div>
            </template>

            <!-- Content -->
            <template #content>
              <div v-if="previewDetailedUrls.length > 0" class="grid grid-cols-2 gap-2.5 mb-4">
                <Image
                  v-for="(url, index) in previewDetailedUrls"
                  :key="index"
                  :src="url"
                  alt="Detailed Image"
                  preview
                  class="aspect-[150/200] rounded-xs overflow-hidden w-full!"
                />
              </div>
            </template>

            <!-- Empty -->
            <template #empty>
              <div class="text-center">
                <div class="flex items-center justify-center flex-col">
                  <i
                    class="pi pi-cloud-upload !border-2 border-(--my-text-secondary-color)! border-dashed !rounded-full !p-8 !text-4xl !text-(--my-text-secondary-color)"
                  />
                  <p class="mt-6 mb-0 text-(--my-text-primary-color)">
                    Drag and drop files to here to upload.
                  </p>
                </div>
              </div>
            </template>
          </FileUpload>
        </div>

        <div class="col-span-3">
          <div class="grid grid-cols-2 gap-4">
            <!-- Book Name -->
            <FormField v-slot="$field" name="name" class="flex flex-col">
              <label for="title" class="font-semibold mb-1">Book name</label>
              <InputText size="small" id="title" class="w-full" />
              <Message v-if="$field.invalid" severity="error" size="small" variant="simple">
                {{ $field.error?.message }}
              </Message>
            </FormField>

            <!-- Price -->
            <FormField v-slot="$field" name="price" class="flex flex-col">
              <label for="price" class="font-semibold mb-1">Price (đ)</label>
              <InputNumber size="small" id="price" class="w-full" />
              <Message v-if="$field.invalid" severity="error" size="small" variant="simple">
                {{ $field.error?.message }}
              </Message>
            </FormField>

            <!-- Description -->
            <FormField
              v-slot="$field"
              name="description"
              class="col-span-2 row-span-2 flex flex-col"
            >
              <label for="description" class="font-semibold mb-1">Description</label>
              <Textarea
                size="small"
                id="description"
                class="w-full"
                placeholder="Enter book description"
                rows="4"
                :style="{ resize: 'none' }"
              />
              <Message v-if="$field.invalid" severity="error" size="small" variant="simple">
                {{ $field.error?.message }}
              </Message>
            </FormField>

            <!-- Publisher -->
            <FormField v-slot="$field" name="publisher" class="flex flex-col">
              <label for="publisher" class="font-semibold mb-1">Publisher</label>
              <Select
                id="publisher"
                size="small"
                class="w-full"
                placeholder="Select a publisher"
                :options="publishers"
                optionLabel="name"
                optionValue="_id"
              />
              <Message v-if="$field.invalid" severity="error" size="small" variant="simple">
                {{ $field.error?.message }}
              </Message>
            </FormField>

            <FormField v-slot="$field" name="author" class="flex flex-col">
              <label for="author" class="font-semibold mb-1">Author</label>
              <InputText id="author" size="small" class="w-full" placeholder="Select an author" />
              <Message v-if="$field.invalid" severity="error" size="small" variant="simple">
                {{ $field.error?.message }}
              </Message>
            </FormField>

            <!-- Author -->
            <FormField v-slot="$field" name="genre" class="flex flex-col">
              <label for="genre" class="font-semibold mb-1">Genre</label>
              <Select
                id="genre"
                size="small"
                class="w-full"
                placeholder="Select a Genre"
                :options="[
                  'fiction',
                  'nonFiction',
                  'scienceFiction',
                  'fantasy',
                  'mystery',
                  'biography',
                  'history',
                  'poetry',
                  'self-help',
                  'business',
                ]"
              />
              <Message v-if="$field.invalid" severity="error" size="small" variant="simple">
                {{ $field.error?.message }}
              </Message>
            </FormField>

            <div class="flex flex-row gap-2">
              <!-- Quantity -->
              <FormField v-slot="$field" name="quantity" class="flex-2 flex flex-col">
                <label for="quantity" class="font-semibold mb-1">Quantity</label>
                <InputNumber
                  id="quantity"
                  mode="decimal"
                  showButtons
                  size="small"
                  :min="1"
                  :max="100"
                  fluid
                />
                <Message v-if="$field.invalid" severity="error" size="small" variant="simple">
                  {{ $field.error?.message }}
                </Message>
              </FormField>

              <!-- Published Date -->
              <FormField v-slot="$field" name="publishedDate" class="flex-3 flex flex-col">
                <label for="publishedDate" class="font-semibold mb-1">Published Date</label>
                <DatePicker
                  size="small"
                  id="publishedDate"
                  showIcon
                  fluid
                  :showOnFocus="false"
                  format="dd/mm/yy"
                />
                <Message v-if="$field.invalid" severity="error" size="small" variant="simple">
                  {{ $field.error?.message }}
                </Message>
              </FormField>
            </div>
          </div>
        </div>
      </div>
    </Form>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button
          type="button"
          label="Cancel"
          severity="secondary"
          @click="addBookVisible = false"
          :disabled="isSubmitting"
        ></Button>
        <Button
          @click="!isSubmitting && formRef?.submit()"
          type="button"
          label="Add Book"
          :class="`bg-(--my-secondary-color)! text-white! border-none! ${!isSubmitting ? 'hover:opacity-85!' : ''}`"
          :loading="isSubmitting"
          :disabled="isSubmitting"
        ></Button>
      </div>
    </template>
  </Dialog>
</template>
