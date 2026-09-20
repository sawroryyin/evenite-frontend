<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../../services/api'

const route = useRoute()
const router = useRouter()

// State
const tokenInput = ref('')
const emailInput = ref('')
const message = ref({ text: '', type: 'success' })
const isLoading = ref(false)
const isResending = ref(false)
const showResendForm = ref(false)

const showMessage = (text: string, type: 'success' | 'error') => {
  message.value = { text, type }
  setTimeout(() => { message.value.text = '' }, 5000)
}

const verify = async () => {
  if (!tokenInput.value) {
    showMessage('Please enter a verification code.', 'error')
    return
  }

  isLoading.value = true
  message.value.text = ''
  
  try {
    await api.post(`/auth/verify-email?token=${tokenInput.value}`)
    
    showMessage('Email verified successfully! Redirecting to login...', 'success')
    
    setTimeout(() => {
      router.push('/auth/login')
    }, 1500)
    
  } catch (error: any) {
    showMessage(error.response?.data?.message || 'Invalid or expired token.', 'error')
  } finally {
    isLoading.value = false
  }
}

const resendCode = async () => {
  if (!emailInput.value) {
    showMessage('Please enter your email address.', 'error')
    return
  }

  isResending.value = true
  message.value.text = ''

  try {
    await api.post('/auth/resend-verification', { email: emailInput.value })
    showMessage('Verification code resent! Please check your email.', 'success')
    showResendForm.value = false
  } catch (error: any) {
    showMessage(error.response?.data?.message || 'Failed to resend verification code.', 'error')
  } finally {
    isResending.value = false
  }
}

onMounted(() => {
  const urlToken = route.query.token as string
  const urlEmail = route.query.email as string // Optional: in case you pass email from register page

  if (urlEmail) {
    emailInput.value = urlEmail
  }

  if (urlToken) {
    tokenInput.value = urlToken
    verify()
  }
})
</script>

<template>
  <div class="flex justify-center bg-transparent font-['Lato'] px-4 py-8 mt-8">
    <div class="bg-white p-8 rounded-2xl shadow-sm border border-[#131B2B]/10 max-w-md w-full">
      
      <div class="text-center mb-8">
        <h1 class="text-2xl font-black text-[#131B2B] uppercase tracking-tight mb-2">Verify Account</h1>
        <p class="text-[11px] font-bold text-[#131B2B] uppercase tracking-wider">
          {{ showResendForm ? 'Resend Verification Code' : 'Secure your Evenite access' }}
        </p>
      </div>

      <div v-if="message.text" class="mb-6 text-[11px] font-bold p-3 rounded-lg text-center transition-all"
           :class="message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'">
        {{ message.text }}
      </div>

      <form v-if="!showResendForm" @submit.prevent="verify" class="flex flex-col gap-6">
        <div>
          <label class="block text-[10px] font-bold text-[#131B2B]/70 uppercase tracking-wider mb-2">Verification Code</label>
          <input 
            v-model="tokenInput" 
            type="text" 
            placeholder="Paste your code here" 
            required
            class="w-full px-4 py-3 bg-[#131B2B]/5 border border-[#131B2B]/10 rounded-xl text-center font-mono text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#131B2B]/30 text-[#131B2B] transition-all" 
          />
        </div>

        <button 
          type="submit" 
          :disabled="isLoading || (message.text !== '' && message.type === 'success')" 
          class="w-full bg-[#131B2B] hover:bg-[#131B2B]/80 text-white py-3 rounded-xl font-bold text-[11px] uppercase tracking-wider shadow-sm disabled:opacity-50 transition-colors cursor-pointer"
        >
          {{ isLoading ? 'VERIFYING...' : 'VERIFY NOW' }}
        </button>

        <div class="text-center mt-2">
          <button 
            type="button" 
            @click="showResendForm = true" 
            class="text-[11px] font-bold text-[#131B2B]/60 hover:text-[#131B2B] transition-colors uppercase tracking-wider cursor-pointer"
          >
            Didn't receive a code? <span class="underline">Resend</span>
          </button>
        </div>
      </form>

      <form v-else @submit.prevent="resendCode" class="flex flex-col gap-6">
        <div>
          <label class="block text-[10px] font-bold text-[#131B2B]/70 uppercase tracking-wider mb-2">Email Address</label>
          <input 
            v-model="emailInput" 
            type="email" 
            placeholder="student@university.edu" 
            required
            class="w-full px-4 py-3 bg-[#131B2B]/5 border border-[#131B2B]/10 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#131B2B]/30 text-[#131B2B] transition-all" 
          />
        </div>

        <button 
          type="submit" 
          :disabled="isResending" 
          class="w-full bg-[#131B2B] hover:bg-[#131B2B]/80 text-white py-3 rounded-xl font-bold text-[11px] uppercase tracking-wider shadow-sm disabled:opacity-50 transition-colors cursor-pointer"
        >
          {{ isResending ? 'SENDING...' : 'RESEND CODE' }}
        </button>

        <div class="text-center mt-2">
          <button 
            type="button" 
            @click="showResendForm = false" 
            class="text-[11px] font-bold text-[#131B2B]/60 hover:text-[#131B2B] transition-colors uppercase tracking-wider cursor-pointer"
          >
            &larr; Back to Verification
          </button>
        </div>
      </form>

    </div>
  </div>
</template>