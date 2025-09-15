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
      console.log(event.values as LoginType)

      toast.add({
         severity: 'success',
         summary: 'Form is submitted.',
         detail: 'This is a placeholder a ction.',
         life: 3000,
      })
   }
}
</script>

<template>
   <div class="flex flex-col items-center gap-2 w-full">
      <Toast position="bottom-right" class="items-center!" />

      <div class="flex flex-col items-center gap-1">
         <h1 class="text-3xl font-bold text-green-500">LOGIN</h1>
         <p class="text-gray-500">Login to your account</p>
      </div>

      <Form
         v-slot="$form"
         :initialValues
         :resolver
         @submit="onFormSubmit"
         class="flex flex-col gap-4 w-full sm:w-80"
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
            <label for="password" class="text-gray-600">Password</label>
            <Password
               name="password"
               type="text"
               placeholder="Password"
               :feedback="false"
               toggleMask
               fluid
            />
            <Message v-if="$form.password?.invalid" severity="error" size="small" variant="simple">
               {{ $form.password.error?.message }}
            </Message>
         </FormField>

         <router-link to="/forgot-password" class="self-end text-green-500 underline text-sm"
            >Forgot password?</router-link
         >

         <Button type="submit" severity="success" label="Login" />

         <p class="text-gray-600 text-center">
            You don't have account?
            <router-link to="/register" class="text-green-500 underline">Sign up</router-link>
         </p>
      </Form>
   </div>
</template>
