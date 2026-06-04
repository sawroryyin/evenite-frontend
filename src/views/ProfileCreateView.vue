<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import api from '../services/api'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const isLoading = ref(false)
const role = ref<'PARTICIPANT' | 'ORGANIZER'>('PARTICIPANT')

const pForm = ref({ firstName: '', lastName: '', studentId: '', major: '' })
const oForm = ref({ name: '', bio: '', contactEmail: '' })

onMounted(() => {
  role.value = (route.query.role as 'PARTICIPANT' | 'ORGANIZER') || 'PARTICIPANT'
})

const submitProfile = async () => {
  isLoading.value = true
  try {
    if (role.value === 'PARTICIPANT') {
      const { data } = await api.post('/users/me/participant-profile', pForm.value)
      authStore.setTokens(data.accessToken, authStore.refreshToken!)
    } else {
      const { data } = await api.post('/users/me/organizer-profile', oForm.value)
      authStore.setTokens(data.accessToken, authStore.refreshToken!)
    }
    router.push({name: 'home'})
  } catch (error) {
    console.error('Failed to create profile', error)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-[#fafafa] font-['Lato'] px-4 py-8">
    <div class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full">
      <h1 class="text-2xl font-black text-gray-900 uppercase tracking-tight mb-2">Create Profile</h1>
      <p class="text-[11px] font-bold text-purple-600 mb-6 uppercase tracking-wider">{{ role }} MODE</p>

      <form @submit.prevent="submitProfile" class="flex flex-col gap-4">
        <template v-if="role === 'PARTICIPANT'">
          <div>
            <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">First Name *</label>
            <input v-model="pForm.firstName" type="text" required class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Last Name</label>
            <input v-model="pForm.lastName" type="text" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Student ID</label>
            <input v-model="pForm.studentId" type="text" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Major</label>
            <input v-model="pForm.major" type="text" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
        </template>

        <template v-else>
          <div>
            <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Organization Name *</label>
            <input v-model="oForm.name" type="text" required class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Contact Email</label>
            <input v-model="oForm.contactEmail" type="email" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Bio / Description</label>
            <textarea v-model="oForm.bio" rows="3" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"></textarea>
          </div>
        </template>

        <button type="submit" :disabled="isLoading" class="mt-4 w-full bg-linear-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-bold text-[12px] uppercase tracking-wider shadow-sm hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 transition-all">
          {{ isLoading ? 'Saving...' : 'Complete Profile' }}
        </button>
      </form>
    </div>
  </div>
</template>