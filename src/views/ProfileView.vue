<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import api from '../services/api'
import BottomNav from '../components/BottomNav.vue'

const router = useRouter()
const authStore = useAuthStore()

const activeRole = ref<'PARTICIPANT' | 'ORGANIZER'>('PARTICIPANT')
const profileData = ref<any>({})

// UI States
const isEditing = ref(false)
const isSaving = ref(false)
const isLoading = ref(true)
const message = ref({ text: '', type: 'success' })

// Image Upload States
const fileInput = ref<HTMLInputElement | null>(null)
const imageFile = ref<File | null>(null)
const imagePreviewUrl = ref<string | null>(null)

// Default Image Fallbacks
const defaultAvatar = computed(() => activeRole.value === 'PARTICIPANT' 
  ? 'https://placehold.co/400x400?text=Profile' 
  : 'https://placehold.co/400x400?text=Organizer'
)

// Computed property to check if a custom image exists (either pending upload or saved in DB)
const hasCustomImage = computed(() => {
  return !!imagePreviewUrl.value || !!profileData.value.imageUrl
})

// Preference Options based on UserPreferences Constant
const PERSONAL_PREFS = [
  'MUSIC', 'GAMING', 'ART', 'SPORTS', 'PHOTOGRAPHY', 'COOKING', 
  'READING', 'TECHNOLOGY', 'FASHION', 'TRAVEL', 'FILM', 'DANCE', 'OTHER'
]
const LANG_PREFS = ['en', 'th']

onMounted(async () => {
  activeRole.value = authStore.currentRole as 'PARTICIPANT' | 'ORGANIZER'
  await fetchProfile()
})

const fetchProfile = async () => {
  isLoading.value = true
  try {
    const endpoint = activeRole.value === 'PARTICIPANT' ? '/users/me/participant-profile' : '/users/me/organizer-profile'
    const { data } = await api.get(endpoint)
    
    // Ensure nested objects exist to avoid undefined errors when binding to v-model
    if (activeRole.value === 'PARTICIPANT') {
      if (!data.preferences) {
        data.preferences = { personal: [], event: [], language: [], personalOther: '' }
      }
    }
    
    profileData.value = { ...data }
  } catch (err) {
    console.error(err)
    showMessage('Failed to load profile data.', 'error')
  } finally {
    isLoading.value = false
  }
}

const triggerFileInput = () => {
  if (isEditing.value && fileInput.value) {
    fileInput.value.click()
  }
}

const onFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const file = target.files[0]
    
    if (file.size > 5 * 1024 * 1024) {
      showMessage('Image size must be less than 5MB.', 'error')
      return
    }

    imageFile.value = file
    imagePreviewUrl.value = URL.createObjectURL(file)
  }
}

const removePicture = () => {
  imageFile.value = null
  imagePreviewUrl.value = null // Setting to null allows the UI to fall back to the defaultAvatar
  profileData.value.imageUrl = '' // Clears the DB image
}

const updateProfile = async () => {
  isSaving.value = true
  message.value.text = ''
  
  try {
    // 1. Upload image first if a new one was selected
    if (imageFile.value) {
      const formData = new FormData()
      formData.append('image', imageFile.value)
      const uploadEndpoint = activeRole.value === 'PARTICIPANT' 
        ? '/users/me/participant-profile/image' 
        : '/users/me/organizer-profile/image'
        
      const uploadRes = await api.post(uploadEndpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      profileData.value.imageUrl = uploadRes.data.imageUrl
    }

    // 2. Clear personalOther if 'OTHER' is not selected in preferences
    if (activeRole.value === 'PARTICIPANT' && !profileData.value.preferences.personal.includes('OTHER')) {
        profileData.value.preferences.personalOther = ''
    }

    // 3. Update the rest of the profile text fields
    const endpoint = activeRole.value === 'PARTICIPANT' ? '/users/me/participant-profile' : '/users/me/organizer-profile'
    await api.patch(endpoint, profileData.value)
    
    showMessage('Profile updated successfully.', 'success')
    isEditing.value = false
    imageFile.value = null 
    imagePreviewUrl.value = null
    
    await fetchProfile()
  } catch (err: any) {
    showMessage(err.response?.data?.message || 'Failed to update profile.', 'error')
  } finally {
    isSaving.value = false
  }
}

const cancelEdit = () => {
  isEditing.value = false
  imageFile.value = null
  imagePreviewUrl.value = null
  message.value.text = ''
  fetchProfile() 
}

const showMessage = (text: string, type: 'success' | 'error') => {
  message.value = { text, type }
  setTimeout(() => { message.value.text = '' }, 5000)
}

const logout = () => {
  authStore.logout()
}
</script>

<template>
  <div class="pt-4 pb-24 max-w-3xl mx-auto bg-[#fafafa] min-h-screen font-['Lato'] px-4">
    
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-[22px] font-['Nunito'] font-black text-transparent bg-clip-text bg-linear-to-r from-purple-600 to-indigo-600 tracking-tight">
        My Profile
      </h1>
      <span class="bg-purple-100 text-purple-700 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest">
        {{ activeRole }}
      </span>
    </div>

    <div v-if="message.text" class="mb-4 text-[11px] font-bold p-3 rounded-lg text-center transition-all"
         :class="message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'">
      {{ message.text }}
    </div>

    <div v-if="isLoading" class="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 flex justify-center items-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
    </div>

    <div v-else class="bg-white rounded-2xl shadow-sm border border-gray-100 pb-6 overflow-hidden">
      
      <div class="h-32 bg-linear-to-r from-purple-200 via-purple-300 to-indigo-300 w-full relative"></div>
      
      <div class="px-6 relative flex flex-col sm:flex-row items-center sm:items-end justify-center sm:justify-start -mt-16 mb-8 gap-5">
        
        <div class="w-32 h-32 rounded-full border-4 border-white bg-white shadow-md overflow-hidden shrink-0 z-10 relative group"
             :class="isEditing ? 'cursor-pointer' : ''"
             @click="triggerFileInput">
          <img 
            :src="imagePreviewUrl || profileData.imageUrl || defaultAvatar" 
            alt="Profile Image" 
            class="w-full h-full object-cover"
          />
          <div v-if="isEditing" class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          </div>
        </div>
        
        <div v-if="isEditing" class="z-10 flex flex-wrap justify-center gap-2 sm:pb-2">
          
          <button 
            v-if="!hasCustomImage"
            type="button" 
            @click="triggerFileInput" 
            class="bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 px-4 py-2.5 rounded-xl text-[11px] font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
            Upload Picture
          </button>
          
          <button 
            v-if="hasCustomImage" 
            type="button" 
            @click="removePicture" 
            class="bg-white text-red-500 hover:bg-red-50 border border-gray-200 hover:border-red-200 px-4 py-2.5 rounded-xl text-[11px] font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            Remove
          </button>
          
          <input type="file" ref="fileInput" @change="onFileChange" accept="image/jpeg, image/png, image/webp" class="hidden" />
        </div>
      </div>

      <div class="px-6">
        <form @submit.prevent="updateProfile" class="flex flex-col gap-6">
          
          <template v-if="activeRole === 'PARTICIPANT'">
            <div class="space-y-4">
              <h2 class="text-sm font-black text-gray-900 border-b border-gray-100 pb-2">Personal Information</h2>
              
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">First Name *</label>
                  <p v-if="!isEditing" class="text-sm font-medium text-gray-900 py-1.5">{{ profileData.firstName || '-' }}</p>
                  <input v-else v-model="profileData.firstName" required type="text" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 transition-all" />
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Last Name</label>
                  <p v-if="!isEditing" class="text-sm font-medium text-gray-900 py-1.5">{{ profileData.lastName || '-' }}</p>
                  <input v-else v-model="profileData.lastName" type="text" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 transition-all" />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Nickname</label>
                  <p v-if="!isEditing" class="text-sm font-medium text-gray-900 py-1.5">{{ profileData.nickname || '-' }}</p>
                  <input v-else v-model="profileData.nickname" type="text" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 transition-all" />
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Student ID</label>
                  <p v-if="!isEditing" class="text-sm font-medium text-gray-900 py-1.5">{{ profileData.studentId || '-' }}</p>
                  <input v-else v-model="profileData.studentId" type="text" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 transition-all" />
                </div>
              </div>

              <div>
                <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Major</label>
                <p v-if="!isEditing" class="text-sm font-medium text-gray-900 py-1.5">{{ profileData.major || '-' }}</p>
                <input v-else v-model="profileData.major" type="text" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 transition-all" />
              </div>
            </div>

            <div class="space-y-4 pt-2">
              <h2 class="text-sm font-black text-gray-900 border-b border-gray-100 pb-2">Contact Details</h2>
              
              <div>
                <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Contact Email</label>
                <p v-if="!isEditing" class="text-sm font-medium text-gray-900 py-1.5">{{ profileData.contactEmail || '-' }}</p>
                <input v-else v-model="profileData.contactEmail" type="email" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 transition-all" />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Phone Number</label>
                  <p v-if="!isEditing" class="text-sm font-medium text-gray-900 py-1.5">{{ profileData.contactPhone || '-' }}</p>
                  <input v-else v-model="profileData.contactPhone" type="text" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 transition-all" />
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">LINE ID</label>
                  <p v-if="!isEditing" class="text-sm font-medium text-gray-900 py-1.5">{{ profileData.contactLineId || '-' }}</p>
                  <input v-else v-model="profileData.contactLineId" type="text" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 transition-all" />
                </div>
              </div>
            </div>

            <div class="space-y-4 pt-2">
              <h2 class="text-sm font-black text-gray-900 border-b border-gray-100 pb-2">Preferences</h2>
              
              <div>
                <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Interests</label>
                <div v-if="!isEditing" class="flex flex-wrap gap-1.5 py-1">
                  <span v-if="!profileData.preferences?.personal?.length" class="text-sm text-gray-400 italic">None selected</span>
                  <span v-else v-for="pref in profileData.preferences.personal" :key="pref" class="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-[10px] font-bold tracking-wide">
                    {{ pref }}
                  </span>
                  <span v-if="profileData.preferences?.personal?.includes('OTHER') && profileData.preferences.personalOther" class="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-[10px] font-bold tracking-wide">
                    {{ profileData.preferences.personalOther }}
                  </span>
                </div>
                <div v-else class="flex flex-wrap gap-2">
                  <label v-for="pref in PERSONAL_PREFS" :key="pref" class="select-none">
                    <input type="checkbox" :value="pref" v-model="profileData.preferences.personal" class="hidden" />
                    <span class="inline-block px-3 py-1.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer"
                          :class="profileData.preferences.personal.includes(pref) ? 'bg-purple-600 border-purple-600 text-white' : 'bg-white border-gray-200 text-gray-500 hover:border-purple-300'">
                      {{ pref }}
                    </span>
                  </label>
                </div>
                
                <div v-if="isEditing && profileData.preferences.personal.includes('OTHER')" class="mt-3">
                  <input v-model="profileData.preferences.personalOther" type="text" placeholder="Please specify other interests..." maxlength="100" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 transition-all" />
                </div>
              </div>

              <div>
                <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Language Preference</label>
                <div v-if="!isEditing" class="flex flex-wrap gap-1.5 py-1">
                  <span v-if="!profileData.preferences?.language?.length" class="text-sm text-gray-400 italic">None selected</span>
                  <span v-else v-for="lang in profileData.preferences.language" :key="lang" class="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase">
                    {{ lang }}
                  </span>
                </div>
                <div v-else class="flex gap-2">
                  <label v-for="lang in LANG_PREFS" :key="lang" class="select-none">
                    <input type="checkbox" :value="lang" v-model="profileData.preferences.language" class="hidden" />
                    <span class="inline-block px-4 py-1.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer uppercase"
                          :class="profileData.preferences.language.includes(lang) ? 'bg-purple-600 border-purple-600 text-white' : 'bg-white border-gray-200 text-gray-500 hover:border-purple-300'">
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
                <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Organization Name *</label>
                <p v-if="!isEditing" class="text-sm font-medium text-gray-900 py-1.5">{{ profileData.name || '-' }}</p>
                <input v-else v-model="profileData.name" required type="text" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 transition-all" />
              </div>
              
              <div>
                <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Bio / Description</label>
                <p v-if="!isEditing" class="text-sm font-medium text-gray-900 py-1.5 whitespace-pre-wrap">{{ profileData.bio || 'No bio provided.' }}</p>
                <textarea v-else v-model="profileData.bio" rows="4" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 transition-all"></textarea>
              </div>

              <div>
                <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Website / External URL</label>
                <p v-if="!isEditing" class="text-sm font-medium text-purple-600 py-1.5 break-all">
                  <a v-if="profileData.externalUrl" :href="profileData.externalUrl" target="_blank" class="hover:underline">{{ profileData.externalUrl }}</a>
                  <span v-else class="text-gray-900">-</span>
                </p>
                <input v-else v-model="profileData.externalUrl" type="url" placeholder="https://" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 transition-all" />
              </div>
            </div>

            <div class="space-y-4 pt-2">
              <h2 class="text-sm font-black text-gray-900 border-b border-gray-100 pb-2">Contact Details</h2>

              <div>
                <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Contact Email</label>
                <p v-if="!isEditing" class="text-sm font-medium text-gray-900 py-1.5">{{ profileData.contactEmail || '-' }}</p>
                <input v-else v-model="profileData.contactEmail" type="email" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 transition-all" />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Phone Number</label>
                  <p v-if="!isEditing" class="text-sm font-medium text-gray-900 py-1.5">{{ profileData.contactPhone || '-' }}</p>
                  <input v-else v-model="profileData.contactPhone" type="text" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 transition-all" />
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">LINE ID</label>
                  <p v-if="!isEditing" class="text-sm font-medium text-gray-900 py-1.5">{{ profileData.contactLineId || '-' }}</p>
                  <input v-else v-model="profileData.contactLineId" type="text" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 transition-all" />
                </div>
              </div>
            </div>
          </template>

          <div class="mt-4 pt-6 border-t border-gray-100">
            
            <div v-if="isEditing" class="flex gap-3">
              <button type="button" @click="cancelEdit" :disabled="isSaving" class="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold text-[11px] uppercase tracking-wider hover:bg-gray-200 transition-all disabled:opacity-50">
                Cancel
              </button>
              <button type="submit" :disabled="isSaving" class="flex-1 bg-gray-900 text-white py-3 rounded-xl font-bold text-[11px] uppercase tracking-wider shadow-sm hover:bg-gray-800 transition-all disabled:opacity-50">
                {{ isSaving ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>

            <div v-else class="flex flex-col gap-3">
              <button type="button" @click="isEditing = true" class="w-full bg-linear-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-bold text-[11px] uppercase tracking-wider shadow-sm hover:from-purple-700 hover:to-indigo-700 transition-all">
                Edit Profile
              </button>
              
              <div class="flex gap-3 mt-2">
                <button type="button" @click="router.push('/role-select')" class="flex-1 bg-purple-50 text-purple-700 border border-purple-200 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-wider hover:bg-purple-100 transition-all">
                  Switch Role
                </button>
                <button type="button" @click="logout" class="flex-1 bg-red-50 text-red-600 border border-red-200 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-wider hover:bg-red-100 transition-all">
                  Log Out
                </button>
              </div>
            </div>

          </div>
        </form>
      </div>
    </div>
    
    <BottomNav />
  </div>
</template>