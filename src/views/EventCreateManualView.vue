<script setup lang="ts">
import { ref, onMounted, computed, toRaw } from 'vue'
import { useRouter } from 'vue-router'
import { useEventCreationStore } from '../stores/eventCreation'
import { EventService } from '../services/EventService'
import type { SaveDraftDto } from '../types'

const router = useRouter()
const store = useEventCreationStore()

// Language Toggle State
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
    // Input labels changed to English as requested
    titleEn: 'Title (EN)',
    titleTh: 'Title (TH)',
    descEn: 'Description (EN)',
    descTh: 'Description (TH)',
    categories: 'Categories (Universal)',
    addCategory: 'เพิ่มหมวดหมู่...', // Kept placeholder in Thai
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
// Predefined options for the dropdown
const presetCategories = [
  'SEMINAR', 'WORKSHOP', 'LECTURE', 'CONFERENCE',
  'HACKATHON', 'COMPETITION', 'CLUB_ACTIVITY', 'ORIENTATION',
  'VOLUNTEER', 'TRIP', 'SPORT', 'CULTURAL', 'FESTIVAL',
  'NETWORKING', 'CAREER_FAIR', 'PARTY', 'INTERNSHIP', 'OTHER'
]
const isTranslating = ref(false)
const isSaving = ref(false)
const showPublishModal = ref(false)
const imageError = ref('')

const formatForDateTimeLocal = (isoString: string | undefined) => {
  if (!isoString) return '';
  
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return ''; // Return empty string if date is invalid

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  // Returns format: YYYY-MM-DDThh:mm
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

onMounted(() => {
  if (store.draftEvent) {
    form.value = { ...form.value, ...store.draftEvent };
  
    if (form.value.startAt) {
      form.value.startAt = formatForDateTimeLocal(form.value.startAt);
    }
    if (form.value.endAt) {
      form.value.endAt = formatForDateTimeLocal(form.value.endAt);
    }
  }
})

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
  
  // Check if the list is not empty
  if (agendaList.length > 0) {
    const lastItem = agendaList[agendaList.length - 1];
    
    // Check if time is empty or BOTH activities are empty
    const isTimeEmpty = !lastItem.time || lastItem.time.trim() === '';
    const isActivityEmpty = (!lastItem.activity.en || lastItem.activity.en.trim() === '') && 
                            (!lastItem.activity.th || lastItem.activity.th.trim() === '');

    if (isTimeEmpty || isActivityEmpty) {
      // Show an alert based on the current language view
      const alertMsg = viewLang.value === 'en' 
        ? "Please fill out the previous agenda item before adding a new one." 
        : "กรุณากรอกข้อมูลกำหนดการล่าสุดให้ครบก่อนเพิ่มรายการใหม่";
      
      alert(alertMsg);
      return; // Stop execution, don't add a new item
    }
  }

  // If validation passes (or list is empty), add the new item
  form.value.agenda.push({ time: '', activity: { en: '', th: '' } });
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

// Publishing & Saving
const confirmPublish = async () => {
  isSaving.value = true
  try {
    await EventService.publish(form.value)
    store.hasUnsavedChanges = false 
    alert("Event published successfully")
    router.push({ name: 'event-preview', params: { id: 'new' } })
  } catch (error: any) {
    alert(error.response?.data?.message || "Failed to publish event.")
  } finally {
    showPublishModal.value = false
    isSaving.value = false
  }
}

// Agenda Management
const removeAgendaItem = (index: number) => {
  form.value.agenda.splice(index, 1)
}

// Add this near your other refs
const eventFormRef = ref<HTMLFormElement | null>(null)

// Update your Publish action
const handlePublishClick = () => {
  // .reportValidity() checks EVERY input inside the form for the 'required' property.
  // If any are empty, it returns false and scrolls the user to the exact missing field!
  if (eventFormRef.value && !eventFormRef.value.reportValidity()) {
    return // Stop if validation fails
  }
  
  showPublishModal.value = true
}

// Your Save Draft action can remain exactly as it was!
// (Because you usually want to let organizers save a draft even if it's incomplete)
const saveAsDraft = async () => {
  if (eventFormRef.value && !eventFormRef.value.reportValidity()) {
    return 
  }

  isSaving.value = true
  
  try {
    // 1. Extract the raw, un-proxied object from Vue
    const rawForm = toRaw(form.value);

    // 2. Map and sanitize the data into your DTO format
    const draftPayload: SaveDraftDto = {
      ...rawForm,
      // NestJS @IsOptional() expects the field to be absent or undefined, not an empty string.
      // Convert empty strings to undefined to pass backend validation.
      startAt: rawForm.startAt ? new Date(rawForm.startAt).toISOString() : undefined,
      endAt: rawForm.endAt ? new Date(rawForm.endAt).toISOString() : undefined,
      seatLimit: rawForm.seatLimit ? Number(rawForm.seatLimit) : undefined,
      mapLink: rawForm.mapLink || undefined,
      contactEmail: rawForm.contactEmail || undefined,
      externalUrl: rawForm.externalUrl || undefined,
    };

    console.log('Sending sanitized payload:', draftPayload);

    // 3. Send the clean DTO to the service
    await EventService.saveAsDraft(draftPayload);
    
    store.hasUnsavedChanges = false
    alert("Event saved as draft successfully")
    router.push({ name: 'home' })
    
  } catch (error: any) {
    // 4. Log the EXACT backend validation error to see which field failed
    console.error('Backend Validation Error:', error.response?.data?.message || error); 
    alert("Failed to save event. Check console for details.");
  } finally {
    isSaving.value = false
  }
}

// Add this near your other refs (e.g., const isSaving = ref(false))
const showLeaveModal = ref(false)

// Replaces your direct router.back() call
const handleBackClick = () => {
  showLeaveModal.value = true
}

// When the user clicks "Quit without saving"
const confirmLeave = () => {
  showLeaveModal.value = false
  
  // Clear the Pinia store so data doesn't carry over next time
  // Note: Depending on how your store is set up, you might need to use 
  // store.$reset(), store.clearDraft(), or store.draftEvent = null
  store.setDraftEvent(null) 
  store.hasUnsavedChanges = false 
  
  router.back()
}

// When the user clicks "Cancel"
const cancelLeave = () => {
  showLeaveModal.value = false
}
</script>

<template>
  <div class="p-6 max-w-2xl mx-auto pb-20">
    <!-- Change @click="router.back()" to @click="handleBackClick" -->
  <button
    @click="handleBackClick"
    class="mb-6 text-gray-500 hover:text-gray-800 flex items-center gap-2 font-medium transition cursor-pointer"
  >
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
    </svg>
    Back
  </button>

  <!-- Leave Confirmation Modal -->
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

    <!-- Top Header & Controls -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b pb-4 gap-4">
      <h1 class="text-2xl font-bold text-gray-800">{{ t.detailsTitle }}</h1>
      
      <div class="flex items-center gap-3 w-full md:w-auto">
        <!-- Language Toggle -->
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

        <!-- Translate Button -->
        <button @click="handleTranslate" :disabled="isTranslating" class="bg-purple-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold shadow hover:bg-purple-700 disabled:bg-gray-400 transition flex items-center gap-1 whitespace-nowrap">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path></svg>
          <span class="hidden sm:inline">{{ isTranslating ? t.translating : t.translateBtn }}</span>
        </button>
      </div>
    </div>

    <form ref="eventFormRef" class="space-y-8" @submit.prevent>
      
      <!-- Section 1: Basic Information -->
      <section class="bg-white p-5 rounded-xl border shadow-sm">
        <h2 class="text-lg font-bold text-gray-800 mb-4">{{ t.basicInfo }}</h2>
        
        <div v-if="viewLang === 'en'" class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t.titleEn }} <span class="text-red-500">*</span></label>
          <input v-model="form.title.en" required class="w-full border p-2 rounded-lg" placeholder="Event Title" />
        </div>
        <div v-if="viewLang === 'th'" class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t.titleTh }} <span class="text-red-500">*</span></label>
          <input v-model="form.title.th" required class="w-full border p-2 rounded-lg" placeholder="ชื่ออีเวนต์" />
        </div>

        <div v-if="viewLang === 'en'" class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t.descEn }}</label>
          <textarea v-model="form.description.en" class="w-full border p-2 rounded-lg" rows="3" placeholder="Describe your event..."></textarea>
        </div>
        <div v-if="viewLang === 'th'" class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t.descTh }}</label>
          <textarea v-model="form.description.th" class="w-full border p-2 rounded-lg" rows="3" placeholder="รายละเอียดกิจกรรม..."></textarea>
        </div>

        <div class="mb-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t.categories }}</label>
          <div class="flex gap-2 mb-2">
            <!-- Added list="category-options" to link to the datalist -->
            <input 
              list="category-options"
              v-model="newCategory" 
              @keydown.enter.prevent="addCategory" 
              class="flex-grow border p-2 rounded-lg bg-white" 
              :placeholder="t.addCategory" 
            />
            
            <!-- Datalist provides the dropdown options -->
            <datalist id="category-options">
              <option v-for="cat in presetCategories" :key="cat" :value="cat"></option>
            </datalist>

            <button @click="addCategory" class="bg-gray-800 text-white px-4 py-2 rounded-lg">{{ t.addBtn }}</button>
          </div>
          
          <div class="flex flex-wrap gap-2">
            <span v-for="cat in form.category" :key="cat" class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
              {{ cat }}
              <button @click="removeCategory(cat)" class="text-red-500 font-bold hover:text-red-700">&times;</button>
            </span>
          </div>
        </div>
      </section>

      <!-- Section 2: Date & Location -->
      <section class="bg-white p-5 rounded-xl border shadow-sm">
        <h2 class="text-lg font-bold text-gray-800 mb-4">{{ t.dateLocation }}</h2>
        
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t.startDate }}</label>
            <input type="datetime-local" v-model="form.startAt" class="w-full border p-2 rounded-lg text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t.endDate }}</label>
            <input type="datetime-local" v-model="form.endAt" class="w-full border p-2 rounded-lg text-sm" />
          </div>
        </div>

        <div class="flex items-center gap-2 mb-4">
          <input type="checkbox" v-model="form.isOnline" id="isOnline" class="w-4 h-4 text-blue-600 rounded" />
          <label for="isOnline" class="font-medium text-gray-700">{{ t.isOnline }}</label>
        </div>

        <div v-if="!form.isOnline" class="space-y-4">
          <div v-if="viewLang === 'en'">
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t.locationEn }}</label>
            <input v-model="form.location.en" class="w-full border p-2 rounded-lg" placeholder="e.g. Main Hall" />
          </div>
          <div v-if="viewLang === 'th'">
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t.locationTh }}</label>
            <input v-model="form.location.th" class="w-full border p-2 rounded-lg" placeholder="สถานที่จัดงาน" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t.mapLink }}</label>
            <input v-model="form.mapLink" class="w-full border p-2 rounded-lg" placeholder="https://maps.google.com/..." />
          </div>
        </div>
      </section>

      <!-- Section 3: Agenda -->
      <!-- Section 3: Agenda -->
      <section class="bg-white p-5 rounded-xl border shadow-sm">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-bold text-gray-800">{{ t.agenda }}</h2>
          <button @click="addAgendaItem" class="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-lg font-medium hover:bg-blue-200">{{ t.addItem }}</button>
        </div>
        
        <div v-if="form.agenda.length === 0" class="text-gray-500 text-sm text-center py-4">{{ t.noAgenda }}</div>
        
        <!-- SINGLE CONTAINER FOR ALL ITEMS -->
        <div v-if="form.agenda.length > 0" class="border rounded-lg bg-gray-50 p-3">
          
          <!-- HEADER ROW -->
          <div class="flex flex-row gap-2 sm:gap-4 mb-2 pr-8 border-b border-gray-200 pb-2">
            <!-- Empty spacer to align with the number indicator -->
            <div class="shrink-0 w-4 sm:w-5"></div>
            
            <!-- Time Header -->
            <div class="w-1/3">
              <label class="block text-xs font-bold text-gray-500 truncate">{{ t.time }}</label>
            </div>
            
            <!-- Activity Header -->
            <div class="flex-1">
              <label v-if="viewLang === 'en'" class="block text-xs font-bold text-gray-500 truncate">{{ t.activityEn }}</label>
              <label v-if="viewLang === 'th'" class="block text-xs font-bold text-gray-500 truncate">{{ t.activityTh }}</label>
            </div>
          </div>

          <!-- AGENDA ITEMS LOOP -->
          <div v-for="(item, index) in form.agenda" :key="index" class="relative flex flex-row items-center gap-2 sm:gap-4 py-2 pr-8">
            
            <!-- Vertically centered remove button -->
            <button @click="removeAgendaItem(index as number)" class="absolute top-1/2 right-0 -translate-y-1/2 p-1 text-red-500 hover:text-red-700 text-lg font-bold leading-none">&times;</button>
            
            <!-- Number Indicator -->
            <div class="shrink-0 w-4 sm:w-5 text-center font-black text-gray-400 text-sm sm:text-base">
              {{ (index as number) + 1 }}
            </div>

            <!-- Time Input: 1/3 Width -->
            <div class="w-1/3">
              <input 
                type="time" 
                v-model="item.time" 
                class="w-full border p-1.5 sm:p-2 rounded text-xs sm:text-sm bg-white" 
              />
            </div>
            
            <!-- Activity Input (EN) -->
            <div v-if="viewLang === 'en'" class="flex-1">
              <input v-model="item.activity.en" class="w-full border p-1.5 sm:p-2 rounded text-xs sm:text-sm" placeholder="Opening Ceremony" />
            </div>
            
            <!-- Activity Input (TH) -->
            <div v-if="viewLang === 'th'" class="flex-1">
              <input v-model="item.activity.th" class="w-full border p-1.5 sm:p-2 rounded text-xs sm:text-sm" placeholder="พิธีเปิด" />
            </div>
          </div>

        </div>
      </section>

      <!-- Section 4: Details & Catering -->
      <section class="bg-white p-5 rounded-xl border shadow-sm">
        <h2 class="text-lg font-bold text-gray-800 mb-4">{{ t.cateringLogistics }}</h2>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t.seatLimit }}</label>
          <input type="number" v-model="form.seatLimit" class="w-full border p-2 rounded-lg max-w-xs" />
        </div>

        <div class="flex items-center gap-2 mb-2">
          <input type="checkbox" v-model="form.hasCatering" id="hasCatering" class="w-4 h-4 text-blue-600 rounded" />
          <label for="hasCatering" class="font-medium text-gray-700">{{ t.hasCatering }}</label>
        </div>

        <div v-if="form.hasCatering" class="pl-6 space-y-4 border-l-2 border-blue-200 ml-2 mt-4 mb-4">
          <div class="flex items-center gap-2 mb-2">
            <input type="checkbox" v-model="form.isCateringFree" id="isCateringFree" class="w-4 h-4 text-blue-600 rounded" />
            <label for="isCateringFree" class="font-medium text-gray-700">{{ t.isCateringFree }}</label>
          </div>
          
          <div v-if="viewLang === 'en'">
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t.cateringEn }}</label>
            <input v-model="form.cateringDescription.en" class="w-full border p-2 rounded-lg" placeholder="e.g. Buffet Lunch included" />
          </div>
          <div v-if="viewLang === 'th'">
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t.cateringTh }}</label>
            <input v-model="form.cateringDescription.th" class="w-full border p-2 rounded-lg" placeholder="รายละเอียดอาหาร..." />
          </div>
        </div>

        <div v-if="viewLang === 'en'" class="mt-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t.remarksEn }}</label>
          <textarea v-model="form.remarks.en" class="w-full border p-2 rounded-lg" rows="2" placeholder="e.g. Please bring your student ID"></textarea>
        </div>
        <div v-if="viewLang === 'th'" class="mt-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t.remarksTh }}</label>
          <textarea v-model="form.remarks.th" class="w-full border p-2 rounded-lg" rows="2" placeholder="หมายเหตุ..."></textarea>
        </div>
      </section>

      <!-- Section 5: Contact Info -->
      <section class="bg-white p-5 rounded-xl border shadow-sm">
        <h2 class="text-lg font-bold text-gray-800 mb-4">{{ t.contactInfo }} <span class="text-sm font-normal text-gray-500">{{ t.universalSub }}</span></h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t.contactName }}</label>
            <input v-model="form.contactName" class="w-full border p-2 rounded-lg" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t.contactEmail }}</label>
            <input v-model="form.contactEmail" type="email" class="w-full border p-2 rounded-lg" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t.contactPhone }}</label>
            <input v-model="form.contactPhone" class="w-full border p-2 rounded-lg" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t.lineId }}</label>
            <input v-model="form.contactLineId" class="w-full border p-2 rounded-lg" />
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t.externalUrl }}</label>
            <input v-model="form.externalUrl" class="w-full border p-2 rounded-lg" placeholder="https://..." />
          </div>
        </div>
      </section>

      <!-- Section 6: Banner Upload -->
      <section class="bg-white p-5 rounded-xl border shadow-sm">
        <h2 class="text-lg font-bold text-gray-800 mb-4">{{ t.eventBanner }} <span class="text-sm font-normal text-gray-500">{{ t.universalSub }}</span></h2>
        <div v-if="form.bannerUrl" class="relative">
          <img :src="form.bannerUrl" class="w-full h-48 object-cover rounded-lg border" />
          <button @click="form.bannerUrl = ''" class="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-md text-xs shadow hover:bg-red-700">{{ t.removeImg }}</button>
        </div>
        <div v-else class="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 transition cursor-pointer relative">
          <input type="file" @change="handleImageUpload" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/jpeg, image/png, image/webp" />
          <div class="text-gray-500 pointer-events-none flex flex-col items-center">
             <svg class="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
             <span>{{ t.uploadBanner }}</span>
          </div>
        </div>
        <span v-if="imageError" class="text-red-500 text-sm mt-2 block">{{ imageError }}</span>
      </section>

    </form>

    <!-- Bottom Action Bar (Sticky for Mobile) -->
    <div class="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
      <div class="max-w-screen-md mx-auto w-full flex gap-3">
        <button @click="saveAsDraft" :disabled="isSaving" class="bg-blue-600 text-white px-4 py-3 rounded-lg font-bold text-sm flex-1 hover:bg-yellow-600 transition disabled:opacity-50">
          Save as Draft
        </button>
        <button @click="handlePublishClick" :disabled="isSaving" class="bg-blue-600 text-white px-4 py-3 rounded-lg font-bold text-sm flex-1 hover:bg-blue-700 transition disabled:opacity-50">
  Publish Event
</button>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <div v-if="showPublishModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full">
        <h3 class="text-xl font-bold mb-2">{{ t.confirmPubTitle }}</h3>
        <p class="text-gray-600 mb-6">{{ t.confirmPubDesc }}</p>
        <div class="flex justify-end gap-3">
          <button @click="showPublishModal = false" class="px-4 py-2 bg-gray-100 font-bold rounded-lg hover:bg-gray-200">{{ t.cancel }}</button>
          <button @click="confirmPublish" class="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">{{ t.confirm }}</button>
        </div>
      </div>
    </div>
  </div>
</template>