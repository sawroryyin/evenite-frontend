<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import api from '../services/api'
import BottomNav from '../components/BottomNav.vue'

const authStore = useAuthStore()
const activeRole = ref<'PARTICIPANT' | 'ORGANIZER'>('PARTICIPANT')
const profileData = ref<any>({})
const isSaving = ref(false)
const message = ref('')

onMounted(async () => {
  activeRole.value = authStore.currentRole as 'PARTICIPANT' | 'ORGANIZER'
  fetchProfile()
})

const fetchProfile = async () => {
  try {
    const endpoint = activeRole.value === 'PARTICIPANT' ? '/users/me/participant-profile' : '/users/me/organizer-profile'
    const { data } = await api.get(endpoint)
    profileData.value = data
  } catch (err) {
    console.error(err)
  }
}

const updateProfile = async () => {
  isSaving.value = true
  message.value = ''
  try {
    const endpoint = activeRole.value === 'PARTICIPANT' ? '/users/me/participant-profile' : '/users/me/organizer-profile'
    await api.patch(endpoint, profileData.value)
    message.value = 'Profile updated successfully.'
  } catch (err: any) {
    message.value = err.response?.data?.message || 'Failed to update.'
  } finally {
    isSaving.value = false
  }
}

const logout = () => {
  authStore.logout()
}
</script>

<template>
  <div class="pt-4 pb-24 max-w-3xl mx-auto bg-[#fafafa] min-h-screen font-['Lato'] px-4">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-xl font-black text-gray-900 uppercase tracking-tight">My Profile</h1>
      <span class="bg-purple-100 text-purple-700 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest">{{ activeRole }}</span>
    </div>

    <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <p v-if="message" class="mb-4 text-[11px] font-bold text-purple-600">{{ message }}</p>

      <form @submit.prevent="updateProfile" class="flex flex-col gap-4">
        
        <template v-if="activeRole === 'PARTICIPANT'">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">First Name</label>
              <input v-model="profileData.firstName" type="text" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Last Name</label>
              <input v-model="profileData.lastName" type="text" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500" />
            </div>
          </div>
          <div>
            <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Student ID</label>
            <input v-model="profileData.studentId" type="text" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Major</label>
            <input v-model="profileData.major" type="text" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500" />
          </div>
        </template>

        <template v-else>
          <div>
            <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Organization Name</label>
            <input v-model="profileData.name" type="text" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Contact Email</label>
            <input v-model="profileData.contactEmail" type="email" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Bio</label>
            <textarea v-model="profileData.bio" rows="3" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"></textarea>
          </div>
        </template>

        <div class="mt-4 flex gap-3">
          <button type="submit" :disabled="isSaving" class="flex-1 bg-gray-900 text-white py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-wider hover:bg-gray-800 disabled:opacity-50">
            {{ isSaving ? 'Saving...' : 'Save Changes' }}
          </button>
          <button type="button" @click="$router.push('/role-select')" class="flex-1 bg-purple-50 text-purple-700 border border-purple-200 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-wider hover:bg-purple-100">
            Switch Role
          </button>
        </div>
      </form>
      
      <div class="mt-8 pt-6 border-t border-gray-100 text-center">
        <button @click="logout" class="text-red-500 text-[11px] font-bold uppercase tracking-wider hover:text-red-700">Log Out</button>
      </div>
    </div>
    
    <BottomNav />
  </div>
</template>