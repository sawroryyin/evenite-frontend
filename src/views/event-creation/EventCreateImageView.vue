<script setup lang="ts">
import { ref, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useEventCreationStore } from "../../stores/eventCreation.ts";
import { EventService } from "../../services/EventService.ts";
import LoadingOverlay from "../../components/LoadingOverlay.vue";
import ConfirmModal from "../../components/ConfirmModal.vue";

const router = useRouter();
const store = useEventCreationStore();

const isLoading = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

const selectedFile = ref<File | null>(null);
const previewUrl = ref<string | null>(null);

// Alert Modal State
const alertState = ref({
  show: false,
  title: '',
  description: '',
  theme: 'blue' as 'blue' | 'red',
  redirectOnClose: false
});

const showAlert = (title: string, description: string, theme: 'blue' | 'red' = 'blue', redirect = false) => {
  alertState.value = { show: true, title, description, theme, redirectOnClose: redirect };
};

const handleAlertConfirm = () => {
  alertState.value.show = false;
  if (alertState.value.redirectOnClose) {
    router.push({ name: 'create-manual' });
  }
};

const validateImage = (file: File) => {
  const validTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!validTypes.includes(file.type)) return "Unsupported image format";
  if (file.size > 5242880) return "File size must not exceed 5MB.";
  return null;
};

const handleFileSelect = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const error = validateImage(file);
  if (error) {
    showAlert("Validation Error", error, "red");
    if (fileInput.value) fileInput.value.value = ""; // Reset input so it doesn't break the preview
    return;
  }

  // Set file and create local preview
  selectedFile.value = file;
  previewUrl.value = URL.createObjectURL(file);
};

const clearImage = () => {
  selectedFile.value = null;
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
    previewUrl.value = null;
  }
  if (fileInput.value) fileInput.value.value = "";
};

const handleGenerate = async () => {
  if (!selectedFile.value) return;

  isLoading.value = true;

  try {
    const generatedData = await EventService.generateFromImage(selectedFile.value);
    store.setTempEventData(generatedData as any)
    router.push({ name: "create-manual" });
  } catch (error: any) {
    // Show in-app alert and set redirect flag to true
    showAlert("Error", "There was an error in creating an event, try creating manually.", "red", true);
  } finally {
    isLoading.value = false;
  }
};

// Clean up object URL when component unmounts to prevent memory leaks
onUnmounted(() => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
});
</script>

<template>
  <div class="p-4 max-w-md mx-auto font-['Lato'] relative">
    
    <LoadingOverlay v-if="isLoading" message="Analyzing Image & Generating Event..." />

    <button
      @click="router.back()"
      class="mb-5 text-[#26215C]/70 hover:text-[#3C3489] flex items-center gap-1.5 font-bold text-[11px] transition-colors 
      cursor-pointer uppercase tracking-wide"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
      </svg>
      Back
    </button>
    
    <div class="mb-5">
      <h1 class="text-[18px] font-black tracking-tight text-[#26215C] mb-1">Generate from Image</h1>
      <p class="text-[11px] text-[#26215C]/70 font-medium leading-snug">
        Upload an event poster or screenshot, and we'll extract the details for you.
      </p>
    </div>

    <input
      type="file"
      ref="fileInput"
      class="hidden"
      accept="image/jpeg, image/png, image/webp"
      @change="handleFileSelect"
    />

    <template v-if="!previewUrl">
      <button
        @click="fileInput?.click()"
        :disabled="isLoading"
        class="px-4 py-8 border-2 border-[#CECBF6] border-dashed rounded-xl w-full text-[12px] font-bold flex flex-col 
        items-center gap-2.5 text-[#26215C]/70 disabled:bg-[#EEEDFE]/50 disabled:text-[#26215C]/40 disabled:border-[#CECBF6]/50 
        transition-colors cursor-pointer hover:bg-[#EEEDFE]/50 hover:border-[#7F77DD] shadow-sm bg-[#FFFFFF]"
      >
        <svg class="w-7 h-7 text-[#7F77DD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
        </svg>
        Tap to Upload Poster
      </button>
    </template>

    <template v-else>
      <div class="relative w-full aspect-4/3 rounded-xl overflow-hidden border border-[#CECBF6] shadow-sm mb-4 bg-[#EEEDFE]/30">
        <img :src="previewUrl" class="w-full h-full object-contain" />
        <button 
          @click="clearImage" 
          class="absolute top-2 right-2 bg-[#FFFFFF]/90 backdrop-blur-sm text-red-600 px-3 py-1.5 rounded-lg text-[10px] 
          font-bold shadow-sm hover:bg-red-50 transition-colors border border-red-100 cursor-pointer"
        >
          Remove
        </button>
      </div>

      <button 
        @click="handleGenerate" 
        :disabled="isLoading"
        class="bg-[#534AB7] hover:bg-[#3C3489] text-[#FFFFFF] px-4 py-2.5 rounded-xl 
        w-full text-[12px] font-bold disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
      >
        Generate Event
      </button>
    </template>

    <ConfirmModal 
      v-if="alertState.show"
      :title="alertState.title"
      :description="alertState.description"
      :confirmTheme="alertState.theme"
      confirmText="OK"
      @confirm="handleAlertConfirm"
    />

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