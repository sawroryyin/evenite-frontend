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

onMounted(async () => {
  try {
    // Fetch both to have them ready, or fetch on tab switch to save bandwidth
    summaryData.value = await FormService.getResponsesSummary(eventId, formType);
    individualData.value = await FormService.getResponses(eventId, formType);
    
    if (summaryData.value?.totalResponses === 0) {
      alert('No responses have been collected yet.');
      router.push(`/events/${eventId}/forms/${formType}`);
    }
  } catch (error) {
    console.error('Failed to fetch responses', error);
  }
});
</script>

<template>
  <div class="p-6 max-w-4xl mx-auto">
    <div class="flex justify-between items-center mb-6">
      <button @click="router.push(`/events/${eventId}/forms/${formType}`)" class="btn btn-secondary">Back to Form</button>
      <div class="flex gap-2">
        <button @click="viewMode = 'SUMMARY'" :class="viewMode === 'SUMMARY' ? 'bg-blue-600 text-white' : 'bg-gray-200'" class="px-4 py-2 rounded">Summary</button>
        <button @click="viewMode = 'INDIVIDUAL'" :class="viewMode === 'INDIVIDUAL' ? 'bg-blue-600 text-white' : 'bg-gray-200'" class="px-4 py-2 rounded">Individual</button>
      </div>
    </div>

    <div v-if="viewMode === 'SUMMARY' && summaryData" class="space-y-6">
      <h2 class="text-2xl font-bold">{{ summaryData.totalResponses }} Total Responses</h2>
      
      <div v-for="field in summaryData.summary" :key="field.formFieldId" class="border rounded p-4">
        <h3 class="font-semibold text-lg mb-2">{{ field.label }}</h3>
        <div class="max-h-48 overflow-y-auto space-y-2 bg-gray-50 p-2 rounded">
          <div v-for="(answer, idx) in field.answers" :key="idx" class="p-2 border-b bg-white text-sm">
            {{ answer.value || '(No answer)' }}
          </div>
        </div>
      </div>
    </div>

    <div v-if="viewMode === 'INDIVIDUAL' && individualData?.responses.length" class="space-y-4">
      <div class="flex justify-between items-center bg-gray-100 p-3 rounded">
        <button @click="currentResponseIndex--" :disabled="currentResponseIndex === 0" class="btn bg-gray-300 px-3 py-1 rounded disabled:opacity-50">⬅️ Backward</button>
        <span class="font-semibold">Response {{ currentResponseIndex + 1 }} of {{ individualData.totalResponses }}</span>
        <button @click="currentResponseIndex++" :disabled="currentResponseIndex === individualData.responses.length - 1" class="btn bg-gray-300 px-3 py-1 rounded disabled:opacity-50">Forward ➡️</button>
      </div>

      <div class="border rounded p-6 bg-white space-y-6">
        <div v-for="answer in individualData.responses[currentResponseIndex].answers" :key="answer.formFieldId">
          <h4 class="font-semibold text-gray-700">{{ answer.label }}</h4>
          <p class="mt-1 p-2 bg-gray-50 rounded border">{{ answer.value || '(Blank)' }}</p>
        </div>
      </div>
    </div>
  </div>
</template>