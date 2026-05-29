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
    const isActivityEmpty = (!lastItem.activity.en || lastItem.activity.en.trim() === '') && 
                            (!lastItem.activity.th || lastItem.activity.th.trim() === '');

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
  <section class="bg-white p-3 rounded-xl border border-gray-200 shadow-sm font-['Lato']">
    <div class="flex justify-between items-center mb-3">
      <h2 class="text-sm font-bold text-gray-900">{{ t.agenda }}</h2>
      <button 
        type="button" 
        @click="addAgendaItem" 
        class="text-[10px] bg-purple-50 text-purple-700 px-2.5 py-1 rounded-md font-bold hover:bg-purple-100 transition-colors border border-purple-100"
      >
        {{ t.addItem }}
      </button>
    </div>
    
    <div v-if="form.agenda.length === 0" class="text-gray-500 text-[11px] text-center py-4 bg-gray-50 border border-dashed border-gray-200 rounded-lg font-medium">
      {{ t.noAgenda }}
    </div>
    
    <div v-if="form.agenda.length > 0" class="space-y-2">
      <div 
        v-for="(item, index) in form.agenda" 
        :key="index" 
        class="flex gap-2 items-center bg-gray-50 border border-gray-200 rounded-lg p-2 transition-all hover:border-purple-200"
      >
        <span class="flex items-center justify-center w-6 h-6 shrink-0 bg-purple-100 text-purple-700 font-bold text-[10px] rounded-full">
          {{ index + 1 }}
        </span>
        
        <input 
          type="time" 
          v-model="item.time" 
          class="w-20 sm:w-24 border border-gray-200 p-1.5 rounded-md text-[11px] bg-white focus:ring-1 focus:ring-purple-500 focus:border-transparent outline-none transition-all px-1 shrink-0" 
        />
          
        <div class="flex-1 min-w-0">
          <input 
            v-if="viewLang === 'en'" 
            v-model="item.activity.en" 
            class="w-full border border-gray-200 p-1.5 rounded-md text-[11px] bg-white focus:ring-1 focus:ring-purple-500 focus:border-transparent outline-none transition-all truncate" 
            placeholder="e.g. Ceremony" 
          />
          <input 
            v-if="viewLang === 'th'" 
            v-model="item.activity.th" 
            class="w-full border border-gray-200 p-1.5 rounded-md text-[11px] bg-white focus:ring-1 focus:ring-purple-500 focus:border-transparent outline-none transition-all truncate" 
            placeholder="e.g. พิธีเปิด" 
          />
        </div>
          
        <button 
          type="button" 
          @click="removeAgendaItem(index as number)" 
          class="text-gray-400 hover:text-red-500 text-lg font-bold leading-none p-1 shrink-0"
        >
          ×
        </button>
      </div>
    </div>
  </section>
</template>