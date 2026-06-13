<script setup lang="ts">
import { inject } from 'vue'

const props = defineProps<{ 
  form: any; 
  t: any; 
  viewLang: 'en' | 'th';
  viewMode?: 'create' | 'edit'
}>()

const showAlert = inject<((title: string, desc: string, theme?: 'blue'|'red') => void)>('showAlert')

const addAgendaItem = () => {
  const agendaList = props.form.agenda;
  if (agendaList.length > 0) {
    const lastItem = agendaList[agendaList.length - 1];
    const isTimeEmpty = !lastItem.time || lastItem.time.trim() === '';
    const isActivityEmpty = (!lastItem.activity.en || lastItem.activity.en.trim() === '') 
    && (!lastItem.activity.th || lastItem.activity.th.trim() === '');

    if (isTimeEmpty || isActivityEmpty) {
      if(showAlert) {
        showAlert("Incomplete Item", "Please fill out the previous agenda item before adding a new one.", "red");
      }
      return; 
    }
  }
  props.form.agenda.push({ time: '', activity: { en: '', th: '' } });
}

const removeAgendaItem = (index: number) => {
  props.form.agenda.splice(index, 1)
}
</script>

<template>
  <section class="bg-[#FFFFFF] p-3 rounded-xl border border-[#CECBF6] shadow-sm font-['Lato']">
    <div class="flex justify-between items-center mb-3">
      <h2 class="text-sm font-bold text-[#26215C]">{{ t.agenda }}</h2>
      <button 
        type="button" 
        @click="addAgendaItem" 
        class="text-[10px] bg-[#EEEDFE] text-[#3C3489] px-2.5 py-1 rounded-md font-bold 
        hover:bg-[#CECBF6] transition-colors border border-[#CECBF6]"
      >
        {{ t.addItem }}
      </button>
    </div>
    
    <div v-if="form.agenda.length === 0" class="text-[#26215C]/70 text-[11px] text-center py-4 
    bg-[#EEEDFE]/30 border border-dashed border-[#CECBF6] rounded-lg font-medium">
      {{ t.noAgenda }}
    </div>
    
    <div v-if="form.agenda.length > 0" class="space-y-2">
      <div 
        v-for="(item, index) in form.agenda" 
        :key="index" 
        class="flex gap-2 items-center bg-[#FFFFFF] border border-[#CECBF6] rounded-lg p-2 
        transition-all hover:border-[#7F77DD]"
      >
        <span class="flex items-center justify-center w-6 h-6 shrink-0 bg-[#EEEDFE] 
        text-[#3C3489] font-bold text-[10px] rounded-full">
          {{ index as number + 1 }}
        </span>
        
        <input 
          type="time" 
          v-model="item.time" 
          class="w-20 sm:w-24 border border-[#CECBF6] p-1.5 rounded-md text-[11px] 
          bg-[#FFFFFF] focus:ring-1 focus:ring-[#7F77DD] focus:border-transparent outline-none transition-all px-1 shrink-0 text-[#26215C]" 
        />
          
        <div class="flex-1 min-w-0">
          <input 
            v-if="viewLang === 'en'" 
            v-model="item.activity.en" 
            class="w-full border border-[#CECBF6] p-1.5 rounded-md text-[11px] 
            bg-[#FFFFFF] focus:ring-1 focus:ring-[#7F77DD] focus:border-transparent outline-none transition-all truncate text-[#26215C]" 
            placeholder="e.g. Ceremony" 
          />
          <input 
            v-if="viewLang === 'th'" 
            v-model="item.activity.th" 
            class="w-full border border-[#CECBF6] p-1.5 rounded-md text-[11px] bg-[#FFFFFF] 
            focus:ring-1 focus:ring-[#7F77DD] focus:border-transparent outline-none transition-all truncate text-[#26215C]" 
            placeholder="e.g. พิธีเปิด" 
          />
        </div>
          
        <button 
          type="button" 
          @click="removeAgendaItem(index as number)" 
          class="text-[#26215C]/50 hover:text-[#3C3489] text-lg font-bold leading-none p-1 shrink-0 transition-colors"
        >
          ×
        </button>
      </div>
    </div>
  </section>
</template>