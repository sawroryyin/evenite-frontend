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
  <section class="bg-[#FFFFFF] p-5 md:p-6 rounded-2xl border border-[#CECBF6] shadow-sm font-['Lato']">
    <div class="flex justify-between items-center mb-5">
      <h2 class="text-xl font-['Nunito'] font-black text-[#26215C]">{{ t.agenda }}</h2>
      <button 
        type="button" 
        @click="addAgendaItem" 
        class="text-sm bg-[#EEEDFE] text-[#534AB7] px-4 py-2 rounded-xl font-bold shadow-sm hover:bg-[#CECBF6] transition-colors border border-[#CECBF6] cursor-pointer"
      >
        {{ t.addItem }}
      </button>
    </div>
    
    <div v-if="form.agenda.length === 0" class="text-[#26215C]/70 text-sm font-semibold text-center py-8 bg-[#EEEDFE]/30 border border-dashed border-[#CECBF6] rounded-xl">
      {{ t.noAgenda }}
    </div>
    
    <div v-if="form.agenda.length > 0" class="space-y-4">
      <div 
        v-for="(item, index) in form.agenda" 
        :key="index" 
        class="flex gap-3 items-center bg-[#FFFFFF] border border-[#CECBF6] rounded-xl p-3.5 transition-all hover:border-[#534AB7] shadow-sm"
      >
        <span class="flex items-center justify-center w-8 h-8 shrink-0 bg-[#EEEDFE] text-[#534AB7] font-black text-sm rounded-full">
          {{ index as number + 1 }}
        </span>
        
        <input 
          type="time" 
          v-model="item.time" 
          class="w-28 sm:w-32 border border-[#CECBF6] p-3 rounded-xl text-base bg-[#F4F4FA] focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#534AB7] focus:border-transparent outline-none transition-all px-3 shrink-0 text-[#26215C] font-semibold" 
        />
          
        <div class="flex-1 min-w-0">
          <input 
            v-if="viewLang === 'en'" 
            v-model="item.activity.en" 
            class="w-full border border-[#CECBF6] p-3 rounded-xl text-base bg-[#F4F4FA] focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#534AB7] focus:border-transparent outline-none transition-all truncate text-[#26215C]" 
            placeholder="e.g. Ceremony" 
          />
          <input 
            v-if="viewLang === 'th'" 
            v-model="item.activity.th" 
            class="w-full border border-[#CECBF6] p-3 rounded-xl text-base bg-[#F4F4FA] focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#534AB7] focus:border-transparent outline-none transition-all truncate text-[#26215C]" 
            placeholder="e.g. พิธีเปิด" 
          />
        </div>
          
        <button 
          type="button" 
          @click="removeAgendaItem(index as number)" 
          class="text-[#26215C]/50 hover:text-red-500 text-2xl font-bold leading-none p-2 shrink-0 transition-colors cursor-pointer"
        >
          ×
        </button>
      </div>
    </div>
  </section>
</template>