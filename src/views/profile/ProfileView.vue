<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import api from '../../services/api'
import BottomNav from '../../components/BottomNav.vue'
import LoadingOverview from '../../components/LoadingOverlay.vue'
import AlertBox from '../../components/ConfirmModal.vue'
import { ALLOWED_EVENT_PREFERENCES } from '../../types.ts'

const router = useRouter()
const authStore = useAuthStore()

const activeRole = ref<'PARTICIPANT' | 'ORGANIZER'>('PARTICIPANT')
const profileData = ref<any>({})

const isEditing = ref(false)
const isSaving = ref(false)
const isLoading = ref(true)
const isSwitchingRole = ref(false)

const showAlert = ref(false)
const alertTitle = ref('')
const alertDescription = ref('')
const alertAction = ref<'SWITCH_SUCCESS' | 'MISSING_PROFILE' | 'NONE'>('NONE')
const targetRoleToSwitch = ref<'PARTICIPANT' | 'ORGANIZER'>('PARTICIPANT')

const triggerAlert = (title: string, description: string, action: 'SWITCH_SUCCESS' | 'MISSING_PROFILE' | 'NONE' = 'NONE') => {
  alertTitle.value = title
  alertDescription.value = description
  alertAction.value = action
  showAlert.value = true
}

const onAlertConfirm = () => {
  showAlert.value = false
  if (alertAction.value === 'MISSING_PROFILE') {
    router.push({ name: 'profile-create', query: { role: targetRoleToSwitch.value } })
  }
}

const fileInput = ref<HTMLInputElement | null>(null)
const imageFile = ref<File | null>(null)
const imagePreviewUrl = ref<string | null>(null)

// Default Image Fallbacks mapped to brand colors
const defaultAvatar = computed(() => activeRole.value === 'PARTICIPANT' 
  ? 'https://placehold.co/400x400/EEEDFE/3C3489?text=Profile' 
  : 'https://placehold.co/400x400/EEEDFE/3C3489?text=Organizer'
)

const hasCustomImage = computed(() => {
  return !!imagePreviewUrl.value || !!profileData.value.imageUrl
})

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
    
    if (activeRole.value === 'PARTICIPANT') {
      if (!data.preferences) {
        data.preferences = { personal: [], event: [], language: [], personalOther: '' }
      } else {
        if (!data.preferences.event) data.preferences.event = []
        if (!data.preferences.language) data.preferences.language = []
        if (!data.preferences.personal) data.preferences.personal = []
      }
    }
    
    profileData.value = { ...data }
  } catch (err) {
    console.error(err)
    triggerAlert('Error', 'Failed to load profile data.')
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

const removePicture = () => {
  imageFile.value = null
  imagePreviewUrl.value = null 
  profileData.value.imageUrl = '' 
}

const updateProfile = async () => {
  if (activeRole.value === 'ORGANIZER' && (!profileData.value.name || !profileData.value.name.trim())) {
    triggerAlert('Action Required', 'Organizer name is required')
    return
  }

  isSaving.value = true
  
  try {
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

    if (activeRole.value === 'PARTICIPANT' && !profileData.value.preferences.personal.includes('OTHER')) {
        profileData.value.preferences.personalOther = ''
    }

    const endpoint = activeRole.value === 'PARTICIPANT' ? '/users/me/participant-profile' : '/users/me/organizer-profile'
    await api.patch(endpoint, profileData.value)
    
    triggerAlert('Success', 'Profile updated successfully.')
    isEditing.value = false
    imageFile.value = null 
    imagePreviewUrl.value = null
    
    window.scrollTo({ top: 0, behavior: 'smooth' })
    await fetchProfile()
  } catch (err: any) {
    triggerAlert('Error', err.response?.data?.message || 'Failed to update profile.')
  } finally {
    isSaving.value = false
  }
}

const cancelEdit = () => {
  isEditing.value = false
  imageFile.value = null
  imagePreviewUrl.value = null
  window.scrollTo({ top: 0, behavior: 'smooth' })
  fetchProfile() 
}

const switchRole = async () => {
  const current = authStore.currentRole
  const targetRole = current === 'PARTICIPANT' ? 'ORGANIZER' : 'PARTICIPANT'
  const hasTargetProfile = targetRole === 'PARTICIPANT' ? authStore.hasParticipantProfile : authStore.hasOrganizerProfile
  
  targetRoleToSwitch.value = targetRole

  if (!hasTargetProfile) {
    const roleName = targetRole === 'ORGANIZER' ? 'Organizer' : 'Participant'
    triggerAlert(
      'Profile Not Found', 
      `You haven't created an ${roleName} profile yet. Please create one to switch.`, 
      'MISSING_PROFILE'
    )
    return
  }

  isSwitchingRole.value = true

  setTimeout(async () => {
    try {
      const { data } = await api.patch('/users/me/switch-profile', { targetRole })
      authStore.setTokens(data.accessToken, authStore.refreshToken!)
      
      activeRole.value = targetRole
      
      await fetchProfile()
      
      window.scrollTo({ top: 0, behavior: 'smooth' })

      isSwitchingRole.value = false
      const roleName = targetRole === 'ORGANIZER' ? 'Organizer' : 'Participant'
      triggerAlert('Success', `Switched to ${roleName} profile.`, 'SWITCH_SUCCESS')
      
    } catch (error) {
      console.error('Failed to switch role', error)
      isSwitchingRole.value = false
      triggerAlert('Error', 'Failed to switch profile. Please try again later.')
    }
  }, 3000)
}

const logout = () => {
  authStore.logout()
}
</script>

<template>
  <div class="pt-4 pb-24 max-w-3xl mx-auto bg-[#FFFFFF] min-h-screen font-['Lato'] px-4 relative">
    
    <AlertBox 
      v-if="showAlert" 
      :title="alertTitle" 
      :description="alertDescription" 
      confirmText="OK" 
      @confirm="onAlertConfirm" 
    />
    
    <LoadingOverview 
      v-if="isSwitchingRole" 
      :message="`Switching to ${activeRole === 'PARTICIPANT' ? 'Organizer' : 'Participant'} Profile...`" 
    />

    <div class="flex justify-between items-center mb-6">
      <h1 class="text-[22px] font-['Nunito'] font-black text-[#26215C] tracking-tight">
        My Profile
      </h1>
      <span class="bg-[#EEEDFE] text-[#3C3489] px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border border-[#CECBF6]">
        {{ activeRole }}
      </span>
    </div>

    <div v-if="isLoading" class="bg-[#FFFFFF] p-12 rounded-2xl shadow-sm border border-[#CECBF6] flex justify-center items-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#534AB7]"></div>
    </div>

    <div v-else class="bg-[#FFFFFF] rounded-2xl shadow-sm border border-[#CECBF6] pb-6 overflow-hidden">
      
      <div class="h-22 bg-[#EEEDFE] w-full relative"></div>
      
      <div class="px-6 relative flex flex-col sm:flex-row items-center sm:items-end justify-center sm:justify-start -mt-16 mb-4 gap-5">
        
        <div class="w-32 h-32 rounded-full border-4 border-[#FFFFFF] bg-[#FFFFFF] shadow-md overflow-hidden shrink-0 z-10 relative group"
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
            class="bg-[#EEEDFE] text-[#534AB7] hover:bg-[#CECBF6] border border-[#CECBF6] px-4 py-2.5 rounded-xl text-[11px] font-bold transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
            Upload Picture
          </button>
          
          <button 
            v-if="hasCustomImage" 
            type="button" 
            @click="removePicture" 
            class="bg-[#FFFFFF] text-red-500 hover:bg-red-50 border border-[#CECBF6] hover:border-red-200 px-4 py-2.5 rounded-xl text-[11px] font-bold transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            Remove Picture
          </button>
          
          <input type="file" ref="fileInput" @change="onFileChange" accept="image/jpeg, image/png, image/webp" class="hidden" />
        </div>
      </div>

      <div class="px-6">
        <form @submit.prevent="updateProfile" class="flex flex-col gap-6">
          
          <template v-if="activeRole === 'PARTICIPANT'">
            <div class="space-y-4">
              <h2 class="text-sm font-black text-[#26215C] border-b border-[#CECBF6] pb-2">Personal Information</h2>
              
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-[11px] font-semibold text-[#26215C]/50 uppercase tracking-widest mb-1.5">First Name *</label>
                  <p v-if="!isEditing" class="text-[15px] font-bold text-[#26215C] bg-gray-50 px-3 py-2 rounded-lg">{{ profileData.firstName || '-' }}</p>
                  <input v-else v-model="profileData.firstName" required type="text" class="w-full px-3 py-2 bg-[#EEEDFE]/30 border border-[#CECBF6] rounded-lg text-sm focus:ring-2 focus:ring-[#7F77DD] focus:outline-none focus:bg-[#FFFFFF] text-[#26215C] transition-all" />
                </div>
                <div>
                  <label class="block text-[11px] font-semibold text-[#26215C]/50 uppercase tracking-widest mb-1.5">Last Name</label>
                  <p v-if="!isEditing" class="text-[15px] font-bold text-[#26215C] bg-gray-50 px-3 py-2 rounded-lg">{{ profileData.lastName || '-' }}</p>
                  <input v-else v-model="profileData.lastName" type="text" class="w-full px-3 py-2 bg-[#EEEDFE]/30 border border-[#CECBF6] rounded-lg text-sm focus:ring-2 focus:ring-[#7F77DD] focus:outline-none focus:bg-[#FFFFFF] text-[#26215C] transition-all" />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-[11px] font-semibold text-[#26215C]/50 uppercase tracking-widest mb-1.5">Nickname</label>
                  <p v-if="!isEditing" class="text-[15px] font-bold text-[#26215C] bg-gray-50 px-3 py-2 rounded-lg">{{ profileData.nickname || '-' }}</p>
                  <input v-else v-model="profileData.nickname" type="text" class="w-full px-3 py-2 bg-[#EEEDFE]/30 border border-[#CECBF6] rounded-lg text-sm focus:ring-2 focus:ring-[#7F77DD] focus:outline-none focus:bg-[#FFFFFF] text-[#26215C] transition-all" />
                </div>
                <div>
                  <label class="block text-[11px] font-semibold text-[#26215C]/50 uppercase tracking-widest mb-1.5">Student ID</label>
                  <p v-if="!isEditing" class="text-[15px] font-bold text-[#26215C] bg-gray-50 px-3 py-2 rounded-lg">{{ profileData.studentId || '-' }}</p>
                  <input v-else v-model="profileData.studentId" type="text" class="w-full px-3 py-2 bg-[#EEEDFE]/30 border border-[#CECBF6] rounded-lg text-sm focus:ring-2 focus:ring-[#7F77DD] focus:outline-none focus:bg-[#FFFFFF] text-[#26215C] transition-all" />
                </div>
              </div>

              <div>
                <label class="block text-[11px] font-semibold text-[#26215C]/50 uppercase tracking-widest mb-1.5">Major</label>
                <p v-if="!isEditing" class="text-[15px] font-bold text-[#26215C] bg-gray-50 px-3 py-2 rounded-lg">{{ profileData.major || '-' }}</p>
                <input v-else v-model="profileData.major" type="text" class="w-full px-3 py-2 bg-[#EEEDFE]/30 border border-[#CECBF6] rounded-lg text-sm focus:ring-2 focus:ring-[#7F77DD] focus:outline-none focus:bg-[#FFFFFF] text-[#26215C] transition-all" />
              </div>
            </div>

            <div class="space-y-4 pt-2">
              <h2 class="text-sm font-black text-[#26215C] border-b border-[#CECBF6] pb-2">Contact Details</h2>
              
              <div>
                <label class="block text-[11px] font-semibold text-[#26215C]/50 uppercase tracking-widest mb-1.5">Contact Email</label>
                <p v-if="!isEditing" class="text-[15px] font-bold text-[#26215C] bg-gray-50 px-3 py-2 rounded-lg">{{ profileData.contactEmail || '-' }}</p>
                <input v-else v-model="profileData.contactEmail" type="email" class="w-full px-3 py-2 bg-[#EEEDFE]/30 border border-[#CECBF6] rounded-lg text-sm focus:ring-2 focus:ring-[#7F77DD] focus:outline-none focus:bg-[#FFFFFF] text-[#26215C] transition-all" />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-[11px] font-semibold text-[#26215C]/50 uppercase tracking-widest mb-1.5">Phone Number</label>
                  <p v-if="!isEditing" class="text-[15px] font-bold text-[#26215C] bg-gray-50 px-3 py-2 rounded-lg">{{ profileData.contactPhone || '-' }}</p>
                  <input v-else v-model="profileData.contactPhone" type="text" class="w-full px-3 py-2 bg-[#EEEDFE]/30 border border-[#CECBF6] rounded-lg text-sm focus:ring-2 focus:ring-[#7F77DD] focus:outline-none focus:bg-[#FFFFFF] text-[#26215C] transition-all" />
                </div>
                <div>
                  <label class="block text-[11px] font-semibold text-[#26215C]/50 uppercase tracking-widest mb-1.5">LINE ID</label>
                  <p v-if="!isEditing" class="text-[15px] font-bold text-[#26215C] bg-gray-50 px-3 py-2 rounded-lg">{{ profileData.contactLineId || '-' }}</p>
                  <input v-else v-model="profileData.contactLineId" type="text" class="w-full px-3 py-2 bg-[#EEEDFE]/30 border border-[#CECBF6] rounded-lg text-sm focus:ring-2 focus:ring-[#7F77DD] focus:outline-none focus:bg-[#FFFFFF] text-[#26215C] transition-all" />
                </div>
              </div>
            </div>

            <div class="space-y-4 pt-2">
              <h2 class="text-sm font-black text-[#26215C] border-b border-[#CECBF6] pb-2">Preferences</h2>
              
              <div>
                <label class="block text-[11px] font-semibold text-[#26215C]/50 uppercase tracking-widest mb-2">Interests</label>
                <div v-if="!isEditing" class="flex flex-wrap gap-1.5 py-1">
                  <span v-if="!profileData.preferences?.personal?.length" class="text-sm text-[#26215C]/40 italic">None selected</span>
                  <span v-else v-for="pref in profileData.preferences.personal" :key="pref" class="bg-[#EEEDFE]/50 text-[#3C3489] border border-[#CECBF6] px-3 py-1 rounded-full text-[10px] font-bold tracking-wide">
                    {{ pref }}
                  </span>
                  <span v-if="profileData.preferences?.personal?.includes('OTHER') && profileData.preferences.personalOther" class="bg-[#EEEDFE]/50 text-[#3C3489] border border-[#CECBF6] px-3 py-1 rounded-full text-[10px] font-bold tracking-wide">
                    {{ profileData.preferences.personalOther }}
                  </span>
                </div>
                <div v-else class="flex flex-wrap gap-2">
                  <label v-for="pref in PERSONAL_PREFS" :key="pref" class="select-none cursor-pointer group">
                    <input type="checkbox" :value="pref" v-model="profileData.preferences.personal" class="hidden" />
                    <span class="inline-block px-3 py-1.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer"
                          :class="profileData.preferences.personal.includes(pref) ? 'bg-[#534AB7] border-[#534AB7] text-[#FFFFFF]' : 'bg-[#FFFFFF] border-[#CECBF6] text-[#26215C]/60 group-hover:border-[#7F77DD] group-hover:text-[#3C3489]'">
                      {{ pref }}
                    </span>
                  </label>
                </div>
                
                <div v-if="isEditing && profileData.preferences.personal.includes('OTHER')" class="mt-3">
                  <input v-model="profileData.preferences.personalOther" type="text" placeholder="Please specify other interests..." maxlength="100" class="w-full px-3 py-2 bg-[#EEEDFE]/30 border border-[#CECBF6] rounded-lg text-sm focus:ring-2 focus:ring-[#7F77DD] focus:outline-none focus:bg-[#FFFFFF] text-[#26215C] transition-all" />
                </div>
              </div>

              <div>
                <label class="block text-[11px] font-semibold text-[#26215C]/50 uppercase tracking-widest mb-2">Event Preferences</label>
                
                <div v-if="!isEditing" class="flex flex-wrap gap-1.5 py-1">
                  <span v-if="!profileData.preferences?.event?.length" class="text-sm text-[#26215C]/40 italic">None selected</span>
                  <span v-else v-for="pref in profileData.preferences.event" :key="pref" class="bg-[#EEEDFE]/50 text-[#3C3489] border border-[#CECBF6] px-3 py-1 rounded-full text-[10px] font-bold tracking-wide">
                    {{ pref }}
                  </span>
                </div>

                <div v-else class="flex flex-wrap gap-2">
                  <label v-for="pref in ALLOWED_EVENT_PREFERENCES" :key="pref" class="select-none cursor-pointer group">
                    <input type="checkbox" :value="pref" v-model="profileData.preferences.event" class="hidden" />
                    <span class="inline-block px-3 py-1.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer"
                          :class="profileData.preferences.event.includes(pref) ? 'bg-[#3C3489] border-[#3C3489] text-[#FFFFFF]' : 'bg-[#FFFFFF] border-[#CECBF6] text-[#26215C]/60 group-hover:border-[#534AB7] group-hover:text-[#3C3489]'">
                      {{ pref }}
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label class="block text-[11px] font-semibold text-[#26215C]/50 uppercase tracking-widest mb-2">Language Preference</label>
                <div v-if="!isEditing" class="flex flex-wrap gap-1.5 py-1">
                  <span v-if="!profileData.preferences?.language?.length" class="text-sm text-[#26215C]/40 italic">None selected</span>
                  <span v-else v-for="lang in profileData.preferences.language" :key="lang" class="bg-[#EEEDFE]/50 text-[#3C3489] border border-[#CECBF6] px-3 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase">
                    {{ lang }}
                  </span>
                </div>
                <div v-else class="flex gap-2">
                  <label v-for="lang in LANG_PREFS" :key="lang" class="select-none cursor-pointer group">
                    <input type="checkbox" :value="lang" v-model="profileData.preferences.language" class="hidden" />
                    <span class="inline-block px-4 py-1.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer uppercase"
                          :class="profileData.preferences.language.includes(lang) ? 'bg-[#534AB7] border-[#534AB7] text-[#FFFFFF]' : 'bg-[#FFFFFF] border-[#CECBF6] text-[#26215C]/60 group-hover:border-[#7F77DD] group-hover:text-[#3C3489]'">
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
                <label class="block text-[11px] font-semibold text-[#26215C]/50 uppercase tracking-widest mb-1.5">Organization Name *</label>
                <p v-if="!isEditing" class="text-[15px] font-bold text-[#26215C] bg-gray-50 px-3 py-2 rounded-lg">{{ profileData.name || '-' }}</p>
                <input v-else v-model="profileData.name" type="text" class="w-full px-3 py-2 bg-[#EEEDFE]/30 border border-[#CECBF6] rounded-lg text-sm focus:ring-2 focus:ring-[#7F77DD] focus:outline-none focus:bg-[#FFFFFF] text-[#26215C] transition-all" />
              </div>
              
              <div>
                <label class="block text-[11px] font-semibold text-[#26215C]/50 uppercase tracking-widest mb-1.5">Bio / Description</label>
                <p v-if="!isEditing" class="text-[15px] font-bold text-[#26215C] bg-gray-50 px-3 py-2 rounded-lg whitespace-pre-wrap min-h-[4rem]">{{ profileData.bio || 'No bio provided.' }}</p>
                <textarea v-else v-model="profileData.bio" rows="4" class="w-full px-3 py-2 bg-[#EEEDFE]/30 border border-[#CECBF6] rounded-lg text-sm focus:ring-2 focus:ring-[#7F77DD] focus:outline-none focus:bg-[#FFFFFF] text-[#26215C] transition-all"></textarea>
              </div>

              <div>
                <label class="block text-[11px] font-semibold text-[#26215C]/50 uppercase tracking-widest mb-1.5">Website / External URL</label>
                <p v-if="!isEditing" class="text-[15px] font-bold text-[#534AB7] bg-gray-50 px-3 py-2 rounded-lg break-all">
                  <a v-if="profileData.externalUrl" :href="profileData.externalUrl" target="_blank" class="hover:underline hover:text-[#3C3489] transition-colors">{{ profileData.externalUrl }}</a>
                  <span v-else class="text-[#26215C]">-</span>
                </p>
                <input v-else v-model="profileData.externalUrl" type="url" placeholder="https://" class="w-full px-3 py-2 bg-[#EEEDFE]/30 border border-[#CECBF6] rounded-lg text-sm focus:ring-2 focus:ring-[#7F77DD] focus:outline-none focus:bg-[#FFFFFF] text-[#26215C] transition-all" />
              </div>
            </div>

            <div class="space-y-4 pt-2">
              <h2 class="text-sm font-black text-[#26215C] border-b border-[#CECBF6] pb-2">Contact Details</h2>

              <div>
                <label class="block text-[11px] font-semibold text-[#26215C]/50 uppercase tracking-widest mb-1.5">Contact Email</label>
                <p v-if="!isEditing" class="text-[15px] font-bold text-[#26215C] bg-gray-50 px-3 py-2 rounded-lg">{{ profileData.contactEmail || '-' }}</p>
                <input v-else v-model="profileData.contactEmail" type="email" class="w-full px-3 py-2 bg-[#EEEDFE]/30 border border-[#CECBF6] rounded-lg text-sm focus:ring-2 focus:ring-[#7F77DD] focus:outline-none focus:bg-[#FFFFFF] text-[#26215C] transition-all" />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-[11px] font-semibold text-[#26215C]/50 uppercase tracking-widest mb-1.5">Phone Number</label>
                  <p v-if="!isEditing" class="text-[15px] font-bold text-[#26215C] bg-gray-50 px-3 py-2 rounded-lg">{{ profileData.contactPhone || '-' }}</p>
                  <input v-else v-model="profileData.contactPhone" type="text" class="w-full px-3 py-2 bg-[#EEEDFE]/30 border border-[#CECBF6] rounded-lg text-sm focus:ring-2 focus:ring-[#7F77DD] focus:outline-none focus:bg-[#FFFFFF] text-[#26215C] transition-all" />
                </div>
                <div>
                  <label class="block text-[11px] font-semibold text-[#26215C]/50 uppercase tracking-widest mb-1.5">LINE ID</label>
                  <p v-if="!isEditing" class="text-[15px] font-bold text-[#26215C] bg-gray-50 px-3 py-2 rounded-lg">{{ profileData.contactLineId || '-' }}</p>
                  <input v-else v-model="profileData.contactLineId" type="text" class="w-full px-3 py-2 bg-[#EEEDFE]/30 border border-[#CECBF6] rounded-lg text-sm focus:ring-2 focus:ring-[#7F77DD] focus:outline-none focus:bg-[#FFFFFF] text-[#26215C] transition-all" />
                </div>
              </div>
            </div>
          </template>

          <div class="mt-4 pt-6 border-t border-[#CECBF6]">
            
            <div v-if="isEditing" class="flex gap-3">
              <button type="button" @click="cancelEdit" :disabled="isSaving" class="flex-1 bg-[#EEEDFE]/50 hover:bg-[#EEEDFE] text-[#26215C]/70 hover:text-[#26215C] border border-[#CECBF6] py-3 rounded-xl font-bold text-[11px] uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer">
                Cancel
              </button>
              <button type="submit" :disabled="isSaving" class="flex-1 bg-[#534AB7] hover:bg-[#3C3489] text-[#FFFFFF] py-3 rounded-xl font-bold text-[11px] uppercase tracking-wider shadow-sm transition-colors disabled:opacity-50 cursor-pointer">
                {{ isSaving ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>

            <div v-else class="flex flex-col gap-3">
              <button type="button" @click="isEditing = true" class="w-full bg-[#534AB7] text-[#FFFFFF] py-3 rounded-xl font-bold text-[11px] uppercase tracking-wider shadow-sm hover:bg-[#3C3489] transition-colors cursor-pointer">
                Edit Profile
              </button>
              
              <div class="flex gap-3 mt-2">
                <button type="button" @click="switchRole" :disabled="isSwitchingRole" class="flex-1 bg-[#EEEDFE] text-[#534AB7] border border-[#CECBF6] py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-wider hover:bg-[#CECBF6] hover:text-[#3C3489] transition-colors cursor-pointer">
                  Switch Profile
                </button>
                <button type="button" @click="logout" class="flex-1 bg-red-50 text-red-600 border border-red-200 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-wider hover:bg-red-100 transition-colors cursor-pointer">
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