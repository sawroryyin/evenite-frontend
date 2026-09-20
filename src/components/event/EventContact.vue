<script setup lang="ts">
defineProps<{ 
  form: any; 
  t: any;
  viewMode?: 'create' | 'edit'
}>()
</script>

<template>
  <section class="bg-white p-5 md:p-6 rounded-2xl border border-[#131B2B]/10 shadow-sm font-['Lato']">
    <h2 class="text-xl font-['Nunito'] font-black text-[#131B2B] mb-5">
      {{ t.contactInfo }} 
      <span class="text-xs font-semibold text-[#131B2B]/60 ml-2 font-['Lato']">{{ t.universalSub }}</span>
    </h2>
    
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
      <div>
        <label class="block text-sm font-bold text-[#131B2B] mb-2">{{ t.contactName }}</label>
        <input v-model="form.contactName" class="w-full border border-[#131B2B]/10 p-3.5 rounded-xl text-base bg-[#131B2B]/5 focus:bg-white focus:ring-2 focus:ring-[#131B2B]/30 focus:border-transparent transition-all outline-none text-[#131B2B]" placeholder="e.g. John Doe" />
      </div>
      <div>
        <label class="block text-sm font-bold text-[#131B2B] mb-2">{{ t.contactEmail }}</label>
        <input v-model="form.contactEmail" type="email" class="w-full border border-[#131B2B]/10 p-3.5 rounded-xl text-base bg-[#131B2B]/5 focus:bg-white focus:ring-2 focus:ring-[#131B2B]/30 focus:border-transparent transition-all outline-none text-[#131B2B]" placeholder="john@example.com" />
      </div>
      <div>
        <label class="block text-sm font-bold text-[#131B2B] mb-2">{{ t.contactPhone }}</label>
        <input v-model="form.contactPhone" class="w-full border border-[#131B2B]/10 p-3.5 rounded-xl text-base bg-[#131B2B]/5 focus:bg-white focus:ring-2 focus:ring-[#131B2B]/30 focus:border-transparent transition-all outline-none text-[#131B2B]" placeholder="e.g. +66 123 456 789" />
      </div>
      <div>
        <label class="block text-sm font-bold text-[#131B2B] mb-2">{{ t.lineId }}</label>
        <input v-model="form.contactLineId" class="w-full border border-[#131B2B]/10 p-3.5 rounded-xl text-base bg-[#131B2B]/5 focus:bg-white focus:ring-2 focus:ring-[#131B2B]/30 focus:border-transparent transition-all outline-none text-[#131B2B]" placeholder="e.g. @eventcontact" />
      </div>
      <div class="sm:col-span-2">
        <label class="block text-sm font-bold text-[#131B2B] mb-2">{{ t.externalUrl }}</label>
        <input v-model="form.externalUrl" class="w-full border border-[#131B2B]/10 p-3.5 rounded-xl text-base bg-[#131B2B]/5 focus:bg-white focus:ring-2 focus:ring-[#131B2B]/30 focus:border-transparent transition-all outline-none text-[#131B2B]" placeholder="https://..." />
      </div>
    </div>
  </section>
</template>