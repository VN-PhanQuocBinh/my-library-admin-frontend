<script setup lang="ts">
import { watch, ref, onMounted } from 'vue'
import {
  DataTable,
  Column,
  IconField,
  InputIcon,
  InputText,
  Button,
  Select, 
  Dialog,
  Message,
  useToast,
  Tag,
  Divider,
  Popover,
  DatePicker,
  Password, 
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
  password: z.string().min(6, 'Password must be at least 6 characters long'),
})

type ReaderFormType = z.infer<typeof ReaderSchema>

// State
const toast = useToast()
const resolver = zodResolver(ReaderSchema)
const editResolver = zodResolver(ReaderSchema.omit({ email: true, password: true })) 

const readers = ref<Reader[]>([])
const isLoadingData = ref(false)
const expandedRows = ref({})

const searchQuery = ref('')
const selectedStatus = ref<string | null>(null)
const selectedGender = ref<string | null>(null) // Added gender filter
const [debouncedSearchQuery, setDebouncedSearchQuery] = useDebounce('', 300)

const statusOptions = [
  { label: 'Hoạt động', value: 'active' },
  { label: 'Không hoạt động', value: 'inactive' },
  { label: 'Bị cấm', value: 'banned' },
]

const genderOptions = [
  { label: 'Nam', value: 'male' },
  { label: 'Nữ', value: 'female' },
  { label: 'Khác', value: 'other' },
]

// Action menu
const openActions = ref<any>(null)

// Dialog states
const addReaderVisible = ref(false)
const editReaderVisible = ref(false)
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
  password: '',
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

    const queries: UserParams = { page, limit } // Added page and limit
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
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Không thể lấy danh sách độc giả',
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
      detail: 'Tạo độc giả thành công',
      life: 3000,
    })
    await fetchUsers()
    addReaderVisible.value = false // Moved inside try block
  } catch (error: any) {
    // Added error type and better error handling
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error?.response?.data?.message || 'Tạo độc giả thất bại',
      life: 3000,
    })
  } finally {
    isSubmitting.value = false
  }
}

const handleEditReader = async (data: ReaderFormType) => {
  try {
    isSubmitting.value = true
    const userId = selectedReader.value?._id || ''
    if (!userId) throw new Error('Thiếu ID người dùng')
    await updateUser(userId, data)
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Cập nhật độc giả thành công',
      life: 3000,
    })
    await fetchUsers()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Cập nhật độc giả thất bại',
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
      detail: 'Cập nhật trạng thái độc giả thành công',
      life: 3000,
    })
    await fetchUsers()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Cập nhật trạng thái độc giả thất bại',
      life: 3000,
    })
  } finally {
    openActions.value?.hide() // Added
    isSubmitting.value = false
  }
}

const handleSubmit = async (event: any) => {
  console.log(event)

  if (event.valid) {
    const { values: formValues } = event
    await handleCreateReader(formValues)
  } else {
    toast.add({
      severity: 'error',
      summary: 'Validation Error',
      detail: 'Vui lòng sửa các lỗi trong biểu mẫu.',
      life: 3000,
    })
  }
}

const handleEditSubmit = async (event: any) => {
  console.log(event)

  if (event.valid) {
    const { values: formValues } = event
    await handleEditReader(formValues)
  } else {
    toast.add({
      severity: 'error',
      summary: 'Validation Error',
      detail: 'Vui lòng sửa các lỗi trong biểu mẫu.',
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

const getGenderSeverity = (gender: string) => {
  // Added
  switch (gender) {
    case 'male':
      return 'info'
    case 'female':
      return 'secondary'
    case 'other':
      return 'warn'
    default:
      return 'info'
  }
}

const openEditReader = (event: any, reader: Reader) => {
  selectedReader.value = {
    ...reader,
    dateOfBirth: new Date(reader.dateOfBirth),
  }
  editReaderVisible.value = true
}

const openEditStatus = (event: any, reader: Reader) => {
  // Updated to use popover
  selectedReader.value = reader
  openActions.value?.toggle(event)
}

// Watchers
watch(searchQuery, (newValue) => {
  setDebouncedSearchQuery(newValue)
})

watch([debouncedSearchQuery, selectedStatus, selectedGender], () => {
  // Added selectedGender
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
      <div class="text-(--my-text-secondary-color) text-center">Không có độc giả nào.</div>
    </template>

    <template #header>
      <!-- Updated header layout to match admin tab -->
      <div class="flex flex-row items-center justify-between w-full gap-4">
        <div class="flex flex-row items-center gap-2.5">
          <Select
            v-model="selectedStatus"
            :options="statusOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Lọc theo trạng thái"
            class="w-48"
            showClear
          />
        </div>

        <div class="flex flex-row items-center justify-between gap-2.5">
          <IconField class="bg-white!">
            <InputIcon class="pi pi-search" />
            <InputText
              v-model="searchQuery"
              placeholder="Tìm kiếm theo tên hoặc email..."
              class="w-full focus:border-(--my-primary-color)!"
            />
          </IconField>
          <Button
            @click="addReaderVisible = true"
            icon="pi pi-plus"
            label="Thêm độc giả"
            class="bg-(--my-primary-color)! border-none! hover:opacity-85! text-(--my-secondary-color)!"
          />
        </div>
      </div>
    </template>

    <Column expander style="width: 3rem" />

    <Column field="fullname" header="Họ và tên">
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

    <Column field="dateOfBirth" header="Ngày sinh">
      <template #body="slotProps">
        <div v-if="isLoadingData" class="skeleton h-4 rounded w-24"></div>
        <span v-else>{{ new Date(slotProps.data.dateOfBirth).toLocaleDateString() }}</span>
      </template>
    </Column>

    <Column field="address" header="Địa chỉ">
      <template #body="slotProps">
        <div v-if="isLoadingData" class="skeleton h-4 rounded w-32"></div>
        <span v-else>{{ slotProps.data.address }}</span>
      </template>
    </Column>

    <!-- Added Gender column -->
    <Column field="gender" header="Giới tính">
      <template #body="slotProps">
        <div v-if="isLoadingData" class="skeleton h-4 rounded w-16"></div>
        <Tag
          v-else
          :value="slotProps.data.gender"
          :severity="getGenderSeverity(slotProps.data.gender)"
          class="capitalize"
        />
      </template>
    </Column>

    <Column field="status" header="Trạng thái">
      <template #body="slotProps">
        <div v-if="isLoadingData" class="skeleton h-4 rounded w-16"></div>
        <Tag
          v-else
          :value="slotProps.data.status"
          :severity="getStatusSeverity(slotProps.data.status)"
          class="capitalize"
        />
      </template>
    </Column>

    <Column header="Hành động" style="width: 8rem">
      <template #body="slotProps">
        <div v-if="isLoadingData" class="skeleton h-4 rounded w-24"></div>
        <div v-else class="flex gap-2">
          <Button
            icon="pi pi-pencil"
            size="small"
            @click="openEditReader($event, slotProps.data)"
            class="p-button-text text-(--my-secondary-color)! hover:bg-gray-100!"
          />
          <Button
            icon="pi pi-ellipsis-v"
            size="small"
            @click="openEditStatus($event, slotProps.data)"
            class="p-button-text text-(--my-text-primary-color)! hover:bg-gray-100!"
          />
        </div>
      </template>
    </Column>

    <!-- Updated expansion template to match admin tab style -->
    <template #expansion="slotProps">
      <div class="flex flex-row p-5 gap-6">
        <!-- Avatar -->
        <div class="flex flex-col items-center gap-2">
          <div
            class="flex items-center justify-center size-20 bg-(--my-primary-color) rounded-full text-white text-4xl font-semibold"
          >
            {{ slotProps.data.firstname.charAt(0).toUpperCase() }}
          </div>
          <Tag
            :value="slotProps.data.gender"
            :severity="getGenderSeverity(slotProps.data.gender)"
          />
          <div class="flex flex-col items-center gap-0">
            <h4 class="font-semibold">
              {{ slotProps.data.firstname }} {{ slotProps.data.lastname }}
            </h4>
            <span class="text-sm text-gray-400">{{ slotProps.data.email }}</span>
          </div>
        </div>

        <Divider layout="vertical" />

        <!-- Details -->
        <div class="flex-1 grid grid-cols-3 gap-4">
          <!-- Gender -->
          <div class="flex flex-col gap-1">
            <span class="font-semibold">Giới tính:</span>
            <Tag
              class="w-max"
              :value="slotProps.data.gender"
              :severity="getGenderSeverity(slotProps.data.gender)"
            />
          </div>

          <!-- Status -->
          <div class="flex flex-col gap-1">
            <span class="font-semibold">Trạng thái:</span>
            <Tag
              class="w-max"
              :value="slotProps.data.status"
              :severity="getStatusSeverity(slotProps.data.status)"
            />
          </div>

          <!-- Phone -->
          <div class="flex flex-col gap-1">
            <span class="font-semibold">Số điện thoại:</span>
            <div class="flex items-center gap-2">
              <span
                class="flex-1 rounded-[6px] bg-gray-100 text-(--my-text-primary-color) px-2 py-1"
                >{{ slotProps.data.phoneNumber }}</span
              >
              <Button
                icon="pi pi-copy"
                size="small"
                class="p-button-text p-button-rounded p-button-secondary"
                :disabled="!slotProps.data.phoneNumber"
                @click="console.log('copied to clipboard')"
              />
            </div>
          </div>

          <!-- Date of Birth -->
          <div class="flex flex-col gap-1">
            <span class="font-semibold">Ngày sinh:</span>
            <span class="rounded-[6px] bg-gray-100 text-(--my-text-primary-color) px-2 py-1">{{
              new Date(slotProps.data.dateOfBirth).toLocaleDateString()
            }}</span>
          </div>

          <!-- Address -->
          <div class="flex flex-col gap-1">
            <span class="font-semibold">Địa chỉ:</span>
            <div class="flex items-center gap-2">
              <span
                class="flex-1 rounded-[6px] bg-gray-100 text-(--my-text-primary-color) px-2 py-1"
                >{{ slotProps.data.address }}</span
              >
              <Button
                icon="pi pi-copy"
                size="small"
                class="p-button-text p-button-rounded p-button-secondary"
                :disabled="!slotProps.data.address"
                @click="console.log('copied to clipboard')"
              />
            </div>
          </div>

          <div class="flex flex-col gap-1 text-(--my-text-primary-color)">
            <span class="font-semibold">Ngày tạo:</span>
            <span>{{ new Date(slotProps.data.createdAt).toLocaleDateString() }}</span>
          </div>
          <div class="flex flex-col gap-1 text-(--my-text-primary-color)">
            <span class="font-semibold">Cập nhật:</span>
            <span>{{ new Date(slotProps.data.updatedAt).toLocaleDateString() }}</span>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      Hiển thị {{ pagination.page * pagination.limit + 1 }} đến
      {{ Math.min((pagination.page + 1) * pagination.limit, pagination.total) }}
      trong tổng số {{ pagination.total }} độc giả.
    </template>
  </DataTable>

  <!-- Status Popover -->
  <Popover ref="openActions" placement="top" class="min-w-[120px]">
    <div class="flex flex-col">
      <button
        v-if="selectedReader?.status === 'inactive'"
        @click="handleUpdateStatus('active')"
        class="flex flex-row items-center gap-2.5 px-3 py-2 rounded-md hover:bg-(--my-secondary-color) hover:text-white transition-all duration-200"
      >
        <i class="pi pi-check"></i>
        <span>Kích hoạt</span>
      </button>

      <button
        v-if="selectedReader?.status === 'active'"
        @click="handleUpdateStatus('inactive')"
        class="flex flex-row items-center gap-2.5 px-3 py-2 rounded-md hover:bg-(--my-secondary-color) hover:text-white transition-all duration-200"
      >
        <i class="pi pi-times"></i>
        <span>Vô hiệu hóa</span>
      </button>

      <button
        v-if="selectedReader?.status !== 'banned'"
        @click="handleUpdateStatus('banned')"
        class="flex flex-row items-center gap-2.5 px-3 py-2 rounded-md hover:bg-red-500 hover:text-white transition-all duration-200"
      >
        <i class="pi pi-ban"></i>
        <span>Cấm</span>
      </button>

      <button
        v-if="selectedReader?.status === 'banned'"
        @click="handleUpdateStatus('active')"
        class="flex flex-row items-center gap-2.5 px-3 py-2 rounded-md hover:bg-(--my-secondary-color) hover:text-white transition-all duration-200"
      >
        <i class="pi pi-check"></i>
        <span>Bỏ cấm</span>
      </button>
    </div>
  </Popover>

  <!-- Add Reader Dialog -->
  <Dialog
    v-model:visible="addReaderVisible"
    modal
    :draggable="false"
    header="Thêm độc giả"
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
          <label class="font-semibold mb-2">Tên</label>
          <InputText size="small" class="w-full" placeholder="Nhập tên" />
          <Message v-if="$field.invalid" severity="error" size="small" variant="simple">
            {{ $field.error?.message }}
          </Message>
        </FormField>

        <FormField v-slot="$field" name="lastname" class="flex flex-col">
          <label class="font-semibold mb-2">Họ</label>
          <InputText size="small" class="w-full" placeholder="Nhập họ" />
          <Message v-if="$field.invalid" severity="error" size="small" variant="simple">
            {{ $field.error?.message }}
          </Message>
        </FormField>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <FormField v-slot="$field" name="gender" class="flex flex-col">
          <label class="font-semibold mb-2">Giới tính</label>
          <Select
            v-model="$field.value"
            size="small"
            :options="genderOptions"
            optionLabel="label"
            optionValue="value"
            class="w-full"
          />
        </FormField>

        <FormField v-slot="$field" name="dateOfBirth" class="flex flex-col">
          <label class="font-semibold mb-2">Ngày sinh</label>
          <DatePicker v-model="$field.value" dateFormat="mm/dd/yy" size="small" class="w-full" />
        </FormField>
      </div>

      <FormField v-slot="$field" name="email" class="flex flex-col">
        <label class="font-semibold mb-2">Email</label>
        <InputText size="small" class="w-full" placeholder="Nhập email" />
        <Message v-if="$field.invalid" severity="error" size="small" variant="simple">
          {{ $field.error?.message }}
        </Message>
      </FormField>

      <FormField v-slot="$field" name="phoneNumber" class="flex flex-col">
        <label class="font-semibold mb-2">Số điện thoại</label>
        <InputText size="small" class="w-full" placeholder="Nhập số điện thoại" />
        <Message v-if="$field.invalid" severity="error" size="small" variant="simple">
          {{ $field.error?.message }}
        </Message>
      </FormField>

      <FormField v-slot="$field" name="address" class="flex flex-col">
        <label class="font-semibold mb-2">Địa chỉ</label>
        <InputText size="small" class="w-full" placeholder="Nhập địa chỉ" />
        <Message v-if="$field.invalid" severity="error" size="small" variant="simple">
          {{ $field.error?.message }}
        </Message>
      </FormField>

      <FormField v-slot="$field" name="password" class="flex flex-col">
        <label class="font-semibold mb-2">Mật khẩu</label>
        <Password size="small" class="w-full" placeholder="Nhập mật khẩu" :feedback="false" toggleMask fluid />
        <Message v-if="$field.invalid" severity="error" size="small" variant="simple">
          {{ $field.error?.message }}
        </Message>
      </FormField>
    </Form>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button
          type="button"
          label="Hủy"
          severity="secondary"
          @click="addReaderVisible = false"
          :disabled="isSubmitting"
        />
        <Button
          @click="!isSubmitting && formRef?.submit()"
          type="button"
          label="Thêm độc giả"
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
    header="Chỉnh sửa độc giả"
    :style="{ minWidth: '40rem' }"
  >
    <Form
      ref="formRef"
      :initialValues="selectedReader"
      :resolver="editResolver"
      @submit="handleEditSubmit"
      :validateOnSubmit="true"
      class="w-full flex flex-col gap-4"
    >
      <!-- Same form fields as Add Reader but excluding email -->
      <div class="grid grid-cols-2 gap-4">
        <FormField v-slot="$field" name="firstname" class="flex flex-col">
          <label class="font-semibold mb-2">Tên</label>
          <InputText size="small" class="w-full" placeholder="Nhập tên" />
          <Message v-if="$field.invalid" severity="error" size="small" variant="simple">
            {{ $field.error?.message }}
          </Message>
        </FormField>

        <FormField v-slot="$field" name="lastname" class="flex flex-col">
          <label class="font-semibold mb-2">Họ</label>
          <InputText size="small" class="w-full" placeholder="Nhập họ" />
          <Message v-if="$field.invalid" severity="error" size="small" variant="simple">
            {{ $field.error?.message }}
          </Message>
        </FormField>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <FormField v-slot="$field" name="gender" class="flex flex-col">
          <label class="font-semibold mb-2">Giới tính</label>
          <Select
            v-model="$field.value"
            size="small"
            :options="genderOptions"
            optionLabel="label"
            optionValue="value"
            class="w-full"
          />
        </FormField>

        <FormField v-slot="$field" name="dateOfBirth" class="flex flex-col">
          <label class="font-semibold mb-2">Ngày sinh</label>
          <DatePicker
            v-model="$field.value"
            size="small"
            class="w-full"
            dateFormat="mm/dd/yy"
            showIcon
          />
        </FormField>
      </div>

      <FormField v-slot="$field" name="phoneNumber" class="flex flex-col">
        <label class="font-semibold mb-2">Số điện thoại</label>
        <InputText size="small" class="w-full" placeholder="Nhập số điện thoại" />
        <Message v-if="$field.invalid" severity="error" size="small" variant="simple">
          {{ $field.error?.message }}
        </Message>
      </FormField>

      <FormField v-slot="$field" name="address" class="flex flex-col">
        <label class="font-semibold mb-2">Địa chỉ</label>
        <InputText size="small" class="w-full" placeholder="Nhập địa chỉ" />
        <Message v-if="$field.invalid" severity="error" size="small" variant="simple">
          {{ $field.error?.message }}
        </Message>
      </FormField>
    </Form>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button
          type="button"
          label="Hủy"
          severity="secondary"
          @click="editReaderVisible = false"
          :disabled="isSubmitting"
        />
        <Button
          @click="!isSubmitting && formRef?.submit()"
          type="button"
          label="Lưu thay đổi"
          :class="`bg-(--my-secondary-color)! text-white! border-none! ${!isSubmitting ? 'hover:opacity-85!' : ''}`"
          :loading="isSubmitting"
          :disabled="isSubmitting"
        />
      </div>
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
