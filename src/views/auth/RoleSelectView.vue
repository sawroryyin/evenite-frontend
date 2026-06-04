<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import api from '../../services/api'
import { ref } from 'vue'

const router = useRouter()
const authStore = useAuthStore()
const isLoading = ref(false)

const selectRole = async (targetRole: 'PARTICIPANT' | 'ORGANIZER') => {
  const hasProfile = targetRole === 'PARTICIPANT' ? authStore.hasParticipantProfile : authStore.hasOrganizerProfile

  if (!hasProfile) {
    // FIXED: Using route 'name' instead of 'path' to avoid mismatch errors
    router.push({ name: 'profile-create', query: { role: targetRole } })
  } else {
    // Prevent switching to the role you are already in
    if (authStore.currentRole === targetRole) {
      router.push({ name: 'home' })
      return
    }

    isLoading.value = true
    try {
      const { data } = await api.patch('/users/me/switch-profile', { targetRole })
      authStore.setTokens(data.accessToken, authStore.refreshToken!)
      router.push({ name: 'home' })
    } catch (error) {
      console.error('Failed to switch role', error)
    } finally {
      isLoading.value = false
    }
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-[#fafafa] font-['Lato'] px-4">
    <div class="max-w-xl w-full">
      <h1 class="text-2xl font-black text-gray-900 uppercase tracking-tight mb-2 text-center">Choose Your Role</h1>
      <p class="text-[12px] text-gray-500 text-center mb-8 font-bold">You can switch between these profiles anytime.</p>
      
      <div class="grid md:grid-cols-2 gap-4">
        <div @click="selectRole('PARTICIPANT')" class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-purple-300 cursor-pointer transition-all hover:-translate-y-1">
          <div class="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
          </div>
          <h2 class="text-lg font-bold text-gray-900 mb-1">Participant</h2>
          <p class="text-[11px] text-gray-500">Discover events, register, and join the community discussions.</p>
        </div>

        <div @click="selectRole('ORGANIZER')" class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-indigo-300 cursor-pointer transition-all hover:-translate-y-1">
          <div class="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
          </div>
          <h2 class="text-lg font-bold text-gray-900 mb-1">Organizer</h2>
          <p class="text-[11px] text-gray-500">Create events, manage registrations, and track attendance.</p>
        </div>
      </div>
    </div>
  </div>
</template>