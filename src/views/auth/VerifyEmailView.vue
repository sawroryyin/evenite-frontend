<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../../services/api'

const route = useRoute()
const router = useRouter()
const tokenInput = ref('')
const message = ref('')
const isSuccess = ref(false)
const isLoading = ref(false)

const verify = async (tokenToVerify: string) => {
  if (!tokenToVerify) return
  isLoading.value = true
  isSuccess.value = false
  
  try {
    // Ping the backend to verify the token
    await api.post(`/auth/verify-email?token=${tokenToVerify}`)
    
    isSuccess.value = true
    message.value = 'Email verified successfully! Redirecting to login...'
    
    // Redirect to login after 1.5 seconds so they can log in manually
    setTimeout(() => {
      router.push('/auth/login')
    }, 1500)
    
  } catch (error: any) {
    message.value = error.response?.data?.message || 'Invalid or expired token.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  const urlToken = route.query.token as string
  if (urlToken) {
    tokenInput.value = urlToken
    verify(urlToken)
  }
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-[#fafafa] font-['Lato'] px-4">
    <div class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full text-center">
      <h1 class="text-2xl font-black text-gray-900 uppercase tracking-tight mb-2">Verify Email</h1>
      <p class="text-[11px] text-gray-500 mb-6">Enter the code sent to your email or click the link in the email.</p>
      
      <p v-if="message" class="mb-4 text-[11px] font-bold p-3 rounded-lg"
         :class="isSuccess ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'">
        {{ message }}
      </p>

      <div class="flex flex-col gap-4">
        <input v-model="tokenInput" type="text" placeholder="Verification Code" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-center font-mono text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
        <button @click="verify(tokenInput)" :disabled="isLoading || isSuccess" class="w-full bg-gray-900 text-white py-3 rounded-xl font-bold text-[12px] uppercase tracking-wider shadow-sm hover:bg-gray-800 disabled:opacity-50 transition-all">
          {{ isLoading ? 'Verifying...' : 'Verify Now' }}
        </button>
      </div>
    </div>
  </div>
</template>