<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../services/api'
import ConfirmModal from '../../components/ConfirmModal.vue'

const email = ref('')
const password = ref('')
const message = ref('')
const showModal = ref(false)
const isSuccess = ref(false)
const isLoading = ref(false)
const router = useRouter()

const register = async () => {
  isLoading.value = true
  message.value = ''
  showModal.value = false
  
  try {
    await api.post('/auth/register', { email: email.value, password: password.value })
    message.value = 'Registration successful! Redirecting to verification...'
    isSuccess.value = true
    showModal.value = true
    
    // Redirect to verify-email view after 1.5 seconds
    setTimeout(() => {
      showModal.value = false
      router.push('/verify-email')
    }, 1500)

  } catch (error: any) {
    message.value = error.response?.data?.message || 'Registration failed. Please try again.'
    isSuccess.value = false
    showModal.value = true
    
    // Clear all inputs on failed attempt
    email.value = ''
    password.value = ''
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="flex justify-center bg-[#FFFFFF] font-['Lato'] px-4 mt-8">
    <div class="bg-[#FFFFFF] p-8 rounded-2xl shadow-sm border border-[#CECBF6] max-w-md w-full">
      
      <h1 class="text-2xl font-black text-[#26215C] uppercase tracking-tight mb-1 text-center">Join Evenite</h1>
      <p class="text-sm font-medium text-[#26215C]/60 text-center mb-6">Create your university account</p>

      <form @submit.prevent="register" class="flex flex-col gap-4">
        <div>
          <label class="block text-[10px] font-bold text-[#26215C]/70 uppercase tracking-wider mb-1">University Email</label>
          <input v-model="email" type="email" required class="w-full px-4 py-2.5 bg-[#EEEDFE]/30 border border-[#CECBF6] rounded-xl text-sm focus:outline-none focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#7F77DD] text-[#26215C] transition-all" />
        </div>
        <div>
          <label class="block text-[10px] font-bold text-[#26215C]/70 uppercase tracking-wider mb-1">Password</label>
          <input v-model="password" type="password" required class="w-full px-4 py-2.5 bg-[#EEEDFE]/30 border border-[#CECBF6] rounded-xl text-sm focus:outline-none focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#7F77DD] text-[#26215C] transition-all" />
        </div>
        <button type="submit" :disabled="isLoading" class="mt-2 w-full bg-[#534AB7] hover:bg-[#3C3489] text-[#FFFFFF] py-3 rounded-xl font-bold text-[12px] uppercase tracking-wider shadow-sm disabled:opacity-50 transition-colors cursor-pointer">
          {{ isLoading ? 'Registering...' : 'Sign Up' }}
        </button>
      </form>
      
      <div class="mt-8 flex flex-col items-center gap-3">
        <div class="w-full h-px bg-[#CECBF6] mb-2"></div>
        <p class="text-[10px] font-bold text-[#26215C]/50 uppercase tracking-wider">Already have an account?</p>
        <button @click="router.push('/auth/login')" class="w-full bg-[#FFFFFF] border-2 border-[#CECBF6] text-[#534AB7] py-3 rounded-xl font-bold text-[12px] uppercase tracking-wider hover:border-[#534AB7] hover:bg-[#EEEDFE]/30 transition-colors cursor-pointer">
          Log In Here
        </button>
      </div>

    </div>

    <!-- Success/Error Modal -->
    <ConfirmModal
      v-if="showModal"
      :title="isSuccess ? 'Success' : 'Registration Failed'"
      :description="message"
      confirmText="Okay"
      :confirmTheme="isSuccess ? 'blue' : 'red'"
      @confirm="showModal = false"
    />
  </div>
</template>