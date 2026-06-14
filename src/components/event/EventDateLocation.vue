<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

const props = defineProps<{ 
  form: any; 
  t: any; 
  viewLang: 'en' | 'th';
  viewMode?: 'create' | 'edit'
}>()

const isMultiDay = ref(false)
const singleDate = ref('')
const startTime = ref('')
const endTime = ref('')

const parseDateTime = (dtStr: string) => {
  if (!dtStr) return { date: '', time: '' }
  const [datePart, timePart] = dtStr.split('T')
  return { 
    date: datePart || '', 
    time: timePart ? timePart.substring(0, 5) : '' 
  }
}

// Replace onMounted with an immediate watcher to sync external store restorations
watch(
  () => [props.form.startAt, props.form.endAt],
  ([newStart, newEnd]) => {
    const start = parseDateTime(newStart as string)
    const end = parseDateTime(newEnd as string)

    // Initialize multi-day toggle if start and end dates differ
    if (start.date && end.date && start.date !== end.date) {
      isMultiDay.value = true
    }

    if (!isMultiDay.value) {
      // The conditionals prevent infinite loop overlaps with the other watcher
      if (singleDate.value !== start.date) singleDate.value = start.date
      if (startTime.value !== start.time) startTime.value = start.time
      if (endTime.value !== end.time) endTime.value = end.time
    }
  },
  { immediate: true }
)

watch([singleDate, startTime, endTime], () => {
  if (!isMultiDay.value) {
    if (singleDate.value) {
      props.form.startAt = startTime.value ? `${singleDate.value}T${startTime.value}` : `${singleDate.value}T00:00`
      // FIX: Set to null if endTime is empty, instead of defaulting to 23:59
      props.form.endAt = endTime.value ? `${singleDate.value}T${endTime.value}` : null
    } else {
      props.form.startAt = null
      props.form.endAt = null
    }
  }
})

watch(isMultiDay, (newVal) => {
  if (!newVal) {
    const start = parseDateTime(props.form.startAt)
    const end = parseDateTime(props.form.endAt)
    
    singleDate.value = start.date || end.date || ''
    startTime.value = start.time || ''
    endTime.value = end.time || ''
    
    if (singleDate.value) {
      props.form.startAt = startTime.value ? `${singleDate.value}T${startTime.value}` : `${singleDate.value}T00:00`
      props.form.endAt = endTime.value ? `${singleDate.value}T${endTime.value}` : null
    }
  }
})
</script>

<template>
  <section class="bg-[#FFFFFF] p-4 rounded-xl border border-[#CECBF6] shadow-sm">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
      <h2 class="text-base font-bold text-[#26215C]">{{ t.dateLocation }}</h2>
      
      <div class="flex bg-[#EEEDFE]/50 border border-[#CECBF6] p-1 rounded-xl w-full sm:w-56 shrink-0">
        <button 
          type="button"
          @click="isMultiDay = false" 
          :class="!isMultiDay ? 'bg-[#534AB7] shadow-sm text-[#FFFFFF]' : 'text-[#26215C]/70 hover:text-[#3C3489]'" 
          class="flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-colors">
          {{ viewLang === 'th' ? 'วันเดียว' : 'Single Day' }}
        </button>
        <button 
          type="button"
          @click="isMultiDay = true" 
          :class="isMultiDay ? 'bg-[#534AB7] shadow-sm text-[#FFFFFF]' : 'text-[#26215C]/70 hover:text-[#3C3489]'" 
          class="flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-colors">
          {{ viewLang === 'th' ? 'หลายวัน' : 'Multi-Day' }}
        </button>
      </div>
    </div>
    
    <div v-if="!isMultiDay" class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 bg-[#EEEDFE]/10 p-3 rounded-xl border border-[#CECBF6]/50">
      <div class="sm:col-span-1">
        <label class="block text-xs font-bold text-[#26215C] mb-1.5">
          {{ t.date || (viewLang === 'th' ? 'วันที่' : 'Date') }} <span class="text-red-500">*</span>
        </label>
        <input type="date" v-model="singleDate" class="w-full border border-[#CECBF6] p-2.5 rounded-xl text-sm 
        bg-[#EEEDFE]/30 focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#7F77DD] focus:border-transparent transition-all outline-none text-[#26215C]" />
      </div>
      <div>
        <label class="block text-xs font-bold text-[#26215C] mb-1.5">
          {{ t.startTime || (viewLang === 'th' ? 'เวลาเริ่ม' : 'Start Time') }} <span class="text-red-500">*</span>
        </label>
        <input type="time" v-model="startTime" class="w-full border border-[#CECBF6] p-2.5 rounded-xl text-sm 
        bg-[#EEEDFE]/30 focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#7F77DD] focus:border-transparent transition-all outline-none text-[#26215C]" />
      </div>
      <div>
        <label class="block text-xs font-bold text-[#26215C] mb-1.5">
          {{ t.endTime || (viewLang === 'th' ? 'เวลาสิ้นสุด' : 'End Time') }}
        </label>
        <input type="time" v-model="endTime" class="w-full border border-[#CECBF6] p-2.5 rounded-xl text-sm 
        bg-[#EEEDFE]/30 focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#7F77DD] focus:border-transparent transition-all outline-none text-[#26215C]" />
      </div>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 bg-[#EEEDFE]/10 p-3 rounded-xl border border-[#CECBF6]/50">
      <div>
        <label class="block text-xs font-bold text-[#26215C] mb-1.5">{{ t.startDate }} <span class="text-red-500">*</span></label>
        <input type="datetime-local" v-model="form.startAt" class="w-full border border-[#CECBF6] p-2.5 rounded-xl text-sm 
        bg-[#EEEDFE]/30 focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#7F77DD] focus:border-transparent transition-all outline-none text-[#26215C]" />
      </div>
      <div>
        <label class="block text-xs font-bold text-[#26215C] mb-1.5">{{ t.endDate }}</label>
        <input type="datetime-local" v-model="form.endAt" class="w-full border border-[#CECBF6] p-2.5 rounded-xl text-sm 
        bg-[#EEEDFE]/30 focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#7F77DD] focus:border-transparent transition-all outline-none text-[#26215C]" />
      </div>
    </div>

    <div class="flex items-center gap-2.5 mb-4 bg-[#EEEDFE]/30 p-3 rounded-xl border border-[#CECBF6]">
      <input type="checkbox" v-model="form.isOnline" id="isOnline" class="w-4 h-4 text-[#534AB7] border-[#CECBF6] rounded 
      focus:ring-[#7F77DD] transition-colors cursor-pointer" />
      <label for="isOnline" class="text-xs font-bold text-[#26215C] cursor-pointer">{{ t.isOnline }}</label>
    </div>

    <div v-if="!form.isOnline" class="space-y-4">
      <div v-if="viewLang === 'en'">
        <label class="block text-xs font-bold text-[#26215C] mb-1.5">{{ t.locationEn }} <span class="text-red-500">*</span></label>
        <input v-model="form.location.en" class="w-full border border-[#CECBF6] p-2.5 rounded-xl text-sm bg-[#EEEDFE]/30 
        focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#7F77DD] focus:border-transparent transition-all outline-none text-[#26215C]" placeholder="e.g. Main Hall" />
      </div>
      <div v-if="viewLang === 'th'">
        <label class="block text-xs font-bold text-[#26215C] mb-1.5">{{ t.locationTh }} <span class="text-red-500">*</span></label>
        <input v-model="form.location.th" class="w-full border border-[#CECBF6] p-2.5 rounded-xl text-sm bg-[#EEEDFE]/30 
        focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#7F77DD] focus:border-transparent transition-all outline-none text-[#26215C]" placeholder="สถานที่จัดงาน" />
      </div>
      <div>
        <label class="block text-xs font-bold text-[#26215C] mb-1.5">{{ t.mapLink }}</label>
        <input v-model="form.mapLink" class="w-full border border-[#CECBF6] p-2.5 rounded-xl text-sm bg-[#EEEDFE]/30 
        focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#7F77DD] focus:border-transparent transition-all outline-none text-[#26215C]" 
        placeholder="https://maps.google.com/..." />
      </div>
    </div>
  </section>
</template>