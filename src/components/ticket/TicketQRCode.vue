<script setup lang="ts">
import QrcodeVue from 'qrcode.vue';

defineProps<{
  token: string;
  size?: number;
}>();
</script>

<template>
  <div class="p-4 sm:p-5 bg-white border border-[#131B2B]/10 rounded-2xl shadow-sm inline-block font-['Lato']">
    <qrcode-vue 
      :value="token" 
      :size="size || 200" 
      level="H" 
      foreground="#131B2B" 
      background="#ffffff" 
    />
  </div>
</template>