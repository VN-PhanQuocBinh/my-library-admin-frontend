<script setup lang="ts">
import { reactive } from 'vue'
import { useToast } from 'primevue/usetoast'
import { Toast, Message, InputText, Button, Password } from 'primevue'
import { Form, FormField } from '@primevue/forms'

import { zodResolver } from '@primevue/forms/resolvers/zod'
import { LoginSchema, type LoginType } from '@/types/auth-schema'

import { useAuthStore } from '@/stores/auth'

// login code
const { loginUser } = useAuthStore()
const toast = useToast()

const initialValues = reactive({
  email: '',
  password: '',
})

const resolver = zodResolver(LoginSchema)

const handleLogin = async (values: LoginType) => {
  try {
    await loginUser(values)
    toast.add({
      severity: 'success',
      summary: 'Login successful',
      life: 3000,
    })
  } catch (error: unknown) {
    toast.add({
      severity: 'error',
      summary: 'Login failed',
      detail: 'An error occurred during login.',
      life: 3000,
    })
  }
}

const onFormSubmit = async (event: any) => {
  if (event.valid) {
    await handleLogin(event.values as LoginType)
  }
}
</script>

<template>
  <div class="flex flex-col items-center gap-2 w-full">
    <Toast position="bottom-right" class="items-center!" />

    <div class="flex flex-col items-center gap-1">
      <h1 class="text-3xl font-bold text-gray-900">ĐĂNG NHẬP</h1>
      <p class="text-gray-500">Đăng nhập vào tài khoản của bạn</p>
    </div>

    <Form
      v-slot="$form"
      :initialValues
      :resolver
      @submit="onFormSubmit"
      class="flex flex-col gap-4 w-full sm:w-80"
      :validateOnValueUpdate="false"
    >
      <!-- Email -->
      <FormField class="flex flex-col gap-1">
        <label for="email" class="text-gray-600">Email</label>
        <InputText name="email" type="text" placeholder="Email" fluid />
        <Message v-if="$form.email?.invalid" severity="error" size="small" variant="simple">
          {{ $form.email.error?.message }}
        </Message>
      </FormField>

      <!-- Password -->
      <FormField class="flex flex-col gap-1">
        <label for="password" class="text-gray-600">Mật khẩu</label>
        <Password
          name="password"
          type="text"
          placeholder="Mật khẩu"
          :feedback="false"
          toggleMask
          fluid
        />
        <Message v-if="$form.password?.invalid" severity="error" size="small" variant="simple">
          {{ $form.password.error?.message }}
        </Message>
      </FormField>

      <router-link to="/forgot-password" class="self-end text-green-500 underline text-sm"
        >Quên mật khẩu?</router-link
      >

      <Button type="submit" severity="success" label="Đăng nhập" />

      <p class="text-center">
        Bạn chưa có tài khoản?
        <router-link to="/register"
          ><span class="text-(--my-secondary-color) underline">Đăng ký</span>
        </router-link>
      </p>
    </Form>
  </div>
</template>

<style scoped>
.p-button {
  @apply bg-(--my-primary-color)! text-(--my-secondary-color)! border-none! hover:bg-(--my-primary-color)/80!;
}
</style>
