<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth.ts'
import api from '../../services/api.ts'
import LoadingOverview from '../../components/LoadingOverlay.vue'

import AlertBox from '../../components/ConfirmModal.vue' 

const showAlert = ref(false)
const alertTitle = ref('')
const alertDescription = ref('')
const isSuccessAlert = ref(false)

const triggerAlert = (title: string, description: string, success = false) => {
  alertTitle.value = title
  alertDescription.value = description
  isSuccessAlert.value = success
  showAlert.value = true
}

const onAlertConfirm = () => {
  showAlert.value = false
  if (isSuccessAlert.value) {
    router.push({ name: 'profile' })
  }
}

import { ALLOWED_EVENT_PREFERENCES, LANG_PREFS } from '../../types.ts'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isLoading = ref(false)
const role = ref<'PARTICIPANT' | 'ORGANIZER'>('PARTICIPANT')

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
    event: [] as string[], 
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
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      triggerAlert('Invalid File', 'Unsupported image format')
      target.value = '' 
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      triggerAlert('File Too Large', 'File size must not exceed 5MB.')
      target.value = '' 
      return
    }
    
    imageFile.value = file
    imagePreviewUrl.value = URL.createObjectURL(file)
  }
}

const submitProfile = async () => {
  if (role.value === 'PARTICIPANT' && (!pForm.value.firstName || !pForm.value.firstName.trim())) {
    triggerAlert('Missing Information', 'First name is required')
    return 
  }

  if (role.value === 'ORGANIZER' && (!oForm.value.name || !oForm.value.name.trim())) {
    triggerAlert('Missing Information', 'Organizer name is required')
    return 
  }

  isLoading.value = true
  try {
    let imageUrl = ''
    
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
    
    triggerAlert('Success!', 'Your profile has been created successfully.', true)
    
  } catch (error) {
    console.error('Failed to create profile', error)
    triggerAlert('Error', 'Failed to create profile. Please try again later.')
  } finally {
    isLoading.value = false
  }
}

const removePicture = () => {
  imageFile.value = null
  imagePreviewUrl.value = null
  if (fileInput.value) fileInput.value.value = '' 
}

const handleCancel = () => {
  const hasParticipant = authStore.hasParticipantProfile; 
  const hasOrganizer = authStore.hasOrganizerProfile;
  
  const hasOtherProfile = role.value === 'PARTICIPANT' ? hasOrganizer : hasParticipant;

  if (hasOtherProfile) {
    router.push({ name: 'profile' }); 
  } else {
    router.push({ name: 'role-select' }); 
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-[#FFFFFF] font-['Lato'] px-4 py-8 relative mb-14">
    
    <AlertBox 
      v-if="showAlert" 
      :title="alertTitle" 
      :description="alertDescription" 
      confirmText="OK" 
      @confirm="onAlertConfirm" 
    />
    
    <LoadingOverview v-if="isLoading" message="Creating your profile..." />

    <div class="bg-[#FFFFFF] p-8 rounded-2xl shadow-sm border border-[#CECBF6] max-w-2xl w-full">
      <h1 class="text-2xl font-black text-[#26215C] uppercase tracking-tight mb-2">Create Profile</h1>
      <p class="text-[11px] font-bold text-[#534AB7] mb-6 uppercase tracking-wider">{{ role }} MODE</p>

      <div class="flex flex-col items-center mb-8">
        <div class="w-32 h-32 rounded-full border-4 border-[#CECBF6] bg-[#EEEDFE]/50 shadow-sm overflow-hidden cursor-pointer group relative" @click="triggerFileInput">
          <img :src="imagePreviewUrl || 'https://placehold.co/400x400/EEEDFE/3C3489?text=Upload'" class="w-full h-full object-cover" />
          <div class="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path></svg>
          </div>
        </div>
        <input type="file" ref="fileInput" @change="onFileChange" accept="image/jpeg, image/png, image/webp" class="hidden" />
        
        <button 
          v-if="imagePreviewUrl" 
          type="button" 
          @click="removePicture"
          class="mt-3 text-[10px] font-bold text-red-500 hover:text-red-700 uppercase tracking-wider bg-red-50 px-3 py-1 rounded-lg transition-colors cursor-pointer"
        >
          Remove Photo
        </button>
        <p v-else class="text-[10px] font-bold text-[#26215C]/50 mt-2 uppercase">Tap to upload photo</p>
      </div>

      <form @submit.prevent="submitProfile" class="flex flex-col gap-6">
        
        <template v-if="role === 'PARTICIPANT'">
          <div class="space-y-4">
            <h2 class="text-sm font-black text-[#26215C] border-b border-[#CECBF6] pb-2">Personal Information</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-[10px] font-bold text-[#26215C]/70 uppercase tracking-wider mb-1">First Name *</label>
                <input v-model="pForm.firstName" type="text" class="w-full px-4 py-2.5 bg-[#EEEDFE]/30 border border-[#CECBF6] rounded-xl text-sm focus:outline-none focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#7F77DD] focus:border-transparent text-[#26215C] transition-all" />
              </div>
              <div>
                <label class="block text-[10px] font-bold text-[#26215C]/70 uppercase tracking-wider mb-1">Last Name</label>
                <input v-model="pForm.lastName" type="text" class="w-full px-4 py-2.5 bg-[#EEEDFE]/30 border border-[#CECBF6] rounded-xl text-sm focus:outline-none focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#7F77DD] focus:border-transparent text-[#26215C] transition-all" />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-[10px] font-bold text-[#26215C]/70 uppercase tracking-wider mb-1">Nickname</label>
                <input v-model="pForm.nickname" type="text" class="w-full px-4 py-2.5 bg-[#EEEDFE]/30 border border-[#CECBF6] rounded-xl text-sm focus:outline-none focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#7F77DD] focus:border-transparent text-[#26215C] transition-all" />
              </div>
              <div>
                <label class="block text-[10px] font-bold text-[#26215C]/70 uppercase tracking-wider mb-1">Student ID</label>
                <input v-model="pForm.studentId" type="text" class="w-full px-4 py-2.5 bg-[#EEEDFE]/30 border border-[#CECBF6] rounded-xl text-sm focus:outline-none focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#7F77DD] focus:border-transparent text-[#26215C] transition-all" />
              </div>
            </div>

            <div>
              <label class="block text-[10px] font-bold text-[#26215C]/70 uppercase tracking-wider mb-1">Major</label>
              <input v-model="pForm.major" type="text" class="w-full px-4 py-2.5 bg-[#EEEDFE]/30 border border-[#CECBF6] rounded-xl text-sm focus:outline-none focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#7F77DD] focus:border-transparent text-[#26215C] transition-all" />
            </div>
          </div>

          <div class="space-y-4 pt-2">
            <h2 class="text-sm font-black text-[#26215C] border-b border-[#CECBF6] pb-2">Contact Details</h2>
            
            <div>
              <label class="block text-[10px] font-bold text-[#26215C]/70 uppercase tracking-wider mb-1">Contact Email</label>
              <input v-model="pForm.contactEmail" type="email" class="w-full px-4 py-2.5 bg-[#EEEDFE]/30 border border-[#CECBF6] rounded-xl text-sm focus:outline-none focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#7F77DD] focus:border-transparent text-[#26215C] transition-all" />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-[10px] font-bold text-[#26215C]/70 uppercase tracking-wider mb-1">Phone Number</label>
                <input v-model="pForm.contactPhone" type="text" class="w-full px-4 py-2.5 bg-[#EEEDFE]/30 border border-[#CECBF6] rounded-xl text-sm focus:outline-none focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#7F77DD] focus:border-transparent text-[#26215C] transition-all" />
              </div>
              <div>
                <label class="block text-[10px] font-bold text-[#26215C]/70 uppercase tracking-wider mb-1">LINE ID</label>
                <input v-model="pForm.contactLineId" type="text" class="w-full px-4 py-2.5 bg-[#EEEDFE]/30 border border-[#CECBF6] rounded-xl text-sm focus:outline-none focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#7F77DD] focus:border-transparent text-[#26215C] transition-all" />
              </div>
            </div>
          </div>

          <div class="space-y-4 pt-2">
            <h2 class="text-sm font-black text-[#26215C] border-b border-[#CECBF6] pb-2">Preferences</h2>
            
            <div>
              <label class="block text-[10px] font-bold text-[#26215C]/70 uppercase tracking-wider mb-2">Interests</label>
              <div class="flex flex-wrap gap-2">
                <label v-for="pref in PERSONAL_PREFS" :key="pref" class="select-none cursor-pointer group">
                  <input type="checkbox" :value="pref" v-model="pForm.preferences.personal" class="hidden" />
                  <span class="inline-block px-3 py-1.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer"
                        :class="pForm.preferences.personal.includes(pref) ? 'bg-[#534AB7] border-[#534AB7] text-[#FFFFFF]' : 'bg-[#FFFFFF] border-[#CECBF6] text-[#26215C]/60 group-hover:border-[#7F77DD] group-hover:text-[#3C3489]'">
                    {{ pref }}
                  </span>
                </label>
              </div>
              
              <div v-if="pForm.preferences.personal.includes('OTHER')" class="mt-3">
                <input v-model="pForm.preferences.personalOther" type="text" placeholder="Please specify other interests..." maxlength="100" class="w-full px-4 py-2.5 bg-[#EEEDFE]/30 border border-[#CECBF6] rounded-xl text-sm focus:outline-none focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#7F77DD] focus:border-transparent text-[#26215C] transition-all" />
              </div>
            </div>

            <div>
              <label class="block text-[10px] font-bold text-[#26215C]/70 uppercase tracking-wider mb-2 mt-4">Event Preferences</label>
              <div class="flex flex-wrap gap-2">
                <label v-for="pref in ALLOWED_EVENT_PREFERENCES" :key="pref" class="select-none cursor-pointer group">
                  <input type="checkbox" :value="pref" v-model="pForm.preferences.event" class="hidden" />
                  <span class="inline-block px-3 py-1.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer"
                        :class="pForm.preferences.event.includes(pref) ? 'bg-[#3C3489] border-[#3C3489] text-[#FFFFFF]' : 'bg-[#FFFFFF] border-[#CECBF6] text-[#26215C]/60 group-hover:border-[#534AB7] group-hover:text-[#3C3489]'">
                    {{ pref }}
                  </span>
                </label>
              </div>
            </div>

            <div>
              <label class="block text-[10px] font-bold text-[#26215C]/70 uppercase tracking-wider mb-2 mt-4">Language Preference</label>
              <div class="flex gap-2">
                <label v-for="lang in LANG_PREFS" :key="lang" class="select-none cursor-pointer group">
                  <input type="checkbox" :value="lang" v-model="pForm.preferences.language" class="hidden" />
                  <span class="inline-block px-4 py-1.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer uppercase"
                        :class="pForm.preferences.language.includes(lang) ? 'bg-[#534AB7] border-[#534AB7] text-[#FFFFFF]' : 'bg-[#FFFFFF] border-[#CECBF6] text-[#26215C]/60 group-hover:border-[#7F77DD] group-hover:text-[#3C3489]'">
                    {{ lang }}
                  </span>
                </label>
              </div>
            </div>
          </div>
        </template>

        <template v-else>
          <div class="space-y-4">
            <h2 class="text-sm font-black text-[#26215C] border-b border-[#CECBF6] pb-2">Organization Information</h2>

            <div>
              <label class="block text-[10px] font-bold text-[#26215C]/70 uppercase tracking-wider mb-1">Organization Name *</label>
              <input v-model="oForm.name" type="text" class="w-full px-4 py-2.5 bg-[#EEEDFE]/30 border border-[#CECBF6] rounded-xl text-sm focus:outline-none focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#7F77DD] focus:border-transparent text-[#26215C] transition-all" />
            </div>
            
            <div>
              <label class="block text-[10px] font-bold text-[#26215C]/70 uppercase tracking-wider mb-1">Bio / Description</label>
              <textarea v-model="oForm.bio" rows="3" class="w-full px-4 py-2.5 bg-[#EEEDFE]/30 border border-[#CECBF6] rounded-xl text-sm focus:outline-none focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#7F77DD] focus:border-transparent text-[#26215C] transition-all"></textarea>
            </div>

            <div>
              <label class="block text-[10px] font-bold text-[#26215C]/70 uppercase tracking-wider mb-1">Website / External URL</label>
              <input v-model="oForm.externalUrl" type="url" placeholder="https://" class="w-full px-4 py-2.5 bg-[#EEEDFE]/30 border border-[#CECBF6] rounded-xl text-sm focus:outline-none focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#7F77DD] focus:border-transparent text-[#26215C] transition-all" />
            </div>
          </div>

          <div class="space-y-4 pt-2">
            <h2 class="text-sm font-black text-[#26215C] border-b border-[#CECBF6] pb-2">Contact Details</h2>

            <div>
              <label class="block text-[10px] font-bold text-[#26215C]/70 uppercase tracking-wider mb-1">Contact Email</label>
              <input v-model="oForm.contactEmail" type="email" class="w-full px-4 py-2.5 bg-[#EEEDFE]/30 border border-[#CECBF6] rounded-xl text-sm focus:outline-none focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#7F77DD] focus:border-transparent text-[#26215C] transition-all" />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-[10px] font-bold text-[#26215C]/70 uppercase tracking-wider mb-1">Phone Number</label>
                <input v-model="oForm.contactPhone" type="text" class="w-full px-4 py-2.5 bg-[#EEEDFE]/30 border border-[#CECBF6] rounded-xl text-sm focus:outline-none focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#7F77DD] focus:border-transparent text-[#26215C] transition-all" />
              </div>
              <div>
                <label class="block text-[10px] font-bold text-[#26215C]/70 uppercase tracking-wider mb-1">LINE ID</label>
                <input v-model="oForm.contactLineId" type="text" class="w-full px-4 py-2.5 bg-[#EEEDFE]/30 border border-[#CECBF6] rounded-xl text-sm focus:outline-none focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#7F77DD] focus:border-transparent text-[#26215C] transition-all" />
              </div>
            </div>
          </div>
        </template>

        <div class="fixed bottom-0 left-0 right-0 bg-[#FFFFFF] border-t border-[#CECBF6] p-4 shadow-[0_-4px_10px_-2px_rgba(0,0,0,0.03)] z-20">
          <div class="max-w-2xl mx-auto flex gap-4">
            
            <button 
              type="button" 
              @click="handleCancel" 
              class="flex-1 bg-[#EEEDFE]/50 hover:bg-[#EEEDFE] text-[#26215C]/70 hover:text-[#26215C] border border-[#CECBF6] py-3 rounded-xl font-bold text-[11px] uppercase tracking-wider transition-all cursor-pointer"
            >
              Cancel
            </button>
            
            <button 
              type="submit" 
              :disabled="isLoading" 
              class="flex-1 bg-[#534AB7] hover:bg-[#3C3489] text-[#FFFFFF] py-3 rounded-xl font-bold text-[11px] uppercase tracking-wider shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {{ isLoading ? 'SAVING...' : 'COMPLETE PROFILE' }}
            </button>
            
          </div>
        </div>
      </form>
    </div>
  </div>
</template>