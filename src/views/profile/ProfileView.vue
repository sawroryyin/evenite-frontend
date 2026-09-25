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

const defaultAvatar = computed(() => activeRole.value === 'PARTICIPANT' 
  ? 'https://placehold.co/400x400/transparent/000000?text=User' 
  : 'https://placehold.co/400x400/transparent/000000?text=Org'
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
    triggerAlert('Action Required', 'Organization name is required')
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

const startEditing = () => {
  isEditing.value = true
  window.scrollTo({ top: 0, behavior: 'smooth' })
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
    triggerAlert('Profile Not Found', `You haven't created an ${roleName} profile yet. Create one now?`, 'MISSING_PROFILE')
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
      triggerAlert('Success', `Switched to ${targetRole === 'ORGANIZER' ? 'Organizer' : 'Participant'} profile.`, 'SWITCH_SUCCESS')
    } catch (error) {
      isSwitchingRole.value = false
      triggerAlert('Error', 'Failed to switch profile. Please try again later.')
    }
  }, 1500)
}

const logout = () => authStore.logout()
const onAlertCancel = () => { showAlert.value = false; alertAction.value = 'NONE' }
</script>

<template>
  <div class="pb-28 max-w-3xl mx-auto min-h-screen font-['Lato'] px-4 sm:px-6 relative">
    
    <AlertBox v-if="showAlert" :title="alertTitle" :description="alertDescription" confirmText="OK" :cancelText="alertAction === 'MISSING_PROFILE' ? 'Cancel' : ''" @confirm="onAlertConfirm" @cancel="onAlertCancel" />
    <LoadingOverview v-if="isSwitchingRole" :message="`Switching to ${activeRole === 'PARTICIPANT' ? 'Organizer' : 'Participant'}...`" />

    <div v-if="isLoading" class="bg-transparent p-24 rounded-3xl border border-gray-300 flex justify-center items-center mt-8">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
    </div>

    <div v-else class="bg-transparent rounded-3xl pb-8 overflow-hidden backdrop-blur-sm mt-4">
      
      <!-- Cover Photo Area -->
      <div class="h-12 sm:h-16 w-full relative bg-transparent border-gray-300"></div>
      
      <div class="px-5 sm:px-8 relative z-10 flex flex-col mb-6">
        
        <!-- Profile Picture and Name Row -->
        <div class="flex flex-row gap-4 sm:gap-6 -mt-12 sm:-mt-16">
          <div class="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white bg-gray-100 overflow-hidden shrink-0 relative group shadow-sm"
               :class="isEditing ? 'cursor-pointer' : ''"
               @click="triggerFileInput">
            <img :src="imagePreviewUrl || profileData.imageUrl || defaultAvatar" alt="Profile Image" class="w-full h-full object-cover" />
            <div v-if="isEditing" class="absolute inset-0 bg-gray-900/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
              <svg class="w-8 h-8 text-white mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path></svg>
              <span class="text-xs text-white font-bold tracking-wider uppercase">Edit</span>
            </div>
          </div>
          
          <!-- Name and Role Badge -->
          <div v-if="!isEditing" class="flex flex-col flex-1 pt-2 sm:pt-4 justify-start items-start">
            <template v-if="activeRole === 'PARTICIPANT'">
              <h2 class="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight leading-tight">{{ profileData.firstName || 'Anonymous' }} {{ profileData.lastName || '' }}</h2>
              <p v-if="profileData.nickname" class="text-[#EE6A5D] font-medium text-sm mt-0.5">({{ profileData.nickname }})</p>
            </template>

            <template v-else>
              <h2 class="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight leading-tight">{{ profileData.name || 'Unnamed Organization' }}</h2>
            </template>

            <!-- Role Badge moved under the name -->
            <span class="mt-2.5 text-gray-800 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-gray-400">
              {{ activeRole }}
            </span>
          </div>

          <!-- Edit Photo Buttons -->
          <div v-else class="flex flex-col flex-1 pt-14 sm:pt-16 justify-start items-start gap-2">
            <button v-if="!hasCustomImage" type="button" @click="triggerFileInput" class="bg-transparent text-gray-900 border border-gray-400 hover:border-gray-600 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer">
              Upload Photo
            </button>
            <button v-if="hasCustomImage" type="button" @click="removePicture" class="bg-transparent text-gray-900 border border-gray-400 hover:border-gray-600 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer">
              Remove Photo
            </button>
            <input type="file" ref="fileInput" @change="onFileChange" accept="image/jpeg, image/png, image/webp" class="hidden" />
          </div>
        </div>

        <!-- Organizer Bio moved full-width underneath photo and name -->
        <div v-if="!isEditing && activeRole === 'ORGANIZER' && profileData.bio" class="mt-5 text-gray-800 text-sm leading-relaxed">
          {{ profileData.bio }}
        </div>
      </div>

      <div v-if="!isEditing" class="px-5 sm:px-8">
        
        <div class="space-y-4">
          <div class="bg-transparent rounded-2xl p-4 sm:p-5 border border-gray-300 flex flex-col gap-4">
            
            <template v-if="activeRole === 'PARTICIPANT'">
              <div class="flex items-center gap-4">
                <div class="bg-transparent p-2 rounded-xl border border-gray-300">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14v7"></path></svg>
                </div>
                <span class="text-sm font-medium text-gray-900">{{ profileData.major || 'No Major Specified' }}</span>
              </div>
              <div class="flex items-center gap-4">
                <div class="bg-transparent p-2 rounded-xl border border-gray-300">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4.879-4.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242z"></path></svg>
                </div>
                <span class="text-sm font-medium text-gray-900">{{ profileData.studentId || 'No Student ID' }}</span>
              </div>
            </template>

            <template v-if="activeRole === 'ORGANIZER'">
              <div class="flex items-center gap-4">
                <div class="bg-transparent p-2 rounded-xl border border-gray-300">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                </div>
                <a v-if="profileData.externalUrl" :href="profileData.externalUrl" target="_blank" class="text-sm font-medium text-[#EE6A5D] hover:underline break-all">{{ profileData.externalUrl }}</a>
                <span v-else class="text-sm font-medium text-gray-600 italic">No Website Provided</span>
              </div>
            </template>

            <div class="flex items-center gap-4">
              <div class="bg-transparent p-2 rounded-xl border border-gray-300">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              </div>
              <span class="text-sm font-medium text-gray-900">{{ profileData.contactEmail || 'No Email Provided' }}</span>
            </div>
            
            <div class="flex items-center gap-4">
              <div class="bg-transparent p-2 rounded-xl border border-gray-300">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
              </div>
              <span class="text-sm font-medium text-gray-900">{{ profileData.contactPhone || 'No Phone Provided' }}</span>
            </div>
            
            <div class="flex items-center gap-4">
              <div class="bg-transparent p-2 rounded-xl border border-gray-300">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3C6.486 3 2 6.84 2 11.5c0 2.68 1.465 5.067 3.737 6.64.4.212.753.864.632 1.341l-.427 1.66c-.12.477.202.664.568.414l2.062-1.4c.365-.248.882-.248 1.272-.218.694.053 1.417.083 2.156.083 5.514 0 10-3.84 10-8.5S17.514 3 12 3z"></path></svg>
              </div>
              <span class="text-sm font-medium text-gray-900">{{ profileData.contactLineId || 'No LINE ID' }}</span>
            </div>
          </div>

          <div v-if="activeRole === 'PARTICIPANT'" class="pt-6">
            <h3 class="text-xs font-bold text-gray-700 uppercase tracking-widest mb-3">Tags & Preferences</h3>
            
            <div class="flex flex-wrap gap-2 mb-4">
              <span v-if="!profileData.preferences?.personal?.length && !profileData.preferences?.event?.length" class="text-sm text-gray-600 italic">No preferences set</span>
              
              <span v-for="pref in profileData.preferences?.personal" :key="'p-'+pref" class="bg-transparent text-[#EE6A5D] px-3 py-1.5 rounded-full text-xs font-bold tracking-wide border border-[#EE6A5D]">
                {{ pref }}
              </span>
              <span v-if="profileData.preferences?.personal?.includes('OTHER') && profileData.preferences.personalOther" class="bg-transparent text-[#EE6A5D] px-3 py-1.5 rounded-full text-xs font-bold tracking-wide border border-[#EE6A5D]">
                {{ profileData.preferences.personalOther }}
              </span>

              <span v-for="pref in profileData.preferences?.event" :key="'e-'+pref" class="bg-transparent text-[#EE6A5D] px-3 py-1.5 rounded-full text-xs font-bold tracking-wide border border-[#EE6A5D]">
                {{ pref }}
              </span>

              <span v-for="lang in profileData.preferences?.language" :key="'l-'+lang" class="bg-transparent text-[#EE6A5D] px-3 py-1.5 rounded-full text-xs font-bold tracking-wide border border-[#EE6A5D] uppercase">
                {{ lang }}
              </span>
            </div>
          </div>
        </div>

        <div class="mt-8 flex flex-col gap-3">
          <button type="button" @click="startEditing" class="w-full bg-transparent text-gray-900 border border-gray-400 py-3.5 rounded-2xl font-bold text-sm uppercase tracking-wider hover:bg-gray-900 hover:text-white transition-all cursor-pointer">
            Edit Profile
          </button>
          
          <div class="flex gap-3">
            <button type="button" @click="switchRole" :disabled="isSwitchingRole" class="flex-1 bg-transparent text-gray-900 border border-gray-400 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider hover:border-gray-600 transition-colors cursor-pointer flex justify-center items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
              Switch Role
            </button>
            <button type="button" @click="logout" class="flex-1 bg-transparent text-gray-900 border border-gray-400 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider hover:border-gray-600 transition-colors cursor-pointer">
              Log Out
            </button>
          </div>
        </div>
      </div>

      <form v-else @submit.prevent="updateProfile" class="px-5 sm:px-8 mt-2 flex flex-col gap-8">
        
        <template v-if="activeRole === 'PARTICIPANT'">
          <section>
            <h2 class="text-sm font-bold text-gray-900 uppercase tracking-widest border-b border-gray-300 pb-2 mb-4">Personal Info</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="relative">
                <label class="block text-xs font-bold text-gray-800 mb-1.5 ml-1">First Name <span class="text-gray-900">*</span></label>
                <input v-model="profileData.firstName" required type="text" class="w-full px-4 py-3 bg-transparent border border-gray-400 rounded-2xl text-sm focus:border-[#EE6A5D] focus:ring-1 focus:ring-[#EE6A5D] transition-all outline-none" />
              </div>

              <div class="relative">
                <label class="block text-xs font-bold text-gray-800 mb-1.5 ml-1">Last Name</label>
                <input v-model="profileData.lastName" type="text" class="w-full px-4 py-3 bg-transparent border border-gray-400 rounded-2xl text-sm focus:border-[#EE6A5D] focus:ring-1 focus:ring-[#EE6A5D] transition-all outline-none" />
              </div>

              <div class="relative">
                <label class="block text-xs font-bold text-gray-800 mb-1.5 ml-1">Nickname</label>
                <input v-model="profileData.nickname" type="text" class="w-full px-4 py-3 bg-transparent border border-gray-400 rounded-2xl text-sm focus:border-[#EE6A5D] focus:ring-1 focus:ring-[#EE6A5D] transition-all outline-none" />
              </div>

              <div class="relative">
                <label class="block text-xs font-bold text-gray-800 mb-1.5 ml-1">Student ID</label>
                <input v-model="profileData.studentId" type="text" class="w-full px-4 py-3 bg-transparent border border-gray-400 rounded-2xl text-sm focus:border-[#EE6A5D] focus:ring-1 focus:ring-[#EE6A5D] transition-all outline-none" />
              </div>

              <div class="relative sm:col-span-2">
                <label class="block text-xs font-bold text-gray-800 mb-1.5 ml-1">Major</label>
                <input v-model="profileData.major" type="text" class="w-full px-4 py-3 bg-transparent border border-gray-400 rounded-2xl text-sm focus:border-[#EE6A5D] focus:ring-1 focus:ring-[#EE6A5D] transition-all outline-none" />
              </div>
            </div>
          </section>

          <section>
            <h2 class="text-sm font-bold text-gray-900 uppercase tracking-widest border-b border-gray-300 pb-2 mb-4">Contact Details</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="relative sm:col-span-2">
                <label class="block text-xs font-bold text-gray-800 mb-1.5 ml-1">Contact Email</label>
                <input v-model="profileData.contactEmail" type="email" class="w-full px-4 py-3 bg-transparent border border-gray-400 rounded-2xl text-sm focus:border-[#EE6A5D] focus:ring-1 focus:ring-[#EE6A5D] transition-all outline-none" />
              </div>

              <div class="relative">
                <label class="block text-xs font-bold text-gray-800 mb-1.5 ml-1">Phone Number</label>
                <input v-model="profileData.contactPhone" type="text" class="w-full px-4 py-3 bg-transparent border border-gray-400 rounded-2xl text-sm focus:border-[#EE6A5D] focus:ring-1 focus:ring-[#EE6A5D] transition-all outline-none" />
              </div>

              <div class="relative">
                <label class="block text-xs font-bold text-gray-800 mb-1.5 ml-1">LINE ID</label>
                <input v-model="profileData.contactLineId" type="text" class="w-full px-4 py-3 bg-transparent border border-gray-400 rounded-2xl text-sm focus:border-[#EE6A5D] focus:ring-1 focus:ring-[#EE6A5D] transition-all outline-none" />
              </div>
            </div>
          </section>

          <section>
            <h2 class="text-sm font-bold text-gray-900 uppercase tracking-widest border-b border-gray-300 pb-2 mb-4">Preferences</h2>
            
            <div class="mb-6">
              <label class="block text-xs font-bold text-gray-800 mb-3 ml-1">Personal Interests</label>
              <div class="flex flex-wrap gap-2.5">
                <label v-for="pref in PERSONAL_PREFS" :key="pref" class="select-none cursor-pointer group">
                  <input type="checkbox" :value="pref" v-model="profileData.preferences.personal" class="hidden" />
                  <span class="inline-block px-4 py-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer"
                        :class="profileData.preferences.personal.includes(pref) ? 'bg-transparent border-[#EE6A5D] text-[#EE6A5D]' : 'bg-transparent border-gray-400 text-gray-800'">
                    {{ pref }}
                  </span>
                </label>
              </div>
              <div v-if="profileData.preferences.personal.includes('OTHER')" class="mt-4">
                <input v-model="profileData.preferences.personalOther" type="text" placeholder="Specify other interests..." class="w-full px-4 py-3 bg-transparent border border-gray-400 rounded-2xl text-sm focus:border-[#EE6A5D] focus:ring-1 focus:ring-[#EE6A5D] transition-all outline-none" />
              </div>
            </div>

            <div class="mb-6">
              <label class="block text-xs font-bold text-gray-800 mb-3 ml-1">Event Preferences</label>
              <div class="flex flex-wrap gap-2.5">
                <label v-for="pref in ALLOWED_EVENT_PREFERENCES" :key="pref" class="select-none cursor-pointer group">
                  <input type="checkbox" :value="pref" v-model="profileData.preferences.event" class="hidden" />
                  <span class="inline-block px-4 py-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer"
                        :class="profileData.preferences.event.includes(pref) ? 'bg-transparent border-[#EE6A5D] text-[#EE6A5D]' : 'bg-transparent border-gray-400 text-gray-800'">
                    {{ pref }}
                  </span>
                </label>
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-800 mb-3 ml-1">Language</label>
              <div class="flex gap-3">
                <label v-for="lang in LANG_PREFS" :key="lang" class="select-none cursor-pointer group">
                  <input type="checkbox" :value="lang" v-model="profileData.preferences.language" class="hidden" />
                  <span class="inline-block px-6 py-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer uppercase"
                        :class="profileData.preferences.language.includes(lang) ? 'bg-transparent border-[#EE6A5D] text-[#EE6A5D]' : 'bg-transparent border-gray-400 text-gray-800'">
                    {{ lang }}
                  </span>
                </label>
              </div>
            </div>
          </section>
        </template>

        <template v-else>
          <section>
            <h2 class="text-sm font-bold text-gray-900 uppercase tracking-widest border-b border-gray-300 pb-2 mb-4">Organization Profile</h2>

            <div class="space-y-4">
              <div class="relative">
                <label class="block text-xs font-bold text-gray-800 mb-1.5 ml-1">Organization Name <span class="text-gray-900">*</span></label>
                <input v-model="profileData.name" type="text" class="w-full px-4 py-3 bg-transparent border border-gray-400 rounded-2xl text-sm focus:border-[#EE6A5D] focus:ring-1 focus:ring-[#EE6A5D] transition-all outline-none" />
              </div>
              
              <div class="relative">
                <label class="block text-xs font-bold text-gray-800 mb-1.5 ml-1">Bio / Description</label>
                <textarea v-model="profileData.bio" rows="4" class="w-full px-4 py-3 bg-transparent border border-gray-400 rounded-2xl text-sm focus:border-[#EE6A5D] focus:ring-1 focus:ring-[#EE6A5D] transition-all outline-none"></textarea>
              </div>

              <div class="relative">
                <label class="block text-xs font-bold text-gray-800 mb-1.5 ml-1">Website URL</label>
                <input v-model="profileData.externalUrl" type="url" placeholder="https://" class="w-full px-4 py-3 bg-transparent border border-gray-400 rounded-2xl text-sm focus:border-[#EE6A5D] focus:ring-1 focus:ring-[#EE6A5D] transition-all outline-none" />
              </div>
            </div>
          </section>

          <section>
            <h2 class="text-sm font-bold text-gray-900 uppercase tracking-widest border-b border-gray-300 pb-2 mb-4">Contact Details</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="relative sm:col-span-2">
                <label class="block text-xs font-bold text-gray-800 mb-1.5 ml-1">Contact Email</label>
                <input v-model="profileData.contactEmail" type="email" class="w-full px-4 py-3 bg-transparent border border-gray-400 rounded-2xl text-sm focus:border-[#EE6A5D] focus:ring-1 focus:ring-[#EE6A5D] transition-all outline-none" />
              </div>

              <div class="relative">
                <label class="block text-xs font-bold text-gray-800 mb-1.5 ml-1">Phone Number</label>
                <input v-model="profileData.contactPhone" type="text" class="w-full px-4 py-3 bg-transparent border border-gray-400 rounded-2xl text-sm focus:border-[#EE6A5D] focus:ring-1 focus:ring-[#EE6A5D] transition-all outline-none" />
              </div>

              <div class="relative">
                <label class="block text-xs font-bold text-gray-800 mb-1.5 ml-1">LINE ID</label>
                <input v-model="profileData.contactLineId" type="text" class="w-full px-4 py-3 bg-transparent border border-gray-400 rounded-2xl text-sm focus:border-[#EE6A5D] focus:ring-1 focus:ring-[#EE6A5D] transition-all outline-none" />
              </div>
            </div>
          </section>
        </template>

        <div class="mt-4 pt-6 border-t border-gray-300 flex gap-4">
          <button type="button" @click="cancelEdit" :disabled="isSaving" class="flex-1 bg-transparent text-gray-900 border border-gray-400 py-4 rounded-2xl font-bold text-sm uppercase tracking-wider hover:border-gray-600 transition-colors disabled:opacity-50 cursor-pointer">
            Cancel
          </button>
          <button type="submit" :disabled="isSaving" class="flex-1 bg-transparent text-gray-900 border border-gray-900 py-4 rounded-2xl font-bold text-sm uppercase tracking-wider hover:bg-gray-900 hover:text-white transition-all disabled:opacity-50 cursor-pointer">
            {{ isSaving ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </form>

    </div>
    <BottomNav />
  </div>
</template>