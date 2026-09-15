<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { FormService } from '../../services/FormService';
import { FormType } from '../../types';

const route = useRoute();
const router = useRouter();

const eventId = route.params.id as string;
const formType = route.params.formType as FormType;

const viewMode = ref<'SUMMARY' | 'INDIVIDUAL'>('SUMMARY');
const summaryData = ref<any>(null);
const individualData = ref<any>(null);
const currentResponseIndex = ref(0);

const isLoading = ref(true);

onMounted(async () => {
  if (eventId === 'new') {
    summaryData.value = { totalResponses: 0, summary: [] };
    individualData.value = { totalResponses: 0, responses: [] };
    isLoading.value = false;
    return;
  }

  try {
    const existingForms = await FormService.getFormsByEventId(eventId);
    const formExists = existingForms.some((f: any) => f.type === formType);

    if (!formExists) {
      summaryData.value = { totalResponses: 0, summary: [] };
      individualData.value = { totalResponses: 0, responses: [] };
      isLoading.value = false;
      return;
    }

    summaryData.value = await FormService.getResponsesSummary(eventId, formType);
    individualData.value = await FormService.getResponses(eventId, formType);

  } catch (error: any) {
    console.error('Failed to fetch responses', error);
  } finally {
    isLoading.value = false;
  }
});

const formatValue = (value: any) => {
  if (value === null || value === undefined || value === '') return null;
  
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    return value.split('T')[0];
  }
  
  return value;
};
</script>

<template>
  <div class="pt-6 pb-28 max-w-3xl mx-auto bg-[#F4F4FA] min-h-screen font-['Lato'] px-5 relative">
    
    <button @click="router.back()" class="mb-5 text-[#26215C]/70 hover:text-[#3C3489] flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer py-1 pr-4">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
      BACK
    </button>

    <div class="border-b border-[#CECBF6] pb-5 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-5">
      <div>
        <h1 class="text-2xl font-['Nunito'] font-black text-[#26215C] tracking-tight">{{ formType }} </h1>
        <p v-if="summaryData" class="text-sm text-[#534AB7] font-bold mt-1.5">{{ summaryData.totalResponses }} Participants</p>
      </div>

      <div v-if="!isLoading" class="flex bg-[#FFFFFF] border border-[#CECBF6] p-1.5 rounded-xl w-full md:w-64 shrink-0 shadow-sm">
        <button @click="viewMode = 'SUMMARY'" :class="viewMode === 'SUMMARY' ? 'bg-[#534AB7] shadow-sm text-[#FFFFFF]' : 'text-[#26215C]/70 hover:text-[#3C3489] hover:bg-[#EEEDFE]'" class="flex-1 py-2.5 rounded-lg text-xs font-black transition-colors uppercase tracking-widest cursor-pointer">
          Summary
        </button>
        <button @click="viewMode = 'INDIVIDUAL'" :class="viewMode === 'INDIVIDUAL' ? 'bg-[#534AB7] shadow-sm text-[#FFFFFF]' : 'text-[#26215C]/70 hover:text-[#3C3489] hover:bg-[#EEEDFE]'" class="flex-1 py-2.5 rounded-lg text-xs font-black transition-colors uppercase tracking-widest cursor-pointer">
          Individual
        </button>
      </div>
    </div>

    <div v-if="isLoading" class="flex justify-center py-20">
      <div class="w-10 h-10 border-4 border-[#CECBF6] border-t-[#534AB7] rounded-full animate-spin"></div>
    </div>

    <div v-else-if="viewMode === 'SUMMARY' && summaryData" class="space-y-6 animate-fade-in mt-6">
      
      <div v-if="summaryData.totalResponses === 0" class="text-center py-16 bg-[#FFFFFF] rounded-2xl border border-[#CECBF6] shadow-sm">
        <p class="text-[#26215C]/50 text-sm font-semibold">No responses have been collected yet.</p>
      </div>

      <div v-else v-for="field in summaryData.summary" :key="field.formFieldId" class="p-5 md:p-6 bg-[#FFFFFF] border border-[#CECBF6] rounded-2xl shadow-sm">
        <h3 class="font-bold text-[#26215C] mb-4 text-sm">{{ field.label }}</h3>
        
        <div class="max-h-64 overflow-y-auto space-y-2.5 pr-2 custom-scrollbar bg-[#F4F4FA] p-3 rounded-xl shadow-inner border border-[#CECBF6]/50">
          <div v-for="(answer, idx) in field.answers" :key="idx" class="p-3.5 bg-[#FFFFFF] border border-[#CECBF6] rounded-xl text-sm font-semibold text-[#26215C]/80 shadow-sm flex items-center gap-3">
            <span class="text-xs font-black text-[#534AB7] w-6">{{ idx as number + 1 }}.</span>
            {{ formatValue(answer.value) || '(No answer provided)' }}
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="viewMode === 'INDIVIDUAL' && individualData" class="animate-fade-in mt-6">
      
      <div v-if="individualData.totalResponses === 0" class="text-center py-16 bg-[#FFFFFF] rounded-2xl border border-[#CECBF6] shadow-sm">
        <p class="text-[#26215C]/50 text-sm font-semibold">No responses have been collected yet.</p>
      </div>

      <div v-else-if="individualData.responses.length">
        <div class="flex justify-between items-center px-2 pt-1 pb-3 rounded-2xl">
          <button @click="currentResponseIndex--" :disabled="currentResponseIndex === 0" class="flex items-center gap-1.5 text-xs font-black px-4 py-2.5 rounded-xl transition-colors" :class="currentResponseIndex === 0 ? 'text-[#26215C]/30 cursor-not-allowed' : 'text-[#534AB7] hover:bg-[#FFFFFF] shadow-sm border border-[#CECBF6] cursor-pointer'">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"></path></svg>
            PREV
          </button>
          
          <div class="text-sm font-bold text-[#26215C] bg-[#FFFFFF] border border-[#CECBF6] px-4 py-2 rounded-xl shadow-sm">
             <span class="text-[#534AB7]">Response {{ currentResponseIndex + 1 }}</span> of {{ individualData.totalResponses }}
          </div>
          
          <button @click="currentResponseIndex++" :disabled="currentResponseIndex === individualData.responses.length - 1" class="flex items-center gap-1.5 text-xs font-black px-4 py-2.5 rounded-xl transition-colors" :class="currentResponseIndex === individualData.responses.length - 1 ? 'text-[#26215C]/30 cursor-not-allowed' : 'text-[#534AB7] hover:bg-[#FFFFFF] shadow-sm border border-[#CECBF6] cursor-pointer'">
            NEXT
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"></path></svg>
          </button>
        </div>

        <div class="p-6 md:p-8 bg-[#FFFFFF] border border-[#CECBF6] rounded-2xl shadow-sm space-y-6 mt-3">
          <div v-for="answer in individualData.responses[currentResponseIndex].answers" :key="answer.formFieldId" class="space-y-2">
            <h4 class="text-sm font-bold text-[#26215C]">{{ answer.label }}</h4>
            <p class="p-3.5 bg-[#F4F4FA] border border-[#CECBF6] rounded-xl text-sm font-semibold text-[#26215C]">
              {{ formatValue(answer.value) || '(Blank)' }}
            </p>
          </div>
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
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #CECBF6; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #7F77DD; }
</style>