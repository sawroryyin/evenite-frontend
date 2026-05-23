<script setup lang="ts">
const props = defineProps<{ 
  form: any; 
  t: any; 
  viewLang: 'en' | 'th';
  viewMode?: 'create' | 'edit'
}>()

const addAgendaItem = () => {
  const agendaList = props.form.agenda;
  if (agendaList.length > 0) {
    const lastItem = agendaList[agendaList.length - 1];
    const isTimeEmpty = !lastItem.time || lastItem.time.trim() === '';
    const isActivityEmpty = (!lastItem.activity.en || lastItem.activity.en.trim() === '') && 
                            (!lastItem.activity.th || lastItem.activity.th.trim() === '');

    if (isTimeEmpty || isActivityEmpty) {
      const alertMsg = props.viewLang === 'en' 
        ? "Please fill out the previous agenda item before adding a new one." 
        : "กรุณากรอกข้อมูลกำหนดการล่าสุดให้ครบก่อนเพิ่มรายการใหม่";
      alert(alertMsg);
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
        + {{ t.addItem }}
      </button>
    </div>
    
    <div v-if="form.agenda.length === 0" class="text-gray-500 text-[11px] text-center py-4 bg-gray-50 border border-dashed border-gray-200 rounded-lg font-medium">
      {{ t.noAgenda }}
    </div>
    
    <div v-if="form.agenda.length > 0" class="space-y-2">
      <div 
        v-for="(item, index) in form.agenda" 
        :key="index" 
        class="bg-gray-50 border border-gray-200 rounded-lg p-2 transition-all hover:border-purple-200 relative"
      >
        <div class="flex justify-between items-center mb-1.5">
          <span class="font-black text-purple-400 text-[9px] uppercase tracking-widest">Item {{ index as number + 1 }}</span>
          <button 
            type="button" 
            @click="removeAgendaItem(index as number)" 
            class="text-gray-400 hover:text-red-500 text-sm font-bold leading-none p-1"
          >
            ×
          </button>
        </div>
        
        <div class="flex gap-1.5 items-end">
          
          <div class="w-[72px] shrink-0">
            <label class="block text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">{{ t.time }}</label>
            <input type="time" v-model="item.time" class="w-full border border-gray-200 p-1.5 rounded-md text-[11px] bg-white focus:ring-1 focus:ring-purple-500 focus:border-transparent outline-none transition-all px-1" />
          </div>
          
          <div v-if="viewLang === 'en'" class="flex-1 min-w-0">
            <label class="block text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-0.5 truncate">{{ t.activityEn }}</label>
            <input v-model="item.activity.en" class="w-full border border-gray-200 p-1.5 rounded-md text-[11px] bg-white focus:ring-1 focus:ring-purple-500 focus:border-transparent outline-none transition-all truncate" placeholder="e.g. Ceremony" />
          </div>
          
          <div v-if="viewLang === 'th'" class="flex-1 min-w-0">
            <label class="block text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-0.5 truncate">{{ t.activityTh }}</label>
            <input v-model="item.activity.th" class="w-full border border-gray-200 p-1.5 rounded-md text-[11px] bg-white focus:ring-1 focus:ring-purple-500 focus:border-transparent outline-none transition-all truncate" placeholder="e.g. พิธีเปิด" />
          </div>
          
        </div>
      </div>
    </div>
  </section>
</template>