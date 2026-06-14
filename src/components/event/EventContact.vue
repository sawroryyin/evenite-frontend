<script setup lang="ts">
defineProps<{ 
  form: any; 
  t: any;
  viewMode?: 'create' | 'edit'
}>()
</script>

<template>
  <section class="bg-[#FFFFFF] p-4 rounded-xl border border-[#CECBF6] shadow-sm">
    <h2 class="text-base font-bold text-[#26215C] mb-4">
      {{ t.contactInfo }} 
      <span class="text-xs font-medium text-[#26215C]/60">{{ t.universalSub }}</span>
    </h2>
    
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label class="block text-xs font-bold text-[#26215C] mb-1.5">{{ t.contactName }}</label>
        <input v-model="form.contactName" class="w-full border border-[#CECBF6] p-2.5 rounded-xl text-sm bg-[#EEEDFE]/30 
        focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#7F77DD] focus:border-transparent transition-all outline-none text-[#26215C]" placeholder="e.g. John Doe" />
      </div>
      <div>
        <label class="block text-xs font-bold text-[#26215C] mb-1.5">{{ t.contactEmail }}</label>
        <input v-model="form.contactEmail" type="email" class="w-full border border-[#CECBF6] p-2.5 rounded-xl text-sm 
        bg-[#EEEDFE]/30 focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#7F77DD] focus:border-transparent transition-all outline-none text-[#26215C]" 
        placeholder="john@example.com" />
      </div>
      <div>
        <label class="block text-xs font-bold text-[#26215C] mb-1.5">{{ t.contactPhone }}</label>
        <input v-model="form.contactPhone" class="w-full border border-[#CECBF6] p-2.5 rounded-xl text-sm bg-[#EEEDFE]/30 
        focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#7F77DD] focus:border-transparent transition-all outline-none text-[#26215C]" placeholder="e.g. +66 123 456 789" />
      </div>
      <div>
        <label class="block text-xs font-bold text-[#26215C] mb-1.5">{{ t.lineId }}</label>
        <input v-model="form.contactLineId" class="w-full border border-[#CECBF6] p-2.5 rounded-xl text-sm bg-[#EEEDFE]/30 
        focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#7F77DD] focus:border-transparent transition-all outline-none text-[#26215C]" placeholder="e.g. @eventcontact" />
      </div>
      <div class="sm:col-span-2">
        <label class="block text-xs font-bold text-[#26215C] mb-1.5">{{ t.externalUrl }}</label>
        <input v-model="form.externalUrl" class="w-full border border-[#CECBF6] p-2.5 rounded-xl text-sm bg-[#EEEDFE]/30 
        focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#7F77DD] focus:border-transparent transition-all outline-none text-[#26215C]" placeholder="https://..." />
      </div>
    </div>
  </section>
</template>