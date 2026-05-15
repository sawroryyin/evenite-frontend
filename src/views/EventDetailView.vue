<script setup lang="ts">
import { ref, onMounted, computed, toRaw } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useEventCreationStore } from '../stores/eventCreation'
import { EventService } from '../services/EventService'

const router = useRouter()
const route = useRoute()
const store = useEventCreationStore()

// State Management
const viewMode = ref<'create' | 'edit' | 'preview'>('create')
const eventStatus = ref<'DRAFT' | 'PUBLISHED' | null>(null)
const viewLang = ref<'en' | 'th'>('en')

// Dynamic UI Dictionary
const t = computed(() => {
  return viewLang.value === 'en' ? {
    detailsTitle: 'Event Details',
    translateBtn: 'Auto-Translate',
    translating: 'Translating...',
    basicInfo: 'Basic Information',
    titleEn: 'Title (EN)',
    titleTh: 'Title (TH)',
    descEn: 'Description (EN)',
    descTh: 'Description (TH)',
    categories: 'Categories (Universal)',
    addCategory: 'Add a category...',
    addBtn: 'Add',
    dateLocation: 'Date & Location',
    startDate: 'Start Date & Time',
    endDate: 'End Date & Time',
    isOnline: 'This is an online event',
    locationEn: 'Location / Venue (EN)',
    locationTh: 'Location / Venue (TH)',
    mapLink: 'Map Link (Universal)',
    agenda: 'Event Agenda',
    addItem: '+ Add Item',
    noAgenda: 'No agenda items added.',
    time: 'Time (Universal)',
    activityEn: 'Activity (EN)',
    activityTh: 'Activity (TH)',
    cateringLogistics: 'Catering & Logistics',
    seatLimit: 'Seat Limit (Universal)',
    hasCatering: 'Food/Catering is provided',
    isCateringFree: 'Catering is free of charge',
    cateringEn: 'Catering Details (EN)',
    cateringTh: 'Catering Details (TH)',
    remarksEn: 'Remarks / Note to Participants (EN)',
    remarksTh: 'Remarks (TH)',
    contactInfo: 'Contact Information',
    contactName: 'Contact Name',
    contactEmail: 'Contact Email',
    contactPhone: 'Contact Phone',
    lineId: 'LINE ID',
    externalUrl: 'External Website URL',
    eventBanner: 'Event Banner',
    removeImg: 'Remove Image',
    uploadBanner: 'Click or drag to upload banner',
    back: 'Back',
    saveDraft: 'Save Draft',
    publish: 'Publish Event',
    confirmPubTitle: 'Publish Event',
    confirmPubDesc: 'Are you sure you want to publish the event? Once published, it will be visible to all students within your university.',
    cancel: 'Cancel',
    confirm: 'Confirm Publish',
    universalSub: '(Universal)'
  } : {
    detailsTitle: 'รายละเอียดกิจกรรม',
    translateBtn: 'แปลภาษาอัตโนมัติ',
    translating: 'กำลังแปล...',
    basicInfo: 'ข้อมูลพื้นฐาน',
    titleEn: 'Title (EN)',
    titleTh: 'Title (TH)',
    descEn: 'Description (EN)',
    descTh: 'Description (TH)',
    categories: 'Categories (Universal)',
    addCategory: 'เพิ่มหมวดหมู่...',
    addBtn: 'เพิ่ม',
    dateLocation: 'วันและสถานที่',
    startDate: 'Start Date & Time',
    endDate: 'End Date & Time',
    isOnline: 'This is an online event',
    locationEn: 'Location / Venue (EN)',
    locationTh: 'Location / Venue (TH)',
    mapLink: 'Map Link (Universal)',
    agenda: 'กำหนดการกิจกรรม',
    addItem: '+ เพิ่มรายการ',
    noAgenda: 'ยังไม่มีกำหนดการ',
    time: 'Time (Universal)',
    activityEn: 'Activity (EN)',
    activityTh: 'Activity (TH)',
    cateringLogistics: 'อาหารและโลจิสติกส์',
    seatLimit: 'Seat Limit (Universal)',
    hasCatering: 'Food/Catering is provided',
    isCateringFree: 'Catering is free of charge',
    cateringEn: 'Catering Details (EN)',
    cateringTh: 'Catering Details (TH)',
    remarksEn: 'Remarks / Note to Participants (EN)',
    remarksTh: 'Remarks (TH)',
    contactInfo: 'ข้อมูลการติดต่อ',
    contactName: 'Contact Name',
    contactEmail: 'Contact Email',
    contactPhone: 'Contact Phone',
    lineId: 'LINE ID',
    externalUrl: 'External Website URL',
    eventBanner: 'ภาพแบนเนอร์',
    removeImg: 'ลบรูปภาพ',
    uploadBanner: 'Click or drag to upload banner',
    back: 'ย้อนกลับ',
    saveDraft: 'บันทึกแบบร่าง',
    publish: 'เผยแพร่กิจกรรม',
    confirmPubTitle: 'ยืนยันการเผยแพร่',
    confirmPubDesc: 'คุณแน่ใจหรือไม่ว่าต้องการเผยแพร่กิจกรรมนี้? เมื่อเผยแพร่แล้ว นักศึกษาทุกคนในมหาวิทยาลัยจะสามารถเห็นได้',
    cancel: 'ยกเลิก',
    confirm: 'ยืนยันการเผยแพร่',
    universalSub: '(Universal)'
  }
})

// Full Event Data Structure
const form = ref<any>({
  id: undefined, // Supports Upsert
  title: { en: '', th: '' },
  description: { en: '', th: '' },
  category: [],
  location: { en: '', th: '' },
  mapLink: '',
  isOnline: false,
  startAt: '',
  endAt: '',
  seatLimit: undefined,
  hasCatering: false,
  isCateringFree: false,
  cateringDescription: { en: '', th: '' },
  agenda: [],
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  contactLineId: '',
  externalUrl: '',
  remarks: { en: '', th: '' },
  bannerUrl: ''
})

const newCategory = ref('')
const presetCategories = [
  'SEMINAR', 'WORKSHOP', 'LECTURE', 'CONFERENCE',
  'HACKATHON', 'COMPETITION', 'CLUB_ACTIVITY', 'ORIENTATION',
  'VOLUNTEER', 'TRIP', 'SPORT', 'CULTURAL', 'FESTIVAL',
  'NETWORKING', 'CAREER_FAIR', 'PARTY', 'INTERNSHIP', 'OTHER'
]

const isTranslating = ref(false)
const isSaving = ref(false)
const showPublishModal = ref(false)
const showLeaveModal = ref(false)
const imageError = ref('')
const eventFormRef = ref<HTMLFormElement | null>(null)

const formatForDateTimeLocal = (isoString: string | undefined) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

onMounted(async () => {
  const eventId = route.params.id as string

  if (eventId && eventId !== 'new') {
    // PREVIEW/EDIT MODE: Fetch data from backend
    try {
      const data = await EventService.getEventById(eventId)
      form.value = { ...form.value, ...data }
      eventStatus.value = data.status
      viewMode.value = 'preview' // Always default to preview mode when opening
      
      if (form.value.startAt) form.value.startAt = formatForDateTimeLocal(form.value.startAt)
      if (form.value.endAt) form.value.endAt = formatForDateTimeLocal(form.value.endAt)
    } catch (error) {
      alert("Failed to load event data.")
      router.back()
    }
  } else {
    // CREATE MODE: Check Pinia store for AI-generated drafts
    viewMode.value = 'create'
    if (store.draftEvent) {
      form.value = { ...form.value, ...store.draftEvent };
      if (form.value.startAt) form.value.startAt = formatForDateTimeLocal(form.value.startAt);
      if (form.value.endAt) form.value.endAt = formatForDateTimeLocal(form.value.endAt);
    }
  }
})

const enableEditMode = () => {
  viewMode.value = 'edit'
}

// Translation API Call
const handleTranslate = async () => {
  isTranslating.value = true
  try {
    const payload = {
      title: form.value.title,
      description: form.value.description,
      location: form.value.location,
      cateringDescription: form.value.cateringDescription,
      agenda: form.value.agenda,
      remarks: form.value.remarks
    }
    const translated = await EventService.translateFields(payload)
    Object.assign(form.value, translated)
    alert(viewLang.value === 'th' ? "แปลภาษาเสร็จสมบูรณ์!" : "Translation complete!")
  } catch (error) {
    alert(viewLang.value === 'th' ? "การแปลล้มเหลว" : "Translation failed.")
  } finally {
    isTranslating.value = false
  }
}

// Category Management
const addCategory = () => {
  const cat = newCategory.value.trim()
  if (cat && !form.value.category.includes(cat)) {
    form.value.category.push(cat)
    newCategory.value = ''
  }
}
const removeCategory = (categoryToRemove: string) => {
  form.value.category = form.value.category.filter((c: string) => c !== categoryToRemove)
}

// Agenda Management
const addAgendaItem = () => {
  const agendaList = form.value.agenda;
  if (agendaList.length > 0) {
    const lastItem = agendaList[agendaList.length - 1];
    const isTimeEmpty = !lastItem.time || lastItem.time.trim() === '';
    const isActivityEmpty = (!lastItem.activity.en || lastItem.activity.en.trim() === '') && 
                            (!lastItem.activity.th || lastItem.activity.th.trim() === '');

    if (isTimeEmpty || isActivityEmpty) {
      const alertMsg = viewLang.value === 'en' 
        ? "Please fill out the previous agenda item before adding a new one." 
        : "กรุณากรอกข้อมูลกำหนดการล่าสุดให้ครบก่อนเพิ่มรายการใหม่";
      alert(alertMsg);
      return; 
    }
  }
  form.value.agenda.push({ time: '', activity: { en: '', th: '' } });
}

const removeAgendaItem = (index: number) => {
  form.value.agenda.splice(index, 1)
}

// Banner Validation & Upload
const handleImageUpload = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  imageError.value = ''
  const validTypes = ['image/jpeg', 'image/png', 'image/webp']
  
  if (!validTypes.includes(file.type)) {
    imageError.value = "Unsupported image format"
    return
  }
  if (file.size > 5242880) {
    imageError.value = "File size must not exceed 5MB."
    return
  }

  try {
    const response = await EventService.uploadBanner(file)
    form.value.bannerUrl = response.bannerUrl
  } catch (error) {
    imageError.value = "Failed to upload banner image."
  }
}

const sanitizePayload = () => {
  const rawForm = toRaw(form.value);
  return {
    ...rawForm,
    startAt: rawForm.startAt ? new Date(rawForm.startAt).toISOString() : undefined,
    endAt: rawForm.endAt ? new Date(rawForm.endAt).toISOString() : undefined,
    seatLimit: rawForm.seatLimit ? Number(rawForm.seatLimit) : undefined,
    mapLink: rawForm.mapLink || undefined,
    contactEmail: rawForm.contactEmail || undefined,
    externalUrl: rawForm.externalUrl || undefined,
  };
}

// Publishing & Saving
const saveAsDraft = async () => {
  if (eventFormRef.value && !eventFormRef.value.reportValidity()) return 
  isSaving.value = true
  
  try {
    const draftPayload = sanitizePayload();
    await EventService.saveAsDraft(draftPayload as any);
    store.hasUnsavedChanges = false
    alert("Event saved as draft successfully")
    router.push({ name: 'home' })
  } catch (error: any) {
    console.error('Backend Validation Error:', error.response?.data?.message || error); 
    alert("Failed to save event. Check console for details.");
  } finally {
    isSaving.value = false
  }
}

const handlePublishClick = () => {
  if (eventFormRef.value && !eventFormRef.value.reportValidity()) return 
  showPublishModal.value = true
}

const confirmPublish = async () => {
  isSaving.value = true
  try {
    const publishPayload = sanitizePayload();
    await EventService.publish(publishPayload as any);
    store.hasUnsavedChanges = false 
    alert("Event published successfully")
    router.push({ name: 'home' })
  } catch (error: any) {
    alert(error.response?.data?.message || "Failed to publish event.")
  } finally {
    showPublishModal.value = false
    isSaving.value = false
  }
}

// Navigation & Modals
const handleBackClick = () => {
  if (viewMode.value === 'preview') {
    router.back()
  } else {
    showLeaveModal.value = true
  }
}

const confirmLeave = () => {
  showLeaveModal.value = false
  store.setDraftEvent(null) 
  store.hasUnsavedChanges = false 
  router.back()
}

const cancelLeave = () => {
  showLeaveModal.value = false
}
</script>

<template>
  <div class="p-6 max-w-2xl mx-auto pb-20">
    <button
      @click="handleBackClick"
      class="mb-6 text-gray-500 hover:text-gray-800 flex items-center gap-2 font-medium transition cursor-pointer"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
      </svg>
      {{ t.back }}
    </button>

    <div v-if="showLeaveModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full animate-fade-in">
        <h3 class="text-xl font-bold mb-2">Unsaved Changes</h3>
        <p class="text-gray-600 mb-6">You have unsaved changes. Are you sure you want to go back?</p>
        <div class="flex justify-end gap-3">
          <button @click="cancelLeave" class="px-4 py-2 bg-gray-100 font-bold rounded-lg hover:bg-gray-200 transition">
            Cancel
          </button>
          <button @click="confirmLeave" class="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition">
            Quit without saving
          </button>
        </div>
      </div>
    </div>

    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b pb-4 gap-4">
      <h1 class="text-2xl font-bold text-gray-800">
        {{ viewMode === 'preview' ? 'Event Details' : t.detailsTitle }}
      </h1>
      
      <div class="flex items-center gap-3 w-full md:w-auto">
        <div class="flex bg-gray-200 p-1 rounded-lg w-full md:w-48">
          <button 
            @click="viewLang = 'en'" 
            :class="viewLang === 'en' ? 'bg-white shadow text-blue-700' : 'text-gray-500'" 
            class="flex-1 py-1.5 rounded-md text-sm font-bold transition"
          >
            EN
          </button>
          <button 
            @click="viewLang = 'th'" 
            :class="viewLang === 'th' ? 'bg-white shadow text-blue-700' : 'text-gray-500'" 
            class="flex-1 py-1.5 rounded-md text-sm font-bold transition"
          >
            TH
          </button>
        </div>

        <button v-if="viewMode !== 'preview'" @click="handleTranslate" :disabled="isTranslating" class="bg-purple-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold shadow hover:bg-purple-700 disabled:bg-gray-400 transition flex items-center gap-1 whitespace-nowrap">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path></svg>
          <span class="hidden sm:inline">{{ isTranslating ? t.translating : t.translateBtn }}</span>
        </button>
      </div>
    </div>

    <form ref="eventFormRef" class="space-y-8" @submit.prevent>
      
      <fieldset :disabled="viewMode === 'preview'" class="space-y-8 disabled:opacity-95">
        
        <section class="bg-white p-5 rounded-xl border shadow-sm">
          <h2 class="text-lg font-bold text-gray-800 mb-4">{{ t.basicInfo }}</h2>
          
          <div v-if="viewLang === 'en'" class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t.titleEn }} <span class="text-red-500">*</span></label>
            <input v-model="form.title.en" required class="w-full border p-2 rounded-lg disabled:bg-gray-50" placeholder="Event Title" />
          </div>
          <div v-if="viewLang === 'th'" class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t.titleTh }} <span class="text-red-500">*</span></label>
            <input v-model="form.title.th" required class="w-full border p-2 rounded-lg disabled:bg-gray-50" placeholder="ชื่ออีเวนต์" />
          </div>

          <div v-if="viewLang === 'en'" class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t.descEn }}</label>
            <textarea v-model="form.description.en" class="w-full border p-2 rounded-lg disabled:bg-gray-50" rows="3" placeholder="Describe your event..."></textarea>
          </div>
          <div v-if="viewLang === 'th'" class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t.descTh }}</label>
            <textarea v-model="form.description.th" class="w-full border p-2 rounded-lg disabled:bg-gray-50" rows="3" placeholder="รายละเอียดกิจกรรม..."></textarea>
          </div>

          <div class="mb-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t.categories }}</label>
            <div class="flex gap-2 mb-2" v-if="viewMode !== 'preview'">
              <input 
                list="category-options"
                v-model="newCategory" 
                @keydown.enter.prevent="addCategory" 
                class="flex-grow border p-2 rounded-lg bg-white" 
                :placeholder="t.addCategory" 
              />
              <datalist id="category-options">
                <option v-for="cat in presetCategories" :key="cat" :value="cat"></option>
              </datalist>
              <button @click="addCategory" class="bg-gray-800 text-white px-4 py-2 rounded-lg">{{ t.addBtn }}</button>
            </div>
            
            <div class="flex flex-wrap gap-2">
              <span v-for="cat in form.category" :key="cat" class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                {{ cat }}
                <button v-if="viewMode !== 'preview'" @click="removeCategory(cat)" class="text-red-500 font-bold hover:text-red-700">×</button>
              </span>
            </div>
          </div>
        </section>

        <section class="bg-white p-5 rounded-xl border shadow-sm">
          <h2 class="text-lg font-bold text-gray-800 mb-4">{{ t.dateLocation }}</h2>
          
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ t.startDate }}</label>
              <input type="datetime-local" v-model="form.startAt" class="w-full border p-2 rounded-lg text-sm disabled:bg-gray-50" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ t.endDate }}</label>
              <input type="datetime-local" v-model="form.endAt" class="w-full border p-2 rounded-lg text-sm disabled:bg-gray-50" />
            </div>
          </div>

          <div class="flex items-center gap-2 mb-4">
            <input type="checkbox" v-model="form.isOnline" id="isOnline" class="w-4 h-4 text-blue-600 rounded disabled:opacity-70" />
            <label for="isOnline" class="font-medium text-gray-700">{{ t.isOnline }}</label>
          </div>

          <div v-if="!form.isOnline" class="space-y-4">
            <div v-if="viewLang === 'en'">
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ t.locationEn }}</label>
              <input v-model="form.location.en" class="w-full border p-2 rounded-lg disabled:bg-gray-50" placeholder="e.g. Main Hall" />
            </div>
            <div v-if="viewLang === 'th'">
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ t.locationTh }}</label>
              <input v-model="form.location.th" class="w-full border p-2 rounded-lg disabled:bg-gray-50" placeholder="สถานที่จัดงาน" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ t.mapLink }}</label>
              <input v-model="form.mapLink" class="w-full border p-2 rounded-lg disabled:bg-gray-50" placeholder="https://maps.google.com/..." />
            </div>
          </div>
        </section>

        <section class="bg-white p-5 rounded-xl border shadow-sm">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-bold text-gray-800">{{ t.agenda }}</h2>
            <button v-if="viewMode !== 'preview'" @click="addAgendaItem" class="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-lg font-medium hover:bg-blue-200">{{ t.addItem }}</button>
          </div>
          
          <div v-if="form.agenda.length === 0" class="text-gray-500 text-sm text-center py-4">{{ t.noAgenda }}</div>
          
          <div v-if="form.agenda.length > 0" class="border rounded-lg bg-gray-50 p-3">
            <div class="flex flex-row gap-2 sm:gap-4 mb-2 pr-8 border-b border-gray-200 pb-2">
              <div class="shrink-0 w-4 sm:w-5"></div>
              <div class="w-1/3">
                <label class="block text-xs font-bold text-gray-500 truncate">{{ t.time }}</label>
              </div>
              <div class="flex-1">
                <label v-if="viewLang === 'en'" class="block text-xs font-bold text-gray-500 truncate">{{ t.activityEn }}</label>
                <label v-if="viewLang === 'th'" class="block text-xs font-bold text-gray-500 truncate">{{ t.activityTh }}</label>
              </div>
            </div>

            <div v-for="(item, index) in form.agenda" :key="index" class="relative flex flex-row items-center gap-2 sm:gap-4 py-2 pr-8">
              <button v-if="viewMode !== 'preview'" @click="removeAgendaItem(index as number)" class="absolute top-1/2 right-0 -translate-y-1/2 p-1 text-red-500 hover:text-red-700 text-lg font-bold leading-none">×</button>
              
              <div class="shrink-0 w-4 sm:w-5 text-center font-black text-gray-400 text-sm sm:text-base">
                {{ (index as number) + 1 }}
              </div>

              <div class="w-1/3">
                <input type="time" v-model="item.time" class="w-full border p-1.5 sm:p-2 rounded text-xs sm:text-sm bg-white disabled:bg-gray-100" />
              </div>
              
              <div v-if="viewLang === 'en'" class="flex-1">
                <input v-model="item.activity.en" class="w-full border p-1.5 sm:p-2 rounded text-xs sm:text-sm disabled:bg-gray-100" placeholder="Opening Ceremony" />
              </div>
              <div v-if="viewLang === 'th'" class="flex-1">
                <input v-model="item.activity.th" class="w-full border p-1.5 sm:p-2 rounded text-xs sm:text-sm disabled:bg-gray-100" placeholder="พิธีเปิด" />
              </div>
            </div>
          </div>
        </section>

        <section class="bg-white p-5 rounded-xl border shadow-sm">
          <h2 class="text-lg font-bold text-gray-800 mb-4">{{ t.cateringLogistics }}</h2>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t.seatLimit }}</label>
            <input type="number" v-model="form.seatLimit" class="w-full border p-2 rounded-lg max-w-xs disabled:bg-gray-50" />
          </div>

          <div class="flex items-center gap-2 mb-2">
            <input type="checkbox" v-model="form.hasCatering" id="hasCatering" class="w-4 h-4 text-blue-600 rounded disabled:opacity-70" />
            <label for="hasCatering" class="font-medium text-gray-700">{{ t.hasCatering }}</label>
          </div>

          <div v-if="form.hasCatering" class="pl-6 space-y-4 border-l-2 border-blue-200 ml-2 mt-4 mb-4">
            <div class="flex items-center gap-2 mb-2">
              <input type="checkbox" v-model="form.isCateringFree" id="isCateringFree" class="w-4 h-4 text-blue-600 rounded disabled:opacity-70" />
              <label for="isCateringFree" class="font-medium text-gray-700">{{ t.isCateringFree }}</label>
            </div>
            
            <div v-if="viewLang === 'en'">
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ t.cateringEn }}</label>
              <input v-model="form.cateringDescription.en" class="w-full border p-2 rounded-lg disabled:bg-gray-50" placeholder="e.g. Buffet Lunch included" />
            </div>
            <div v-if="viewLang === 'th'">
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ t.cateringTh }}</label>
              <input v-model="form.cateringDescription.th" class="w-full border p-2 rounded-lg disabled:bg-gray-50" placeholder="รายละเอียดอาหาร..." />
            </div>
          </div>

          <div v-if="viewLang === 'en'" class="mt-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t.remarksEn }}</label>
            <textarea v-model="form.remarks.en" class="w-full border p-2 rounded-lg disabled:bg-gray-50" rows="2" placeholder="e.g. Please bring your student ID"></textarea>
          </div>
          <div v-if="viewLang === 'th'" class="mt-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t.remarksTh }}</label>
            <textarea v-model="form.remarks.th" class="w-full border p-2 rounded-lg disabled:bg-gray-50" rows="2" placeholder="หมายเหตุ..."></textarea>
          </div>
        </section>

        <section class="bg-white p-5 rounded-xl border shadow-sm">
          <h2 class="text-lg font-bold text-gray-800 mb-4">{{ t.contactInfo }} <span class="text-sm font-normal text-gray-500">{{ t.universalSub }}</span></h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ t.contactName }}</label>
              <input v-model="form.contactName" class="w-full border p-2 rounded-lg disabled:bg-gray-50" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ t.contactEmail }}</label>
              <input v-model="form.contactEmail" type="email" class="w-full border p-2 rounded-lg disabled:bg-gray-50" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ t.contactPhone }}</label>
              <input v-model="form.contactPhone" class="w-full border p-2 rounded-lg disabled:bg-gray-50" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ t.lineId }}</label>
              <input v-model="form.contactLineId" class="w-full border p-2 rounded-lg disabled:bg-gray-50" />
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ t.externalUrl }}</label>
              <input v-model="form.externalUrl" class="w-full border p-2 rounded-lg disabled:bg-gray-50" placeholder="https://..." />
            </div>
          </div>
        </section>

        <section class="bg-white p-5 rounded-xl border shadow-sm">
          <h2 class="text-lg font-bold text-gray-800 mb-4">{{ t.eventBanner }} <span class="text-sm font-normal text-gray-500">{{ t.universalSub }}</span></h2>
          <div v-if="form.bannerUrl" class="relative">
            <img :src="form.bannerUrl" class="w-full h-48 object-cover rounded-lg border" />
            <button v-if="viewMode !== 'preview'" @click="form.bannerUrl = ''" class="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-md text-xs shadow hover:bg-red-700">{{ t.removeImg }}</button>
          </div>
          <div v-else class="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 transition relative" :class="viewMode === 'preview' ? 'opacity-50' : 'cursor-pointer'">
            <input type="file" @change="handleImageUpload" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" :disabled="viewMode === 'preview'" accept="image/jpeg, image/png, image/webp" />
            <div class="text-gray-500 pointer-events-none flex flex-col items-center">
               <svg class="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
               <span>{{ t.uploadBanner }}</span>
            </div>
          </div>
          <span v-if="imageError" class="text-red-500 text-sm mt-2 block">{{ imageError }}</span>
        </section>

      </fieldset>
    </form>

    <div class="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
      <div class="max-w-screen-md mx-auto w-full flex gap-3">
        
        <button v-if="viewMode === 'preview' && eventStatus === 'DRAFT'" @click="enableEditMode" class="bg-yellow-500 text-white px-4 py-3 rounded-lg font-bold text-sm flex-1 hover:bg-yellow-600 transition shadow">
          Edit Draft
        </button>

        <template v-if="viewMode === 'create' || viewMode === 'edit'">
          <button @click="saveAsDraft" :disabled="isSaving" class="bg-blue-600 text-white px-4 py-3 rounded-lg font-bold text-sm flex-1 hover:bg-yellow-600 transition disabled:opacity-50 shadow">
            {{ t.saveDraft }}
          </button>
          <button @click="handlePublishClick" :disabled="isSaving" class="bg-blue-600 text-white px-4 py-3 rounded-lg font-bold text-sm flex-1 hover:bg-blue-700 transition disabled:opacity-50 shadow">
            {{ t.publish }}
          </button>
        </template>
        
        <button v-if="viewMode === 'preview' && eventStatus === 'PUBLISHED'" @click="router.push({name: 'home'})" class="bg-gray-800 text-white px-4 py-3 rounded-lg font-bold text-sm flex-1 hover:bg-gray-900 transition shadow">
          Back to Dashboard
        </button>

      </div>
    </div>

    <div v-if="showPublishModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full animate-fade-in">
        <h3 class="text-xl font-bold mb-2">{{ t.confirmPubTitle }}</h3>
        <p class="text-gray-600 mb-6">{{ t.confirmPubDesc }}</p>
        <div class="flex justify-end gap-3">
          <button @click="showPublishModal = false" class="px-4 py-2 bg-gray-100 font-bold rounded-lg hover:bg-gray-200 transition">{{ t.cancel }}</button>
          <button @click="confirmPublish" class="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition">{{ t.confirm }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.2s ease-in-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
/* Optional: Improve the look of disabled inputs so they are clearly readable but locked */
fieldset:disabled input,
fieldset:disabled textarea {
  color: #374151; /* gray-700 */
  border-color: #e5e7eb; /* gray-200 */
  background-color: #f9fafb; /* gray-50 */
}
</style>