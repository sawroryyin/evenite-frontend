<script setup lang="ts">
import { ref, onMounted, computed, toRaw } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useEventCreationStore } from '../stores/eventCreation'
import { EventService } from '../services/EventService'
import { translations } from '../locales/eventForm'

// Components
import ConfirmModal from '../components/ConfirmModal.vue'
import EventPreview from './EventDetailPreview.vue'
import EventForm from '../components/EventDetailForm.vue'

const router = useRouter()
const route = useRoute()
const store = useEventCreationStore()

// State Management
const viewMode = ref<'create' | 'edit' | 'preview'>('create')
const eventStatus = ref<'DRAFT' | 'PUBLISHED' | null | undefined>(null)
const viewLang = ref<'en' | 'th'>('en')
const t = computed(() => translations[viewLang.value])

// Form State
const form = ref<any>({
  id: undefined, 
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

const isTranslating = ref(false)
const isSaving = ref(false)
const showPublishModal = ref(false)
const showLeaveModal = ref(false)
const eventFormRef = ref<HTMLFormElement | null>(null)

const formatForDateTimeLocal = (isoString: string | undefined) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

onMounted(async () => {
  const eventId = route.params.id as string
  if (eventId && eventId !== 'new') {
    try {
      const data = await EventService.getEventById(eventId)
      form.value = { ...form.value, ...data }
      eventStatus.value = data.status
      viewMode.value = 'preview'
      if (form.value.startAt) form.value.startAt = formatForDateTimeLocal(form.value.startAt)
      if (form.value.endAt) form.value.endAt = formatForDateTimeLocal(form.value.endAt)
    } catch (error) {
      alert("Failed to load event data.")
      router.back()
    }
  } else {
    viewMode.value = 'create'
    if (store.draftEvent) {
      form.value = { ...form.value, ...store.draftEvent };
      if (form.value.startAt) form.value.startAt = formatForDateTimeLocal(form.value.startAt);
      if (form.value.endAt) form.value.endAt = formatForDateTimeLocal(form.value.endAt);
    }
  }
})

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

const saveAsDraft = async () => {
  if (eventFormRef.value && !eventFormRef.value.reportValidity()) return 
  isSaving.value = true
  try {
    await EventService.saveAsDraft(sanitizePayload() as any);
    
    store.hasUnsavedChanges = false
    alert("Event saved as draft successfully")
    router.push({ name: 'home' })
  } catch (error: any) {
    alert("Failed to save event. Check console for details.");
  } finally {
    isSaving.value = false
  }
}

const confirmPublish = async () => {
  isSaving.value = true
  try {
    await EventService.publish(sanitizePayload() as any);
    store.setDraftEvent(null);
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

const handleBackClick = () => viewMode.value === 'preview' ? router.back() : (showLeaveModal.value = true)
const confirmLeave = () => { store.setDraftEvent(null); store.hasUnsavedChanges = false; router.back(); }
</script>

<template>
  <div class="p-6 max-w-2xl mx-auto pb-20">
    <!-- Header Controls -->
    <button @click="handleBackClick" class="mb-6 text-gray-500 hover:text-gray-800 flex items-center gap-2 font-medium transition cursor-pointer">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
      {{ t.back }}
    </button>

    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b pb-4 gap-4">
      <h1 class="text-2xl font-bold text-gray-800">{{ viewMode === 'preview' ? 'Event Details' : t.detailsTitle }}</h1>
      <div class="flex items-center gap-3 w-full md:w-auto">
        <div class="flex bg-gray-200 p-1 rounded-lg w-full md:w-48">
          <button @click="viewLang = 'en'" :class="viewLang === 'en' ? 'bg-white shadow text-blue-700' : 'text-gray-500'" class="flex-1 py-1.5 rounded-md text-sm font-bold transition">EN</button>
          <button @click="viewLang = 'th'" :class="viewLang === 'th' ? 'bg-white shadow text-blue-700' : 'text-gray-500'" class="flex-1 py-1.5 rounded-md text-sm font-bold transition">TH</button>
        </div>
        <button v-if="viewMode !== 'preview'" @click="handleTranslate" :disabled="isTranslating" class="bg-purple-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold shadow hover:bg-purple-700 disabled:bg-gray-400 transition flex items-center gap-1 whitespace-nowrap">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path></svg>
          <span class="hidden sm:inline">{{ isTranslating ? t.translating : t.translateBtn }}</span>
        </button>
      </div>
    </div>

    <!-- switch mode -->
    <div v-if="viewMode === 'preview'" class="animate-fade-in">
      <EventPreview :event="form" :t="t" :viewLang="viewLang" />
    </div>

    <form v-else ref="eventFormRef" @submit.prevent>
      <EventForm :form="form" :t="t" :viewLang="viewLang" :viewMode="viewMode" />
    </form>

    <!-- Bottom Action Bar -->
    <div class="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
      <div class="max-w-screen-md mx-auto w-full flex gap-3">
        <button v-if="viewMode === 'preview' && eventStatus === 'DRAFT'" @click="viewMode = 'edit'" class="bg-yellow-500 text-white px-4 py-3 rounded-lg font-bold text-sm flex-1 hover:bg-yellow-600 transition shadow">Edit Draft</button>
        <template v-if="viewMode === 'create' || viewMode === 'edit'">
          <button @click="saveAsDraft" :disabled="isSaving" class="bg-blue-600 text-white px-4 py-3 rounded-lg font-bold text-sm flex-1 hover:bg-yellow-600 transition disabled:opacity-50 shadow">{{ t.saveDraft }}</button>
          <button @click="() => { if (eventFormRef && eventFormRef.reportValidity()) showPublishModal = true }" :disabled="isSaving" class="bg-blue-600 text-white px-4 py-3 rounded-lg font-bold text-sm flex-1 hover:bg-blue-700 transition disabled:opacity-50 shadow">{{ t.publish }}</button>
        </template>
        <button v-if="viewMode === 'preview' && eventStatus === 'PUBLISHED'" @click="router.push({name: 'home'})" class="bg-gray-800 text-white px-4 py-3 rounded-lg font-bold text-sm flex-1 hover:bg-gray-900 transition shadow">Back to Dashboard</button>
      </div>
    </div>

    <!-- Modals -->
    <ConfirmModal 
      v-if="showLeaveModal"
      title="Unsaved Changes"
      description="You have unsaved changes. Are you sure you want to go back?"
      cancelText="Cancel"
      confirmText="Quit without saving"
      confirmTheme="red"
      @cancel="showLeaveModal = false"
      @confirm="confirmLeave"
    />
    
    <ConfirmModal 
      v-if="showPublishModal"
      :title="t.confirmPubTitle"
      :description="t.confirmPubDesc"
      :cancelText="t.cancel"
      :confirmText="t.confirm"
      @cancel="showPublishModal = false"
      @confirm="confirmPublish"
    />
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
</style>