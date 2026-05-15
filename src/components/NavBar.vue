<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isProfileSheetOpen = ref(false)

const closeProfileSheet = () => {
  isProfileSheetOpen.value = false
}

const navigateTo = (routeName: string) => {
  closeProfileSheet()
  router.push({ name: routeName })
}
</script>

<template>
  <!-- Main Header -->
  <header class="bg-blue-800 text-white pl-4 pr-4 p-2 flex justify-between items-center sticky top-0 z-10 shadow-md">
    <div class="font-bold text-lg tracking-wide cursor-pointer" @click="router.push({ name: 'home' })">
      Evenite
    </div>
    
    <nav class="flex items-center gap-4">
      <!-- Profile Icon Button -->
      <button 
        @click="isProfileSheetOpen = true"
        class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center hover:bg-blue-500 transition border border-blue-400 focus:outline-none focus:ring-2 focus:ring-white">
        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
        </svg>
      </button>
    </nav>
  </header>

  <!-- Profile Sheet Overlay -->
  <div 
    v-if="isProfileSheetOpen" 
    class="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-all duration-300"
    @click="closeProfileSheet"
  ></div>

  <!-- Right Side Profile Sheet -->
  <aside 
    class="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col"
    :class="isProfileSheetOpen ? 'translate-x-0' : 'translate-x-full'"
  >
    <!-- Sheet Header -->
    <div class="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
      <h2 class="text-lg font-bold text-gray-800">Account</h2>
      <button @click="closeProfileSheet" class="text-gray-500 hover:text-gray-800 focus:outline-none">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>

    <!-- Profile Preview -->
    <div class="p-6 flex flex-col items-center border-b border-gray-200">
      <div class="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-3 border-2 border-blue-500">
        <svg class="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
        </svg>
      </div>
      <h3 class="text-xl font-bold text-gray-800">Student Name</h3>
      <p class="text-sm text-gray-500 mb-4">student@cmu.ac.th</p>
      
      <button 
        @click="navigateTo('edit-profile')"
        class="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition border border-gray-300">
        View Profile
      </button>
    </div>

    <!-- Event Navigation Options -->
    <div class="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
      <h4 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">My Events</h4>
      
      <!-- Draft Events Button -->
      <button 
        @click="navigateTo('draft-events')"
        class="flex items-center justify-between w-full p-3 bg-white hover:bg-blue-50 text-left border border-gray-200 rounded-lg transition group">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-yellow-100 text-yellow-600 rounded-md group-hover:bg-yellow-200 transition">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
          </div>
          <div>
            <span class="block font-medium text-gray-800">Draft Events</span>
            <span class="block text-xs text-gray-500">Unpublished event setups</span>
          </div>
        </div>
        <svg class="w-5 h-5 text-gray-400 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
      </button>

      <!-- Published Events Button -->
      <button 
        @click="navigateTo('published-events')"
        class="flex items-center justify-between w-full p-3 bg-white hover:bg-blue-50 text-left border border-gray-200 rounded-lg transition group">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-green-100 text-green-600 rounded-md group-hover:bg-green-200 transition">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <div>
            <span class="block font-medium text-gray-800">Published Events</span>
            <span class="block text-xs text-gray-500">Live & upcoming events</span>
          </div>
        </div>
        <svg class="w-5 h-5 text-gray-400 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
      </button>
    </div>
    
    <!-- Sign Out / Footer area (Optional) -->
    <div class="p-4 border-t border-gray-200">
      <button class="w-full flex items-center justify-center gap-2 py-2 text-red-600 hover:bg-red-50 font-medium rounded-lg transition">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
        Sign Out
      </button>
    </div>
  </aside>
</template>