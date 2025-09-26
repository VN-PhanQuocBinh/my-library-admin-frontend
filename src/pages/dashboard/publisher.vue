<script setup lang="ts">
import { watch, ref, onMounted } from 'vue'
import {
  DataTable,
  Column,
  IconField,
  InputIcon,
  InputText,
  Button,
  Popover,
  Dialog,
  Message,
  Toast,
  useToast,
} from 'primevue'

import { Form, FormField } from '@primevue/forms'
import { set, z } from 'zod'
import { zodResolver } from '@primevue/forms/resolvers/zod'

import { useDebounce } from '@/utils/use-debounce'

import {
  createPublisher,
  getAllPublishers,
  updatePublisher,
  deletePublisher,
} from '@/services/publisher.service'
import { PublisherSchema, type Publisher } from '@/types/publisher'

type PublisherType = z.infer<typeof PublisherSchema>

// State variables
const resolver = zodResolver(PublisherSchema)
const initialCreateValues = ref<Publisher>({
  name: '',
  address: '',
})

// Toast for notifications
const toast = useToast()

const publishers = ref<{ _id: string; name: string; address: string }[]>([])
const isLoadingData = ref(false)

const open = ref<any>(null)
const isOpenEdit = ref(false)
const isOpenDeleteConfirm = ref(false)
const formRef = ref<any>(null) // Reference to the edit form component
const isSubmitting = ref(false)

const addPublisherVisible = ref<boolean>(false)
const selectedPublisher = ref<Publisher | undefined>(undefined)

const searchQuery = ref('')
const [debouncedSearchQuery, setDebouncedSearchQuery] = useDebounce('', 300)

const filteredPublishers = ref<Publisher[]>([])
const pagination = ref<{ page: number; limit: number; total: number; totalPages: number }>({
  page: 0,
  limit: 10,
  totalPages: 1,
  total: 0,
})

// Fetch publishers from the API
const fetchPublishers = async (page = 0, limit = 10) => {
  try {
    isLoadingData.value = true
    const response = await getAllPublishers({ query: debouncedSearchQuery.value, page, limit })
    const { list, pagination: _pagination } = response.data

    publishers.value = list
    filteredPublishers.value = list

    console.log('Fetched publishers:', pagination)

    pagination.value = {
      page: _pagination.page,
      limit: _pagination.limit,
      total: _pagination.total,
      totalPages: _pagination.totalPages,
    }
  } catch (error) {
    console.error('Error fetching publishers:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to fetch publishers',
      life: 3000,
    })
  } finally {
    isLoadingData.value = false
  }
}

// Handle pagination change
const onPageChange = (event: any) => {
  pagination.value.page = event.page
  pagination.value.limit = event.rows
  fetchPublishers(event.page, event.rows)
}

// Filter publishers based on search query
const filterPublishers = () => {
  if (!searchQuery.value.trim()) {
    filteredPublishers.value = publishers.value
  } else {
    const query = searchQuery.value.toLowerCase()
    filteredPublishers.value = publishers.value.filter(
      (publisher) =>
        publisher.name.toLowerCase().includes(query) ||
        publisher.address.toLowerCase().includes(query),
    )
  }
}

watch(searchQuery, (newValue) => {
  setDebouncedSearchQuery(newValue)
})

watch(debouncedSearchQuery, (newValue) => {
  pagination.value.page = 0
  fetchPublishers()
})

onMounted(() => {
  fetchPublishers()
})

const toggleOpen = (event: any, selectedInfo: Publisher) => {
  selectedPublisher.value = selectedInfo
  open.value?.toggle(event)
}

const handleCreatePublisher = async (data: PublisherType) => {
  try {
    isSubmitting.value = true
    await createPublisher(data)
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Publisher created successfully',
      life: 3000,
    })
    await fetchPublishers()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to create publisher',
      life: 3000,
    })
  } finally {
    addPublisherVisible.value = false
    isSubmitting.value = false
  }
}

const handleSubmit = async (event: any) => {
  if (event.valid) {
    const { values: formValues } = event
    await handleCreatePublisher(formValues)
  } else {
    toast.add({
      severity: 'error',
      summary: 'Validation Error',
      detail: 'Please correct the errors in the form.',
      life: 3000,
    })
  }
}

const handleEdit = async (event: any) => {
  try {
    isOpenEdit.value = true
    isSubmitting.value = true

    if (event.valid) {
      const { values: formValues } = event

      await updatePublisher({ _id: selectedPublisher.value?._id, ...formValues })
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Publisher updated successfully',
        life: 3000,
      })
      await fetchPublishers()
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to update publisher',
      life: 3000,
    })
  } finally {
    isOpenEdit.value = false
    isSubmitting.value = false
  }
}

const handleDelete = async () => {
  try {
    isSubmitting.value = true

    await deletePublisher(selectedPublisher.value?._id as string)
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Publisher deleted successfully',
      life: 3000,
    })
    await fetchPublishers()
  } catch (error) {
    console.error('Error deleting publisher:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to delete publisher',
      life: 3000,
    })
  } finally {
    isOpenDeleteConfirm.value = false
    isSubmitting.value = false
  }
}
</script>

<template>
  <Toast position="bottom-right" />

  <DataTable
    :value="publishers"
    :paginator="true"
    :rows="pagination.limit"
    :totalRecords="pagination.total"
    :first="pagination.page * pagination.limit"
    :lazy="true"
    @page="onPageChange"
  >
    <template #empty>
      <div class="text-(--my-text-secondary-color) text-center">No publishers found.</div>
    </template>

    <template #header>
      <div class="flex flex-row items-center justify-between gap-2.5">
        <h2 class="flex-1 text-lg font-semibold text-(--my-secondary-color)">Publisher List</h2>

        <IconField class="bg-white!">
          <InputIcon class="pi pi-search sp" />
          <InputText
            v-model="searchQuery"
            placeholder="Search publishers..."
            class="focus:border-(--my-primary-color)!"
          />
        </IconField>

        <Button
          @click="addPublisherVisible = true"
          icon="pi pi-plus"
          label="Add Publisher"
          class="bg-(--my-primary-color)! border-none! hover:opacity-85! text-(--my-secondary-color)!"
        />
      </div>
    </template>

    <Column field="name" header="Publisher Name">
      <template #body="slotProps">
        <div v-if="isLoadingData" class="skeleton h-4 rounded w-32"></div>
        <span v-else class="">{{ slotProps.data.name }}</span>
      </template>
    </Column>

    <Column field="address" header="Address">
      <template #body="slotProps">
        <div v-if="isLoadingData" class="skeleton h-4 rounded w-48"></div>
        <span v-else class="text-(--my-text-primary-color)">{{ slotProps.data.address }}</span>
      </template>
    </Column>

    <Column>
      <template #header>
        <div class="text-center w-full font-semibold">Actions</div>
      </template>
      <template #body="slotProps">
        <div v-if="isLoadingData" class="skeleton h-4 rounded w-24"></div>
        <div v-else class="flex flex-row items-center justify-center gap-2.5">
          <Button
            icon="pi pi-ellipsis-v"
            @click="toggleOpen($event, slotProps.data)"
            unstyled
            class="size-8 rounded-xs"
          />
        </div>
      </template>
    </Column>

    <template #footer>
      Showing {{ pagination.page * pagination.limit + 1 }} to
      {{ Math.min((pagination.page + 1) * pagination.limit, pagination.total) }}
      of {{ pagination.total }} publishers.
    </template>
  </DataTable>

  <Popover ref="open" placement="top" class="min-w-[120px]">
    <div class="flex flex-col">
      <button
        @click="isOpenEdit = true"
        class="flex flex-row items-center gap-2.5 px-3 py-2 rounded-md hover:bg-(--my-secondary-color) hover:text-white transition-all duration-200"
      >
        <i class="pi pi-pen-to-square"></i>
        <span>Edit</span>
      </button>
      <button
        @click="isOpenDeleteConfirm = true"
        class="flex flex-row items-center gap-2.5 px-3 py-2 rounded-md hover:bg-(--my-secondary-color) hover:text-white transition-all duration-200"
      >
        <i class="pi pi-trash"></i>
        <span>Delete</span>
      </button>
    </div>
  </Popover>

  <!-- Add Publisher Dialog -->
  <Dialog
    v-model:visible="addPublisherVisible"
    modal
    :draggable="false"
    header="Add Publisher"
    :style="{ minWidth: '30rem' }"
  >
    <Form
      ref="formRef"
      :initialValues="initialCreateValues"
      :resolver
      @submit="handleSubmit"
      :validateOnSubmit="true"
      class="w-full flex flex-col gap-4"
    >
      <!-- Publisher Name -->
      <FormField v-slot="$field" name="name" class="flex flex-col">
        <label for="publisherName" class="font-semibold mb-2">Publisher Name</label>
        <InputText
          size="small"
          id="publisherName"
          class="w-full"
          placeholder="Enter publisher name"
        />
        <Message v-if="$field.invalid" severity="error" size="small" variant="simple">
          {{ $field.error?.message }}
        </Message>
      </FormField>

      <!-- Address -->
      <FormField v-slot="$field" name="address" class="flex flex-col">
        <label for="publisherAddress" class="font-semibold mb-2">Address</label>
        <InputText
          size="small"
          id="publisherAddress"
          class="w-full"
          placeholder="Enter publisher address"
        />
        <Message v-if="$field.invalid" severity="error" size="small" variant="simple">
          {{ $field.error?.message }}
        </Message>
      </FormField>
    </Form>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button
          type="button"
          label="Cancel"
          severity="secondary"
          @click="addPublisherVisible = false"
          :disabled="isSubmitting"
        />
        <Button
          @click="!isSubmitting && formRef?.submit()"
          type="button"
          label="Add Publisher"
          :class="`bg-(--my-secondary-color)! text-white! border-none! ${!isSubmitting ? 'hover:opacity-85!' : ''}`"
          :loading="isSubmitting"
          :disabled="isSubmitting"
        />
      </div>
    </template>
  </Dialog>

  <!-- Edit Publisher Dialog -->
  <Dialog
    v-model:visible="isOpenEdit"
    modal
    :draggable="false"
    header="Edit Publisher"
    :style="{ minWidth: '30rem' }"
  >
    <Form
      ref="formRef"
      :initialValues="selectedPublisher"
      :resolver
      @submit="handleEdit"
      :validateOnSubmit="true"
      class="w-full flex flex-col gap-4"
    >
      <!-- Publisher Name -->
      <FormField v-slot="$field" name="name" class="flex flex-col">
        <label for="publisherName" class="font-semibold mb-2">Publisher Name</label>
        <InputText
          size="small"
          id="publisherName"
          class="w-full"
          placeholder="Enter publisher name"
        />
        <Message v-if="$field.invalid" severity="error" size="small" variant="simple">
          {{ $field.error?.message }}
        </Message>
      </FormField>

      <!-- Address -->
      <FormField v-slot="$field" name="address" class="flex flex-col">
        <label for="publisherAddress" class="font-semibold mb-2">Address</label>
        <InputText
          size="small"
          id="publisherAddress"
          class="w-full"
          placeholder="Enter publisher address"
        />
        <Message v-if="$field.invalid" severity="error" size="small" variant="simple">
          {{ $field.error?.message }}
        </Message>
      </FormField>
    </Form>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button type="button" label="Close" severity="secondary" @click="isOpenEdit = false" />
        <Button
          type="submit"
          label="Save"
          class="bg-(--my-secondary-color)! text-white! border-none!"
          :disabled="isSubmitting"
          :loading="isSubmitting"
          @click="formRef?.submit()"
        />
      </div>
    </template>
  </Dialog>

  <Dialog
    v-model:visible="isOpenDeleteConfirm"
    modal
    :draggable="false"
    header="Confirm Delete"
    :style="{ minWidth: '30rem' }"
  >
    <div class="text-(--my-text-primary-color) text-center">
      Are you sure you want to delete publisher
      <span class="font-semibold text-(--my-secondary-color)">
        "{{ selectedPublisher?.name }}"
      </span>
      ?
    </div>
    <template #footer>
      <div class="flex justify-end gap-2">
        <Button
          type="button"
          label="Close"
          severity="secondary"
          @click="isOpenDeleteConfirm = false"
        />
        <Button
          type="button"
          label="Delete"
          severity="danger"
          class="text-white! border-none!"
          :disabled="isSubmitting"
          :loading="isSubmitting"
          @click="handleDelete"
        />
      </div>
    </template>
  </Dialog>
</template>

<style scoped>
/* Custom loading overlay */
:deep(.p-paginator-page-selected) {
  background-color: var(--my-secondary-color) !important;
  color: white !important;
}

.skeleton {
  background-color: #e0e0e0;
  animation: skeleton-pulse 3s ease-in-out infinite;
}

@keyframes skeleton-pulse {
  0%,
  100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}
</style>
