<script setup lang="ts">
const props = defineProps<{ event: any; t: any; viewLang: 'en' | 'th' }>()

const formatDisplayDate = (isoString: string) => {
  if (!isoString) return 'TBA';
  return new Date(isoString).toLocaleString(props.viewLang === 'th' ? 'th-TH' : 'en-US', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
}
</script>

<template>
  <div class="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
    
    <!-- Hero Banner -->
    <div class="w-full h-64 md:h-80 bg-gray-100 relative">
      <img v-if="event.bannerUrl" :src="event.bannerUrl" class="w-full h-full object-cover" />
      <div v-else class="w-full h-full flex items-center justify-center text-gray-400 font-medium">
        No Banner Uploaded
      </div>
      <!-- Tags overlapping banner -->
      <div v-if="event.category.length > 0" class="absolute bottom-4 left-6 flex flex-wrap gap-2">
        <span v-for="cat in event.category" :key="cat" class="bg-white/90 backdrop-blur-sm text-blue-800 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
          {{ cat }}
        </span>
      </div>
    </div>

    <div class="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
      
      <!-- Main Content (Left Side, 2 Columns wide) -->
      <div class="md:col-span-2 space-y-8">
        <div>
          <h1 class="text-3xl md:text-4xl font-black text-gray-900 mb-4 leading-tight">
            {{ viewLang === 'en' ? event.title.en : event.title.th }}
          </h1>
          <p class="text-gray-700 whitespace-pre-wrap text-lg leading-relaxed">
            {{ viewLang === 'en' ? event.description.en : event.description.th || 'No description provided.' }}
          </p>
        </div>

        <div v-if="event.agenda.length > 0">
          <h2 class="text-xl font-bold text-gray-900 border-b pb-2 mb-4">{{ t.agenda }}</h2>
          <ul class="space-y-4 relative border-l-2 border-blue-100 ml-3 pl-6">
            <li v-for="(item, index) in event.agenda" :key="index" class="relative">
              <span class="absolute -left-[31px] top-1 w-4 h-4 bg-blue-500 rounded-full border-4 border-white shadow-sm"></span>
              <p class="font-bold text-blue-600">{{ item.time || '--:--' }}</p>
              <p class="text-gray-800">{{ viewLang === 'en' ? item.activity.en : item.activity.th }}</p>
            </li>
          </ul>
        </div>
      </div>

      <!-- Sticky Sidebar (Right Side, 1 Column wide) -->
      <div class="space-y-6">
        
        <!-- Date & Location Card -->
        <div class="bg-gray-50 p-5 rounded-xl border border-gray-100 space-y-4">
          <div>
            <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">📅 Date & Time</h3>
            <p class="font-medium text-gray-900">{{ formatDisplayDate(event.startAt) }}</p>
            <p class="text-sm text-gray-500">to {{ formatDisplayDate(event.endAt) }}</p>
          </div>
          
          <div>
            <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">📍 Location</h3>
            <p v-if="event.isOnline" class="font-medium text-blue-600">🌐 {{ t.isOnline }}</p>
            <div v-else>
              <p class="font-medium text-gray-900">{{ viewLang === 'en' ? event.location.en : event.location.th || 'TBA' }}</p>
              <a v-if="event.mapLink" :href="event.mapLink" target="_blank" class="text-blue-600 hover:underline text-sm inline-block mt-1">🔗 View Map</a>
            </div>
          </div>
        </div>

        <!-- Details Card -->
        <div class="bg-gray-50 p-5 rounded-xl border border-gray-100 space-y-4">
          <div v-if="event.seatLimit">
            <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">🎟️ Capacity</h3>
            <p class="font-medium text-gray-900">{{ event.seatLimit }} seats</p>
          </div>
          
          <div v-if="event.hasCatering">
            <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">🍽️ Catering</h3>
            <p class="font-medium text-gray-900">{{ event.isCateringFree ? 'Free Catering' : 'Paid Catering' }}</p>
            <p class="text-sm text-gray-600 mt-1">{{ viewLang === 'en' ? event.cateringDescription.en : event.cateringDescription.th }}</p>
          </div>

          <div v-if="event.contactName || event.contactEmail">
            <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">📞 Contact</h3>
            <p class="text-sm text-gray-800">{{ event.contactName }}</p>
            <p class="text-sm"><a :href="'mailto:'+event.contactEmail" class="text-blue-600 hover:underline">{{ event.contactEmail }}</a></p>
            <p v-if="event.contactPhone" class="text-sm text-gray-800">{{ event.contactPhone }}</p>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>