<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import api from '../services/api'
import LoadingOverview from '../components/LoadingOverlay.vue'
import { ALLOWED_EVENT_PREFERENCES, LANG_PREFS } from '../types.ts'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isLoading = ref(false)
const role = ref<'PARTICIPANT' | 'ORGANIZER'>('PARTICIPANT')

// Image Upload Refs
const fileInput = ref<HTMLInputElement | null>(null)
const imageFile = ref<File | null>(null)
const imagePreviewUrl = ref<string | null>(null)

const PERSONAL_PREFS = [
  'MUSIC', 'GAMING', 'ART', 'SPORTS', 'PHOTOGRAPHY', 'COOKING', 
  'READING', 'TECHNOLOGY', 'FASHION', 'TRAVEL', 'FILM', 'DANCE', 'OTHER'
]

const pForm = ref({ 
  firstName: '', lastName: '', nickname: '', studentId: '', major: '',
  contactEmail: '', contactPhone: '', contactLineId: '',
  preferences: { 
    personal: [] as string[], 
    event: [] as string[], // Add this
    language: [] as string[], 
    personalOther: '' 
  }
})

const oForm = ref({ 
  name: '', bio: '', externalUrl: '',
  contactEmail: '', contactPhone: '', contactLineId: ''
})

onMounted(() => {
  role.value = (route.query.role as 'PARTICIPANT' | 'ORGANIZER') || 'PARTICIPANT'
})

const triggerFileInput = () => fileInput.value?.click()

const onFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const file = target.files[0]
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB.')
      return
    }
    imageFile.value = file
    imagePreviewUrl.value = URL.createObjectURL(file)
  }
}

const submitProfile = async () => {
  isLoading.value = true
  try {
    let imageUrl = ''
    
    // 1. Upload image first if one is selected
    if (imageFile.value) {
      const formData = new FormData()
      formData.append('image', imageFile.value)
      
      const uploadEndpoint = role.value === 'PARTICIPANT' 
        ? '/users/me/participant-profile/image' 
        : '/users/me/organizer-profile/image'
        
      const uploadRes = await api.post(uploadEndpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      imageUrl = uploadRes.data.imageUrl
    }

    // 2. Submit Profile
    if (role.value === 'PARTICIPANT') {
      if (!pForm.value.preferences.personal.includes('OTHER')) pForm.value.preferences.personalOther = ''
      const payload = { ...pForm.value, imageUrl }
      const { data } = await api.post('/users/me/participant-profile', payload)
      authStore.setTokens(data.accessToken, authStore.refreshToken!)
    } else {
      const payload = { ...oForm.value, imageUrl }
      const { data } = await api.post('/users/me/organizer-profile', payload)
      authStore.setTokens(data.accessToken, authStore.refreshToken!)
    }
    router.push({name: 'home'})
  } catch (error) {
    console.error('Failed to create profile', error)
  } finally {
    isLoading.value = false
  }
}

const removePicture = () => {
  imageFile.value = null
  imagePreviewUrl.value = null
  if (fileInput.value) fileInput.value.value = '' // Resets the actual file input
}

// Add this inside <script setup lang="ts">
const handleCancel = () => {
  // Logic to determine if the "other" profile exists
  // You might need to check your authStore or check if the user has 
  // already created the alternate profile previously.
  const hasParticipant = authStore.hasParticipantProfile; 
  const hasOrganizer = authStore.hasOrganizerProfile;
  
  const hasOtherProfile = role.value === 'PARTICIPANT' ? hasOrganizer : hasParticipant;

  if (hasOtherProfile) {
    // Navigate to the Profile View to show the existing other profile
    router.push({ name: 'profile' }); 
  } else {
    // No other profile exists, return to selection
    router.push({ name: 'role-select' }); 
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-[#fafafa] font-['Lato'] px-4 py-8">
    <LoadingOverview v-if="isLoading" message="Creating your profile..." />

    <div class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-2xl w-full">
      <h1 class="text-2xl font-black text-gray-900 uppercase tracking-tight mb-2">Create Profile</h1>
      <p class="text-[11px] font-bold text-purple-600 mb-6 uppercase tracking-wider">{{ role }} MODE</p>

      <div class="flex flex-col items-center mb-8">
        <div class="w-32 h-32 rounded-full border-4 border-gray-100 bg-gray-50 shadow-sm overflow-hidden cursor-pointer group relative" @click="triggerFileInput">
          <img :src="imagePreviewUrl || 'https://placehold.co/400x400?text=Upload'" class="w-full h-full object-cover" />
          <div class="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path></svg>
          </div>
        </div>
        <input type="file" ref="fileInput" @change="onFileChange" accept="image/jpeg, image/png, image/webp" class="hidden" />
        
        <button 
          v-if="imagePreviewUrl" 
          type="button" 
          @click="removePicture"
          class="mt-3 text-[10px] font-bold text-red-500 hover:text-red-700 uppercase tracking-wider bg-red-50 px-3 py-1 rounded-lg transition-colors"
        >
          Remove Photo
        </button>
        <p v-else class="text-[10px] font-bold text-gray-400 mt-2 uppercase">Tap to upload photo</p>
      </div>

      <form @submit.prevent="submitProfile" class="flex flex-col gap-6">
        
        <template v-if="role === 'PARTICIPANT'">
          <div class="space-y-4">
            <h2 class="text-sm font-black text-gray-900 border-b border-gray-100 pb-2">Personal Information</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">First Name *</label>
                <input v-model="pForm.firstName" type="text" required class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
              </div>
              <div>
                <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Last Name</label>
                <input v-model="pForm.lastName" type="text" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Nickname</label>
                <input v-model="pForm.nickname" type="text" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
              </div>
              <div>
                <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Student ID</label>
                <input v-model="pForm.studentId" type="text" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
              </div>
            </div>

            <div>
              <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Major</label>
              <input v-model="pForm.major" type="text" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
            </div>
          </div>

          <div class="space-y-4 pt-2">
            <h2 class="text-sm font-black text-gray-900 border-b border-gray-100 pb-2">Contact Details</h2>
            
            <div>
              <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Contact Email</label>
              <input v-model="pForm.contactEmail" type="email" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Phone Number</label>
                <input v-model="pForm.contactPhone" type="text" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
              </div>
              <div>
                <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">LINE ID</label>
                <input v-model="pForm.contactLineId" type="text" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
              </div>
            </div>
          </div>

          <div class="space-y-4 pt-2">
            <h2 class="text-sm font-black text-gray-900 border-b border-gray-100 pb-2">Preferences</h2>
            
            <div>
              <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Interests</label>
              <div class="flex flex-wrap gap-2">
                <label v-for="pref in PERSONAL_PREFS" :key="pref" class="select-none">
                  <input type="checkbox" :value="pref" v-model="pForm.preferences.personal" class="hidden" />
                  <span class="inline-block px-3 py-1.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer"
                        :class="pForm.preferences.personal.includes(pref) ? 'bg-purple-600 border-purple-600 text-white' : 'bg-white border-gray-200 text-gray-500 hover:border-purple-300'">
                    {{ pref }}
                  </span>
                </label>
              </div>
              
              <div v-if="pForm.preferences.personal.includes('OTHER')" class="mt-3">
                <input v-model="pForm.preferences.personalOther" type="text" placeholder="Please specify other interests..." maxlength="100" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
              </div>
            </div>

            <div>
              <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 mt-4">Event Preferences</label>
              <div class="flex flex-wrap gap-2">
                <label v-for="pref in ALLOWED_EVENT_PREFERENCES" :key="pref" class="select-none">
                  <input type="checkbox" :value="pref" v-model="pForm.preferences.event" class="hidden" />
                  <span class="inline-block px-3 py-1.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer"
                        :class="pForm.preferences.event.includes(pref) ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-200 text-gray-500 hover:border-indigo-300'">
                    {{ pref }}
                  </span>
                </label>
              </div>
            </div>

            <div>
              <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 mt-4">Language Preference</label>
              <div class="flex gap-2">
                <label v-for="lang in LANG_PREFS" :key="lang" class="select-none">
                  <input type="checkbox" :value="lang" v-model="pForm.preferences.language" class="hidden" />
                  <span class="inline-block px-4 py-1.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer uppercase"
                        :class="pForm.preferences.language.includes(lang) ? 'bg-purple-600 border-purple-600 text-white' : 'bg-white border-gray-200 text-gray-500 hover:border-purple-300'">
                    {{ lang }}
                  </span>
                </label>
              </div>
            </div>
          </div>
        </template>

        <template v-else>
          <div class="space-y-4">
            <h2 class="text-sm font-black text-gray-900 border-b border-gray-100 pb-2">Organization Information</h2>

            <div>
              <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Organization Name *</label>
              <input v-model="oForm.name" type="text" required class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
            </div>
            
            <div>
              <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Bio / Description</label>
              <textarea v-model="oForm.bio" rows="3" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"></textarea>
            </div>

            <div>
              <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Website / External URL</label>
              <input v-model="oForm.externalUrl" type="url" placeholder="https://" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
            </div>
          </div>

          <div class="space-y-4 pt-2">
            <h2 class="text-sm font-black text-gray-900 border-b border-gray-100 pb-2">Contact Details</h2>

            <div>
              <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Contact Email</label>
              <input v-model="oForm.contactEmail" type="email" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Phone Number</label>
                <input v-model="oForm.contactPhone" type="text" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
              </div>
              <div>
                <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">LINE ID</label>
                <input v-model="oForm.contactLineId" type="text" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
              </div>
            </div>
          </div>
        </template>

        <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 shadow-[0_-4px_10px_-2px_rgba(0,0,0,0.03)] z-20">
          <div class="max-w-2xl mx-auto flex gap-4">
            
            <button 
              type="button" 
              @click="handleCancel" 
              class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 py-3 rounded-xl font-bold text-[11px] uppercase tracking-wider transition-all"
            >
              Cancel
            </button>
            
            <button 
              type="submit" 
              :disabled="isLoading" 
              class="flex-1 bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3 rounded-xl font-bold text-[11px] uppercase tracking-wider shadow-sm transition-all disabled:opacity-50"
            >
              {{ isLoading ? 'SAVING...' : 'COMPLETE PROFILE' }}
            </button>
            
          </div>
        </div>
      </form>
    </div>
  </div>
</template>