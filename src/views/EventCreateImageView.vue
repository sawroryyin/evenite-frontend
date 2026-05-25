<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useEventCreationStore } from "../stores/eventCreation";
import { EventService } from "../services/EventService";
import LoadingOverlay from "../components/LoadingOverlay.vue"; // Adjust path as needed

const router = useRouter();
const store = useEventCreationStore();

const isLoading = ref(false);
const errorMessage = ref("");
const fileInput = ref<HTMLInputElement | null>(null);

const validateImage = (file: File) => {
  const validTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!validTypes.includes(file.type)) return "Unsupported image format";
  if (file.size > 5242880) return "File size must not exceed 5MB.";
  return null;
};

const handleImageUpload = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const error = validateImage(file);
  if (error) {
    errorMessage.value = error;
    return;
  }

  errorMessage.value = "";
  isLoading.value = true;

  try {
    const generatedData = await EventService.generateFromImage(file);
    store.setDraftEvent(generatedData as any);
    router.push({ name: "create-manual" });
  } catch (error: any) {
    errorMessage.value =
      error.response?.data?.message ||
      "There was an error creating an event, try creating manually.";
  } finally {
    isLoading.value = false;
    if (fileInput.value) fileInput.value.value = ""; // Reset input
  }
};
</script>

<template>
  <div class="p-4 max-w-md mx-auto font-['Lato'] relative">
    
    <LoadingOverlay v-if="isLoading" message="Analyzing Image & Generating Event..." />

    <button
      @click="router.back()"
      class="mb-5 text-gray-500 hover:text-gray-800 flex items-center gap-1.5 font-bold text-[11px] transition cursor-pointer uppercase tracking-wide"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
      </svg>
      Back
    </button>
    
    <div class="mb-5">
      <h1 class="text-[18px] font-black tracking-tight text-gray-900 mb-1">Generate from Image</h1>
      <p class="text-[11px] text-gray-400 font-medium leading-snug">
        Upload an event poster or screenshot, and we'll extract the details for you.
      </p>
    </div>

    <input
      type="file"
      ref="fileInput"
      class="hidden"
      accept="image/jpeg, image/png, image/webp"
      @change="handleImageUpload"
    />

    <button
      v-if="!errorMessage"
      @click="fileInput?.click()"
      :disabled="isLoading"
      class="px-4 py-8 border-2 border-gray-300 border-dashed rounded-xl w-full text-[12px] font-bold flex flex-col items-center gap-2.5 text-gray-600 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 transition-colors cursor-pointer hover:bg-gray-50 hover:border-gray-400"
    >
      <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
      </svg>
      Tap to Upload Poster
    </button>

    <div
      v-if="errorMessage"
      class="mt-3 text-center animate-fade-in border border-red-100 bg-red-50 p-4 rounded-xl"
    >
      <p class="text-red-600 text-[11px] font-bold mb-3">{{ errorMessage }}</p>

      <button
        @click="router.push({ name: 'create-manual' })"
        class="bg-gray-800 text-white px-4 py-2.5 rounded-lg w-full text-[12px] font-bold hover:bg-gray-700 transition shadow-sm mb-2"
      >
        Create Manually Instead
      </button>

      <button
        @click="errorMessage = ''"
        class="text-gray-500 text-[11px] font-bold underline hover:text-gray-700"
      >
        Try uploading again
      </button>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
</style>