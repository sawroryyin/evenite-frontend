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
  <div class="pt-4 pb-24 max-w-3xl mx-auto bg-[#FFFFFF] min-h-screen font-['Lato'] px-4">
    
    <button @click="router.back()" class="mb-4 text-[#26215C]/70 hover:text-[#3C3489] flex items-center gap-1.5 text-[11px] font-bold transition-colors cursor-pointer">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
      BACK
    </button>

    <div class="border-b border-[#CECBF6] pb-4 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-[#26215C] tracking-tight">{{ formType }} </h1>
        <p v-if="summaryData" class="text-sm text-[#534AB7] font-bold mt-1">{{ summaryData.totalResponses }} Participants</p>
      </div>

      <div v-if="!isLoading" class="flex bg-[#EEEDFE]/50 border border-[#CECBF6] p-1 rounded-xl w-full md:w-64 shrink-0 shadow-sm">
        <button @click="viewMode = 'SUMMARY'" :class="viewMode === 'SUMMARY' ? 'bg-[#534AB7] shadow-sm text-[#FFFFFF]' : 'text-[#26215C]/70 hover:text-[#3C3489]'" class="flex-1 py-2 rounded-lg text-xs font-black transition-colors uppercase tracking-wider cursor-pointer">
          Summary
        </button>
        <button @click="viewMode = 'INDIVIDUAL'" :class="viewMode === 'INDIVIDUAL' ? 'bg-[#534AB7] shadow-sm text-[#FFFFFF]' : 'text-[#26215C]/70 hover:text-[#3C3489]'" class="flex-1 py-2 rounded-lg text-xs font-black transition-colors uppercase tracking-wider cursor-pointer">
          Individual
        </button>
      </div>
    </div>

    <div v-if="isLoading" class="flex justify-center py-20">
      <div class="w-10 h-10 border-4 border-[#CECBF6] border-t-[#534AB7] rounded-full animate-spin"></div>
    </div>

    <div v-else-if="viewMode === 'SUMMARY' && summaryData" class="space-y-6 animate-fade-in">
      
      <div v-if="summaryData.totalResponses === 0" class="text-center py-10 bg-[#FFFFFF] rounded-2xl border border-[#CECBF6] shadow-sm mt-2">
        <p class="text-[#26215C]/50 text-sm">No responses have been collected yet.</p>
      </div>

      <div v-else v-for="field in summaryData.summary" :key="field.formFieldId" class="p-5 bg-[#FFFFFF] border border-[#CECBF6] rounded-2xl shadow-sm">
        <h3 class="font-bold text-[#26215C] mb-3 text-sm">{{ field.label }}</h3>
        
        <div class="max-h-56 overflow-y-auto space-y-2 pr-2 custom-scrollbar bg-[#EEEDFE]/20 p-2 rounded-xl shadow-inner border border-[#CECBF6]">
          <div v-for="(answer, idx) in field.answers" :key="idx" class="p-3 bg-[#FFFFFF] border border-[#CECBF6] rounded-xl text-sm text-[#26215C]/80 shadow-sm flex items-center gap-3">
            <span class="text-xs font-bold text-[#26215C]/40 w-5">{{ idx as number + 1 }}.</span>
            {{ formatValue(answer.value) || '(No answer provided)' }}
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="viewMode === 'INDIVIDUAL' && individualData" class="animate-fade-in">
      
      <div v-if="individualData.totalResponses === 0" class="text-center py-10 bg-[#FFFFFF] rounded-2xl border border-[#CECBF6] shadow-sm mt-6">
        <p class="text-[#26215C]/50 text-sm">No responses have been collected yet.</p>
      </div>

      <div v-else-if="individualData.responses.length">
        <div class="flex justify-between items-center pl-4 pr-4 pt-1 pb-1 rounded-2xl">
          <button @click="currentResponseIndex--" :disabled="currentResponseIndex === 0" class="flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-lg transition-colors" :class="currentResponseIndex === 0 ? 'text-[#26215C]/30 cursor-not-allowed' : 'text-[#534AB7] hover:bg-[#EEEDFE] cursor-pointer'">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
            PREV
          </button>
          
          <div class="text-sm font-bold text-[#26215C]">
             <span class="text-[#534AB7]">Response {{ currentResponseIndex + 1 }}</span> of {{ individualData.totalResponses }}
          </div>
          
          <button @click="currentResponseIndex++" :disabled="currentResponseIndex === individualData.responses.length - 1" class="flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-lg transition-colors" :class="currentResponseIndex === individualData.responses.length - 1 ? 'text-[#26215C]/30 cursor-not-allowed' : 'text-[#534AB7] hover:bg-[#EEEDFE] cursor-pointer'">
            NEXT
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
          </button>
        </div>

        <div class="p-6 bg-[#FFFFFF] border border-[#CECBF6] rounded-2xl shadow-sm space-y-6 mt-2">

          <div v-for="answer in individualData.responses[currentResponseIndex].answers" :key="answer.formFieldId" class="space-y-1.5">
            <h4 class="text-sm font-bold text-[#26215C]">{{ answer.label }}</h4>
            <p class="p-3 bg-[#EEEDFE]/30 border border-[#CECBF6] rounded-xl text-sm text-[#26215C]/80">
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