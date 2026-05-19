<script setup lang="ts">
const props = defineProps<{ form: any; t: any; viewLang: 'en' | 'th' }>()

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
  <section class="bg-white p-5 rounded-xl border shadow-sm">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-lg font-bold text-gray-800">{{ t.agenda }}</h2>
      <button type="button" @click="addAgendaItem" class="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-lg font-medium hover:bg-blue-200">{{ t.addItem }}</button>
    </div>
    
    <div v-if="form.agenda.length === 0" class="text-gray-500 text-sm text-center py-4">{{ t.noAgenda }}</div>
    
    <div v-if="form.agenda.length > 0" class="border rounded-lg bg-gray-50 p-3">
      <div class="flex flex-row gap-2 sm:gap-4 mb-2 pr-8 border-b border-gray-200 pb-2">
        <div class="shrink-0 w-4 sm:w-5"></div>
        <div class="w-1/3"><label class="block text-xs font-bold text-gray-500 truncate">{{ t.time }}</label></div>
        <div class="flex-1">
          <label v-if="viewLang === 'en'" class="block text-xs font-bold text-gray-500 truncate">{{ t.activityEn }}</label>
          <label v-if="viewLang === 'th'" class="block text-xs font-bold text-gray-500 truncate">{{ t.activityTh }}</label>
        </div>
      </div>

      <div v-for="(item, index) in form.agenda" :key="index" class="relative flex flex-row items-center gap-2 sm:gap-4 py-2 pr-8">
        <button type="button" @click="removeAgendaItem(index as number)" class="absolute top-1/2 right-0 -translate-y-1/2 p-1 text-red-500 hover:text-red-700 text-lg font-bold leading-none">×</button>
        
        <div class="shrink-0 w-4 sm:w-5 text-center font-black text-gray-400 text-sm sm:text-base">{{ index as number + 1 }}</div>
        <div class="w-1/3"><input type="time" v-model="item.time" class="w-full border p-1.5 sm:p-2 rounded text-xs sm:text-sm bg-white" /></div>
        
        <div v-if="viewLang === 'en'" class="flex-1">
          <input v-model="item.activity.en" class="w-full border p-1.5 sm:p-2 rounded text-xs sm:text-sm bg-white" placeholder="Opening Ceremony" />
        </div>
        <div v-if="viewLang === 'th'" class="flex-1">
          <input v-model="item.activity.th" class="w-full border p-1.5 sm:p-2 rounded text-xs sm:text-sm bg-white" placeholder="พิธีเปิด" />
        </div>
      </div>
    </div>
  </section>
</template>