<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()

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
  // Replace with actual API call to update the database
  alert('Profile updated successfully!')
  isEditing.value = false
}
</script>

<template>
  <div class="max-w-2xl mx-auto p-6 py-8">

    <button @click="router.push({ name: 'home' })" class="mb-6 text-gray-500 hover:text-gray-800 flex items-center gap-2 font-medium transition cursor-pointer">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
      Back
    </button>

    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <!-- Header -->
      <div class="bg-blue-800 p-6 text-white flex justify-between items-center">
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center border-2 border-white text-blue-600 font-bold text-xl">
            {{ profile.firstName.charAt(0) }}{{ profile.lastName.charAt(0) }}
          </div>
          <div>
            <h1 class="text-2xl font-bold">{{ isEditing ? 'Edit Profile' : 'My Profile' }}</h1>
            <p class="text-blue-200 text-sm">
              {{ isEditing ? 'Update your personal info and preferences' : 'Manage your account details' }}
            </p>
          </div>
        </div>
        
        <!-- Quick Action Edit Button (Visible only in View Mode) -->
        <button 
          v-if="!isEditing" 
          @click="enableEdit" 
          class="bg-white/20 hover:bg-white/30 text-white border border-white/40 py-2 px-4 rounded-lg font-medium transition text-sm flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
          Edit
        </button>
      </div>

      <!-- Form Content -->
      <form @submit.prevent="saveProfile" class="p-6 space-y-6">
        
        <!-- Names -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input v-if="isEditing" type="text" v-model="profile.firstName" class="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" required />
            <p v-else class="text-gray-800 py-2 font-medium">{{ profile.firstName }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input v-if="isEditing" type="text" v-model="profile.lastName" class="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" required />
            <p v-else class="text-gray-800 py-2 font-medium">{{ profile.lastName }}</p>
          </div>
        </div>

        <!-- University Details -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">University Email</label>
            <!-- Email is generally read-only even in edit mode, as it's tied to university SSO -->
            <input v-if="isEditing" type="email" v-model="profile.email" disabled class="w-full border border-gray-200 bg-gray-50 text-gray-500 rounded-lg py-2 px-3 cursor-not-allowed" />
            <p v-else class="text-gray-800 py-2 font-medium">{{ profile.email }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
            <input v-if="isEditing" type="text" v-model="profile.studentId" class="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
            <p v-else class="text-gray-800 py-2 font-medium">{{ profile.studentId }}</p>
          </div>
        </div>

        <hr class="border-gray-200" />

        <!-- Preferences -->
        <div>
          <h3 class="text-lg font-semibold text-gray-800 mb-3">Event Preferences</h3>
          <p v-if="isEditing" class="text-sm text-gray-500 mb-4">Select categories you're interested in to get personalized recommendations.</p>
          
          <!-- Edit Mode: Checkboxes -->
          <div v-if="isEditing" class="flex flex-wrap gap-3">
            <label 
              v-for="cat in availableCategories" 
              :key="cat"
              class="flex items-center gap-2 px-4 py-2 border rounded-full cursor-pointer transition"
              :class="profile.preferences.includes(cat) ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'"
            >
              <input type="checkbox" :value="cat" v-model="profile.preferences" class="hidden" />
              <span class="text-sm font-medium">{{ cat }}</span>
            </label>
          </div>

          <!-- View Mode: Read-only Badges -->
          <div v-else class="flex flex-wrap gap-2">
            <span v-if="profile.preferences.length === 0" class="text-gray-500 italic text-sm">No preferences set.</span>
            <span 
              v-for="cat in profile.preferences" 
              :key="'view-'+cat"
              class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium border border-gray-200"
            >
              {{ cat }}
            </span>
          </div>
        </div>

        <!-- Action Buttons (Visible only in Edit Mode) -->
        <div v-if="isEditing" class="pt-4 flex justify-end gap-3">
          <button @click="cancelEdit" type="button" class="px-6 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-lg transition">
            Cancel
          </button>
          <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow transition">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  </div>
</template>