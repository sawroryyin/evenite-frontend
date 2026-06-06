<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import EventFormResponseLinks from '../components/EventFormResponseLinks.vue'

const router = useRouter()

const props = defineProps<{ 
  event: any; 
  viewLang: 'en' | 'th';
  availableForms?: any[]; 
  isOrganizer?: boolean;
}>()

// Check if specific forms exist
const hasRegistration = computed(() => props.availableForms?.some(f => f.type === 'REGISTRATION'))
const hasFeedback = computed(() => props.availableForms?.some(f => f.type === 'FEEDBACK'))

// Navigation handler for participants
const navigateToSubmitForm = (type: string) => {
  router.push(`/events/${props.event.id}/forms/${type}/submit`) 
}

const formatDisplayDate = (isoString: string) => {
  if (!isoString) return 'TBA'
  return new Date(isoString).toLocaleString(props.viewLang === 'th' ? 'th-TH' : 'en-US', { 
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}

const mapEmbedUrl = computed(() => {
  if (props.event.mapLink && !props.event.isOnline) {
    const locationText = props.event.location?.en || props.event.location?.th;
    
    if (locationText) {
      return `https://maps.google.com/maps?q=${encodeURIComponent(locationText)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    }
    return props.event.mapLink; 
  }
  return null;
})
</script>

<template>
  <div class="font-['Lato'] max-w-6xl mx-auto space-y-6">
    
    <div class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
      
      <div class="w-full h-48 md:h-64 bg-gray-100 relative border-b border-gray-100">
        <img v-if="event.bannerUrl" :src="event.bannerUrl" class="w-full h-full object-cover" />
        <div v-else class="w-full h-full flex items-center justify-center text-gray-400 font-medium text-sm">
          No Banner Uploaded
        </div>
      </div>

      <div class="p-5 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        <div class="md:col-span-2 space-y-8">
          <div>
            <h1 class="text-2xl md:text-3xl font-bold text-gray-900 mb-3 leading-tight tracking-tight">
              {{ viewLang === 'en' ? event.title.en : event.title.th || 'Untitled Event' }}
            </h1>
            <p class="text-gray-700 whitespace-pre-wrap text-sm md:text-base leading-relaxed">
              {{ viewLang === 'en' ? event.description.en : event.description.th || 'No description provided.' }}
            </p>
            
            <div v-if="event.category?.length > 0" class="mt-6 flex flex-wrap gap-2">
              <span v-for="cat in event.category" :key="cat" class="bg-purple-600 text-white px-3 py-1.5 
              rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                {{ cat }}
              </span>
            </div>
          </div>

          <div v-if="event.agenda?.length > 0">
            <h2 class="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">Event Agenda</h2>
            <ul class="space-y-4 relative border-l-2 border-purple-200 ml-2 pl-5">
              <li v-for="(item, index) in event.agenda" :key="index" class="relative">
                <span class="absolute -left-6.5 top-1 w-3 h-3 bg-purple-500 rounded-full border-2 
                border-white shadow-sm"></span>
                <p class="text-sm font-bold text-purple-600 tracking-wide">{{ item.time || '--:--' }}</p>
                <p class="text-gray-800 text-sm mt-1">{{ viewLang === 'en' ? item.activity.en : item.activity.th }}</p>
              </li>
            </ul>
          </div>
        </div>

        <div class="space-y-4">
          
          <div class="bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-5">
            <div class="flex items-start gap-3">
              <svg class="w-5 h-5 text-purple-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div>
                <h3 class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Date & Time</h3>
                <p class="text-sm font-semibold text-gray-900">{{ formatDisplayDate(event.startAt) }}</p>
                <p class="text-xs text-gray-500 mt-0.5">to {{ formatDisplayDate(event.endAt) }}</p>
              </div>
            </div>
            
            <hr class="border-gray-200" />

            <div class="space-y-4">
              <div class="flex items-start gap-3">
                <svg class="w-5 h-5 text-purple-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <h3 class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Location</h3>
                  <p v-if="event.isOnline" class="text-sm font-bold text-purple-600 bg-purple-50 
                  inline-block px-2 py-1 rounded">Online Event</p>
                  <p v-else class="text-sm font-semibold text-gray-900">
                    {{ viewLang === 'en' ? event.location.en : event.location.th || 'TBA' }}
                  </p>
                </div>
              </div>
              
              <div v-if="!event.isOnline" class="w-full space-y-2">
                <div v-if="mapEmbedUrl" class="w-full rounded-lg overflow-hidden border border-gray-200 shadow-sm 
                bg-gray-200 h-32 md:h-40">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    frameborder="0" 
                    style="border:0;" 
                    :src="mapEmbedUrl"
                    allowfullscreen="false" 
                    loading="lazy">
                  </iframe>
                </div>

                <a v-if="event.mapLink" :href="event.mapLink" target="_blank" class="text-purple-600 
                hover:text-purple-700 
                hover:underline text-xs font-bold inline-block mt-2 transition-colors">
                  Open in Google Maps ↗
                </a>
              </div>
            </div>
          </div>

          <div v-if="event.seatLimit || event.hasCatering || event.contactName || event.contactEmail" 
            class="bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-5">
  
            <div v-if="event.seatLimit" class="flex items-start gap-3">
              <svg class="w-5 h-5 text-purple-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <div>
                <h3 class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Capacity</h3>
                <p class="text-sm font-semibold text-gray-900">{{ event.seatLimit }} seats available</p>
              </div>
            </div>
          
            <hr v-if="event.seatLimit && (event.hasCatering || event.contactName)" class="border-gray-200" />
          
            <div v-if="event.hasCatering" class="flex items-start gap-3">
              <svg class="w-5 h-5 text-purple-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
              </svg>
              <div>
                <h3 class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Catering</h3>
                <p class="text-sm font-semibold text-gray-900">{{ event.isCateringFree ? 'Free Catering' : 'Paid Catering' }}</p>
                <p class="text-xs text-gray-600 mt-0.5">
                  {{ viewLang === 'en' ? event.cateringDescription?.en : event.cateringDescription?.th }}
                </p>
              </div>
            </div>

            <hr v-if="event.hasCatering && (event.contactName || event.contactEmail)" class="border-gray-200" />

            <div v-if="event.contactName || event.contactEmail" class="flex items-start gap-3">
              <svg class="w-5 h-5 text-purple-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <div>
                <h3 class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Organizer Contact</h3>
                <p class="text-sm font-semibold text-gray-800">{{ event.contactName }}</p>
                <p class="text-sm mt-0.5">
                  <a :href="'mailto:'+event.contactEmail" class="text-purple-600 
                    hover:underline">{{ event.contactEmail }}
                  </a>
                </p>
                <p v-if="event.contactPhone" class="text-sm text-gray-600 mt-0.5">{{ event.contactPhone }}</p>
              </div>
            </div>
          </div>

          <div v-if="(hasRegistration || hasFeedback) && (!isOrganizer || event.status === 'DRAFT')" 
               class="bg-linear-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100 shadow-sm space-y-4">
            
            <div class="text-center">
              <h3 class="text-lg font-black text-gray-900 tracking-tight">Join the Experience</h3>
              <p class="text-xs text-gray-500 mt-1">Don't miss out on this event!</p>
            </div>

            <div class="flex flex-col gap-3 mt-4">
              <button v-if="hasRegistration" @click="navigateToSubmitForm('REGISTRATION')" 
                class="w-full bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                <svg class="w-5 h-5 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path>
                </svg>
                Register Now
              </button>

              <button v-if="hasFeedback" @click="navigateToSubmitForm('FEEDBACK')" 
                class="w-full bg-white hover:bg-gray-50 text-indigo-700 border border-indigo-200 shadow-sm hover:shadow transform hover:-translate-y-0.5 transition-all py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                <svg class="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                </svg>
                Give Feedback
              </button>
            </div>
          </div>

          <div v-if="isOrganizer && (!hasRegistration || !hasFeedback)" class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
            <h3 class="text-base font-bold text-gray-900 mb-2">Manage Forms</h3>
            
            <div class="flex flex-col gap-3">
              <!-- Button to create Registration Form if missing -->
              <button 
                v-if="!hasRegistration" 
                @click="router.push(`/events/${event.id}/forms/REGISTRATION`)" 
                class="w-full bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                Create Registration Form
              </button>
              
              <!-- Button to create Feedback Form if missing -->
              <button 
                v-if="!hasFeedback" 
                @click="router.push(`/events/${event.id}/forms/FEEDBACK`)" 
                class="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                Create Feedback Form
              </button>
            </div>
          </div>

          <EventFormResponseLinks 
            v-if="isOrganizer && event.status === 'PUBLISHED'"
            :event-id="event.id"
            :available-forms="availableForms"
          />

        </div>
      </div>
    </div>
  </div>
</template>