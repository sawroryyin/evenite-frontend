<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { FormService } from '../../services/FormService';
import { RegistrationService } from '../../services/RegistrationService';
import api from '../../services/api';
import { type Form, type CreateFormFieldAnswerDto } from '../../types';
import ConfirmModal from '../../components/ConfirmModal.vue';
import LoadingOverlay from '../../components/LoadingOverlay.vue';

const route = useRoute();
const router = useRouter();
const eventId = route.params.id as string;

const form = ref<Form | null>(null);
const answers = ref<Record<string, any>>({});
const participantProfile = ref<Record<string, any>>({});
const isLoading = ref(true);
const isSubmitting = ref(false);

const alertState = ref({
  show: false,
  title: '',
  description: '',
  theme: 'blue' as 'blue' | 'red' 
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
    
    // 1. Fetch the participant profile for autofill (URS-015 Normal Flow Step 4)
    const profileResponse = await api.get('/users/me/participant-profile');
    participantProfile.value = profileResponse.data;

    // 2. Fetch the registration form for this specific event
    const formData = await FormService.getForm(eventId, 'REGISTRATION');
    form.value = formData;

    // 3. Initialize answers and auto-fill if applicable
    formData.fields.forEach((field: any) => {
      // Initialize with correct type
      if (field.type === 'CHECKBOX' || field.type === 'CHOICE') {
        answers.value[field.id] = field.type === 'CHECKBOX' ? [] : null;
      } else {
        answers.value[field.id] = null;
      }

      // Auto-fill logic based on autoFillKey
      if (field.autoFillKey && participantProfile.value[field.autoFillKey]) {
        answers.value[field.id] = participantProfile.value[field.autoFillKey];
      }
    });

  } catch (error: any) {
    console.error('Failed to load registration data:', error);
    showAlert('Error', 'Unable to load the registration form. It may not exist or you might already be registered.', 'red');
  } finally {
    isLoading.value = false;
  }
});

const validateForm = (): boolean => {
  if (!form.value) return false;
  
  for (const field of form.value.fields) {
    if (field.isRequired) {
      const value = answers.value[field.id!];
      const isEmpty = value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0);
      
      if (isEmpty) {
        showAlert('Required Field Missing', `Please fill out the required field: "${field.label}"`, 'red');
        return false; // Exception Flow C8
      }
    }
  }
  return true;
};

const submitRegistration = () => {
  if (!validateForm()) return;

  // Normal Flow Step 8: Confirmation dialogue before submission
  showConfirm(
    'Confirm Registration',
    'Are you sure you want to register for this event?',
    'Confirm',
    'blue',
    async () => {
      confirmState.value.show = false;
      await processRegistration();
    }
  );
};

const processRegistration = async () => {
  isSubmitting.value = true;
  
  // Format answers to match CreateFormFieldAnswerDto[]
  const formattedAnswers: CreateFormFieldAnswerDto[] = Object.keys(answers.value).map(fieldId => ({
    formFieldId: fieldId,
    value: answers.value[fieldId]
  }));

  try {
    // Normal Flow Steps 10-12
    const ticketDetails = await RegistrationService.registerForEvent(eventId, formattedAnswers);
    
    showAlert('Registration Successful', 'Your digital ticket has been generated.', 'blue');
    
    // Route user to the Ticket Detail Page
    setTimeout(() => {
      router.push(`/events/${eventId}/tickets/${ticketDetails.id}`);
    }, 1500);

  } catch (error: any) {
    const errorMsg = error.response?.data?.message || 'An unexpected error occurred while processing your registration. Please try again later.';
    showAlert('Registration Failed', errorMsg, 'red'); // Exception Flows F12 / G11
  } finally {
    isSubmitting.value = false;
  }
};

const handleCancel = () => {
  // Alternate Flow B6-B8
  showConfirm(
    'Cancel Registration',
    'Are you sure you want to cancel? Any unsaved data will be lost.',
    'Yes',
    'red',
    () => {
      confirmState.value.show = false;
      router.push(`/event/${eventId}`);
    }
  );
};

const showAlert = (title: string, description: string, theme: 'blue' | 'red' = 'blue') => {
  alertState.value = { show: true, title, description, theme };
};

const showConfirm = (title: string, description: string, confirmText: string, theme: 'blue' | 'red', action: () => void) => {
  confirmState.value = { show: true, title, description, confirmText, theme, onConfirm: action };
};
</script>

<template>
  <div class="pt-4 pb-24 max-w-3xl mx-auto bg-[#FFFFFF] min-h-screen font-['Lato'] px-4">
    <LoadingOverlay v-if="isLoading || isSubmitting" />

    <template v-if="!isLoading && form">
      <div class="mb-5 border-b border-[#CECBF6] pb-3">
        <h1 class="text-[22px] font-['Nunito'] font-black text-[#26215C] tracking-tight leading-none">
          {{ form.title || 'Event Registration' }}
        </h1>
        <p v-if="form.description" class="text-sm text-[#26215C]/70 mt-1">{{ form.description }}</p>
      </div>

      <div class="space-y-4 animate-fade-in">
        <div v-for="field in form.fields" :key="field.id" class="p-5 bg-[#FFFFFF] border border-[#CECBF6] rounded-2xl shadow-sm">
          <div class="flex justify-between items-start mb-3">
            <label class="block font-bold text-[#26215C] text-sm">
              {{ field.label }} <span v-if="field.isRequired" class="text-red-500 ml-1">*</span>
            </label>
            
            <span v-if="field.autoFillKey && participantProfile[field.autoFillKey]" class="flex items-center gap-1 bg-[#EEEDFE] text-[#534AB7] px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border border-[#CECBF6] shadow-sm">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              Auto-filled
            </span>
          </div>
          
          <!-- Text, Number, Date Inputs -->
          <input 
            v-if="['TEXT', 'NUMBER', 'DATE'].includes(field.type)" 
            :type="field.type.toLowerCase()" 
            v-model="answers[field.id!]"
            class="w-full p-3 bg-[#EEEDFE]/30 border border-[#CECBF6] rounded-xl text-sm text-[#26215C] focus:outline-none focus:border-[#7F77DD] transition-all" 
            placeholder="Your answer..." 
          />
          
          <!-- Textarea Input -->
          <textarea 
            v-if="field.type === 'TEXTAREA'" 
            v-model="answers[field.id!]"
            class="w-full p-3 bg-[#EEEDFE]/30 border border-[#CECBF6] rounded-xl text-sm h-24 resize-none text-[#26215C] focus:outline-none focus:border-[#7F77DD] transition-all" 
            placeholder="Your answer...">
          </textarea>
          
          <!-- Choice (Radio) -->
          <div v-if="field.type === 'CHOICE'" class="space-y-2.5">
            <label v-for="opt in field.options" :key="opt" class="flex items-center gap-3 cursor-pointer group">
              <div class="relative flex items-center">
                <input 
                  type="radio" 
                  :name="field.id" 
                  :value="opt" 
                  v-model="answers[field.id!]"
                  class="peer sr-only" 
                />
                <div class="w-4 h-4 rounded-full border-2 border-[#CECBF6] bg-[#EEEDFE]/30 peer-checked:border-[#534AB7] peer-checked:bg-[#534AB7] transition-all"></div>
                <div class="absolute inset-0 m-auto w-1.5 h-1.5 rounded-full bg-white opacity-0 peer-checked:opacity-100 transition-opacity"></div>
              </div>
              <span class="text-sm text-[#26215C]/80 group-hover:text-[#26215C] transition-colors">{{ opt }}</span>
            </label>
          </div>
          
          <!-- Checkbox -->
          <div v-if="field.type === 'CHECKBOX'" class="space-y-2.5">
            <label v-for="opt in field.options" :key="opt" class="flex items-center gap-3 cursor-pointer group">
              <div class="relative flex items-center">
                <input 
                  type="checkbox" 
                  :value="opt" 
                  v-model="answers[field.id!]"
                  class="peer w-4 h-4 text-[#534AB7] bg-[#EEEDFE]/30 border border-[#CECBF6] rounded focus:ring-2 focus:ring-[#7F77DD]/30 transition-all cursor-pointer appearance-none checked:bg-[#534AB7] checked:border-[#534AB7]" 
                />
                <svg class="absolute w-3 h-3 text-white top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <span class="text-sm text-[#26215C]/80 group-hover:text-[#26215C] transition-colors">{{ opt }}</span>
            </label>
          </div>

          <!-- Rating -->
          <div v-if="field.type === 'RATING'" class="flex flex-wrap gap-2 mt-3">
            <label v-for="n in (field.maxRating || 5)" :key="n" class="cursor-pointer group">
              <input 
                type="radio" 
                :name="field.id" 
                :value="n" 
                v-model="answers[field.id!]"
                class="peer sr-only" 
              />
              <div class="w-10 h-10 rounded-full border-2 border-[#CECBF6] bg-[#EEEDFE]/30 flex items-center justify-center text-sm font-bold text-[#26215C]/40 peer-checked:bg-[#534AB7] peer-checked:text-white peer-checked:border-[#534AB7] hover:border-[#7F77DD] transition-all">
                {{ n }}
              </div>
            </label>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="fixed bottom-0 left-0 right-0 bg-[#FFFFFF] border-t border-[#CECBF6] p-3 flex justify-center shadow-[0_-4px_10px_-2px_rgba(0,0,0,0.03)] z-20">
        <div class="max-w-3xl w-full flex justify-center gap-4 md:gap-6 px-4 md:px-0">
          <button @click="handleCancel" class="w-35 md:w-40 bg-[#FFFFFF] border border-[#CECBF6] hover:bg-red-50 text-red-500 hover:text-red-700 py-2.5 rounded-xl font-bold text-[11px] transition-colors cursor-pointer">
            CANCEL
          </button>
          <button @click="submitRegistration" class="w-35 md:w-40 bg-[#534AB7] hover:bg-[#3C3489] text-[#FFFFFF] py-2.5 rounded-xl font-bold text-[11px] transition-colors shadow-sm cursor-pointer">
            SUBMIT
          </button>
        </div>
      </div>
    </template>

    <!-- Modals -->
    <ConfirmModal 
      v-if="alertState.show"
      :title="alertState.title"
      :description="alertState.description"
      :confirmTheme="alertState.theme"
      confirmText="OK"
      @confirm="alertState.show = false"
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