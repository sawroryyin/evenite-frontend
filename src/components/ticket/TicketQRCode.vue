<script setup lang="ts">
import QrcodeVue from 'qrcode.vue';

defineProps<{
  token: string;
  size?: number;
}>();
</script>

<template>
  <div class="p-3 bg-white border border-[#CECBF6] rounded-xl shadow-sm inline-block">
    <qrcode-vue 
      :value="token" 
      :size="size || 180" 
      level="H" 
      foreground="#26215C" 
      background="#ffffff" 
    />
  </div>
</template>