<script setup lang="ts">
const props = defineProps<{ event: any; t: any; viewLang: 'en' | 'th' }>()

const formatDisplayDate = (isoString: string) => {
  if (!isoString) return 'TBA';
  return new Date(isoString).toLocaleString(props.viewLang === 'th' ? 'th-TH' : 'en-US', { 
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
}
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 font-['Plus_Jakarta_Sans']">
    
    <!-- Hero Banner -->
    <div class="w-full h-48 md:h-64 bg-gray-100 relative border-b border-gray-100">
      <img v-if="event.bannerUrl" :src="event.bannerUrl" class="w-full h-full object-cover" />
      <div v-else class="w-full h-full flex items-center justify-center text-gray-400 font-medium text-sm font-['Lato']">
        No Banner Uploaded
      </div>
      <!-- Tags overlapping banner -->
      <div v-if="event.category.length > 0" class="absolute bottom-4 left-4 flex flex-wrap gap-2">
        <span v-for="cat in event.category" :key="cat" class="bg-white/95 backdrop-blur-sm text-purple-800 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider shadow-sm border border-purple-100">
          {{ cat }}
        </span>
      </div>
    </div>

    <div class="p-5 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
      
      <!-- Main Content (Left Side, 2 Columns wide) -->
      <div class="md:col-span-2 space-y-8">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold text-gray-900 mb-3 leading-tight font-['Space_Grotesk'] tracking-tight">
            {{ viewLang === 'en' ? event.title.en : event.title.th || 'Untitled Event' }}
          </h1>
          <p class="text-gray-700 whitespace-pre-wrap text-sm md:text-base leading-relaxed font-['Lato']">
            {{ viewLang === 'en' ? event.description.en : event.description.th || 'No description provided.' }}
          </p>
        </div>

        <div v-if="event.agenda.length > 0">
          <h2 class="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4 font-['Space_Grotesk']">{{ t.agenda }}</h2>
          <ul class="space-y-4 relative border-l-2 border-purple-200 ml-2 pl-5">
            <li v-for="(item, index) in event.agenda" :key="index" class="relative">
              <span class="absolute -left-[27px] top-1 w-3 h-3 bg-purple-500 rounded-full border-2 border-white shadow-sm"></span>
              <p class="text-sm font-bold text-purple-600 font-['Lato'] tracking-wide">{{ item.time || '--:--' }}</p>
              <p class="text-gray-800 text-sm mt-1">{{ viewLang === 'en' ? item.activity.en : item.activity.th }}</p>
            </li>
          </ul>
        </div>
      </div>

      <!-- Sticky Sidebar (Right Side, 1 Column wide) -->
      <div class="space-y-4">
        
        <!-- Date & Location Card -->
        <div class="bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-4">
          <div>
            <h3 class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 font-['Lato']">Date & Time</h3>
            <p class="text-sm font-semibold text-gray-900">{{ formatDisplayDate(event.startAt) }}</p>
            <p class="text-xs text-gray-500 mt-1 font-['Lato']">to {{ formatDisplayDate(event.endAt) }}</p>
          </div>
          
          <div>
            <h3 class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 font-['Lato']">Location</h3>
            <p v-if="event.isOnline" class="text-sm font-bold text-purple-600">{{ t.isOnline }}</p>
            <div v-else>
              <p class="text-sm font-semibold text-gray-900">{{ viewLang === 'en' ? event.location.en : event.location.th || 'TBA' }}</p>
              <a v-if="event.mapLink" :href="event.mapLink" target="_blank" class="text-purple-600 hover:text-purple-700 hover:underline text-xs font-bold inline-block mt-1 transition-colors">View Map ↗</a>
            </div>
          </div>
        </div>

        <!-- Details Card -->
        <div class="bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-4">
          <div v-if="event.seatLimit">
            <h3 class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 font-['Lato']">Capacity</h3>
            <p class="text-sm font-semibold text-gray-900">{{ event.seatLimit }} seats</p>
          </div>
          
          <div v-if="event.hasCatering">
            <h3 class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 font-['Lato']">Catering</h3>
            <p class="text-sm font-semibold text-gray-900">{{ event.isCateringFree ? 'Free Catering' : 'Paid Catering' }}</p>
            <p class="text-xs text-gray-600 mt-1 font-['Lato']">{{ viewLang === 'en' ? event.cateringDescription.en : event.cateringDescription.th }}</p>
          </div>

          <div v-if="event.contactName || event.contactEmail">
            <h3 class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 font-['Lato']">Contact</h3>
            <p class="text-sm font-semibold text-gray-800">{{ event.contactName }}</p>
            <p class="text-sm mt-0.5"><a :href="'mailto:'+event.contactEmail" class="text-purple-600 hover:underline">{{ event.contactEmail }}</a></p>
            <p v-if="event.contactPhone" class="text-sm text-gray-600 mt-0.5 font-['Lato']">{{ event.contactPhone }}</p>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>