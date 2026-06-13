<script setup lang="ts">
import { ref, onMounted, toRaw, provide, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useEventCreationStore } from '../../stores/eventCreation.ts'
import { EventService } from '../../services/EventService.ts'
import { translations } from '../../locales/eventForm.ts'

import ConfirmModal from '../../components/ConfirmModal.vue'
import EventPreview from '../event/EventDetailPreview.vue'
import EventForm from '../../components/event/EventDetailForm.vue'
import { FormService } from '../../services/FormService.ts'
import { useAuthStore } from '../../stores/auth.ts'

const router = useRouter()
const route = useRoute()
const store = useEventCreationStore()
const authStore = useAuthStore()

const viewMode = ref<'create' | 'edit' | 'preview'>('create')
const eventStatus = ref<'DRAFT' | 'PUBLISHED' | 'CONCLUDED' | 'ONGOING' | null | undefined>(null)
const viewLang = ref<'en' | 'th'>('en')

const t = translations['en'] 

const isTranslating = ref(false)
const isSaving = ref(false)
const showPublishModal = ref(false)
const showLeaveModal = ref(false)
const eventFormRef = ref<HTMLFormElement | null>(null)
const originalStateStr = ref('')

const availableForms = ref<any[]>([]) 
const isRegistered = ref(false)

// Alert Modal State
const alertState = ref({
  show: false,
  title: '',
  description: '',
  theme: 'blue' as 'blue' | 'red'
})

const showAlert = (title: string, description: string, theme: 'blue' | 'red' = 'blue') => {
  alertState.value = { show: true, title, description, theme }
}
provide('showAlert', showAlert)

const isCurrentUserOrganizer = computed(() => authStore.currentRole === 'ORGANIZER')

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

const formatForDateTimeLocal = (isoString: string | undefined) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

// CONTINUOUS SYNC: Watch for changes and save to temp data automatically
watch(form, (newVal) => {
  if (viewMode.value === 'create' || viewMode.value === 'edit') {
    store.setTempEventData(JSON.parse(JSON.stringify(newVal)));
  }
}, { deep: true });

watch(form, (newVal) => {
  if (viewMode.value === 'create' || viewMode.value === 'edit') {
    store.setTempEventData(JSON.parse(JSON.stringify(newVal)));
  }
}, { deep: true });

onMounted(async () => {
  const eventId = route.params.id as string
  
  // Safely check for both 'new' and 'create' depending on how the router is pushed
  const isNewEvent = !eventId || eventId === 'new' || eventId === 'create';

  if (!isNewEvent) {
    // IT IS AN EXISTING EVENT
    try {
      const data = await EventService.getEventById(eventId)
      eventStatus.value = data.status

      if (data.startAt) data.startAt = formatForDateTimeLocal(data.startAt)
      if (data.endAt) data.endAt = formatForDateTimeLocal(data.endAt)

      form.value = { ...form.value, ...data }
      
      availableForms.value = await FormService.getFormsByEventId(eventId)
      
      const requestedEdit = route.query.mode === 'edit' || sessionStorage.getItem('returnToEventEditMode') === 'true';
      
      if (requestedEdit && data.status === 'DRAFT') {
        viewMode.value = 'edit';
      } else {
        viewMode.value = 'preview';
      }
      sessionStorage.removeItem('returnToEventEditMode');
      
      originalStateStr.value = JSON.stringify(form.value)
    } catch (error) {
      showAlert("Error", "Failed to load event data.", "red")
      router.back()
    }
  } else {
    // IT IS A NEW EVENT
    viewMode.value = 'create'

    // SMART TEMP DATA CHECK: Ensure it doesn't belong to a previous draft!
    if (store.tempEventData && Object.keys(store.tempEventData).length > 0) {
      
      // If there is NO ID, it's a true new event in progress. Safe to restore.
      if (!store.tempEventData.id) {
        const draft = { ...store.tempEventData };
        
        if (draft.startAt) draft.startAt = formatForDateTimeLocal(draft.startAt);
        if (draft.endAt) draft.endAt = formatForDateTimeLocal(draft.endAt);
        
        form.value = { ...form.value, ...draft };
      } else {
        // It has an ID! This means it's ghost data from a previous saved draft. 
        // Do not restore it into a new event. Wipe it instead.
        store.clearTempData();
      }
    }
    
    originalStateStr.value = JSON.stringify(form.value)
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
    showAlert("Success", "Translation complete!", "blue")
  } catch (error) {
    showAlert("Translation Error", "Translation failed. Please try again.", "red")
  } finally {
    isTranslating.value = false
  }
}

const sanitizeDateRange = (startInput: any, endInput: any) => {
  const isValidDate = (d: any) => d instanceof Date && !isNaN(d.getTime());
  
  let startAt = startInput ? new Date(startInput) : undefined;
  let endAt = endInput ? new Date(endInput) : undefined;

  if (!isValidDate(startAt)) return { startAt: undefined, endAt: undefined };
  if (!isValidDate(endAt)) return { startAt, endAt: undefined };
  if (startAt!.getTime() >= endAt!.getTime()) return { startAt, endAt: undefined };

  return { startAt, endAt };
}

const validateForm = (isPublishing = false) => {

  const titleEn = form.value.title?.en || '';
  const titleTh = form.value.title?.th || '';
  
  const isCurrentTitleEmpty = viewLang.value === 'en' ? titleEn.trim() === '' : titleTh.trim() === '';

  if (isCurrentTitleEmpty || (titleEn.trim() === '' && titleTh.trim() === '')) {
    showAlert("Validation Error", "Event Title cannot be empty.", "red");
    return false;
  }
  
  const { startAt } = sanitizeDateRange(form.value.startAt, form.value.endAt);

  if (isPublishing) {
    if (!startAt) {
      showAlert("Validation Error", "A valid Start Date is required to publish an event.", "red");
      return false;
    }

    if (!form.value.isOnline) {
      if (!form.value.location?.en?.trim() && !form.value.location?.th?.trim()) {
        showAlert("Validation Error", "Location is required for offline events.", "red");
        return false;
      }
    }
  }

  if (form.value.seatLimit !== undefined && form.value.seatLimit !== null && form.value.seatLimit !== '') {
    const limit = Number(form.value.seatLimit);
    if (!Number.isInteger(limit) || limit < 1) {
      showAlert("Validation Error", "Seat Limit must be a positive whole number.", "red");
      return false;
    }
  }

  return true;
}

const sanitizePayload = () => {
  const rawForm = toRaw(form.value);
  const { startAt, endAt } = sanitizeDateRange(rawForm.startAt, rawForm.endAt);

  return {
    ...rawForm,
    startAt: startAt ? startAt.toISOString() : undefined,
    endAt: endAt ? endAt.toISOString() : undefined,
    seatLimit: rawForm.seatLimit ? Number(rawForm.seatLimit) : undefined,
    mapLink: rawForm.mapLink || undefined,
    contactEmail: rawForm.contactEmail || undefined,
    externalUrl: rawForm.externalUrl || undefined,
  };
}

const triggerPublish = () => {
  if (!validateForm(true)) return; 
  if (eventFormRef.value && !eventFormRef.value.reportValidity()) return;
  showPublishModal.value = true;
}

const saveAsDraft = async () => {
  if (!validateForm(false)) return; 
  if (eventFormRef.value && !eventFormRef.value.reportValidity()) return;
  
  isSaving.value = true
  try {
    const response = await EventService.saveAsDraft(sanitizePayload() as any);
    if (response && response.id) {
      form.value.id = response.id;

      for (const draftForm of Object.values(store.draftForms)) {
        const formPayload = JSON.parse(JSON.stringify(draftForm));
        formPayload.eventId = response.id;
        delete formPayload.id;

        await FormService.createForm(response.id, formPayload);
      }
      store.clearDraftForms(); 

      router.replace({ params: { id: response.id } }).catch(() => {});
    }
    
    // CLEAR TEMP DATA ON EXPLICIT SAVE
    store.clearTempData();
    originalStateStr.value = JSON.stringify(form.value) 
    
    showAlert("Success", "Event Saved As Draft", "blue")
    eventStatus.value = 'DRAFT'
    viewMode.value = 'preview'
  } catch (error: any) {
    const msg = error.response?.data?.message;
    const formattedMsg = Array.isArray(msg) ? msg.join('\n• ') : (msg || "Failed to save event.");
    showAlert("Error", formattedMsg, "red")
  } finally {
    isSaving.value = false
  }
}

const confirmPublish = async () => {
  isSaving.value = true
  try {
    const response = await EventService.publish(sanitizePayload() as any);
    if (response && response.id) {
      form.value.id = response.id;

      for (const draftForm of Object.values(store.draftForms)) {
        const formPayload = JSON.parse(JSON.stringify(draftForm));
        formPayload.eventId = response.id;
        delete formPayload.id;

        await FormService.createForm(response.id, formPayload);
      }
      store.clearDraftForms(); 

      router.replace({ params: { id: response.id } }).catch(() => {});
    }
    
    // CLEAR TEMP DATA ON EXPLICIT PUBLISH
    store.clearTempData();
    originalStateStr.value = JSON.stringify(form.value) 
    
    showAlert("Success", "Event Published Successfully", "blue")
    eventStatus.value = 'PUBLISHED'
    viewMode.value = 'preview'
  } catch (error: any) {
    const msg = error.response?.data?.message;
    const formattedMsg = Array.isArray(msg) ? msg.join(' | ') : (msg || "Failed to publish event.");
    showAlert("Error", formattedMsg, "red")
  } finally {
    showPublishModal.value = false
    isSaving.value = false
  }
}

const handleBackClick = () => {
  if (viewMode.value === 'preview') {
    router.back()
    return
  }
  
  if (JSON.stringify(form.value) !== originalStateStr.value) {
    showLeaveModal.value = true
  } else {
    if (eventStatus.value) {
      viewMode.value = 'preview'
    } else {
      router.back()
    }
  }
}

const confirmLeave = () => { 
  // CLEAR TEMP DATA ON EXPLICIT QUIT
  store.clearTempData(); 
  showLeaveModal.value = false;

  if (eventStatus.value) {
    if (originalStateStr.value) {
      form.value = JSON.parse(originalStateStr.value);
    }
    viewMode.value = 'preview';
  } else {
    router.back(); 
  }
}
</script>

<template>
  <div class="pt-4 pb-24 max-w-3xl mx-auto bg-[#FFFFFF] min-h-screen font-['Lato'] px-4">
    
    <div v-if="isTranslating" class="fixed inset-0 bg-[#FFFFFF]/70 backdrop-blur-sm z-50 flex flex-col items-center justify-center transition-opacity">
      <div class="w-10 h-10 border-4 border-[#CECBF6] border-t-[#534AB7] rounded-full animate-spin mb-3"></div>
      <p class="text-[#26215C] font-bold tracking-widest uppercase text-sm animate-pulse">Translating...</p>
    </div>

    <button @click="handleBackClick" class="mb-4 text-[#26215C]/70 hover:text-[#3C3489] flex items-center gap-1.5 text-[11px] font-bold transition-colors cursor-pointer">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
      {{ t.back }}
    </button>

    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-5 border-b border-[#CECBF6] pb-3 gap-3">
      <h1 class="text-[22px] font-['Nunito'] font-black text-[#26215C] tracking-tight leading-none">
        {{ viewMode === 'preview' ? 'Event Details' : t.detailsTitle }}
      </h1>

      <!-- <h1 class="text-[22px] font-['Nunito'] font-black text-[#26215C] tracking-tight leading-none">
          My Events
        </h1> -->
      
      <div class="flex items-center gap-2 w-full md:w-auto">
        <div class="flex bg-[#EEEDFE]/50 border border-[#CECBF6] p-0.5 rounded-lg w-full md:w-32">
          <button @click="viewLang = 'en'" :class="viewLang === 'en' ? 'bg-[#534AB7] shadow-sm text-[#FFFFFF]' : 'text-[#26215C]/70 hover:text-[#3C3489]'" class="flex-1 py-1 rounded-md text-[10px] font-black transition-colors">EN</button>
          <button @click="viewLang = 'th'" :class="viewLang === 'th' ? 'bg-[#534AB7] shadow-sm text-[#FFFFFF]' : 'text-[#26215C]/70 hover:text-[#3C3489]'" class="flex-1 py-1 rounded-md text-[10px] font-black transition-colors">TH</button>
        </div>
        
        <button v-if="viewMode !== 'preview'" @click="handleTranslate" :disabled="isTranslating" class="bg-[#534AB7] text-[#FFFFFF] px-2.5 py-1.5 rounded-lg text-[10px] font-bold shadow-sm hover:bg-[#3C3489] disabled:opacity-50 transition-all flex items-center gap-1 whitespace-nowrap cursor-pointer">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path></svg>
          <span class="hidden sm:inline">Auto Translate</span>
        </button>
      </div>
    </div>

    <div v-if="viewMode === 'preview'" class="animate-fade-in">
      <EventPreview 
        :event="form" 
        :viewLang="viewLang" 
        :availableForms="availableForms" 
        :isRegistered="isRegistered" 
        :isOrganizer="isCurrentUserOrganizer"
      />
    </div>

    <form v-else ref="eventFormRef" @submit.prevent>
      <EventForm :form="form" :t="t" :viewLang="viewLang" :viewMode="viewMode" />
    </form>

    <div v-if="viewMode === 'create' || viewMode === 'edit' || (viewMode === 'preview' && eventStatus === 'DRAFT')" class="fixed bottom-0 left-0 right-0 bg-[#FFFFFF] border-t border-[#CECBF6] p-3 flex justify-center shadow-[0_-4px_10px_-2px_rgba(0,0,0,0.03)] z-20">
      
      <div class="max-w-3xl w-full flex justify-center gap-4 md:gap-6 px-4 md:px-0">
        
        <template v-if="viewMode === 'preview' && eventStatus === 'DRAFT'">
          <button @click="viewMode = 'edit'" class="w-35 md:w-40 bg-[#EEEDFE] hover:bg-[#CECBF6] text-[#534AB7] hover:text-[#3C3489] border border-[#CECBF6] py-2.5 rounded-xl font-bold text-[11px] transition-colors cursor-pointer">Edit Draft</button>
        </template>
        
        <template v-if="viewMode === 'create' || viewMode === 'edit'">
          <button @click="saveAsDraft" :disabled="isSaving" class="w-35 md:w-40 bg-[#FFFFFF] hover:bg-[#EEEDFE] text-[#534AB7] hover:text-[#3C3489] border border-[#CECBF6] py-2.5 rounded-xl font-bold text-[11px] transition-colors disabled:opacity-50 cursor-pointer">Save Draft</button>
          <button @click="triggerPublish" :disabled="isSaving" class="w-35 md:w-40 bg-[#534AB7] hover:bg-[#3C3489] text-[#FFFFFF] py-2.5 rounded-xl font-bold text-[11px] transition-colors disabled:opacity-50 shadow-sm cursor-pointer">Publish</button>
        </template>

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
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
}
</style>