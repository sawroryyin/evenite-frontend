<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import BottomNav from '../components/BottomNav.vue'
import api from '../services/api'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

const isLoading = ref(true)
const isEditing = ref(false)

// Dynamic profile state
const profile = ref({
  firstName: '',
  lastName: '',
  studentId: '',
  phone: '',
  preferences: [] as string[]
})

// Store a backup of the profile in case the user cancels their edits
const originalProfile = ref({ ...profile.value })

const availableCategories = ['Workshop', 'Seminar', 'Networking', 'Cultural', 'Sports', 'Academic']

// Computed properties for safe rendering
const email = computed(() => authStore.user?.email || 'Loading...')
const isOrganizer = computed(() => authStore.currentRole === 'ORGANIZER')
const initials = computed(() => {
  const f = profile.value.firstName?.charAt(0) || ''
  const l = profile.value.lastName?.charAt(0) || ''
  return (f + l).toUpperCase() || 'U' // Fallback to 'U' for User
})

onMounted(async () => {
  await fetchProfile()
})

const fetchProfile = async () => {
  isLoading.value = true
  try {
    // If they haven't created a profile yet, force them into edit mode
    if (!authStore.hasProfile) {
      isEditing.value = true
      isLoading.value = false
      return
    }

    const endpoint = isOrganizer.value ? '/users/me/organizer-profile' : '/users/me/participant-profile'
    const response = await api.get(endpoint)
    
    if (response.data) {
      profile.value = {
        firstName: response.data.firstName || '',
        lastName: response.data.lastName || '',
        studentId: response.data.studentId || '',
        phone: response.data.phone || '',
        preferences: response.data.preferences || []
      }
      originalProfile.value = { ...profile.value }
    }
  } catch (error) {
    console.error('Error fetching profile:', error)
  } finally {
    isLoading.value = false
  }
}

const enableEdit = () => {
  originalProfile.value = { ...profile.value } // Save current state
  isEditing.value = true
}

const cancelEdit = () => {
  if (!authStore.hasProfile) {
    // Cannot cancel if they haven't created a profile yet
    alert('You must complete your profile first.')
    return
  }
  profile.value = { ...originalProfile.value } // Restore previous state
  isEditing.value = false
}

const saveProfile = async () => {
  try {
    const endpoint = isOrganizer.value ? '/users/me/organizer-profile' : '/users/me/participant-profile'

    if (!authStore.hasProfile) {
      // 1. Create new profile
      const response = await api.post(endpoint, profile.value)
      
      // IMPORTANT: When a user creates a profile, the backend should return a NEW access token
      // that contains `hasCreatedProfile: true` and the new `participantProfileId`.
      if (response.data.accessToken) {
        authStore.setTokens(response.data.accessToken, authStore.refreshToken as string)
      }
    } else {
      // 2. Update existing profile
      await api.patch(endpoint, profile.value)
    }

    originalProfile.value = { ...profile.value }
    isEditing.value = false
    alert('Profile saved successfully!')
  } catch (error) {
    console.error('Error saving profile:', error)
    alert('Failed to save profile. Please try again.')
  }
}
</script>

<template>
  <div class="max-w-3xl mx-auto p-4 pt-4 pb-24 bg-[#fafafa] min-h-screen font-['Lato']">
    
    <div v-if="isLoading" class="flex justify-center items-center h-48">
      <p class="text-gray-400 font-bold text-sm tracking-wider animate-pulse">Loading profile...</p>
    </div>

    <div v-else class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="bg-linear-to-r from-purple-600 to-indigo-600 p-5 text-white flex justify-between items-center">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border-2 
          border-white/30 text-white font-bold text-[16px] shadow-inner">
            {{ initials }}
          </div>
          <div>
            <h1 class="text-[16px] font-black tracking-tight">
              <span v-if="!authStore.hasProfile">Create Profile</span>
              <span v-else>{{ isEditing ? 'Edit Profile' : 'My Profile' }}</span>
            </h1>
            <p class="text-purple-200 text-[11px] mt-0.5">
              {{ isEditing ? 'Update your personal info' : 'Manage your account details' }}
            </p>
          </div>
        </div>
        
        <button 
          v-if="!isEditing && authStore.hasProfile" 
          @click="enableEdit" 
          class="bg-white/15 hover:bg-white/25 text-white border border-white/20 py-1.5 px-3 rounded-lg 
          font-bold transition text-[11px] flex items-center gap-1 cursor-pointer">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" 
            stroke-linejoin="round" stroke-width="2" 
            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
          Edit
        </button>
      </div>

      <form @submit.prevent="saveProfile" class="p-5 space-y-4 text-[12px]">
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">First Name</label>
            <input v-if="isEditing" type="text" v-model="profile.firstName" class="w-full border 
            border-gray-200 rounded-lg py-2 px-2.5 focus:ring-1.5 focus:ring-purple-400 
            focus:border-purple-400 outline-none font-bold bg-[#fafafa] text-[12px]" required />
            <p v-else class="text-gray-800 py-1 font-bold text-[13px]">{{ profile.firstName }}</p>
          </div>
          <div>
            <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Last Name</label>
            <input v-if="isEditing" type="text" v-model="profile.lastName" class="w-full border 
            border-gray-200 rounded-lg py-2 px-2.5 focus:ring-1.5 focus:ring-purple-400 
            focus:border-purple-400 outline-none font-bold bg-[#fafafa] text-[12px]" required />
            <p v-else class="text-gray-800 py-1 font-bold text-[13px]">{{ profile.lastName }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">University Email</label>
            <input v-if="isEditing" type="email" :value="email" disabled class="w-full border 
            border-gray-100 bg-gray-50 text-gray-400 rounded-lg py-2 px-2.5 cursor-not-allowed font-medium text-[12px]" />
            <p v-else class="text-gray-800 py-1 font-semibold text-[12px]">{{ email }}</p>
          </div>
          <div>
            <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Student ID</label>
            <input v-if="isEditing" type="text" v-model="profile.studentId" class="w-full border 
            border-gray-200 rounded-lg py-2 px-2.5 focus:ring-1.5 focus:ring-purple-400 focus:border-purple-400 
            outline-none font-bold bg-[#fafafa] text-[12px]" />
            <p v-else class="text-gray-800 py-1 font-bold text-[13px]">{{ profile.studentId || 'N/A' }}</p>
          </div>
        </div>

        <hr class="border-gray-100" />

        <div>
          <h3 class="text-[13px] font-black text-gray-900 tracking-tight mb-1">Event Preferences</h3>
          <p v-if="isEditing" class="text-[11px] text-gray-400 mb-3">Select categories to get personalized recommendations.</p>
          
          <div v-if="isEditing" class="flex flex-wrap gap-2">
            <label 
              v-for="cat in availableCategories" 
              :key="cat"
              class="flex items-center gap-1.5 px-3 py-1.5 border rounded-full cursor-pointer transition-all text-[11px] font-bold"
              :class="profile.preferences.includes(cat) ? 'bg-purple-50 border-purple-400 text-purple-700' : 
              'border-gray-200 text-gray-500 bg-white hover:bg-gray-50'"
            >
              <input type="checkbox" :value="cat" v-model="profile.preferences" class="hidden" />
              <span>{{ cat }}</span>
            </label>
          </div>

          <div v-else class="flex flex-wrap gap-1.5">
            <span v-if="profile.preferences.length === 0" class="text-gray-400 italic text-[11px]">No preferences set.</span>
            <span 
              v-for="cat in profile.preferences" 
              :key="'view-'+cat"
              class="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full text-[10px] font-bold border border-purple-100/50"
            >
              {{ cat }}
            </span>
          </div>
        </div>

        <div v-if="isEditing" class="pt-2 flex justify-end gap-2">
          <button v-if="authStore.hasProfile" @click="cancelEdit" type="button" class="px-4 py-1.5 border border-gray-200 text-gray-600 
          hover:bg-gray-50 font-bold rounded-lg transition-colors cursor-pointer text-[11px]">
            Cancel
          </button>
          <button type="submit" class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-1.5 px-4 
          rounded-lg shadow-sm transition-colors cursor-pointer text-[11px]">
            {{ authStore.hasProfile ? 'Save Changes' : 'Create Profile' }}
          </button>
        </div>
      </form>
    </div>

    <BottomNav />
  </div>
</template>