<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useEventCreationStore } from "../stores/eventCreation";
import { EventService } from "../services/EventService";

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
      "There was an error in creating an event, try creating manually.";
  } finally {
    isLoading.value = false;
    if (fileInput.value) fileInput.value.value = ""; // Reset input
  }
};
</script>

<template>
  <div class="p-6 max-w-md mx-auto">
    <button
      @click="router.back()"
      class="mb-6 text-gray-500 hover:text-gray-800 flex items-center gap-2 font-medium transition cursor-pointer"
    >
      <svg
        class="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M10 19l-7-7m0 0l7-7m-7 7h18"
        ></path>
      </svg>
      Back
    </button>
    <div class="flex items-center gap-2 mb-6">
      <h1 class="text-2xl font-bold">Generate from Image</h1>
    </div>

    <p class="text-gray-600 mb-6">
      Upload an event poster or screenshot, and we'll extract the details for
      you.
    </p>

    <!-- Hidden File Input -->
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
      class=" px-4 py-8 border-2 border-black-800 border-dashed rounded-xl w-full font-bold flex flex-col items-center gap-2 disabled:bg-gray-400 disabled:border-gray-500 transition shadow hover:bg-gray-200"
    >
      <svg
        class="w-8 h-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
        ></path>
      </svg>
      {{ isLoading ? "Analyzing Image..." : "Click to Upload Poster" }}
    </button>

    <!-- Error Message & Manual Route Button -->
    <div
      v-if="errorMessage"
      class="mt-4 text-center animate-fade-in border border-red-200 bg-red-50 p-4 rounded-xl"
    >
      <p class="text-red-600 text-sm mb-4 font-medium">{{ errorMessage }}</p>

      <button
        @click="router.push({ name: 'create-detail' })"
        class="bg-gray-800 text-white px-4 py-3 rounded-lg w-full font-bold hover:bg-gray-700 transition shadow mb-2"
      >
        Create Manually Instead
      </button>

      <button
        @click="errorMessage = ''"
        class="text-gray-500 text-sm underline"
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
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
