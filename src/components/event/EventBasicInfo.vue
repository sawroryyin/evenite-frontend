<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{ 
  form: any; 
  t: any; 
  viewLang: 'en' | 'th';
  viewMode?: 'create' | 'edit'
}>()

const newCategory = ref('')
const presetCategories = [
  'SEMINAR', 'WORKSHOP', 'LECTURE', 'CONFERENCE',
  'HACKATHON', 'COMPETITION', 'CLUB_ACTIVITY', 'ORIENTATION',
  'VOLUNTEER', 'TRIP', 'SPORT', 'CULTURAL', 'FESTIVAL',
  'NETWORKING', 'CAREER_FAIR', 'PARTY', 'INTERNSHIP', 'OTHER'
]

const addCategory = () => {
  const cat = newCategory.value.trim()
  if (cat && !props.form.category.includes(cat)) {
    props.form.category.push(cat)
    newCategory.value = ''
  }
}
const removeCategory = (categoryToRemove: string) => {
  props.form.category = props.form.category.filter((c: string) => c !== categoryToRemove)
}
</script>

<template>
  <section class="bg-[#FFFFFF] p-5 md:p-6 rounded-2xl border border-[#CECBF6] shadow-sm">
    <h2 class="text-xl font-['Nunito'] font-black text-[#26215C] mb-5">{{ t.basicInfo }}</h2>
    
    <div v-if="viewLang === 'en'" class="mb-5">
      <label class="block text-sm font-bold text-[#26215C] mb-2">{{ t.titleEn }} <span class="text-red-500">*</span></label>
      <input v-model="form.title.en" class="w-full border border-[#CECBF6] p-3.5 rounded-xl text-base bg-[#F4F4FA] focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#534AB7] focus:border-transparent transition-all outline-none text-[#26215C] font-semibold" placeholder="Event Title" />
    </div>
    <div v-if="viewLang === 'th'" class="mb-5">
      <label class="block text-sm font-bold text-[#26215C] mb-2">{{ t.titleTh }} <span class="text-red-500">*</span></label>
      <input v-model="form.title.th" class="w-full border border-[#CECBF6] p-3.5 rounded-xl text-base bg-[#F4F4FA] focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#534AB7] focus:border-transparent transition-all outline-none text-[#26215C] font-semibold" placeholder="ชื่ออีเวนต์" />
    </div>

    <div v-if="viewLang === 'en'" class="mb-5">
      <label class="block text-sm font-bold text-[#26215C] mb-2">{{ t.descEn }}</label>
      <textarea v-model="form.description.en" class="w-full border border-[#CECBF6] p-3.5 rounded-xl text-base bg-[#F4F4FA] focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#534AB7] focus:border-transparent transition-all outline-none text-[#26215C]" rows="4" placeholder="Describe your event...">
    </textarea>
    </div>
    <div v-if="viewLang === 'th'" class="mb-5">
      <label class="block text-sm font-bold text-[#26215C] mb-2">{{ t.descTh }}</label>
      <textarea v-model="form.description.th" class="w-full border border-[#CECBF6] p-3.5 rounded-xl text-base bg-[#F4F4FA] focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#534AB7] focus:border-transparent transition-all outline-none text-[#26215C]" rows="4" placeholder="รายละเอียดกิจกรรม...">
    </textarea>
    </div>

    <div>
      <label class="block text-sm font-bold text-[#26215C] mb-2">{{ t.categories }}</label>
      <div class="flex gap-3 mb-4">
        <input 
          list="category-options" v-model="newCategory" @keydown.enter.prevent="addCategory" 
          class="flex-1 w-full border border-[#CECBF6] p-3.5 rounded-xl text-base bg-[#F4F4FA] focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#534AB7] focus:border-transparent transition-all outline-none text-[#26215C]" :placeholder="t.addCategory" 
        />
        <datalist id="category-options">
          <option v-for="cat in presetCategories" :key="cat" :value="cat"></option>
        </datalist>
        <button type="button" @click="addCategory" class="shrink-0 whitespace-nowrap bg-[#534AB7] hover:bg-[#3C3489] text-[#FFFFFF] px-6 py-3.5 rounded-xl text-sm font-bold shadow-sm transition-colors">{{ t.addBtn }}</button>
      </div>
      
      <div class="flex flex-wrap gap-2.5 mt-2">
        <span v-for="cat in form.category" :key="cat" class="bg-[#EEEDFE] text-[#534AB7] border border-[#CECBF6] px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm">
          {{ cat }}
          <button type="button" @click="removeCategory(cat)" class="text-[#534AB7]/70 hover:text-[#534AB7] text-base leading-none transition-colors p-1 -mr-1">
            ×</button>
        </span>
      </div>
    </div>
  </section>
</template>