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
  <section class="bg-[#FFFFFF] p-4 rounded-xl border border-[#CECBF6] shadow-sm">
    <h2 class="text-base font-bold text-[#26215C] mb-4">{{ t.basicInfo }}</h2>
    
    <div v-if="viewLang === 'en'" class="mb-4">
      <label class="block text-xs font-bold text-[#26215C] mb-1.5">{{ t.titleEn }} <span class="text-red-500">*</span></label>
      <input v-model="form.title.en" class="w-full border border-[#CECBF6] p-2.5 rounded-xl text-sm bg-[#EEEDFE]/30 focus:bg-[#FFFFFF] 
      focus:ring-2 focus:ring-[#7F77DD] focus:border-transparent transition-all outline-none text-[#26215C]" placeholder="Event Title" />
    </div>
    <div v-if="viewLang === 'th'" class="mb-4">
      <label class="block text-xs font-bold text-[#26215C] mb-1.5">{{ t.titleTh }} <span class="text-red-500">*</span></label>
      <input v-model="form.title.th" class="w-full border border-[#CECBF6] p-2.5 rounded-xl text-sm bg-[#EEEDFE]/30 focus:bg-[#FFFFFF] 
      focus:ring-2 focus:ring-[#7F77DD] focus:border-transparent transition-all outline-none text-[#26215C]" placeholder="ชื่ออีเวนต์" />
    </div>

    <div v-if="viewLang === 'en'" class="mb-4">
      <label class="block text-xs font-bold text-[#26215C] mb-1.5">{{ t.descEn }}</label>
      <textarea v-model="form.description.en" class="w-full border border-[#CECBF6] p-3 rounded-xl text-sm bg-[#EEEDFE]/30 focus:bg-[#FFFFFF] 
      focus:ring-2 focus:ring-[#7F77DD] focus:border-transparent transition-all outline-none text-[#26215C]" rows="3" placeholder="Describe your event...">
    </textarea>
    </div>
    <div v-if="viewLang === 'th'" class="mb-4">
      <label class="block text-xs font-bold text-[#26215C] mb-1.5">{{ t.descTh }}</label>
      <textarea v-model="form.description.th" class="w-full border border-[#CECBF6] p-3 rounded-xl text-sm bg-[#EEEDFE]/30 focus:bg-[#FFFFFF] 
      focus:ring-2 focus:ring-[#7F77DD] focus:border-transparent transition-all outline-none text-[#26215C]" rows="3" placeholder="รายละเอียดกิจกรรม...">
    </textarea>
    </div>

    <div>
      <label class="block text-xs font-bold text-[#26215C] mb-1.5">{{ t.categories }}</label>
      <div class="flex gap-2 mb-3">
        <input 
          list="category-options" v-model="newCategory" @keydown.enter.prevent="addCategory" 
          class="flex-1 w-full border border-[#CECBF6] p-2.5 rounded-xl text-sm bg-[#EEEDFE]/30 focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#7F77DD] focus:border-transparent transition-all outline-none text-[#26215C]" :placeholder="t.addCategory" 
        />
        <datalist id="category-options">
          <option v-for="cat in presetCategories" :key="cat" :value="cat"></option>
        </datalist>
        <button type="button" @click="addCategory" class="shrink-0 whitespace-nowrap bg-[#534AB7] hover:bg-[#3C3489] text-[#FFFFFF] px-4 py-2.5 rounded-xl text-sm font-bold transition-colors">{{ t.addBtn }}</button>
      </div>
      
      <div class="flex flex-wrap gap-2 mt-2">
        <span v-for="cat in form.category" :key="cat" class="bg-[#EEEDFE] text-[#3C3489] border border-[#CECBF6] px-2.5 py-1 rounded-lg 
        text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
          {{ cat }}
          <button type="button" @click="removeCategory(cat)" class="text-[#3C3489]/70 hover:text-[#3C3489] text-sm leading-none transition-colors">
            ×</button>
        </span>
      </div>
    </div>
  </section>
</template>