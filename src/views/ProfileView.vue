<script setup lang="ts">
import { ref } from 'vue'
import BottomNav from '../components/BottomNav.vue'

// Toggles between View and Edit mode
const isEditing = ref(false)

const profile = ref({
  firstName: 'Su Su',
  lastName: 'Aung',
  email: 'susu_a@cmu.ac.th', 
  studentId: '662110000',
  phone: '+66 81 234 5678',
  preferences: ['Workshop', 'Seminar']
})

// Store a backup of the profile in case the user cancels their edits
const originalProfile = ref({ ...profile.value })

const availableCategories = ['Workshop', 'Seminar', 'Networking', 'Cultural', 'Sports', 'Academic']

const enableEdit = () => {
  originalProfile.value = { ...profile.value } // Save current state
  isEditing.value = true
}

const cancelEdit = () => {
  profile.value = { ...originalProfile.value } // Restore previous state
  isEditing.value = false
}

const saveProfile = () => {
  alert('Profile updated successfully!')
  isEditing.value = false
}
</script>

<template>
  <div class="max-w-3xl mx-auto p-4 pt-4 pb-24 bg-[#fafafa] min-h-screen font-['Lato']">
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="bg-linear-to-r from-purple-600 to-indigo-600 p-5 text-white flex justify-between items-center">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border-2 
          border-white/30 text-white font-bold text-[16px] shadow-inner">
            {{ profile.firstName.charAt(0) }}{{ profile.lastName.charAt(0) }}
          </div>
          <div>
            <h1 class="text-[16px] font-black tracking-tight">{{ isEditing ? 'Edit Profile' : 'My Profile' }}</h1>
            <p class="text-purple-200 text-[11px] mt-0.5">
              {{ isEditing ? 'Update your personal info' : 'Manage your account details' }}
            </p>
          </div>
        </div>
        
        <button 
          v-if="!isEditing" 
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
            <input v-if="isEditing" type="email" v-model="profile.email" disabled class="w-full border 
            border-gray-100 bg-gray-50 text-gray-400 rounded-lg py-2 px-2.5 cursor-not-allowed font-medium text-[12px]" />
            <p v-else class="text-gray-800 py-1 font-semibold text-[12px]">{{ profile.email }}</p>
          </div>
          <div>
            <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Student ID</label>
            <input v-if="isEditing" type="text" v-model="profile.studentId" class="w-full border 
            border-gray-200 rounded-lg py-2 px-2.5 focus:ring-1.5 focus:ring-purple-400 focus:border-purple-400 
            outline-none font-bold bg-[#fafafa] text-[12px]" />
            <p v-else class="text-gray-800 py-1 font-bold text-[13px]">{{ profile.studentId }}</p>
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
          <button @click="cancelEdit" type="button" class="px-4 py-1.5 border border-gray-200 text-gray-600 
          hover:bg-gray-50 font-bold rounded-lg transition-colors cursor-pointer text-[11px]">
            Cancel
          </button>
          <button type="submit" class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-1.5 px-4 
          rounded-lg shadow-sm transition-colors cursor-pointer text-[11px]">
            Save Changes
          </button>
        </div>
      </form>
    </div>

    <BottomNav />
  </div>
</template>