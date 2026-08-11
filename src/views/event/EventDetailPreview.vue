<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { RegistrationService } from '../../services/RegistrationService'
import ConfirmModal from '../../components/ConfirmModal.vue'
import { UserService } from '../../services/UserService'

const router = useRouter()

const props = defineProps<{ 
  event: any; 
  viewLang: 'en' | 'th';
  availableForms?: any[]; 
  isOrganizer?: boolean;
}>()

const userTicket = ref<any>(null)
const isLoadingTicket = ref(false)

const alertState = ref({ show: false, title: '', description: '', theme: 'blue' as 'blue' | 'red' })
const confirmState = ref({ show: false, title: '', description: '', confirmText: '', theme: 'blue' as 'blue' | 'red', onConfirm: () => {} })

const fetchUserTicket = async () => {
  if (props.isOrganizer || !props.event?.id) return;
  
  try {
    isLoadingTicket.value = true;
    
    const registeredEvents = await UserService.getCurrentUserRegisteredEvents();
    
    const isRegistered = registeredEvents.some((evt: any) => evt.id === props.event.id);

    if (isRegistered) {
      userTicket.value = await RegistrationService.getTicketByEvent(props.event.id);
    } else {
      userTicket.value = null; 
    }
    
  } catch (e: any) {
    console.error("Error checking registration or fetching ticket:", e);
    userTicket.value = null; 
  } finally {
    isLoadingTicket.value = false;
  }
}

watch(() => props.event?.id, (newId) => {
  if (newId) {
    fetchUserTicket();
  }
}, { immediate: true })

const hasRegistration = computed(() => props.availableForms?.some(f => f.type === 'REGISTRATION'))
const hasFeedback = computed(() => props.availableForms?.some(f => f.type === 'FEEDBACK'))

const isEventFull = computed(() => {
  if (props.event.seatLimit === null || props.event.seatLimit === undefined) return false;
  return props.event.seatsTaken >= props.event.seatLimit;
});

const isEventStarted = computed(() => {
  if (!props.event.startAt) return false;
  return new Date(props.event.startAt) <= new Date();
});

const isEventOver = computed(() => {
  if (!props.event.startAt && !props.event.endAt) return false;
  const endTime = props.event.endAt ? new Date(props.event.endAt) : new Date(props.event.startAt);
  return endTime <= new Date();
});

const navigateToSubmitForm = (type: string) => {
  if (type === 'REGISTRATION') {
    router.push(`/events/${props.event.id}/register`)
  } else {
    router.push(`/events/${props.event.id}/forms/${type}/submit`) 
  }
}

const viewTicket = () => {
  if (userTicket.value) {
    router.push(`/events/${props.event.id}/tickets/${userTicket.value.id}`)
  }
}

const goToChat = () => {
  if (props.event?.roomId) {
    // Adjust this route if your router uses a different path or named route
    router.push(`/discussion/${props.event.roomId}`); 
  } else {
    showAlert('Error', 'Discussion room is not available yet.', 'red');
  }
}

const showAlert = (title: string, description: string, theme: 'blue' | 'red' = 'blue') => {
  alertState.value = { show: true, title, description, theme };
}

const confirmCancelRegistration = () => {
  if (isEventStarted.value) {
    return showAlert('Error', 'Cannot cancel registration because the event has already started.', 'red');
  }

  confirmState.value = {
    show: true,
    title: 'Cancel Registration',
    description: 'Are you sure you want to cancel your registration for this event?',
    confirmText: 'Confirm',
    theme: 'red',
    onConfirm: async () => {
      confirmState.value.show = false;
      try {
        await RegistrationService.cancelRegistration(props.event.id);
        showAlert('Success', 'Registration cancelled successfully.', 'blue');
        
        await fetchUserTicket(); 
        props.event.seatsTaken = Math.max(0, props.event.seatsTaken - 1);
      } catch (e: any) {
        const errorMsg = e.response?.data?.message || 'There was an error in cancelling registration. Please try again.';
        showAlert('Error', errorMsg, 'red');
      }
    }
  }
}

const isSingleDay = computed(() => {
  if (!props.event.startAt || !props.event.endAt) return true;
  const start = new Date(props.event.startAt);
  const end = new Date(props.event.endAt);
  return start.toDateString() === end.toDateString();
})

const formatDateObj = (isoString: string | undefined) => {
  if (!isoString) return { date: 'TBA', time: '', full: 'TBA' };
  
  const date = new Date(isoString);
  const locale = props.viewLang === 'th' ? 'th-TH' : 'en-US';
  
  const datePart = date.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
  const weekdayPart = date.toLocaleDateString(locale, { weekday: 'short' });
  const timePart = date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  
  return {
    date: `${datePart} (${weekdayPart})`,
    time: timePart,
    full: `${datePart} (${weekdayPart}) ${timePart}`
  };
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
    
    <div class="bg-[#FFFFFF] rounded-xl shadow-sm overflow-hidden border border-[#CECBF6]">
      <div class="w-full h-48 md:h-64 relative border-b border-[#CECBF6]">
        <img v-if="event.bannerUrl" :src="event.bannerUrl" class="w-full h-full object-cover" />
        <div v-else class="w-full h-full flex items-center justify-center text-[#26215C]/70 font-medium text-sm bg-[#EEEDFE]/50">
          No Banner Uploaded
        </div>
      </div>

      <div class="p-5 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="md:col-span-2 space-y-8">
          <div>
            <h1 class="text-2xl md:text-3xl font-bold text-[#26215C] mb-3 leading-tight tracking-tight">
              {{ viewLang === 'en' ? event.title.en : event.title.th || 'Untitled Event' }}
            </h1>
            <p class="text-[#26215C]/80 whitespace-pre-wrap text-sm md:text-base leading-relaxed">
              {{ viewLang === 'en' ? event.description.en : event.description.th || 'No description provided.' }}
            </p>
            
            <div v-if="event.category?.length > 0" class="mt-6 flex flex-wrap gap-2">
              <span v-for="cat in event.category" :key="cat" class="bg-[#EEEDFE] text-[#3C3489] border border-[#CECBF6] px-3 py-1.5 
              rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                {{ cat }}
              </span>
            </div>
          </div>

          <div v-if="event.agenda?.length > 0">
            <h2 class="text-lg font-bold text-[#26215C] border-b border-[#CECBF6] pb-2 mb-4">Event Agenda</h2>
            <ul class="space-y-4 relative border-l-2 border-[#CECBF6] ml-2 pl-5">
              <li v-for="(item, index) in event.agenda" :key="index" class="relative">
                <span class="absolute -left-6.5 top-1 w-3 h-3 bg-[#7F77DD] rounded-full border-2 border-[#FFFFFF] shadow-sm"></span>
                <p class="text-sm font-bold text-[#534AB7] tracking-wide">{{ item.time || '--:--' }}</p>
                <p class="text-[#26215C] text-sm mt-1">{{ viewLang === 'en' ? item.activity.en : item.activity.th }}</p>
              </li>
            </ul>
          </div>
        </div>

        <div class="space-y-4">
          <div class="bg-[#EEEDFE]/30 p-5 rounded-xl border border-[#CECBF6] space-y-5">
            <div class="flex items-start gap-3">
              <svg class="w-5 h-5 text-[#7F77DD] mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div>
                <h3 class="text-xs font-bold text-[#26215C]/70 uppercase tracking-widest mb-1.5">Date & Time</h3>
                <template v-if="isSingleDay">
                  <p class="text-sm font-bold text-[#26215C]">{{ formatDateObj(event.startAt).date }}</p>
                  <p class="text-xs text-[#26215C]/70 font-semibold mt-0.5">
                    {{ formatDateObj(event.startAt).time }}
                    <template v-if="event.endAt"> - {{ formatDateObj(event.endAt).time }}</template>
                  </p>
                </template>
                <template v-else>
                  <p class="text-[13px] font-semibold text-[#26215C]">
                    <span class="text-[#534AB7] font-bold">Start - </span>{{ formatDateObj(event.startAt).full }}
                  </p>
                  <p v-if="event.endAt" class="text-[13px] font-semibold text-[#26215C] mt-1">
                    <span class="text-[#534AB7] font-bold">End &nbsp;&nbsp;- </span>{{ formatDateObj(event.endAt).full }}
                  </p>
                </template>
              </div>
            </div>
            
            <hr class="border-[#CECBF6]" />

            <div class="space-y-4">
              <div class="flex items-start gap-3">
                <svg class="w-5 h-5 text-[#7F77DD] mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <h3 class="text-xs font-bold text-[#26215C]/70 uppercase tracking-widest mb-1">Location</h3>
                  <p v-if="event.isOnline" class="text-sm font-bold text-[#3C3489] bg-[#EEEDFE] inline-block px-2 py-1 rounded">Online Event</p>
                  <p v-else class="text-sm font-semibold text-[#26215C]">
                    {{ viewLang === 'en' ? event.location.en : event.location.th || 'TBA' }}
                  </p>
                </div>
              </div>
              
              <div v-if="!event.isOnline" class="w-full space-y-2">
                <div v-if="mapEmbedUrl" class="w-full rounded-lg overflow-hidden border border-[#CECBF6] shadow-sm bg-[#EEEDFE]/50 h-32 md:h-40">
                  <iframe width="100%" height="100%" frameborder="0" style="border:0;" :src="mapEmbedUrl" allowfullscreen="false" loading="lazy"></iframe>
                </div>
                <a v-if="event.mapLink" :href="event.mapLink" target="_blank" class="text-[#534AB7] hover:text-[#3C3489] hover:underline text-xs font-bold inline-block mt-2 transition-colors">
                  Open in Google Maps ↗
                </a>
              </div>
            </div>
          </div>

          <div v-if="event.seatLimit || event.hasCatering || event.contactName || event.contactEmail" class="bg-[#EEEDFE]/30 p-5 rounded-xl border border-[#CECBF6] space-y-5">
            <div v-if="event.seatLimit" class="flex items-start gap-3">
              <svg class="w-5 h-5 text-[#7F77DD] mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <div>
                <h3 class="text-xs font-bold text-[#26215C]/70 uppercase tracking-widest mb-1">Capacity</h3>
                <p class="text-sm font-semibold text-[#26215C]">{{ event.seatsTaken }} / {{ event.seatLimit }} seats booked</p>
              </div>
            </div>
          
            <hr v-if="event.seatLimit && (event.hasCatering || event.contactName)" class="border-[#CECBF6]" />
          
            <div v-if="event.hasCatering" class="flex items-start gap-3">
              <svg class="w-5 h-5 text-[#7F77DD] mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
              </svg>
              <div>
                <h3 class="text-xs font-bold text-[#26215C]/70 uppercase tracking-widest mb-1">Catering</h3>
                <p class="text-sm font-semibold text-[#26215C]">{{ event.isCateringFree ? 'Free Catering' : 'Paid Catering' }}</p>
                <p class="text-xs text-[#26215C]/60 mt-0.5">
                  {{ viewLang === 'en' ? event.cateringDescription?.en : event.cateringDescription?.th }}
                </p>
              </div>
            </div>

            <hr v-if="event.hasCatering && (event.contactName || event.contactEmail)" class="border-[#CECBF6]" />

            <div v-if="event.contactName || event.contactEmail" class="flex items-start gap-3">
              <svg class="w-5 h-5 text-[#7F77DD] mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <div>
                <h3 class="text-xs font-bold text-[#26215C]/70 uppercase tracking-widest mb-1">Organizer Contact</h3>
                <p class="text-sm font-semibold text-[#26215C]">{{ event.contactName }}</p>
                <p class="text-sm mt-0.5">
                  <a :href="'mailto:'+event.contactEmail" class="text-[#534AB7] hover:underline hover:text-[#3C3489] transition-colors">{{ event.contactEmail }}</a>
                </p>
                <p v-if="event.contactPhone" class="text-sm text-[#26215C]/70 mt-0.5">{{ event.contactPhone }}</p>
              </div>
            </div>
          </div>

          <div v-if="(hasRegistration || hasFeedback || userTicket) && !isOrganizer && !isLoadingTicket" class="bg-[#EEEDFE]/50 p-6 rounded-xl border border-[#CECBF6] shadow-sm space-y-4">
            
            <div class="text-center">
              <h3 class="text-lg font-black text-[#26215C] tracking-tight">
                {{ userTicket?.registration?.status === 'CONFIRMED' ? 'You are registered!' : 'Join the Experience' }}
              </h3>
              <p class="text-xs text-[#26215C]/70 mt-1">
                {{ userTicket?.registration?.status === 'CONFIRMED' ? 'We look forward to seeing you.' : "Don't miss out on this event!" }}
              </p>
            </div>

            <div v-if="!userTicket || userTicket?.registration?.status === 'CANCELLED'" class="flex flex-col gap-3 mt-4">
              
              <p v-if="isEventOver || isEventFull || isEventStarted" class="text-center text-[#26215C]/80 text-sm font-semibold py-2">
                {{ isEventOver ? 'This event is already over.' : (isEventStarted ? 'This event has already started.' : 'All seats are fully taken for this event.') }}
              </p>

              <button v-if="hasRegistration && !isEventFull && !isEventStarted && !isEventOver" @click="navigateToSubmitForm('REGISTRATION')" 
                class="w-full bg-[#534AB7] hover:bg-[#3C3489] text-[#FFFFFF] shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                <svg class="w-5 h-5 text-[#EEEDFE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path>
                </svg>
                Register Now
              </button>
            </div>

            <div v-if="userTicket?.registration?.status === 'CONFIRMED'" class="flex flex-col gap-3 mt-4">
              
              <p v-if="isEventOver || isEventStarted" class="text-center text-[#26215C]/80 text-sm font-semibold py-2 px-1">
                {{ isEventOver ? 'This event is already over.' : 'This event has already started. Cancellation is no longer available.' }}
              </p>

              <div class="flex gap-2 w-full">
                <button @click="viewTicket" class="flex-1 bg-[#534AB7] hover:bg-[#3C3489] text-[#FFFFFF] shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                  View ticket
                </button>

                <!-- New Chat Icon Button -->
                <button 
                  @click="goToChat" 
                  title="Event Discussion Room"
                  class="w-14 bg-[#EEEDFE] hover:bg-[#CECBF6] text-[#534AB7] hover:text-[#3C3489] border border-[#CECBF6] shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all rounded-xl flex items-center justify-center shrink-0 cursor-pointer"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                  </svg>
                </button>
              </div>

              <button v-if="hasFeedback && isEventOver" @click="navigateToSubmitForm('FEEDBACK')" class="w-full bg-[#FFFFFF] hover:bg-[#EEEDFE] text-[#534AB7] border border-[#CECBF6] shadow-sm hover:shadow transform hover:-translate-y-0.5 transition-all py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                <svg class="w-5 h-5 text-[#7F77DD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                </svg>
                Give Feedback
              </button>

              <button v-if="!isEventStarted && !isEventOver" @click="confirmCancelRegistration" 
                class="w-full bg-red-50 hover:bg-red-100 text-red-600 border-red-200 border shadow-sm transition-all py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                Cancel Registration
              </button>
            </div>
          </div>

          <div v-if="isOrganizer" class="bg-[#FFFFFF] p-4 rounded-xl border border-[#CECBF6] shadow-sm space-y-3">
            <h3 class="text-base font-bold text-[#26215C] mb-2">Event Forms</h3>
            <div class="flex flex-col gap-3">
              <button @click="router.push(`/events/${event.id || 'new'}/forms/REGISTRATION?source=preview`)" class="w-full bg-[#EEEDFE] hover:bg-[#CECBF6] text-[#534AB7] hover:text-[#3C3489] border border-[#CECBF6] py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                {{ hasRegistration ? 'Registration Form' : 'Create Registration Form' }}
              </button>
              <button @click="router.push(`/events/${event.id || 'new'}/forms/FEEDBACK?source=preview`)" class="w-full bg-[#EEEDFE] hover:bg-[#CECBF6] text-[#534AB7] hover:text-[#3C3489] border border-[#CECBF6] py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                {{ hasFeedback ? 'Feedback Form' : 'Create Feedback Form' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ConfirmModal 
      v-if="alertState.show"
      :title="alertState.title"
      :description="alertState.description"
      :confirmTheme="alertState.theme"
      confirmText="OK"
      @confirm="alertState.show = false"
    />

    <ConfirmModal 
      v-if="confirmState.show"
      :title="confirmState.title"
      :description="confirmState.description"
      :confirmTheme="confirmState.theme"
      :confirmText="confirmState.confirmText"
      cancelText="Cancel"
      @cancel="confirmState.show = false"
      @confirm="confirmState.onConfirm"
    />
  </div>
</template>