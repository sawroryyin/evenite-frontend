<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { EventService } from '../services/EventService'
import { useAuthStore } from '../stores/auth'
import api from '../services/api'
import EventCard from '../components/event/EventCard.vue'
import BottomNav from '../components/BottomNav.vue'
import type { EventData } from '../types'

const router = useRouter()
const authStore = useAuthStore()

const isLoading = ref(true)
const errorMessage = ref('')

const allPublicEvents = ref<EventData[]>([]) 
const selectedEvents = ref<EventData[]>([])
const upcomingEvents = ref<EventData[]>([])
const activeSwipeIndex = ref(0)

const isSearchMode = ref(false)
const searchInput = ref('')
const appliedSearchQuery = ref('')
const isSearching = ref(false)

const isCategoryOpen = ref(false)
const isDateOpen = ref(false)

const activeCategoryValue = ref('All')
const activeDateValue = ref('latest')

const closeDropdowns = () => {
  isCategoryOpen.value = false
  isDateOpen.value = false
}

const exitSearch = () => {
  isSearchMode.value = false
  searchInput.value = ''
  appliedSearchQuery.value = ''
  activeCategoryValue.value = 'All'
  activeDateValue.value = 'latest'
  closeDropdowns()
}

// --- Filter Definitions ---
const categoryOptions = [
  { value: 'All', label: 'All Categories', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
  { value: 'SEMINAR', label: 'Seminar', icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z' },
  { value: 'WORKSHOP', label: 'Workshop', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
  { value: 'LECTURE', label: 'Lecture', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477-4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  { value: 'CONFERENCE', label: 'Conference', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  { value: 'HACKATHON', label: 'Hackathon', icon: 'M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { value: 'COMPETITION', label: 'Competition', icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' },
  { value: 'CLUB_ACTIVITY', label: 'Club Activity', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
  { value: 'ORIENTATION', label: 'Orientation', icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7' },
  { value: 'VOLUNTEER', label: 'Volunteer', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
  { value: 'TRIP', label: 'Trip', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z' },
  { value: 'SPORT', label: 'Sport', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { value: 'CULTURAL', label: 'Cultural', icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { value: 'FESTIVAL', label: 'Festival', icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' },
  { value: 'NETWORKING', label: 'Networking', icon: 'M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z' },
  { value: 'CAREER_FAIR', label: 'Career Fair', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  { value: 'PARTY', label: 'Party', icon: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3' },
  { value: 'INTERNSHIP', label: 'Internship', icon: 'M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z M12 14v6' },
  { value: 'OTHER', label: 'Other', icon: 'M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z' }
]

const dateOptions = [
  { value: 'latest', label: 'Latest', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  { value: 'today', label: 'Today', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { value: 'week', label: 'This Week', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { value: 'month', label: 'This Month', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' }
]

const activeCategory = computed(() => categoryOptions.find(c => c.value === activeCategoryValue.value) || categoryOptions[0])
const activeDate = computed(() => dateOptions.find(d => d.value === activeDateValue.value) || dateOptions[0])

const selectCategory = (val: string) => { activeCategoryValue.value = val; isCategoryOpen.value = false }
const selectDate = (val: string) => { activeDateValue.value = val; isDateOpen.value = false }

const triggerSearch = () => {
  if (isSearching.value) return; 
  isSearching.value = true
  setTimeout(() => {
    appliedSearchQuery.value = searchInput.value
    isSearching.value = false
  }, 3000)
}

const hasActiveFilters = computed(() => {
  return appliedSearchQuery.value.trim().length > 0 || activeCategoryValue.value !== 'All' || activeDateValue.value !== 'latest'
})

const handleScroll = (event: Event) => {
  const container = event.target as HTMLElement
  const width = container.offsetWidth
  const scrollLeft = container.scrollLeft
  activeSwipeIndex.value = Math.round(scrollLeft / (width * 0.78))
}

const fetchHomeFeed = async () => {
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    const rawPublicEvents = await EventService.getPublicEvents()

    const now = new Date()
    const upcomingPublicEvents = rawPublicEvents.filter(event => {
      if (!event.startAt) return false
      const startDate = new Date(event.startAt)
      return startDate > now 
    })

    allPublicEvents.value = upcomingPublicEvents 

    let userPrefs: string[] = []
    if (authStore.currentRole === 'PARTICIPANT') {
      try {
        const profileRes = await api.get('/users/me/participant-profile')
        const prefs = profileRes.data.preferences || {}
        userPrefs = [...(prefs.event || []), ...(prefs.personal || [])]
      } catch (err) {
        console.warn('Could not load participant profile preferences', err)
      }
    }

    if (userPrefs.length > 0) {
      selectedEvents.value = upcomingPublicEvents.filter(event => {
        const eventCategories = Array.isArray(event.category) ? event.category : [event.category]
        return eventCategories.some(cat => userPrefs.includes(cat as string))
      })
    } else {
      selectedEvents.value = upcomingPublicEvents
        .sort((a, b) => new Date(a.startAt!).getTime() - new Date(b.startAt!).getTime())
        .slice(0, 5)
    }

    const nextWeek = new Date()
    nextWeek.setDate(now.getDate() + 7)

    upcomingEvents.value = upcomingPublicEvents.filter(event => {
      const startDate = new Date(event.startAt!)
      return startDate <= nextWeek 
    })

    upcomingEvents.value.sort((a, b) => new Date(a.startAt!).getTime() - new Date(b.startAt!).getTime())

  } catch (error) {
    console.error('Failed to load events:', error)
    errorMessage.value = 'Could not load events. Please try again later.'
  } finally {
    isLoading.value = false
  }
}

const filteredEvents = computed(() => {
  let result = allPublicEvents.value

  if (appliedSearchQuery.value.trim()) {
    const q = appliedSearchQuery.value.toLowerCase()
    result = result.filter(e => {
      const titleEn = e.title?.en?.toLowerCase() || ''
      const titleTh = e.title?.th?.toLowerCase() || ''
      const descEn = e.description?.en?.toLowerCase() || ''
      const descTh = e.description?.th?.toLowerCase() || ''
      const locEn = e.location?.en?.toLowerCase() || ''
      const locTh = e.location?.th?.toLowerCase() || ''

      return titleEn.includes(q) || titleTh.includes(q) || 
             descEn.includes(q) || descTh.includes(q) ||
             locEn.includes(q) || locTh.includes(q)
    })
  }

  if (activeCategoryValue.value !== 'All') {
    result = result.filter(e => {
      const cats = Array.isArray(e.category) ? e.category : [e.category]
      return cats.includes(activeCategoryValue.value)
    })
  }

  const now = new Date()
  if (activeDateValue.value !== 'latest') {
    result = result.filter(e => {
      if (!e.startAt) return false
      const eDate = new Date(e.startAt)
      
      if (activeDateValue.value === 'today') {
        return eDate.toDateString() === now.toDateString()
      } else if (activeDateValue.value === 'week') {
        const nextWeek = new Date(now)
        nextWeek.setDate(now.getDate() + 7)
        return eDate >= now && eDate <= nextWeek
      } else if (activeDateValue.value === 'month') {
        const nextMonth = new Date(now)
        nextMonth.setMonth(now.getMonth() + 1)
        return eDate >= now && eDate <= nextMonth
      }
      return true
    })
  }

  result.sort((a, b) => {
    const dA = a.startAt ? new Date(a.startAt).getTime() : 0
    const dB = b.startAt ? new Date(b.startAt).getTime() : 0
    return dA - dB
  })

  return result
})

onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'instant' })
  fetchHomeFeed()
})
</script>

<template>
  <div class="pb-24 max-w-3xl mx-auto font-['Plus_Jakarta_Sans'] bg-[#FFFFFF] min-h-screen overflow-x-hidden relative">

    <div v-if="isSearchMode && (isCategoryOpen || isDateOpen)" @click="closeDropdowns" class="fixed inset-0 z-30"></div>

    <div class="pt-4 px-4 relative z-10">
      <template v-if="!isSearchMode">
        <h1 class="text-[22px] font-['Nunito'] font-black text-[#26215C] tracking-tight leading-none">
          Discover your next <br /> campus experience ✨
        </h1>
        <p class="text-[11px] font-['Lato'] text-[#26215C]/70 font-medium tracking-wide mt-2">
          Explore what's happening around you today.
        </p>
      </template>

      <template v-else>
        <div class="flex items-center gap-2 mb-1">
          <button @click="exitSearch" class="p-1 -ml-1 text-[#26215C]/70 hover:text-[#3C3489] transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
          </button>
          <h1 class="text-[22px] font-['Nunito'] font-black text-[#26215C] tracking-tight leading-none">
            Search Events
          </h1>
        </div>
        <p class="text-[11px] font-['Lato'] text-[#26215C]/70 font-medium mt-1.5 tracking-wide ml-9">
          Find exactly what you're looking for
        </p>
      </template>
    </div>

    <div class="relative w-full px-4 mt-4 mb-5 z-20">
      <button v-if="isSearchMode" @click="triggerSearch" class="absolute inset-y-0 left-4 pl-3 flex items-center pr-2 cursor-pointer outline-none">
        <svg class="w-3.5 h-3.5 text-[#7F77DD] hover:text-[#3C3489] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
      </button>
      <div v-else class="absolute inset-y-0 left-4 pl-3 flex items-center pointer-events-none">
        <svg class="w-3.5 h-3.5 text-[#7F77DD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
      </div>
      
      <input 
        v-model="searchInput" 
        @focus="isSearchMode = true"
        @keyup.enter="isSearchMode ? triggerSearch() : null"
        type="text" 
        :placeholder="isSearchMode ? 'Search... (Press Enter to search)' : 'Search events...'" 
        class="w-full text-[12px] border-none rounded-xl py-2.5 pl-9 pr-4 focus:outline-none focus:ring-1.5 
        focus:ring-[#7F77DD] bg-[#FFFFFF] shadow-sm font-['Lato'] transition-all text-[#26215C]" 
      />
    </div>

    <div v-if="isSearchMode" class="relative z-10">
      <div class="grid grid-cols-2 gap-2.5 px-4 mb-6 relative z-40 font-['Lato']">
        <div class="relative">
          <button @click="isCategoryOpen = !isCategoryOpen; isDateOpen = false" 
            class="w-full flex items-center justify-between bg-[#FFFFFF] border-none text-[#26215C] text-[11px] 
            py-2 pl-3 pr-2.5 rounded-xl focus:outline-none focus:ring-1.5 focus:ring-[#7F77DD] font-bold shadow-sm cursor-pointer transition-shadow">
            <div class="flex items-center gap-1.5 truncate font-['Lato']">
              <svg class="w-3.5 h-3.5 text-[#7F77DD] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="activeCategory.icon"></path>
              </svg>
              <span class="truncate text-[12px]">{{ activeCategory.label }}</span>
            </div>
            <svg class="w-3 h-3 text-[#7F77DD] shrink-0 transition-transform duration-200" 
              :class="{ 'rotate-180': isCategoryOpen }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>

          <ul v-if="isCategoryOpen" 
            class="absolute top-full left-0 w-full mt-1.5 bg-[#FFFFFF] border border-[#EEEDFE] rounded-xl shadow-xl max-h-56 
            overflow-y-auto scrollbar-hide py-1 z-50 origin-top">
            <li v-for="cat in categoryOptions" :key="cat.value" @click="selectCategory(cat.value)"
              :class="['flex items-center gap-2 px-3 py-2 text-[11px] font-bold cursor-pointer transition-colors',
              activeCategoryValue === cat.value ? 'text-[#7F77DD] bg-[#EEEDFE]' : 'text-[#26215C] hover:bg-[#EEEDFE] hover:text-[#3C3489]']">
              <svg class="w-3.5 h-3.5 shrink-0" :class="activeCategoryValue === cat.value ? 'text-[#7F77DD]' : 'text-[#26215C]/70'" 
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="cat.icon"></path>
              </svg>
              {{ cat.label }}
            </li>
          </ul>
        </div>

        <div class="relative font-['Lato']">
          <button @click="isDateOpen = !isDateOpen; isCategoryOpen = false" 
            class="w-full flex items-center justify-between bg-[#FFFFFF] border-none text-[#26215C] text-[11px] 
            py-2 pl-3 pr-2.5 rounded-xl focus:outline-none focus:ring-1.5 focus:ring-[#7F77DD] font-bold shadow-sm cursor-pointer transition-shadow">
            <div class="flex items-center gap-1.5 truncate text-[12px]">
              <svg class="w-3.5 h-3.5 text-[#7F77DD] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="activeDate.icon"></path>
              </svg>
              <span class="truncate">{{ activeDate.label }}</span>
            </div>
            <svg class="w-3 h-3 text-[#7F77DD] shrink-0 transition-transform duration-200" 
              :class="{ 'rotate-180': isDateOpen }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>

          <ul v-if="isDateOpen" 
            class="absolute top-full right-0 w-full mt-1.5 bg-[#FFFFFF] border border-[#EEEDFE] rounded-xl 
            shadow-xl overflow-hidden py-1 z-50 origin-top">
            <li v-for="date in dateOptions" :key="date.value" @click="selectDate(date.value)"
              :class="['flex items-center gap-2 px-3 py-2 text-[11px] font-bold cursor-pointer transition-colors',
              activeDateValue === date.value ? 'text-[#7F77DD] bg-[#EEEDFE]' : 'text-[#26215C] hover:bg-[#EEEDFE] hover:text-[#3C3489]']">
              <svg class="w-3.5 h-3.5 shrink-0" :class="activeDateValue === date.value ? 'text-[#7F77DD]' : 'text-[#26215C]/70'" 
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="date.icon"></path>
              </svg>
              {{ date.label }}
            </li>
          </ul>
        </div>
      </div>

      <div class="px-4">
        <div v-if="isSearching" class="text-center py-16">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-[#7F77DD] mx-auto"></div>
          <p class="text-[#26215C]/70 text-[11px] mt-3 font-medium">Searching...</p>
        </div>

        <div v-else-if="!hasActiveFilters" class="flex flex-col items-center justify-center mt-12 opacity-50">
          <svg class="w-12 h-12 text-[#7F77DD] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <p class="text-xs font-['Lato'] text-[#26215C] font-medium text-center">
            Type a keyword and press <b>Enter</b> <br/> or apply filters to discover campus experiences.
          </p>
        </div>

        <div v-else-if="filteredEvents.length > 0">
          <p class="text-xs font-['Space_Grotesk'] font-bold mb-3 tracking-tight uppercase text-[#26215C]">
            Search Results ({{ filteredEvents.length }})
          </p>
          <div class="grid grid-cols-2 gap-2.5">
            <EventCard 
              v-for="event in filteredEvents" 
              :key="event.id" 
              :event="event"
              variant="grid"
              @click="router.push({ name: 'event-detail', params: { id: event.id } })"
            />
          </div>
        </div>

        <div v-else class="flex flex-col items-center justify-center mt-12 opacity-50">
          <svg class="w-12 h-12 text-[#7F77DD] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p class="text-xs font-['Lato'] text-[#26215C] font-medium text-center">
            No events found matching your search. <br/> Try adjusting your filters.
          </p>
        </div>
      </div>
    </div>

    <div v-else class="relative z-10">
      <div v-if="isLoading" class="text-center py-16">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-[#7F77DD] mx-auto"></div>
        <p class="text-[#26215C]/70 text-[11px] mt-3 font-medium">Curating your feed...</p>
      </div>

      <div v-else-if="errorMessage" class="px-4">
        <div class="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-[11px] font-bold text-center">
          {{ errorMessage }}
        </div>
      </div>

      <template v-else>
        <div class="flex items-center px-4 mb-3">
            <div class="w-1.5 h-4 bg-[#7F77DD] rounded-full mr-2"></div>
            <h2 class="text-sm font-black uppercase tracking-widest text-[#26215C]">Selected for you</h2>
        </div>
        
        <div v-if="selectedEvents.length === 0" class="px-4 mb-5">
          <div class="bg-[#FFFFFF] rounded-xl border border-[#EEEDFE] p-6 text-center shadow-xs">
            <p class="text-[11px] font-bold text-[#26215C]/70">No recommended events right now based on your preferences.</p>
          </div>
        </div>

        <div v-else class="mb-5 relative z-10">
          <div 
            @scroll="handleScroll"
            class="flex overflow-x-auto snap-x snap-mandatory gap-5 pb-2 scrollbar-hide px-8"
          >
            <div 
              v-for="event in selectedEvents" 
              :key="event.id" 
              class="snap-center shrink-0 w-[78vw] max-w-72.5"
            >
              <EventCard 
                :event="event"
                variant="hero"
                @click="router.push({ name: 'event-detail', params: { id: event.id } })"
              />
            </div>
          </div>

          <div class="flex justify-center items-center gap-1.5 mt-2">
            <span 
              v-for="(_, idx) in selectedEvents" 
              :key="idx"
              :class="[
                'transition-all duration-300 rounded-full',
                activeSwipeIndex === idx ? 'w-2 h-2 bg-[#7F77DD]' : 'w-1.5 h-1.5 bg-[#EEEDFE]'
              ]"
            ></span>
          </div>
        </div>

        <div class="flex items-center px-4 mb-3 mt-6">
            <div class="w-1.5 h-4 bg-[#7F77DD] rounded-full mr-2"></div>
            <h2 class="text-sm font-black uppercase tracking-widest text-[#26215C]">Upcoming Events</h2>
        </div>

        <div v-if="upcomingEvents.length === 0" class="px-4">
          <div class="bg-[#FFFFFF] rounded-xl border border-[#EEEDFE] p-6 text-center shadow-xs">
            <p class="text-[11px] font-bold text-[#26215C]/70">No events happening this week.</p>
          </div>
        </div>

        <div v-else class="px-4 relative z-10">
          <div class="grid grid-cols-2 gap-2.5">
            <EventCard 
              v-for="event in upcomingEvents" 
              :key="event.id" 
              :event="event"
              variant="grid"
              @click="router.push({ name: 'event-detail', params: { id: event.id } })"
            />
          </div>
        </div>
      </template>
    </div>

    <BottomNav />
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>