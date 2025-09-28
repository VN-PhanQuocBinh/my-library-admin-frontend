<script setup lang="ts">
import { watch, ref, onMounted } from 'vue'
import {
  DataTable,
  Column,
  IconField,
  InputIcon,
  InputText,
  Button,
  Dropdown,
  Dialog,
  Message,
  useToast,
  Tag,
} from 'primevue'

import { Form, FormField } from '@primevue/forms'
import { z } from 'zod'
import { zodResolver } from '@primevue/forms/resolvers/zod'

import { useDebounce } from '@/utils/use-debounce'
import { getAllUsers, createUser, updateUser } from '@/services/user.service'
import type { UserParams, CreateUserPayload } from '@/services/user.service'

// Types
interface Reader {
  _id: string
  firstname: string
  lastname: string
  gender: 'male' | 'female' | 'other'
  status: 'active' | 'inactive' | 'banned'
  dateOfBirth: Date
  phoneNumber: string
  email: string
  address: string
  createdAt?: Date
  updatedAt?: Date
}

const ReaderSchema = z.object({
  firstname: z.string().min(1, 'First name is required'),
  lastname: z.string().min(1, 'Last name is required'),
  gender: z.enum(['male', 'female', 'other']),
  email: z.string().email('Invalid email format'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  dateOfBirth: z.date(),
  address: z.string().min(1, 'Address is required'),
})

type ReaderFormType = z.infer<typeof ReaderSchema>

// State
const toast = useToast()
const resolver = zodResolver(ReaderSchema)

const readers = ref<Reader[]>([])
const isLoadingData = ref(false)
const expandedRows = ref({})

const searchQuery = ref('')
const selectedStatus = ref<string | null>(null)
const [debouncedSearchQuery, setDebouncedSearchQuery] = useDebounce('', 300)

const statusOptions = [
  { label: 'All', value: null },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Banned', value: 'banned' },
]

const genderOptions = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
]

// Dialog states
const addReaderVisible = ref(false)
const editReaderVisible = ref(false)
const editStatusVisible = ref(false)
const selectedReader = ref<Reader | undefined>(undefined)
const isSubmitting = ref(false)
const formRef = ref<any>(null)

const initialCreateValues = ref<Partial<CreateUserPayload>>({
  firstname: '',
  lastname: '',
  gender: 'male',
  email: '',
  phoneNumber: '',
  address: '',
  dateOfBirth: new Date(),
})

const pagination = ref({
  page: 0,
  limit: 10,
  total: 0,
  totalPages: 1,
})

// Methods
const fetchUsers = async (page = 0, limit = 10) => {
  try {
    isLoadingData.value = true

    const queries: UserParams = {}
    debouncedSearchQuery.value && (queries['query'] = debouncedSearchQuery.value)
    selectedStatus.value && (queries['status'] = selectedStatus.value || '')

    const response = await getAllUsers(queries)

    const { list, pagination: _pagination } = response.data
    readers.value = list
    pagination.value = {
      page: _pagination.page,
      limit: _pagination.limit,
      total: _pagination.total,
      totalPages: _pagination.totalPages,
    }
  } catch (error) {
    console.error('Error fetching readers:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to fetch readers',
      life: 3000,
    })
  } finally {
    isLoadingData.value = false
  }
}

const onPageChange = (event: any) => {
  pagination.value.page = event.page
  pagination.value.limit = event.rows
  fetchUsers(event.page, event.rows)
}

const handleCreateReader = async (data: CreateUserPayload) => {
  try {
    isSubmitting.value = true
    await createUser(data)
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Reader created successfully',
      life: 3000,
    })
    await fetchUsers()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to create reader',
      life: 3000,
    })
  } finally {
    addReaderVisible.value = false
    isSubmitting.value = false
  }
}

const handleEditReader = async (data: ReaderFormType) => {
  try {
    isSubmitting.value = true
    const userId = selectedReader.value?._id || ''
    if (!userId) throw new Error('User ID is missing')
    await updateUser(userId, data)
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Reader updated successfully',
      life: 3000,
    })
    await fetchUsers()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to update reader',
      life: 3000,
    })
  } finally {
    editReaderVisible.value = false
    isSubmitting.value = false
  }
}

const handleUpdateStatus = async (status: string) => {
  try {
    isSubmitting.value = true
    const userId = selectedReader.value?._id || ''
    if (!userId) throw new Error('User ID is missing')

    await updateUser(userId, { status })
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Reader status updated successfully',
      life: 3000,
    })
    await fetchUsers()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to update reader status',
      life: 3000,
    })
  } finally {
    editStatusVisible.value = false
    isSubmitting.value = false
  }
}

const handleSubmit = async (event: any) => {
  if (event.valid) {
    const { values: formValues } = event
    await handleCreateReader(formValues)
  } else {
    toast.add({
      severity: 'error',
      summary: 'Validation Error',
      detail: 'Please correct the errors in the form.',
      life: 3000,
    })
  }
}

const handleEditSubmit = async (event: any) => {
  if (event.valid) {
    const { values: formValues } = event
    await handleEditReader(formValues)
  } else {
    toast.add({
      severity: 'error',
      summary: 'Validation Error',
      detail: 'Please correct the errors in the form.',
      life: 3000,
    })
  }
}

const getStatusSeverity = (status: string) => {
  switch (status) {
    case 'active':
      return 'success'
    case 'inactive':
      return 'warn'
    case 'banned':
      return 'danger'
    default:
      return 'info'
  }
}

const openEditReader = (reader: Reader) => {
  selectedReader.value = { ...reader }
  editReaderVisible.value = true
}

const openEditStatus = (reader: Reader) => {
  selectedReader.value = reader
  editStatusVisible.value = true
}

// Watchers
watch(searchQuery, (newValue) => {
  setDebouncedSearchQuery(newValue)
})

watch([debouncedSearchQuery, selectedStatus], () => {
  pagination.value.page = 0
  fetchUsers()
})

onMounted(() => {
  fetchUsers()
})
</script>

<template>
  <DataTable
    :value="readers"
    :paginator="true"
    :rows="pagination.limit"
    :totalRecords="pagination.total"
    :first="pagination.page * pagination.limit"
    :lazy="true"
    @page="onPageChange"
    v-model:expandedRows="expandedRows"
    dataKey="_id"
  >
    <template #empty>
      <div class="text-(--my-text-secondary-color) text-center">No readers found.</div>
    </template>

    <template #header>
      <div class="flex flex-col gap-4">
        <div class="flex flex-row items-center justify-between gap-2.5">
          <h2 class="flex-1 text-lg font-semibold text-(--my-secondary-color)">Reader List</h2>

          <Button
            @click="addReaderVisible = true"
            icon="pi pi-plus"
            label="Add Reader"
            class="bg-(--my-primary-color)! border-none! hover:opacity-85! text-(--my-secondary-color)!"
          />
        </div>

        <div class="flex flex-row items-center gap-4">
          <IconField class="bg-white! flex-1">
            <InputIcon class="pi pi-search" />
            <InputText
              v-model="searchQuery"
              placeholder="Search by name or email..."
              class="w-full focus:border-(--my-primary-color)!"
            />
          </IconField>

          <Dropdown
            v-model="selectedStatus"
            :options="statusOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Filter by status"
            class="w-48"
          />
        </div>
      </div>
    </template>

    <Column expander style="width: 3rem" />

    <Column field="fullname" header="Full Name">
      <template #body="slotProps">
        <div v-if="isLoadingData" class="skeleton h-4 rounded w-32"></div>
        <span v-else>{{ slotProps.data.firstname }} {{ slotProps.data.lastname }}</span>
      </template>
    </Column>

    <Column field="email" header="Email">
      <template #body="slotProps">
        <div v-if="isLoadingData" class="skeleton h-4 rounded w-48"></div>
        <span v-else>{{ slotProps.data.email }}</span>
      </template>
    </Column>

    <Column field="dateOfBirth" header="Date of Birth">
      <template #body="slotProps">
        <div v-if="isLoadingData" class="skeleton h-4 rounded w-24"></div>
        <span v-else>{{ new Date(slotProps.data.dateOfBirth).toLocaleDateString() }}</span>
      </template>
    </Column>

    <Column field="address" header="Address">
      <template #body="slotProps">
        <div v-if="isLoadingData" class="skeleton h-4 rounded w-32"></div>
        <span v-else>{{ slotProps.data.address }}</span>
      </template>
    </Column>

    <Column field="status" header="Status">
      <template #body="slotProps">
        <div v-if="isLoadingData" class="skeleton h-4 rounded w-16"></div>
        <Tag
          v-else
          :value="slotProps.data.status"
          :severity="getStatusSeverity(slotProps.data.status)"
        />
      </template>
    </Column>

    <Column header="Actions" style="width: 8rem">
      <template #body="slotProps">
        <div v-if="isLoadingData" class="skeleton h-4 rounded w-24"></div>
        <div v-else class="flex gap-2">
          <Button
            icon="pi pi-pencil"
            size="small"
            @click="openEditReader(slotProps.data)"
            class="p-button-text"
          />
          <Button
            icon="pi pi-cog"
            size="small"
            @click="openEditStatus(slotProps.data)"
            class="p-button-text"
          />
        </div>
      </template>
    </Column>

    <template #expansion="slotProps">
      <div class="p-4">
        <h5 class="font-semibold mb-3">Additional Information</h5>
        <div class="grid grid-cols-2 gap-4">
          <div><strong>Gender:</strong> {{ slotProps.data.gender }}</div>
          <div><strong>Phone:</strong> {{ slotProps.data.phoneNumber }}</div>
          <div>
            <strong>Created:</strong> {{ new Date(slotProps.data.createdAt).toLocaleDateString() }}
          </div>
          <div>
            <strong>Updated:</strong> {{ new Date(slotProps.data.updatedAt).toLocaleDateString() }}
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      Showing {{ pagination.page * pagination.limit + 1 }} to
      {{ Math.min((pagination.page + 1) * pagination.limit, pagination.total) }}
      of {{ pagination.total }} readers.
    </template>
  </DataTable>

  <!-- Add Reader Dialog -->
  <Dialog
    v-model:visible="addReaderVisible"
    modal
    :draggable="false"
    header="Add Reader"
    :style="{ minWidth: '40rem' }"
  >
    <Form
      ref="formRef"
      :initialValues="initialCreateValues"
      :resolver
      @submit="handleSubmit"
      :validateOnSubmit="true"
      class="w-full flex flex-col gap-4"
    >
      <div class="grid grid-cols-2 gap-4">
        <FormField v-slot="$field" name="firstname" class="flex flex-col">
          <label class="font-semibold mb-2">First Name</label>
          <InputText size="small" class="w-full" placeholder="Enter first name" />
          <Message v-if="$field.invalid" severity="error" size="small" variant="simple">
            {{ $field.error?.message }}
          </Message>
        </FormField>

        <FormField v-slot="$field" name="lastname" class="flex flex-col">
          <label class="font-semibold mb-2">Last Name</label>
          <InputText size="small" class="w-full" placeholder="Enter last name" />
          <Message v-if="$field.invalid" severity="error" size="small" variant="simple">
            {{ $field.error?.message }}
          </Message>
        </FormField>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <FormField v-slot="$field" name="gender" class="flex flex-col">
          <label class="font-semibold mb-2">Gender</label>
          <Dropdown
            :options="genderOptions"
            optionLabel="label"
            optionValue="value"
            class="w-full"
          />
        </FormField>

        <FormField v-slot="$field" name="dateOfBirth" class="flex flex-col">
          <label class="font-semibold mb-2">Date of Birth</label>
          <InputText type="date" size="small" class="w-full" />
        </FormField>
      </div>

      <FormField v-slot="$field" name="email" class="flex flex-col">
        <label class="font-semibold mb-2">Email</label>
        <InputText size="small" class="w-full" placeholder="Enter email" />
        <Message v-if="$field.invalid" severity="error" size="small" variant="simple">
          {{ $field.error?.message }}
        </Message>
      </FormField>

      <FormField v-slot="$field" name="phoneNumber" class="flex flex-col">
        <label class="font-semibold mb-2">Phone Number</label>
        <InputText size="small" class="w-full" placeholder="Enter phone number" />
        <Message v-if="$field.invalid" severity="error" size="small" variant="simple">
          {{ $field.error?.message }}
        </Message>
      </FormField>

      <FormField v-slot="$field" name="address" class="flex flex-col">
        <label class="font-semibold mb-2">Address</label>
        <InputText size="small" class="w-full" placeholder="Enter address" />
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
          @click="addReaderVisible = false"
          :disabled="isSubmitting"
        />
        <Button
          @click="!isSubmitting && formRef?.submit()"
          type="button"
          label="Add Reader"
          :class="`bg-(--my-secondary-color)! text-white! border-none! ${!isSubmitting ? 'hover:opacity-85!' : ''}`"
          :loading="isSubmitting"
          :disabled="isSubmitting"
        />
      </div>
    </template>
  </Dialog>

  <!-- Edit Reader Dialog -->
  <Dialog
    v-model:visible="editReaderVisible"
    modal
    :draggable="false"
    header="Edit Reader"
    :style="{ minWidth: '40rem' }"
  >
    <Form
      ref="formRef"
      :initialValues="selectedReader"
      :resolver
      @submit="handleEditSubmit"
      :validateOnSubmit="true"
      class="w-full flex flex-col gap-4"
    >
      <!-- Same form fields as Add Reader -->
      <div class="grid grid-cols-2 gap-4">
        <FormField v-slot="$field" name="firstname" class="flex flex-col">
          <label class="font-semibold mb-2">First Name</label>
          <InputText size="small" class="w-full" placeholder="Enter first name" />
          <Message v-if="$field.invalid" severity="error" size="small" variant="simple">
            {{ $field.error?.message }}
          </Message>
        </FormField>

        <FormField v-slot="$field" name="lastname" class="flex flex-col">
          <label class="font-semibold mb-2">Last Name</label>
          <InputText size="small" class="w-full" placeholder="Enter last name" />
          <Message v-if="$field.invalid" severity="error" size="small" variant="simple">
            {{ $field.error?.message }}
          </Message>
        </FormField>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <FormField v-slot="$field" name="gender" class="flex flex-col">
          <label class="font-semibold mb-2">Gender</label>
          <Dropdown
            :options="genderOptions"
            optionLabel="label"
            optionValue="value"
            class="w-full"
          />
        </FormField>

        <FormField v-slot="$field" name="dateOfBirth" class="flex flex-col">
          <label class="font-semibold mb-2">Date of Birth</label>
          <InputText type="date" size="small" class="w-full" />
        </FormField>
      </div>

      <FormField v-slot="$field" name="email" class="flex flex-col">
        <label class="font-semibold mb-2">Email</label>
        <InputText size="small" class="w-full" placeholder="Enter email" />
        <Message v-if="$field.invalid" severity="error" size="small" variant="simple">
          {{ $field.error?.message }}
        </Message>
      </FormField>

      <FormField v-slot="$field" name="phoneNumber" class="flex flex-col">
        <label class="font-semibold mb-2">Phone Number</label>
        <InputText size="small" class="w-full" placeholder="Enter phone number" />
        <Message v-if="$field.invalid" severity="error" size="small" variant="simple">
          {{ $field.error?.message }}
        </Message>
      </FormField>

      <FormField v-slot="$field" name="address" class="flex flex-col">
        <label class="font-semibold mb-2">Address</label>
        <InputText size="small" class="w-full" placeholder="Enter address" />
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
          @click="editReaderVisible = false"
          :disabled="isSubmitting"
        />
        <Button
          @click="!isSubmitting && formRef?.submit()"
          type="button"
          label="Save Changes"
          :class="`bg-(--my-secondary-color)! text-white! border-none! ${!isSubmitting ? 'hover:opacity-85!' : ''}`"
          :loading="isSubmitting"
          :disabled="isSubmitting"
        />
      </div>
    </template>
  </Dialog>

  <!-- Edit Status Dialog -->
  <Dialog
    v-model:visible="editStatusVisible"
    modal
    :draggable="false"
    header="Update Reader Status"
    :style="{ minWidth: '25rem' }"
  >
    <div class="flex flex-col gap-4">
      <p>
        Update status for
        <strong>{{ selectedReader?.firstname }} {{ selectedReader?.lastname }}</strong
        >:
      </p>

      <div class="flex gap-2">
        <Button
          label="Active"
          severity="success"
          @click="handleUpdateStatus('active')"
          :loading="isSubmitting"
          :disabled="isSubmitting || selectedReader?.status === 'active'"
        />
        <Button
          label="Inactive"
          severity="warn"
          @click="handleUpdateStatus('inactive')"
          :loading="isSubmitting"
          :disabled="isSubmitting || selectedReader?.status === 'inactive'"
        />
        <Button
          label="Banned"
          severity="danger"
          @click="handleUpdateStatus('banned')"
          :loading="isSubmitting"
          :disabled="isSubmitting || selectedReader?.status === 'banned'"
        />
      </div>
    </div>

    <template #footer>
      <Button
        label="Close"
        severity="secondary"
        @click="editStatusVisible = false"
        :disabled="isSubmitting"
      />
    </template>
  </Dialog>
</template>

<style scoped>
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

:deep(.p-paginator-page-selected) {
  background-color: var(--my-secondary-color) !important;
  color: white !important;
}
</style>
