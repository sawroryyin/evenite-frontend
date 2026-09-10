<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { FormService } from '../../services/FormService';
import { RegistrationService } from '../../services/RegistrationService';
import { EventService } from '../../services/EventService';
import api from '../../services/api';
import { FormType, type Form, type CreateFormFieldAnswerDto, type EventData } from '../../types';
import ConfirmModal from '../../components/ConfirmModal.vue';
import LoadingOverlay from '../../components/LoadingOverlay.vue';

const route = useRoute();
const router = useRouter();

const eventId = route.params.id as string;
const formType = route.params.formType as FormType;

const form = ref<Form | null>(null);
const isLoading = ref(true);
const isSubmitting = ref(false);

const answers = ref<Record<string, any>>({});
const initialAnswersStr = ref<string>('');
const participantProfile = ref<Record<string, any>>({});

const alertState = ref({
  show: false,
  title: '',
  description: '',
  theme: 'blue' as 'blue' | 'red',
  onConfirm: undefined as (() => void) | undefined
});

const confirmState = ref({
  show: false,
  title: '',
  description: '',
  confirmText: '',
  theme: 'blue' as 'blue' | 'red',
  onConfirm: () => {}
});

onMounted(async () => {
  try {
    isLoading.value = true;
    const eventData: EventData = await EventService.getEventById(eventId);
    
    if (!['PUBLISHED', 'ONGOING', 'CONCLUDED'].includes(eventData.status as string)) {
      showAlert('Event Unavailable', 'This form is not accepting responses at this time.', 'red');
      
      setTimeout(() => router.replace(`/event/${eventId}`), 2000);
      return;
    }
    
    form.value = await FormService.getForm(eventId, formType);
    
    try {
      const { data } = await api.get('/users/me/participant-profile');
      participantProfile.value = data;
    } catch (profileError) {
      console.warn("Could not load user profile for auto-fill. Defaulting to blank form.");
    }

    if (form.value && form.value.fields) {
      form.value.fields.forEach((field, index) => {
        const key = field.id || index.toString();
        
        if (field.autoFillKey && participantProfile.value[field.autoFillKey]) {
          answers.value[key] = participantProfile.value[field.autoFillKey];
        } else {
          answers.value[key] = field.type === 'CHECKBOX' ? [] : null;
        }
      });
      initialAnswersStr.value = JSON.stringify(answers.value);
    }
  } catch (error) {
    showAlert('Error', 'Form not found or unavailable.', 'red');
    
    setTimeout(() => router.replace(`/event/${eventId}`), 2000);
  } finally {
    isLoading.value = false;
  }
});

const validateForm = (): boolean => {
  if (!form.value) return false;
  
  for (const [index, field] of form.value.fields.entries()) {
    if (field.isRequired) {
      const key = field.id || index.toString();
      const value = answers.value[key];
      const isEmpty = value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0);
      
      if (isEmpty) {
        showAlert('Required Field Missing', `Please fill out the required field: "${field.label}"`, 'red');
        return false; 
      }
    }
  }
  return true;
};

const handlePreSubmit = () => {
  if (!validateForm()) return;

  const actionText = formType === 'REGISTRATION' ? 'register for this event' : 'submit this form';
  
  showConfirm(
    'Confirm Submission',
    `Are you sure you want to ${actionText}?`,
    'Confirm',
    'blue',
    async () => {
      confirmState.value.show = false;
      await processSubmission();
    }
  );
};

const processSubmission = async () => {
  if (!form.value) return;
  isSubmitting.value = true;

  try {
    const formattedAnswers: CreateFormFieldAnswerDto[] = form.value.fields.map((field, index) => {
      const key = field.id || index.toString();
      const rawValue = answers.value[key];
      let finalValue: any;

      if (field.type === 'CHECKBOX') {
        finalValue = Array.isArray(rawValue) ? rawValue : (rawValue ? [rawValue] : []);
      } else if (field.type === 'CHOICE') {
        finalValue = rawValue ? [rawValue] : [];
      } else if (field.type === 'NUMBER' || field.type === 'RATING') {
        finalValue = rawValue ? Number(rawValue) : null;
      } else {
        finalValue = rawValue ? String(rawValue) : '';
      }

      return {
        formFieldId: key,
        value: finalValue
      };
    });

    if (formType === 'REGISTRATION') {
      const ticketDetails = await RegistrationService.registerForEvent(eventId, formattedAnswers);
      showAlert('Registration Successful', 'Your digital ticket has been generated.', 'blue');
      
      setTimeout(() => router.replace(`/events/${eventId}/tickets/${ticketDetails.id}`), 5000);
    } else {
      await FormService.submitResponse(eventId, formType, { answers: formattedAnswers });
      showAlert('Success', 'Form submitted successfully!', 'blue');
      setTimeout(() => router.back(), 1500);
    }
    
  } catch (error: any) {
    console.error("Submission error details:", error.response?.data || error);
    
    // Check if the backend is down (no response)
    const isNetworkError = !error.response; 
    const errorMsg = error.response?.data?.message || 'An error occurred while processing your submission. Please try again.';
    
    // Redirect on network errors OR seat capacity errors
    if (isNetworkError || errorMsg.includes('All seats are fully taken') || errorMsg.includes('seat')) {
      showAlert('Submission Failed', errorMsg, 'red', () => {
        router.replace(`/event/${eventId}`); 
      });
    } else {
      showAlert('Submission Failed', errorMsg, 'red');
    }
  } finally {
    isSubmitting.value = false;
  }
};

const handleCancel = () => {
  const currentAnswersStr = JSON.stringify(answers.value);

  if (currentAnswersStr === initialAnswersStr.value) {
    router.back();
    return;
  }

  showConfirm(
    'Cancel',
    'Are you sure you want to cancel? Any unsaved data will be lost.',
    'Yes',
    'red',
    () => {
      confirmState.value.show = false;
      router.back();
    }
  );
};

const showAlert = (title: string, description: string, theme: 'blue' | 'red' = 'blue', onConfirm?: () => void) => {
  alertState.value = { show: true, title, description, theme, onConfirm };
};

const handleAlertConfirm = () => {
  alertState.value.show = false;
  if (alertState.value.onConfirm) {
    const callback = alertState.value.onConfirm;
    alertState.value.onConfirm = undefined; // Clear before executing
    callback();
  }
};

const showConfirm = (title: string, description: string, confirmText: string, theme: 'blue' | 'red', action: () => void) => {
  confirmState.value = { show: true, title, description, confirmText, theme, onConfirm: action };
};
</script>

<template>
  <div class="pt-4 pb-24 max-w-3xl mx-auto bg-[#FFFFFF] min-h-screen font-['Lato'] px-4">
    <LoadingOverlay 
      v-if="isLoading || isSubmitting" 
      :message="isSubmitting ? 'Registering...' : 'Loading Form...'" 
    />
    
    <template v-if="!isLoading && form">
      <button @click="handleCancel" class="mb-4 text-[#26215C]/70 hover:text-[#3C3489] flex items-center gap-1.5 text-[11px] font-bold transition-colors cursor-pointer">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        BACK TO EVENT
      </button>

      <div class="mb-6 border-b border-[#CECBF6] pb-4">
        <h1 class="text-[22px] font-['Nunito'] font-black text-[#26215C] tracking-tight leading-none">
          {{ form.title || `${formType} Form` }}
        </h1>
        <p v-if="form.description" class="text-sm text-[#26215C]/70 mt-2">{{ form.description }}</p>
      </div>

      <form id="submit-form" @submit.prevent="handlePreSubmit" class="space-y-5 animate-fade-in">
        <div v-for="(field, index) in form.fields" :key="field.id || index" class="p-5 bg-[#FFFFFF] border border-[#CECBF6] rounded-2xl shadow-sm">
          
          <div class="flex justify-between items-start mb-3">
            <label class="block font-bold text-[#26215C] text-sm">
              {{ field.label }} <span v-if="field.isRequired" class="text-red-500 ml-1">*</span>
            </label>
            
            <span v-if="field.autoFillKey && participantProfile[field.autoFillKey]" class="flex items-center gap-1 bg-[#EEEDFE] text-[#534AB7] px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border border-[#CECBF6] shadow-sm">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              Auto-filled
            </span>
          </div>
          
          <input 
            v-if="['TEXT', 'NUMBER', 'DATE'].includes(field.type)" 
            :type="field.type.toLowerCase()" 
            v-model="answers[field.id || index]"
            class="w-full p-3 bg-[#EEEDFE]/30 border border-[#CECBF6] rounded-xl text-sm focus:outline-none focus:border-[#7F77DD] focus:ring-1 focus:ring-[#7F77DD] text-[#26215C] transition-all" 
            placeholder="Your answer..." 
          />
          
          <textarea 
            v-if="field.type === 'TEXTAREA'" 
            v-model="answers[field.id || index]"
            class="w-full p-3 bg-[#EEEDFE]/30 border border-[#CECBF6] rounded-xl text-sm h-24 resize-none focus:outline-none focus:border-[#7F77DD] focus:ring-1 focus:ring-[#7F77DD] text-[#26215C] transition-all" 
            placeholder="Your answer..."></textarea>
          
          <div v-if="field.type === 'CHOICE'" class="space-y-2.5">
            <label v-for="opt in field.options" :key="opt" class="flex items-center gap-3 cursor-pointer group">
              <div class="relative flex items-center">
                <input 
                  type="radio" 
                  :name="`choice-${field.id || index}`" 
                  :value="opt" 
                  v-model="answers[field.id || index]"
                  class="peer sr-only" 
                />
                <div class="w-4 h-4 rounded-full border-2 border-[#CECBF6] bg-[#EEEDFE]/30 peer-checked:border-[#534AB7] peer-checked:bg-[#534AB7] transition-all"></div>
                <div class="absolute inset-0 m-auto w-1.5 h-1.5 rounded-full bg-white opacity-0 peer-checked:opacity-100 transition-opacity"></div>
              </div>
              <span class="text-sm text-[#26215C]/80 group-hover:text-[#26215C] transition-colors">{{ opt }}</span>
            </label>
          </div>
          
          <div v-if="field.type === 'CHECKBOX'" class="space-y-2.5">
            <label v-for="opt in field.options" :key="opt" class="flex items-center gap-3 cursor-pointer group">
              <div class="relative flex items-center">
                <input 
                  type="checkbox" 
                  :value="opt" 
                  v-model="answers[field.id || index]"
                  class="peer w-4 h-4 text-[#534AB7] bg-[#EEEDFE]/30 border border-[#CECBF6] rounded focus:ring-2 focus:ring-[#7F77DD]/30 transition-all cursor-pointer appearance-none checked:bg-[#534AB7] checked:border-[#534AB7]" 
                />
                <svg class="absolute w-3 h-3 text-white top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <span class="text-sm text-[#26215C]/80 group-hover:text-[#26215C] transition-colors">{{ opt }}</span>
            </label>
          </div>

          <div v-if="field.type === 'RATING'" class="flex flex-wrap gap-2 mt-2">
            <label v-for="n in (field.maxRating || 5)" :key="n" class="cursor-pointer group">
              <input 
                type="radio" 
                :name="`rating-${field.id || index}`" 
                :value="n" 
                v-model="answers[field.id || index]"
                class="peer sr-only" 
              />
              <div class="w-10 h-10 rounded-full border-2 border-[#CECBF6] bg-[#EEEDFE]/30 flex items-center justify-center text-sm font-bold text-[#26215C]/50 peer-checked:bg-[#534AB7] peer-checked:text-[#FFFFFF] peer-checked:border-[#534AB7] group-hover:border-[#7F77DD] transition-all shadow-sm">
                {{ n }}
              </div>
            </label>
          </div>

        </div>
      </form>

      <div class="fixed bottom-0 left-0 right-0 bg-[#FFFFFF] border-t border-[#CECBF6] p-3 flex justify-center shadow-[0_-4px_10px_-2px_rgba(0,0,0,0.03)] z-20">
        <div class="max-w-3xl w-full flex justify-center gap-4 md:gap-6 px-4 md:px-0">
          <button @click="handleCancel" class="w-35 md:w-40 bg-[#FFFFFF] border border-[#CECBF6] hover:bg-red-50 text-red-500 hover:text-red-700 py-2.5 rounded-xl font-bold text-[11px] transition-colors cursor-pointer">
            CANCEL
          </button>
          <button 
            type="submit" 
            form="submit-form"
            :disabled="isSubmitting"
            class="w-35 md:w-40 bg-[#534AB7] hover:bg-[#3C3489] text-[#FFFFFF] py-2.5 rounded-xl font-bold text-[11px] transition-colors shadow-sm cursor-pointer disabled:opacity-50"
          >
            {{ isSubmitting ? 'SUBMITTING...' : 'SUBMIT' }}
          </button>
        </div>
      </div>
    </template>

    <ConfirmModal 
      v-if="alertState.show"
      :title="alertState.title"
      :description="alertState.description"
      :confirmTheme="alertState.theme"
      confirmText="OK"
      @confirm="handleAlertConfirm"
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

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.2s ease-in-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>