<script setup lang="ts">
defineProps<{
  message?: string;
}>();
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-[#EEEDFE]/60 backdrop-blur-[2px] animate-fade-in font-['Lato']">
    <div class="flex flex-col items-center gap-4 p-6 rounded-2xl bg-[#FFFFFF] shadow-sm border border-[#CECBF6]">
      <svg class="animate-spin h-10 w-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <defs>
          <linearGradient id="spinner-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#534AB7" /> 
            <stop offset="100%" stop-color="#3C3489" /> 
          </linearGradient>
        </defs>
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="url(#spinner-grad)" stroke-width="4"></circle>
        <path class="opacity-75" fill="url(#spinner-grad)" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
        </path>
      </svg>
      <p class="text-[#26215C] font-['Nunito'] font-black text-[14px] animate-pulse tracking-wide">
        {{ message || 'Generating Event...' }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.2s ease-in-out;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>