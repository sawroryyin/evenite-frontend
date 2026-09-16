<script setup lang="ts">
defineProps<{
  title: string;
  description: string;
  confirmText: string;
  cancelText?: string;
  confirmTheme?: "blue" | "red";
}>();

const emit = defineEmits(["confirm", "cancel"]);
</script>

<template>
  <!-- UI UX Update: Increased background overlay opacity and blur for better depth -->
  <div 
    class="fixed inset-0 bg-[#26215C]/40 backdrop-blur-sm flex items-center justify-center p-5 z-[60] transition-opacity"
    @click.self="cancelText ? emit('cancel') : null"
  >
    <!-- UI UX Update: Upgraded to rounded-3xl and shadow-2xl to match the FormDetailView modal -->
    <div class="bg-[#FFFFFF] p-6 md:p-8 rounded-3xl shadow-2xl border border-[#CECBF6] max-w-sm w-full animate-fade-in font-['Lato']">
      
      <!-- UI UX Update: Standardized to Nunito text-xl -->
      <h3 class="text-xl font-['Nunito'] font-black text-[#26215C] mb-3 tracking-tight">{{ title }}</h3>
      
      <!-- UI UX Update: Bumped to text-sm font-semibold for better readability -->
      <p class="text-sm font-semibold text-[#26215C]/70 mb-8 leading-relaxed">
        {{ description }}
      </p>
      
      <div class="flex justify-end gap-3 w-full">
        <!-- UI UX Update: Buttons use flex-1 on mobile for full-width touch targets, standard sizing on larger screens -->
        <button
          v-if="cancelText"
          @click="emit('cancel')"
          class="flex-1 sm:flex-none px-5 py-3 bg-[#F4F4FA] hover:bg-[#EEEDFE] text-[#26215C]/80 hover:text-[#26215C] border border-[#CECBF6] font-bold text-xs uppercase tracking-widest rounded-xl transition-colors cursor-pointer shadow-sm">
          {{ cancelText }}
        </button>
        <button
          @click="emit('confirm')"
          :class="confirmTheme === 'red' ? 'bg-[#E3342F] hover:bg-[#CC1F1A] text-[#FFFFFF] border-[#CC1F1A]' : 'bg-[#534AB7] hover:bg-[#3C3489] text-[#FFFFFF] border-[#CECBF6]'"
          class="flex-1 sm:flex-none px-5 py-3 font-bold text-xs uppercase tracking-widest rounded-xl shadow-sm transition-colors cursor-pointer border">
          {{ confirmText }}
        </button>
      </div>
      
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.96) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>