<script setup lang="ts">
import { ref, watch } from 'vue'

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

watch(
  () => [props.form.startAt, props.form.endAt],
  ([newStart, newEnd]) => {
    const start = parseDateTime(newStart as string)
    const end = parseDateTime(newEnd as string)

    if (start.date && end.date && start.date !== end.date) {
      isMultiDay.value = true
    }

    if (!isMultiDay.value) {
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
  <section class="bg-white p-5 md:p-6 rounded-2xl border border-[#131B2B]/10 shadow-sm">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
      <h2 class="text-xl font-['Nunito'] font-black text-[#131B2B]">{{ t.dateLocation }}</h2>
      
      <div class="flex bg-white border border-[#131B2B]/10 p-1.5 rounded-xl w-full sm:w-64 shrink-0 shadow-sm">
        <button 
          type="button"
          @click="isMultiDay = false" 
          :class="!isMultiDay ? 'bg-[#131B2B] shadow-sm text-white' : 'text-[#131B2B]/70 hover:text-[#131B2B] hover:bg-[#131B2B]/5'" 
          class="flex-1 py-2 rounded-lg text-sm font-bold transition-colors cursor-pointer">
          {{ viewLang === 'th' ? 'วันเดียว' : 'Single Day' }}
        </button>
        <button 
          type="button"
          @click="isMultiDay = true" 
          :class="isMultiDay ? 'bg-[#131B2B] shadow-sm text-white' : 'text-[#131B2B]/70 hover:text-[#131B2B] hover:bg-[#131B2B]/5'" 
          class="flex-1 py-2 rounded-lg text-sm font-bold transition-colors cursor-pointer">
          {{ viewLang === 'th' ? 'หลายวัน' : 'Multi-Day' }}
        </button>
      </div>
    </div>
    
    <div v-if="!isMultiDay" class="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6 bg-[#131B2B]/5 p-5 rounded-xl border border-[#131B2B]/10">
      <div class="sm:col-span-1">
        <label class="block text-sm font-bold text-[#131B2B] mb-2">
          {{ t.date || (viewLang === 'th' ? 'วันที่' : 'Date') }} <span class="text-red-500">*</span>
        </label>
        <input type="date" v-model="singleDate" class="w-full border border-[#131B2B]/10 p-3.5 rounded-xl text-base bg-white focus:ring-2 focus:ring-[#131B2B]/30 focus:border-transparent transition-all outline-none text-[#131B2B]" />
      </div>
      <div>
        <label class="block text-sm font-bold text-[#131B2B] mb-2">
          {{ t.startTime || (viewLang === 'th' ? 'เวลาเริ่ม' : 'Start Time') }} <span class="text-red-500">*</span>
        </label>
        <input type="time" v-model="startTime" class="w-full border border-[#131B2B]/10 p-3.5 rounded-xl text-base bg-white focus:ring-2 focus:ring-[#131B2B]/30 focus:border-transparent transition-all outline-none text-[#131B2B]" />
      </div>
      <div>
        <label class="block text-sm font-bold text-[#131B2B] mb-2">
          {{ t.endTime || (viewLang === 'th' ? 'เวลาสิ้นสุด' : 'End Time') }}
        </label>
        <input type="time" v-model="endTime" class="w-full border border-[#131B2B]/10 p-3.5 rounded-xl text-base bg-white focus:ring-2 focus:ring-[#131B2B]/30 focus:border-transparent transition-all outline-none text-[#131B2B]" />
      </div>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6 bg-[#131B2B]/5 p-5 rounded-xl border border-[#131B2B]/10">
      <div>
        <label class="block text-sm font-bold text-[#131B2B] mb-2">{{ t.startDate }} <span class="text-red-500">*</span></label>
        <input type="datetime-local" v-model="form.startAt" class="w-full border border-[#131B2B]/10 p-3.5 rounded-xl text-base bg-white focus:ring-2 focus:ring-[#131B2B]/30 focus:border-transparent transition-all outline-none text-[#131B2B]" />
      </div>
      <div>
        <label class="block text-sm font-bold text-[#131B2B] mb-2">{{ t.endDate }}</label>
        <input type="datetime-local" v-model="form.endAt" class="w-full border border-[#131B2B]/10 p-3.5 rounded-xl text-base bg-white focus:ring-2 focus:ring-[#131B2B]/30 focus:border-transparent transition-all outline-none text-[#131B2B]" />
      </div>
    </div>

    <div class="flex items-center gap-3 mb-5 bg-[#131B2B]/5 p-4 rounded-xl border border-[#131B2B]/10 cursor-pointer">
      <input type="checkbox" v-model="form.isOnline" id="isOnline" class="w-5 h-5 text-[#131B2B] border-[#131B2B]/25 rounded focus:ring-[#131B2B]/30 transition-colors cursor-pointer" />
      <label for="isOnline" class="text-sm font-bold text-[#131B2B] cursor-pointer flex-1">{{ t.isOnline }}</label>
    </div>

    <div v-if="!form.isOnline" class="space-y-5">
      <div v-if="viewLang === 'en'">
        <label class="block text-sm font-bold text-[#131B2B] mb-2">{{ t.locationEn }} <span class="text-red-500">*</span></label>
        <input v-model="form.location.en" class="w-full border border-[#131B2B]/10 p-3.5 rounded-xl text-base bg-[#131B2B]/5 focus:bg-white focus:ring-2 focus:ring-[#131B2B]/30 focus:border-transparent transition-all outline-none text-[#131B2B]" placeholder="e.g. Main Hall" />
      </div>
      <div v-if="viewLang === 'th'">
        <label class="block text-sm font-bold text-[#131B2B] mb-2">{{ t.locationTh }} <span class="text-red-500">*</span></label>
        <input v-model="form.location.th" class="w-full border border-[#131B2B]/10 p-3.5 rounded-xl text-base bg-[#131B2B]/5 focus:bg-white focus:ring-2 focus:ring-[#131B2B]/30 focus:border-transparent transition-all outline-none text-[#131B2B]" placeholder="สถานที่จัดงาน" />
      </div>
      <div>
        <label class="block text-sm font-bold text-[#131B2B] mb-2">{{ t.mapLink }}</label>
        <input v-model="form.mapLink" class="w-full border border-[#131B2B]/10 p-3.5 rounded-xl text-base bg-[#131B2B]/5 focus:bg-white focus:ring-2 focus:ring-[#131B2B]/30 focus:border-transparent transition-all outline-none text-[#131B2B]" placeholder="https://maps.google.com/..." />
      </div>
    </div>
  </section>
</template>