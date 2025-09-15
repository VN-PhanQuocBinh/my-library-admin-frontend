<script setup lang="ts">
import { reactive } from 'vue'
import { useToast } from 'primevue/usetoast'
import { Toast, Message, InputText, Button, Password, DatePicker, Select, Checkbox } from 'primevue'
import { Form, FormField } from '@primevue/forms'

import { zodResolver } from '@primevue/forms/resolvers/zod'
import { RegisterSchema, type RegisterType } from '@/types/auth-schema'

import { useAuthStore } from '@/stores/auth'
import { ref } from 'vue'

// login code
const { registerUser } = useAuthStore()
const toast = useToast()
const agreeTerms = ref(false)

const initialValues: RegisterType = reactive({
   fullname: '',
   password: '',
   email: '',
   dateOfBirth: new Date(),
   address: '',
   phoneNumber: '',
   duty: 'staff',
})

const resolver = zodResolver(RegisterSchema)

const handleRegister = async (values: RegisterType) => {
   try {
      await registerUser(values)
      toast.add({
         severity: 'success',
         summary: 'Register successful',
         life: 3000,
      })
   } catch (error: unknown) {
      toast.add({
         severity: 'error',
         summary: 'Register failed',
         detail: 'An error occurred during register.',
         life: 3000,
      })
   }
}

const onFormSubmit = async (event: any) => {
   if (event.valid && agreeTerms.value) {
      // await handleRegister(event.values as RegisterType)
      console.log(event.values)

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
         <h1 class="text-3xl font-bold text-green-500">SIGN UP</h1>
         <p class="text-gray-500">Register your account</p>
      </div>

      <Form
         v-slot="$form"
         :initialValues
         :resolver
         @submit="onFormSubmit"
         class="flex flex-col gap-4 w-full sm:w-96"
      >
         <!-- Fullname -->
         <FormField class="flex flex-col gap-1">
            <label for="fullname" class="text-gray-600">Fullname</label>
            <InputText name="fullname" type="text" placeholder="Fullname" fluid />
            <Message
               v-if="$form.fullname?.invalid"
               severity="error"
               size="fullname"
               variant="simple"
            >
               {{ $form.fullname.error?.message }}
            </Message>
         </FormField>

         <!-- Email -->
         <FormField class="flex flex-col gap-1">
            <label for="email" class="text-gray-600">Email</label>
            <InputText name="email" type="text" placeholder="Email" fluid />
            <Message v-if="$form.email?.invalid" severity="error" size="small" variant="simple">
               {{ $form.email.error?.message }}
            </Message>
         </FormField>

         <!-- Address -->
         <FormField class="flex flex-col gap-1">
            <label for="address" class="text-gray-600">Address</label>
            <InputText name="address" type="text" placeholder="Address" fluid />
            <Message v-if="$form.address?.invalid" severity="error" size="small" variant="simple">
               {{ $form.address.error?.message }}
            </Message>
         </FormField>

         <!-- Phone number -->
         <FormField class="flex flex-col gap-1">
            <label for="phonenumber" class="text-gray-600">Phone number</label>
            <InputText name="phoneNumber" type="text" placeholder="Phone Number" fluid />
            <Message
               v-if="$form.phoneNumber?.invalid"
               severity="error"
               size="small"
               variant="simple"
            >
               {{ $form.phoneNumber.error?.message }}
            </Message>
         </FormField>

         <div class="flex flex-row gap-3">
            <!-- Date of birth -->
            <FormField class="flex-1 flex flex-col gap-1">
               <label for="dateOfBirth" class="text-gray-600">Date of Birth</label>
               <DatePicker
                  name="dateOfBirth"
                  placeholder="Date of Birth"
                  dateFormat="dd/mm/yy"
                  showButtonBar
                  showIcon
                  fluid
               />
               <Message
                  v-if="$form.dateOfBirth?.invalid"
                  severity="error"
                  size="small"
                  variant="simple"
               >
                  {{ $form.dateOfBirth.error?.message }}
               </Message>
            </FormField>

            <!-- Role -->
            <FormField class="flex-1 flex flex-col gap-1">
               <label for="duty" class="text-gray-600">Role</label>
               <Select
                  name="duty"
                  :options="[
                     { label: 'Staff', value: 'staff' },
                     { label: 'Manager', value: 'manager' },
                  ]"
                  placeholder="Select Duty"
                  optionLabel="label"
                  optionValue="value"
                  fluid
               />
               <Message v-if="$form.duty?.invalid" severity="error" size="small" variant="simple">
                  {{ $form.duty.error?.message }}
               </Message>
            </FormField>
         </div>

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

         <div>
            <Checkbox
               v-model="agreeTerms"
               name="acceptTerms"
               inputId="acceptTerms"
               class="mr-2"
               binary
            />
            <label for="acceptTerms" class="text-gray-600"
               >I agree to the
               <router-link to="/terms" class="text-green-500 underline"
                  >Terms and conditions</router-link
               ></label
            >
         </div>

         <Button type="submit" size="large" severity="success" label="Sign up" :loading="false" />

         <p class="text-gray-600 text-center">
            You had account?
            <router-link to="/login" class="text-green-500 underline">Login</router-link>
         </p>
      </Form>
   </div>
</template>
