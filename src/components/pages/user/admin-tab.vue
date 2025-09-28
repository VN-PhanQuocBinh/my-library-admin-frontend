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
import { getAllAdmins, createAdmin, updateAdmin, updateAdminStatus } from '@/utils/admin.service'

// Types
interface Admin {
  _id: string
  fullname: string
  duty: 'staff' | 'manager'
  email: string
  phoneNumber: string
  address: string
  status: 'active' | 'inactive'
  createdAt?: Date
  updatedAt?: Date
}

const AdminSchema = z.object({
  fullname: z.string().min(1, 'Full name is required'),
  duty: z.enum(['staff', 'manager']),
  email: z.string().email('Invalid email format'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  address: z.string().min(1, 'Address is required'),
})

type AdminFormType = z.infer<typeof AdminSchema>

// State
const toast = useToast()
const resolver = zodResolver(AdminSchema)

const admins = ref<Admin[]>([])
const isLoadingData = ref(false)
const expandedRows = ref({})

const searchQuery = ref('')
const selectedStatus = ref<string | null>(null)
const selectedDuty = ref<string | null>(null)
const [debouncedSearchQuery, setDebouncedSearchQuery] = useDebounce('', 300)

const statusOptions = [
  { label: 'All', value: null },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
]

const dutyOptions = [
  { label: 'All', value: null },
  { label: 'Staff', value: 'staff' },
  { label: 'Manager', value: 'manager' },
]

const dutyFormOptions = [
  { label: 'Staff', value: 'staff' },
  { label: 'Manager', value: 'manager' },
]

// Dialog states
const addAdminVisible = ref(false)
const editAdminVisible = ref(false)
const editStatusVisible = ref(false)
const selectedAdmin = ref<Admin | undefined>(undefined)
const isSubmitting = ref(false)
const formRef = ref<any>(null)

const initialCreateValues = ref<Partial<AdminFormType>>({
  fullname: '',
  duty: 'staff',
  email: '',
  phoneNumber: '',
  address: '',
})

const pagination = ref({
  page: 0,
  limit: 10,
  total: 0,
  totalPages: 1,
})

// Methods
const fetchAdmins = async (page = 0, limit = 10) => {
  try {
    isLoadingData.value = true
    const response = await getAllAdmins({
      query: debouncedSearchQuery.value,
      status: selectedStatus.value,
      duty: selectedDuty.value,
      page,
      limit,
    })

    const { list, pagination: _pagination } = response.data
    admins.value = list
    pagination.value = {
      page: _pagination.page,
      limit: _pagination.limit,
      total: _pagination.total,
      totalPages: _pagination.totalPages,
    }
  } catch (error) {
    console.error('Error fetching admins:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to fetch admins',
      life: 3000,
    })
  } finally {
    isLoadingData.value = false
  }
}

const onPageChange = (event: any) => {
  pagination.value.page = event.page
  pagination.value.limit = event.rows
  fetchAdmins(event.page, event.rows)
}

const handleCreateAdmin = async (data: AdminFormType) => {
  try {
    isSubmitting.value = true
    await createAdmin(data)
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Admin created successfully',
      life: 3000,
    })
    await fetchAdmins()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to create admin',
      life: 3000,
    })
  } finally {
    addAdminVisible.value = false
    isSubmitting.value = false
  }
}

const handleEditAdmin = async (data: AdminFormType) => {
  try {
    isSubmitting.value = true
    await updateAdmin({ _id: selectedAdmin.value?._id, ...data })
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Admin updated successfully',
      life: 3000,
    })
    await fetchAdmins()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to update admin',
      life: 3000,
    })
  } finally {
    editAdminVisible.value = false
    isSubmitting.value = false
  }
}

const handleUpdateStatus = async (status: string) => {
  try {
    isSubmitting.value = true
    await updateAdminStatus(selectedAdmin.value?._id as string, status)
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Admin status updated successfully',
      life: 3000,
    })
    await fetchAdmins()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to update admin status',
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
    await handleCreateAdmin(formValues)
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
    await handleEditAdmin(formValues)
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
    default:
      return 'info'
  }
}

const getDutySeverity = (duty: string) => {
  switch (duty) {
    case 'manager':
      return 'info'
    case 'staff':
      return 'secondary'
    default:
      return 'info'
  }
}

const openEditAdmin = (admin: Admin) => {
  selectedAdmin.value = { ...admin }
  editAdminVisible.value = true
}

const openEditStatus = (admin: Admin) => {
  selectedAdmin.value = admin
  editStatusVisible.value = true
}

// Watchers
watch(searchQuery, (newValue) => {
  setDebouncedSearchQuery(newValue)
})

watch([debouncedSearchQuery, selectedStatus, selectedDuty], () => {
  pagination.value.page = 0
  fetchAdmins()
})

onMounted(() => {
  fetchAdmins()
})
</script>

<template>
  <DataTable
    :value="admins"
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
      <div class="text-(--my-text-secondary-color) text-center">No admins found.</div>
    </template>

    <template #header>
      <div class="flex flex-col gap-4">
        <div class="flex flex-row items-center justify-between gap-2.5">
          <h2 class="flex-1 text-lg font-semibold text-(--my-secondary-color)">Admin List</h2>

          <Button
            @click="addAdminVisible = true"
            icon="pi pi-plus"
            label="Add Admin"
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

          <Dropdown
            v-model="selectedDuty"
            :options="dutyOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Filter by duty"
            class="w-48"
          />
        </div>
      </div>
    </template>

    <Column expander style="width: 3rem" />

    <Column field="fullname" header="Full Name">
      <template #body="slotProps">
        <div v-if="isLoadingData" class="skeleton h-4 rounded w-32"></div>
        <span v-else>{{ slotProps.data.fullname }}</span>
      </template>
    </Column>

    <Column field="email" header="Email">
      <template #body="slotProps">
        <div v-if="isLoadingData" class="skeleton h-4 rounded w-48"></div>
        <span v-else>{{ slotProps.data.email }}</span>
      </template>
    </Column>

    <Column field="address" header="Address">
      <template #body="slotProps">
        <div v-if="isLoadingData" class="skeleton h-4 rounded w-32"></div>
        <span v-else>{{ slotProps.data.address }}</span>
      </template>
    </Column>

    <Column field="duty" header="Duty">
      <template #body="slotProps">
        <div v-if="isLoadingData" class="skeleton h-4 rounded w-16"></div>
        <Tag v-else :value="slotProps.data.duty" :severity="getDutySeverity(slotProps.data.duty)" />
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
            @click="openEditAdmin(slotProps.data)"
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
          <div><strong>Phone:</strong> {{ slotProps.data.phoneNumber }}</div>
          <div><strong>Duty:</strong> {{ slotProps.data.duty }}</div>
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
      of {{ pagination.total }} admins.
    </template>
  </DataTable>

  <!-- Add Admin Dialog -->
  <Dialog
    v-model:visible="addAdminVisible"
    modal
    :draggable="false"
    header="Add Admin"
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
      <FormField v-slot="$field" name="fullname" class="flex flex-col">
        <label class="font-semibold mb-2">Full Name</label>
        <InputText size="small" class="w-full" placeholder="Enter full name" />
        <Message v-if="$field.invalid" severity="error" size="small" variant="simple">
          {{ $field.error?.message }}
        </Message>
      </FormField>

      <div class="grid grid-cols-2 gap-4">
        <FormField v-slot="$field" name="email" class="flex flex-col">
          <label class="font-semibold mb-2">Email</label>
          <InputText size="small" class="w-full" placeholder="Enter email" />
          <Message v-if="$field.invalid" severity="error" size="small" variant="simple">
            {{ $field.error?.message }}
          </Message>
        </FormField>

        <FormField v-slot="$field" name="duty" class="flex flex-col">
          <label class="font-semibold mb-2">Duty</label>
          <Dropdown
            :options="dutyFormOptions"
            optionLabel="label"
            optionValue="value"
            class="w-full"
          />
        </FormField>
      </div>

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
          @click="addAdminVisible = false"
          :disabled="isSubmitting"
        />
        <Button
          @click="!isSubmitting && formRef?.submit()"
          type="button"
          label="Add Admin"
          :class="`bg-(--my-secondary-color)! text-white! border-none! ${!isSubmitting ? 'hover:opacity-85!' : ''}`"
          :loading="isSubmitting"
          :disabled="isSubmitting"
        />
      </div>
    </template>
  </Dialog>

  <!-- Edit Admin Dialog -->
  <Dialog
    v-model:visible="editAdminVisible"
    modal
    :draggable="false"
    header="Edit Admin"
    :style="{ minWidth: '35rem' }"
  >
    <Form
      ref="formRef"
      :initialValues="selectedAdmin"
      :resolver
      @submit="handleEditSubmit"
      :validateOnSubmit="true"
      class="w-full flex flex-col gap-4"
    >
      <FormField v-slot="$field" name="fullname" class="flex flex-col">
        <label class="font-semibold mb-2">Full Name</label>
        <InputText size="small" class="w-full" placeholder="Enter full name" />
        <Message v-if="$field.invalid" severity="error" size="small" variant="simple">
          {{ $field.error?.message }}
        </Message>
      </FormField>

      <div class="grid grid-cols-2 gap-4">
        <FormField v-slot="$field" name="email" class="flex flex-col">
          <label class="font-semibold mb-2">Email</label>
          <InputText size="small" class="w-full" placeholder="Enter email" />
          <Message v-if="$field.invalid" severity="error" size="small" variant="simple">
            {{ $field.error?.message }}
          </Message>
        </FormField>

        <FormField v-slot="$field" name="duty" class="flex flex-col">
          <label class="font-semibold mb-2">Duty</label>
          <Dropdown
            :options="dutyFormOptions"
            optionLabel="label"
            optionValue="value"
            class="w-full"
          />
        </FormField>
      </div>

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
          @click="editAdminVisible = false"
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
    header="Update Admin Status"
    :style="{ minWidth: '25rem' }"
  >
    <div class="flex flex-col gap-4">
      <p>
        Update status for <strong>{{ selectedAdmin?.fullname }}</strong
        >:
      </p>

      <div class="flex gap-2">
        <Button
          label="Active"
          severity="success"
          @click="handleUpdateStatus('active')"
          :loading="isSubmitting"
          :disabled="isSubmitting || selectedAdmin?.status === 'active'"
        />
        <Button
          label="Inactive"
          severity="warn"
          @click="handleUpdateStatus('inactive')"
          :loading="isSubmitting"
          :disabled="isSubmitting || selectedAdmin?.status === 'inactive'"
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
