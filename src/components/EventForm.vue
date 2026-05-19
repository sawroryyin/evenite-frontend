<script setup lang="ts">
import FormBanner from './FormBanner.vue'
import FormBasicInfo from './FormBasicInfo.vue'
import FormDateLocation from './FormDateLocation.vue'
import FormAgenda from './FormAgenda.vue'
import FormCatering from './FormCatering.vue'
import FormContact from './FormContact.vue'

defineProps<{ 
  form: any; 
  t: any; 
  viewLang: 'en' | 'th';
  viewMode: 'create' | 'edit'
}>()
</script>

<template>
  <div class="space-y-8">
    <!-- Notice we are now passing :viewMode="viewMode" to satisfy TypeScript -->
    <FormBanner :form="form" :t="t" :viewMode="viewMode" />
    <FormBasicInfo :form="form" :t="t" :viewLang="viewLang" :viewMode="viewMode" />
    <FormDateLocation :form="form" :t="t" :viewLang="viewLang" :viewMode="viewMode" />
    <FormAgenda :form="form" :t="t" :viewLang="viewLang" :viewMode="viewMode" />
    <FormCatering :form="form" :t="t" :viewLang="viewLang" :viewMode="viewMode" />
    <FormContact :form="form" :t="t" :viewMode="viewMode" />
  </div>
</template>