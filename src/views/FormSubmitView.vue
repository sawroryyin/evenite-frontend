<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { FormService } from '../services/FormService';
import { FormType, type Form } from '../types';
import { EventService } from '../services/EventService';

const route = useRoute();
const router = useRouter();

const eventId = route.params.id as string;
const formType = route.params.formType as FormType;

const form = ref<Form | null>(null);
const isSubmitting = ref(false);

const answers = ref<Record<string, any>>({});

onMounted(async () => {
  try {
    const eventData = await EventService.getEventById(eventId);
    if (eventData.status !== 'PUBLISHED') {
      alert('This form is not accepting responses yet because the event is not published.');
      router.push(`/events/${eventId}`);
      return;
    }
    
    form.value = await FormService.getForm(eventId, formType);
    
    if (form.value && form.value.fields) {
      form.value.fields.forEach((field, index) => {
        const key = field.id || index.toString();
        if (field.type === 'CHECKBOX') answers.value[key] = [];
        else answers.value[key] = '';
      });
    }
  } catch (error) {
    alert('Form not found or unavailable.');
    router.push(`/events/${eventId}`);
  }
});

const submitForm = async () => {
  if (!form.value) return;

  // Basic Validation
  for (const [index, field] of form.value.fields.entries()) {
    const key = field.id || index.toString();
    const answer = answers.value[key];
    
    if (field.isRequired) {
      if (!answer || (Array.isArray(answer) && answer.length === 0)) {
        return alert(`Please fill out the required field: ${field.label}`);
      }
    }
  }

  isSubmitting.value = true;
  try {
    const payload = {
      answers: form.value.fields.map((field, index) => ({
        formFieldId: field.id || index.toString(),
        value: answers.value[field.id || index.toString()]
      }))
    };

    // This SINGLE call triggers your backend to save the answers AND register the user!
    await FormService.submitResponse(eventId, formType, payload);
    
    console.log("Submitting Payload:", payload);
    alert('Successfully submitted!');
    router.back();
    
  } catch (error) {
    console.error("Submission error:", error);
    alert('Error submitting form. Please try again.');
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="pt-4 pb-24 max-w-3xl mx-auto bg-[#fafafa] min-h-screen font-['Lato'] px-4" v-if="form">
    
    <button @click="router.back()" class="mb-4 text-gray-500 hover:text-purple-700 flex items-center gap-1.5 text-[11px] font-bold transition-colors cursor-pointer">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
      BACK TO EVENT
    </button>

    <div class="mb-6 border-b border-gray-200 pb-4">
      <h1 class="text-2xl font-bold text-gray-900 tracking-tight">{{ form.title || `${formType} Form` }}</h1>
      <p v-if="form.description" class="text-sm text-gray-600 mt-2">{{ form.description }}</p>
    </div>

    <form id="submit-form" @submit.prevent="submitForm" class="space-y-5 animate-fade-in">
      <div v-for="(field, index) in form.fields" :key="field.id || index" class="p-5 bg-white border border-gray-200 rounded-2xl shadow-sm">
        
        <label class="block font-bold text-gray-800 mb-3 text-sm">
          {{ field.label }} <span v-if="field.isRequired" class="text-red-500 ml-1">*</span>
        </label>
        
        <input 
          v-if="['TEXT', 'NUMBER', 'DATE'].includes(field.type)" 
          :type="field.type.toLowerCase()" 
          v-model="answers[field.id || index]"
          :required="field.isRequired"
          class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all" 
          placeholder="Your answer..." 
        />
        
        <textarea 
          v-if="field.type === 'TEXTAREA'" 
          v-model="answers[field.id || index]"
          :required="field.isRequired"
          class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm h-24 resize-none focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all" 
          placeholder="Your answer..."></textarea>
        
        <div v-if="field.type === 'CHOICE'" class="space-y-2.5">
          <label v-for="opt in field.options" :key="opt" class="flex items-center gap-3 cursor-pointer group">
            <input 
              type="radio" 
              :name="`choice-${field.id || index}`" 
              :value="opt" 
              v-model="answers[field.id || index]"
              :required="field.isRequired && !answers[field.id || index]"
              class="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500 cursor-pointer" 
            /> 
            <span class="text-sm text-gray-700 group-hover:text-purple-700 transition-colors">{{ opt }}</span>
          </label>
        </div>
        
        <div v-if="field.type === 'CHECKBOX'" class="space-y-2.5">
          <label v-for="opt in field.options" :key="opt" class="flex items-center gap-3 cursor-pointer group">
            <input 
              type="checkbox" 
              :value="opt" 
              v-model="answers[field.id || index]"
              class="w-4 h-4 text-purple-600 rounded-sm border-gray-300 focus:ring-purple-500 cursor-pointer" 
            /> 
            <span class="text-sm text-gray-700 group-hover:text-purple-700 transition-colors">{{ opt }}</span>
          </label>
        </div>

        <div v-if="field.type === 'RATING'" class="flex flex-wrap gap-2 mt-2">
          <label v-for="n in (field.maxRating || 5)" :key="n" class="cursor-pointer group">
            <input 
              type="radio" 
              :name="`rating-${field.id || index}`" 
              :value="n" 
              v-model="answers[field.id || index]"
              :required="field.isRequired && !answers[field.id || index]"
              class="peer sr-only" 
            />
            <div class="w-10 h-10 rounded-full border-2 border-gray-200 bg-gray-50 flex items-center justify-center text-sm font-bold text-gray-500 peer-checked:bg-purple-600 peer-checked:text-white peer-checked:border-purple-600 group-hover:border-purple-300 transition-all shadow-sm">
              {{ n }}
            </div>
          </label>
        </div>

      </div>
    </form>

    <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-3 flex justify-center shadow-[0_-4px_10px_-2px_rgba(0,0,0,0.03)] z-20">
      <div class="max-w-3xl w-full flex justify-center gap-4 md:gap-6 px-4 md:px-0">
        
        <button 
          type="submit" 
          form="submit-form"
          :disabled="isSubmitting"
          class="w-35 md:w-40 bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-2.5 rounded-xl font-bold text-[11px] transition-all shadow-sm"
        >
          {{ isSubmitting ? 'SUBMITTING...' : 'SUBMIT FORM' }}
        </button>
        
      </div>
    </div>

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