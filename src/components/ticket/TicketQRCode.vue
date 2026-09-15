<script setup lang="ts">
import QrcodeVue from 'qrcode.vue';

defineProps<{
  token: string;
  size?: number;
}>();
</script>

<template>
  <div class="p-4 sm:p-5 bg-white border border-[#CECBF6] rounded-2xl shadow-sm inline-block">
    <qrcode-vue 
      :value="token" 
      :size="size || 200" 
      level="H" 
      foreground="#26215C" 
      background="#ffffff" 
    />
  </div>
</template>