<script setup lang="ts">
import { watch, ref, onMounted } from 'vue'
import {
  DataTable,
  Column,
  IconField,
  InputIcon,
  InputText,
  InputNumber,
  Button,
  Popover,
  Dialog,
  Message,
  Toast,
  useToast,
  Select,
  Tag,
} from 'primevue'

import { Form, FormField } from '@primevue/forms'
import { z } from 'zod'
import { zodResolver } from '@primevue/forms/resolvers/zod'

import { useDebounce } from '@/utils/use-debounce'

import {
  createBorrowingRegistration,
  getAllBorrowingRegistrations,
  updateBorrowingStatus,
} from '@/services/borrowing.service.ts'
import { getAllUsers } from '@/services/user.service'
import { fetchBooks as getAllBooks } from '@/services/book.service.ts'

// Define schema for borrowing registration
const BorrowingRegistrationSchema = z.object({
  userId: z.string().min(1, 'Please select a user'),
  bookId: z.string().min(1, 'Please select a book'),
  maxBorrowDays: z
    .number()
    .min(1, 'Max borrow days must be at least 1')
    .max(365, 'Max borrow days cannot exceed 365'),
})

type BorrowingRegistrationType = z.infer<typeof BorrowingRegistrationSchema>

interface BorrowingRegistration {
  _id: string
  userId: {
    _id: string
    name: string
    email: string
  }
  bookId: {
    _id: string
    title: string
    author: string
  }
  borrowDate: string
  returnDate?: string
  maxBorrowDays: number
  status: 'pending' | 'approved' | 'rejected' | 'returned'
}

interface User {
  _id: string
  firstname: string
  lastname: string
  fullname: string
  email: string
}

interface Book {
  _id: string
  title: string
  author: string
  isAvailable: boolean
}

// State variables
const resolver = zodResolver(BorrowingRegistrationSchema)
const initialCreateValues = ref<BorrowingRegistrationType>({
  userId: '',
  bookId: '',
  maxBorrowDays: 14,
})

// Toast for notifications
const toast = useToast()

const borrowingRegistrations = ref<BorrowingRegistration[]>([])
const users = ref<User[]>([])
const books = ref<Book[]>([])
const isLoadingData = ref(false)

const open = ref<any>(null)
const isOpenStatusConfirm = ref(false)
const formRef = ref<any>(null)
const isSubmitting = ref(false)

const addBorrowingVisible = ref<boolean>(false)
const selectedRegistration = ref<BorrowingRegistration | undefined>(undefined)
const actionType = ref<'approve' | 'reject' | 'pending'>('approve')

const searchQuery = ref('')
const statusFilter = ref('')
const [debouncedSearchQuery, setDebouncedSearchQuery] = useDebounce('', 300)

const pagination = ref<{ page: number; limit: number; total: number; totalPages: number }>({
  page: 0,
  limit: 10,
  totalPages: 1,
  total: 0,
})

// Options for status filter
const statusOptions = [
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Returned', value: 'returned' },
]

// Fetch borrowing registrations from the API
const fetchBorrowingRegistrations = async (page = 0, limit = 10) => {
  try {
    isLoadingData.value = true
    const response = await getAllBorrowingRegistrations({
      query: debouncedSearchQuery.value,
      status: statusFilter.value,
      page,
      limit,
    })
    const { list, pagination: _pagination } = response.data

    borrowingRegistrations.value = list

    pagination.value = {
      page: _pagination.page,
      limit: _pagination.limit,
      total: _pagination.total,
      totalPages: _pagination.totalPages,
    }
  } catch (error: any) {
    console.error('Error fetching borrowing registrations:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error?.response?.data?.message || 'Failed to fetch borrowing registrations',
      life: 3000,
    })
  } finally {
    isLoadingData.value = false
  }
}

// Fetch users for dropdown
const fetchUsers = async () => {
  try {
    const response = await getAllUsers({ all: true })
    const fetchedUsers = response.data.list || []

    users.value = fetchedUsers.map((user: User) => ({
      ...user,
      fullname: `${user.lastname} ${user.firstname}`,
    }))

    console.log('Fetched users:', users.value)
  } catch (error) {
    console.error('Error fetching users:', error)
  }
}

// Fetch available books for dropdown
const fetchBooks = async () => {
  try {
    const response = await getAllBooks({ status: true })

    books.value = response.data.list || response.data
  } catch (error) {
    console.error('Error fetching books:', error)
  }
}

// Handle pagination change
const onPageChange = (event: any) => {
  pagination.value.page = event.page
  pagination.value.limit = event.rows
  fetchBorrowingRegistrations(event.page, event.rows)
}

// Watch for search query changes
watch(searchQuery, (newValue) => {
  setDebouncedSearchQuery(newValue)
})

watch(debouncedSearchQuery, () => {
  pagination.value.page = 0
  fetchBorrowingRegistrations()
})

// Watch for status filter changes
watch(statusFilter, () => {
  pagination.value.page = 0
  fetchBorrowingRegistrations()
})

onMounted(() => {
  fetchBorrowingRegistrations()
  fetchUsers()
  fetchBooks()
})

const toggleOpen = (event: any, selectedInfo: BorrowingRegistration) => {
  selectedRegistration.value = selectedInfo
  open.value?.toggle(event)
}

const handleCreateBorrowingRegistration = async (data: BorrowingRegistrationType) => {
  try {
    isSubmitting.value = true
    await createBorrowingRegistration(data)
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Borrowing registration created successfully',
      life: 3000,
    })
    await fetchBorrowingRegistrations()
  } catch (error: any) {
    const detailMessage =
      error?.response?.data?.message || 'Failed to create borrowing registration'

    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: detailMessage,
      life: 3000,
    })
  } finally {
    addBorrowingVisible.value = false
    isSubmitting.value = false
  }
}

const handleSubmit = async (event: any) => {
  if (event.valid) {
    const { values: formValues } = event
    console.log('Form Values:', formValues)
    await handleCreateBorrowingRegistration(formValues)
  } else {
    toast.add({
      severity: 'error',
      summary: 'Validation Error',
      detail: 'Please correct the errors in the form.',
      life: 3000,
    })
  }
}

const handleStatusAction = (action: 'approve' | 'reject' | 'pending') => {
  console.log('Action:', action)
  actionType.value = action
  isOpenStatusConfirm.value = true
}

const confirmStatusChange = async () => {
  try {
    isSubmitting.value = true
    const status =
      actionType.value === 'approve'
        ? 'approved'
        : actionType.value === 'reject'
          ? 'rejected'
          : 'pending'

    await updateBorrowingStatus(selectedRegistration.value?._id as string, status)
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: `Borrowing registration ${actionType.value}d successfully`,
      life: 3000,
    })
    await fetchBorrowingRegistrations()
  } catch (error) {
    console.error('Error updating status:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: `Failed to ${actionType.value} borrowing registration`,
      life: 3000,
    })
  } finally {
    isOpenStatusConfirm.value = false
    isSubmitting.value = false
  }
}

// Get status severity for Tag component
const getStatusSeverity = (status: string) => {
  switch (status) {
    case 'pending':
      return 'warn'
    case 'approved':
      return 'success'
    case 'rejected':
      return 'danger'
    case 'returned':
      return 'info'
    default:
      return 'secondary'
  }
}

// Calculate days borrowed
const calculateDaysBorrowed = (borrowDate: string) => {
  const borrow = new Date(borrowDate)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - borrow.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}
</script>

<template>
  <Toast position="bottom-right" />

  <DataTable
    :value="borrowingRegistrations"
    :paginator="true"
    :rows="pagination.limit"
    :totalRecords="pagination.total"
    :first="pagination.page * pagination.limit"
    :lazy="true"
    @page="onPageChange"
  >
    <template #empty>
      <div class="text-(--my-text-secondary-color) text-center">
        No borrowing registrations found.
      </div>
    </template>

    <template #header>
      <div class="flex flex-row items-center justify-between gap-2.5">
        <h2 class="flex-1 text-lg font-semibold text-(--my-secondary-color)">
          Borrowing Registrations
        </h2>

        <div class="flex flex-row items-center gap-2.5">
          <IconField class="bg-white!">
            <InputIcon class="pi pi-search sp" />
            <InputText
              v-model="searchQuery"
              placeholder="Search by user or book name..."
              class="focus:border-(--my-primary-color)!"
            />
          </IconField>

          <Select
            v-model="statusFilter"
            :options="statusOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Filter by status"
            class="min-w-[150px]"
            :showClear="true"
          />

          <Button
            @click="addBorrowingVisible = true"
            icon="pi pi-plus"
            label="New Registration"
            class="bg-(--my-primary-color)! border-none! hover:opacity-85! text-(--my-secondary-color)!"
          />
        </div>
      </div>
    </template>

    <Column field="userId.name" header="Borrower Name">
      <template #body="slotProps">
        <div v-if="isLoadingData" class="skeleton h-4 rounded w-32"></div>
        <span v-else class="">{{
          slotProps.data.userId?.lastname + ' ' + slotProps.data.userId?.firstname
        }}</span>
      </template>
    </Column>

    <Column field="bookId.title" header="Book Title">
      <template #body="slotProps">
        <div v-if="isLoadingData" class="skeleton h-4 rounded w-48"></div>
        <span v-else class="text-(--my-text-primary-color)">{{ slotProps.data.bookId?.name }}</span>
      </template>
    </Column>

    <Column field="borrowDate" header="Borrow Date">
      <template #body="slotProps">
        <div v-if="isLoadingData" class="skeleton h-4 rounded w-24"></div>
        <span v-else class="text-(--my-text-primary-color)">
          {{ new Date(slotProps.data.borrowedAt).toLocaleDateString() }}
        </span>
      </template>
    </Column>

    <Column field="status" header="Status">
      <template #body="slotProps">
        <div v-if="isLoadingData" class="skeleton h-4 rounded w-20"></div>
        <Tag
          v-else
          :value="slotProps.data.status"
          :severity="getStatusSeverity(slotProps.data.status)"
          class="capitalize"
        />
      </template>
    </Column>

    <Column field="returnDate" header="Return Date">
      <template #body="slotProps">
        <div v-if="isLoadingData" class="skeleton h-4 rounded w-24"></div>
        <span v-else class="text-(--my-text-primary-color)">
          {{
            slotProps.data.returnDate
              ? new Date(slotProps.data.returnDate).toLocaleDateString()
              : '-'
          }}
        </span>
      </template>
    </Column>

    <Column field="maxBorrowDays" header="Max Days">
      <template #body="slotProps">
        <div v-if="isLoadingData" class="skeleton h-4 rounded w-16"></div>
        <span v-else class="text-(--my-text-primary-color)">
          {{ slotProps.data.maxBorrowDays }} days
        </span>
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
      of {{ pagination.total }} registrations.
    </template>
  </DataTable>

  <Popover ref="open" placement="top" class="min-w-[120px]">
    <div class="flex flex-col">
      <button
        v-if="selectedRegistration?.status !== 'pending'"
        @click="handleStatusAction('pending')"
        class="flex flex-row items-center gap-2.5 px-3 py-2 rounded-md hover:bg-(--my-secondary-color) hover:text-white transition-all duration-200"
      >
        <i class="pi pi-clock"></i>
        <span>Pending</span>
      </button>
      <button
        v-if="selectedRegistration?.status !== 'approved'"
        @click="handleStatusAction('approve')"
        class="flex flex-row items-center gap-2.5 px-3 py-2 rounded-md hover:bg-(--my-secondary-color) hover:text-white transition-all duration-200"
      >
        <i class="pi pi-check"></i>
        <span>Approve</span>
      </button>
      <button
        v-if="selectedRegistration?.status !== 'rejected'"
        @click="handleStatusAction('reject')"
        class="flex flex-row items-center gap-2.5 px-3 py-2 rounded-md hover:bg-(--my-secondary-color) hover:text-white transition-all duration-200"
      >
        <i class="pi pi-times"></i>
        <span>Reject</span>
      </button>
    </div>
  </Popover>

  <!-- Add Borrowing Registration Dialog -->
  <Dialog
    v-model:visible="addBorrowingVisible"
    modal
    :draggable="false"
    header="New Borrowing Registration"
    :style="{ minWidth: '35rem' }"
  >
    <Form
      ref="formRef"
      :initialValues="initialCreateValues"
      :resolver
      @submit="handleSubmit"
      :validateOnSubmit="true"
      class="w-full flex flex-col gap-4"
    >
      <!-- User Selection -->
      <FormField v-slot="$field" name="userId" class="flex flex-col" :validateOnSubmit="true">
        <label for="userId" class="font-semibold mb-2">Select User</label>
        <Select
          id="userId"
          :options="users"
          optionLabel="fullname"
          optionValue="_id"
          placeholder="Search and select a user"
          filter
          filterPlaceholder="Search users..."
          class="w-full"
        >
          <template #option="slotProps">
            <div class="flex flex-col">
              <span class="font-medium">{{ slotProps.option.fullname }}</span>
              <small class="text-(--my-text-secondary-color)">{{ slotProps.option.email }}</small>
            </div>
          </template>
        </Select>
        <Message v-if="$field.invalid" severity="error" size="small" variant="simple">
          {{ $field.error?.message }}
        </Message>
      </FormField>

      <!-- Book Selection -->
      <FormField v-slot="$field" name="bookId" class="flex flex-col">
        <label for="bookId" class="font-semibold mb-2">Select Book</label>
        <Select
          id="bookId"
          :options="books"
          optionLabel="name"
          optionValue="_id"
          placeholder="Search and select a book"
          filter
          filterPlaceholder="Search books..."
          class="w-full"
        >
          <template #option="slotProps">
            <div class="flex flex-col">
              <span class="font-medium">{{ slotProps.option.name }}</span>
              <small class="text-(--my-text-secondary-color)"
                >by {{ slotProps.option.author }}</small
              >
            </div>
          </template>
        </Select>
        <Message v-if="$field.invalid" severity="error" size="small" variant="simple">
          {{ $field.error?.message }}
        </Message>
      </FormField>

      <!-- Max Borrow Days -->
      <FormField v-slot="$field" name="maxBorrowDays" class="flex flex-col">
        <label for="maxBorrowDays" class="font-semibold mb-2">Maximum Borrow Days</label>
        <InputNumber
          v-model="$field.value"
          id="maxBorrowDays"
          :showButtons="true"
          :min="1"
          :max="365"
          class="w-full"
          placeholder="Enter maximum days (e.g., 14)"
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
          @click="addBorrowingVisible = false"
          :disabled="isSubmitting"
        />
        <Button
          @click="!isSubmitting && formRef?.submit()"
          type="button"
          label="Create Registration"
          :class="`bg-(--my-secondary-color)! text-white! border-none! ${!isSubmitting ? 'hover:opacity-85!' : ''}`"
          :loading="isSubmitting"
          :disabled="isSubmitting"
        />
      </div>
    </template>
  </Dialog>

  <!-- Status Confirmation Dialog -->
  <Dialog
    v-model:visible="isOpenStatusConfirm"
    modal
    :draggable="false"
    :header="`Confirm ${actionType === 'approve' ? 'Approval' : actionType === 'reject' ? 'Rejection' : 'Pending'} of Registration`"
    :style="{ minWidth: '30rem' }"
  >
    <div class="text-(--my-text-primary-color) text-center">
      Are you sure you want to {{ actionType }} the borrowing registration for
      <span class="font-semibold text-(--my-secondary-color)">
        "{{ selectedRegistration?.bookId?.title }}"
      </span>
      by
      <span class="font-semibold text-(--my-secondary-color)">
        "{{ selectedRegistration?.userId?.name }}" </span
      >?
    </div>
    <template #footer>
      <div class="flex justify-end gap-2">
        <Button
          type="button"
          label="Cancel"
          severity="secondary"
          @click="isOpenStatusConfirm = false"
        />
        <Button
          type="button"
          :label="
            actionType === 'approve'
              ? 'Approve'
              : actionType === 'reject'
                ? 'Reject'
                : 'Set to Pending'
          "
          :severity="
            actionType === 'approve' ? 'success' : actionType === 'reject' ? 'danger' : 'warn'
          "
          class="text-white! border-none!"
          :disabled="isSubmitting"
          :loading="isSubmitting"
          @click="confirmStatusChange"
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
