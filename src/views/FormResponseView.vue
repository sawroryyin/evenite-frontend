<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { FormService } from '../services/FormService';
import { FormType } from '../types';

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
  try {
    summaryData.value = await FormService.getResponsesSummary(eventId, formType);
    individualData.value = await FormService.getResponses(eventId, formType);
    
    if (summaryData.value?.totalResponses === 0) {
      alert('No responses have been collected yet.');
      router.back();
    }
  } catch (error) {
    console.error('Failed to fetch responses', error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="pt-4 pb-24 max-w-3xl mx-auto bg-[#fafafa] min-h-screen font-['Lato'] px-4">
    
    <button @click="router.back()" class="mb-4 text-gray-500 hover:text-purple-700 flex items-center gap-1.5 text-[11px] font-bold transition-colors cursor-pointer">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
      BACK
    </button>

    <div class="border-b border-gray-200 pb-4 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 tracking-tight">{{ formType }} </h1>
        <p v-if="summaryData" class="text-sm text-purple-600 font-bold mt-1">{{ summaryData.totalResponses }} Participants</p>
      </div>

      <div v-if="!isLoading" class="flex bg-gray-200 p-1 rounded-xl w-full md:w-64 shrink-0 shadow-inner">
        <button @click="viewMode = 'SUMMARY'" :class="viewMode === 'SUMMARY' ? 'bg-white shadow-sm text-purple-700' : 'text-gray-500 hover:text-purple-600'" class="flex-1 py-2 rounded-lg text-xs font-black transition-all uppercase tracking-wider">
          Summary
        </button>
        <button @click="viewMode = 'INDIVIDUAL'" :class="viewMode === 'INDIVIDUAL' ? 'bg-white shadow-sm text-purple-700' : 'text-gray-500 hover:text-purple-600'" class="flex-1 py-2 rounded-lg text-xs font-black transition-all uppercase tracking-wider">
          Individual
        </button>
      </div>
    </div>

    <div v-if="isLoading" class="flex justify-center py-20">
      <div class="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
    </div>

    <div v-else-if="viewMode === 'SUMMARY' && summaryData" class="space-y-6 animate-fade-in">
      <div v-for="field in summaryData.summary" :key="field.formFieldId" class="p-5 bg-white border border-gray-200 rounded-2xl shadow-sm">
        <h3 class="font-bold text-gray-800 mb-3 text-sm">{{ field.label }}</h3>
        
        <div class="max-h-55 overflow-y-auto space-y-2 pr-2 custom-scrollbar bg-gray-50/50 p-2 rounded-xl shadow-inner border border-gray-100">
          <div v-for="(answer, idx) in field.answers" :key="idx" class="p-3 bg-white border border-gray-100 rounded-xl text-sm text-gray-700 shadow-sm flex items-center gap-3">
            <span class="text-xs font-bold text-gray-400 w-5">{{ idx as number + 1 }}.</span>
            {{ answer.value || '(No answer provided)' }}
          </div>
        </div>
        
      </div>
    </div>

    <div v-else-if="viewMode === 'INDIVIDUAL' && individualData?.responses.length" class="animate-fade-in">
      
      <div class="flex justify-between items-center pl-4 pr-4 pt-1 pb-1 rounded-2xl">
        <button @click="currentResponseIndex--" :disabled="currentResponseIndex === 0" class="flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-lg transition-colors" :class="currentResponseIndex === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-purple-600 hover:bg-purple-50'">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
          PREV
        </button>
        
        <div class="text-sm font-bold text-gray-700">
          <span class="text-purple-600">{{ currentResponseIndex + 1 }}</span> / {{ individualData.totalResponses }}
        </div>
        
        <button @click="currentResponseIndex++" :disabled="currentResponseIndex === individualData.responses.length - 1" class="flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-lg transition-colors" :class="currentResponseIndex === individualData.responses.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-purple-600 hover:bg-purple-50'">
          NEXT
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
        </button>
      </div>

      <div class="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm space-y-6">
        <div class="border-b border-gray-100 pb-4 mb-4">
          <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Participant ID</p>
          <p class="text-sm font-mono text-gray-600">{{ individualData.responses[currentResponseIndex].id }}</p>
        </div>

        <div v-for="answer in individualData.responses[currentResponseIndex].answers" :key="answer.formFieldId" class="space-y-1.5">
          <h4 class="text-sm font-bold text-gray-800">{{ answer.label }}</h4>
          <p class="p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-700">
            {{ answer.value || '(Blank)' }}
          </p>
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

/* Custom Scrollbar for the summary lists */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent; 
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1; 
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8; 
}
</style>