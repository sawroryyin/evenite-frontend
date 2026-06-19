<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import api from '../services/api'

const router = useRouter()
const authStore = useAuthStore()
const isSidebarOpen = ref(false)

const closeSidebar = () => {
  isSidebarOpen.value = false
}

const navigateTo = (routeName: string) => {
  closeSidebar()
  router.push({ name: routeName })
}

const userInitial = computed(() => authStore.parsedToken?.email?.charAt(0).toUpperCase() || 'U')
const isOrganizer = computed(() => authStore.currentRole === 'ORGANIZER')
const targetSwitchRole = computed(() => isOrganizer.value ? 'PARTICIPANT' : 'ORGANIZER')

const handleLogout = () => {
  authStore.logout() 
}

const handleSwitchRole = async () => {
  try {
    const hasTargetProfile = targetSwitchRole.value === 'ORGANIZER' 
      ? authStore.hasOrganizerProfile 
      : authStore.hasParticipantProfile

    if (!hasTargetProfile) {
      alert(`You must create a ${targetSwitchRole.value.toLowerCase()} profile first.`)
      navigateTo('profile-create')
      return
    }

    const response = await api.patch('/users/me/switch-profile', { targetRole: targetSwitchRole.value })
    
    if (response.data.accessToken) {
      authStore.setTokens(response.data.accessToken, authStore.refreshToken as string)
      alert(`Switched to ${targetSwitchRole.value} view!`)
      closeSidebar()
      router.push({ name: targetSwitchRole.value === 'ORGANIZER' ? 'event-list' : 'home' })
    }
  } catch (error) {
    console.error('Failed to switch roles:', error)
    alert('Failed to switch roles. Please try again.')
  }
}
</script>

<template>
  <header class="bg-[#534AB7] text-white px-4 py-3 flex justify-between 
  items-center sticky top-0 z-60 shadow-lg font-sans">
    <div class="font-extrabold font-['Lobster'] text-xl tracking-wider cursor-pointer" @click="router.push({ name: 'home' })">
      Evenite
    </div>
    
    <nav class="flex items-center gap-4">
      <button 
        @click="router.push({ name: 'notifications' })"
        class="relative p-1 rounded-full hover:bg-[#FFFFFF]/20 transition focus:outline-none">
        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 
            00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 
            .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9">
          </path>
        </svg>
      </button>

      <button 
        @click="isSidebarOpen = true"
        class="w-8 h-8 rounded-full bg-[#FFFFFF]/20 border-2 border-[#FFFFFF]/50 flex items-center justify-center 
        hover:bg-[#FFFFFF]/30 transition focus:outline-none overflow-hidden">
        <span class="text-sm font-bold text-[#FFFFFF]">{{ userInitial }}</span>
      </button>
    </nav>
  </header>

  <div 
    v-if="isSidebarOpen" 
    class="fixed inset-0 bg-black/40 backdrop-blur-sm z-70 transition-all duration-300"
    @click="closeSidebar"
  ></div>

  <aside  
      class="fixed top-0 right-0 h-full w-72 bg-[#FFFFFF] z-80 transform transition-all duration-300 ease-in-out flex flex-col font-sans"
      :class="isSidebarOpen ? 'translate-x-0 shadow-2xl' : 'translate-x-full shadow-none'"
    >
    <div class="p-4 flex justify-between items-center bg-[#EEEDFE]">
      <h2 class="text-base font-bold text-[#26215C]">Account Menu</h2>
      <button @click="closeSidebar" class="p-1 text-[#534AB7] hover:bg-[#3C3489] hover:text-white rounded-full transition-colors">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>

    <div class="px-5 py-6 flex flex-col items-center border-b border-[#CECBF6]">
      <div class="w-16 h-16 rounded-full bg-[#EEEDFE] flex items-center justify-center mb-3 shadow-inner">
        <span class="text-xl font-bold text-[#534AB7]">{{ userInitial }}</span>
      </div>
      <h3 class="text-sm font-bold text-[#26215C] leading-tight mb-1">{{ authStore.parsedToken?.email || 'Loading...' }}</h3>
      <p class="text-xs text-[#3C3489] font-bold mb-4 bg-[#EEEDFE] px-2 py-1 rounded-full">
        {{ isOrganizer ? 'Organizer Mode' : 'Participant Mode' }}
      </p>
      
      <div class="flex w-full gap-2">
        <button 
          @click="navigateTo('profile')"
          class="flex-1 py-2 text-xs bg-[#FFFFFF] hover:bg-[#EEEDFE] text-[#534AB7] font-semibold rounded-lg transition-colors border 
          border-[#CECBF6] shadow-sm">
          My Profile
        </button>
        <button 
          @click="handleSwitchRole"
          class="flex-1 py-2 text-xs bg-[#534AB7] hover:bg-[#3C3489] text-[#FFFFFF] font-semibold rounded-lg transition-colors shadow-sm">
          Switch to {{ targetSwitchRole === 'ORGANIZER' ? 'Org' : 'User' }}
        </button>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto p-4 flex flex-col gap-2" v-if="isOrganizer">
      <h4 class="text-[11px] font-bold text-[#26215C]/70 uppercase tracking-widest mb-2 px-1">Manage Organization</h4>
      
      <button 
        @click="navigateTo('create-options')" 
        class="w-full bg-[#534AB7] hover:bg-[#3C3489] text-[#FFFFFF] 
        text-[11px] font-['Lato'] font-bold py-3 px-4 rounded-xl shadow-md shadow-[#534AB7]/20 mb-3 flex justify-center items-center 
        gap-1.5 transition-colors transform active:scale-95 border border-[#CECBF6]"
      >
        <svg class="w-3.5 h-3.5 text-[#EEEDFE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"></path>
        </svg>
        Create New Event
      </button>
      
      <button 
        @click="navigateTo('event-list')"
        class="shadow-sm flex items-center gap-3 w-full p-2.5 bg-[#FFFFFF] hover:bg-[#EEEDFE] text-left rounded-xl transition-colors 
        border border-[#CECBF6] group">
        <div class="p-2 bg-[#EEEDFE] text-[#26215C] rounded-lg group-hover:text-[#534AB7] transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" 
            stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
        </div>
        <span class="text-sm font-medium text-[#26215C] group-hover:text-[#534AB7] transition-colors">My Events Dashboard</span>
      </button>
    </div>

    <div v-else class="flex-1"></div>
    
    <div class="p-4 border-t border-[#CECBF6]">
      <button 
        @click="handleLogout"
        class="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-red-500 hover:bg-red-50 font-bold 
        rounded-xl transition-colors cursor-pointer">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" 
          stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
        Sign Out
      </button>
    </div>
  </aside>
</template>