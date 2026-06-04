<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../services/api'

const email = ref('')
const password = ref('')
const message = ref('')
const isLoading = ref(false)
const router = useRouter()

const register = async () => {
  isLoading.value = true
  try {
    await api.post('/auth/register', { email: email.value, password: password.value })
    message.value = 'Registration successful! Redirecting to verification...'
    
    // Redirect to verify-email view after 1.5 seconds
    setTimeout(() => {
      router.push('/verify-email')
    }, 1500)

  } catch (error: any) {
    message.value = error.response?.data?.message || 'Registration failed.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-[#fafafa] font-['Lato'] px-4">
    <div class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full">
      <h1 class="text-2xl font-black text-gray-900 uppercase tracking-tight mb-6 text-center">Join Evenite</h1>
      
      <p v-if="message" class="mb-4 text-[11px] font-bold p-3 rounded-lg text-center" 
         :class="message.includes('successful') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'">
        {{ message }}
      </p>

      <form @submit.prevent="register" class="flex flex-col gap-4">
        <div>
          <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">University Email</label>
          <input v-model="email" type="email" required class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
        </div>
        <div>
          <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Password</label>
          <input v-model="password" type="password" required class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
        </div>
        <button type="submit" :disabled="isLoading" class="mt-2 w-full bg-linear-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-bold text-[12px] uppercase tracking-wider shadow-sm hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 transition-all">
          {{ isLoading ? 'Registering...' : 'Sign Up' }}
        </button>
      </form>
      <div class="mt-6 text-center">
        <button @click="router.push('/auth/login')" class="text-[11px] font-bold text-gray-500 hover:text-purple-600 transition-colors">Already registered? Log in</button>
      </div>
    </div>
  </div>
</template>