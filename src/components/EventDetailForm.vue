<script setup lang="ts">
import FormBanner from './EventBanner.vue'
import FormBasicInfo from './EventBasicInfo.vue'
import FormDateLocation from './EventDateLocation.vue'
import FormAgenda from './EventAgenda.vue'
import FormCatering from './EventCatering.vue'
import FormContact from './EventContact.vue'

defineProps<{ 
  form: any; 
  t: any; 
  viewLang: 'en' | 'th';
  viewMode: 'create' | 'edit'
}>()
</script>

<template>
  <div class="space-y-4 font-['Lato']">
    <FormBanner :form="form" :t="t" :viewMode="viewMode" />
    <FormBasicInfo :form="form" :t="t" :viewLang="viewLang" :viewMode="viewMode" />
    <FormDateLocation :form="form" :t="t" :viewLang="viewLang" :viewMode="viewMode" />
    <FormAgenda :form="form" :t="t" :viewLang="viewLang" :viewMode="viewMode" />
    <FormCatering :form="form" :t="t" :viewLang="viewLang" :viewMode="viewMode" />
    <FormContact :form="form" :t="t" :viewMode="viewMode" />
  </div>
</template>