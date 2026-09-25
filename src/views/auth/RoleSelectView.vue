<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const selectRole = (role: 'PARTICIPANT' | 'ORGANIZER') => {
  router.push({ name: 'profile-create', query: { role } })
}

const cancelAndLogout = () => {
  // Clear the user session
  authStore.logout()
  // Redirect back to the login page
  router.push('/auth/login')
}
</script>

<template>  
  <div class="flex justify-center bg-transparent font-['Lato'] px-4 mt-8">
    <div class="max-w-xl w-full">
      
      <!-- Back / Logout Button -->
      <button 
        @click="cancelAndLogout" 
        class="mb-6 text-[#131B2B]/70 hover:text-[#131B2B] flex items-center gap-1.5 text-[11px] font-bold transition-colors cursor-pointer uppercase tracking-wide"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
        Back to Login
      </button>

      <h1 class="text-2xl font-black text-[#131B2B] uppercase tracking-tight mb-2 text-center">Create Your Profile</h1>
      <p class="text-[12px] text-[#131B2B]/70 text-center mb-8 font-bold">Select which profile you want to create first to start using Evenite. You can add the other profile later.</p>
      
      <div class="grid md:grid-cols-2 gap-4">
        <div @click="selectRole('PARTICIPANT')" class="bg-white p-6 rounded-2xl shadow-sm border border-[#131B2B]/10 hover:border-[#131B2B]/30 cursor-pointer transition-all hover:-translate-y-1 group">
          <div class="w-12 h-12 bg-[#131B2B]/5 border border-[#131B2B]/10 group-hover:bg-[#131B2B]/10 group-hover:border-[#131B2B]/30 text-[#131B2B] rounded-xl flex items-center justify-center mb-4 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
          </div>
          <h2 class="text-lg font-bold text-[#131B2B] mb-1">Create Participant Profile</h2>
          <p class="text-[11px] text-[#131B2B]/60">Discover events, register, and join the community discussions.</p>
        </div>

        <div @click="selectRole('ORGANIZER')" class="bg-white p-6 rounded-2xl shadow-sm border border-[#131B2B]/10 hover:border-[#131B2B]/30 cursor-pointer transition-all hover:-translate-y-1 group">
          <div class="w-12 h-12 bg-[#131B2B]/5 border border-[#131B2B]/10 group-hover:bg-[#131B2B]/10 group-hover:border-[#131B2B]/30 text-[#131B2B] rounded-xl flex items-center justify-center mb-4 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
          </div>
          <h2 class="text-lg font-bold text-[#131B2B] mb-1">Create Organizer Profile</h2>
          <p class="text-[11px] text-[#131B2B]/60">Create events, manage registrations, and track attendance.</p>
        </div>
      </div>
    </div>
  </div>
</template>