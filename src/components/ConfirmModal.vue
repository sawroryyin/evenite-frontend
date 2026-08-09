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
  <div 
    class="fixed inset-0 bg-[#26215C]/30 backdrop-blur-[2px] flex items-center justify-center p-4 z-50 transition-opacity"
    @click.self="cancelText ? emit('cancel') : null"
  >
    <div class="bg-[#FFFFFF] p-6 rounded-2xl shadow-sm border border-[#CECBF6] max-w-sm w-full animate-fade-in font-['Lato']">
      <h3 class="text-[18px] font-['Nunito'] font-black text-[#26215C] mb-2">{{ title }}</h3>
      <p class="text-[13px] text-[#26215C]/70 mb-6 leading-relaxed">
        {{ description }}
      </p>
      <div class="flex justify-end gap-3">
        <button
          v-if="cancelText"
          @click="emit('cancel')"
          class="px-4 py-2.5 bg-[#EEEDFE]/50 hover:bg-[#EEEDFE] text-[#26215C]/70 hover:text-[#26215C] border border-[#CECBF6] font-bold text-[11px] uppercase tracking-wider rounded-xl transition-colors cursor-pointer">
          {{ cancelText }}
        </button>
        <button
          @click="emit('confirm')"
          :class="confirmTheme === 'red' ? 'bg-[#E3342F] hover:bg-[#CC1F1A] text-[#FFFFFF]' : 'bg-[#534AB7] hover:bg-[#3C3489] text-[#FFFFFF]'"
          class="px-4 py-2.5 font-bold text-[11px] uppercase tracking-wider rounded-xl shadow-sm transition-colors cursor-pointer">
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