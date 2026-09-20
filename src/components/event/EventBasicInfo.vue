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
  <section class="bg-white p-5 md:p-6 rounded-2xl border border-[#131B2B]/10 shadow-sm">
    <h2 class="text-xl font-['Nunito'] font-black text-[#131B2B] mb-5">{{ t.basicInfo }}</h2>
    
    <div v-if="viewLang === 'en'" class="mb-5">
      <label class="block text-sm font-bold text-[#131B2B] mb-2">{{ t.titleEn }} <span class="text-red-500">*</span></label>
      <input v-model="form.title.en" class="w-full border border-[#131B2B]/10 p-3.5 rounded-xl text-base bg-[#131B2B]/5 focus:bg-white focus:ring-2 focus:ring-[#131B2B]/30 focus:border-transparent transition-all outline-none text-[#131B2B] font-semibold" placeholder="Event Title" />
    </div>
    <div v-if="viewLang === 'th'" class="mb-5">
      <label class="block text-sm font-bold text-[#131B2B] mb-2">{{ t.titleTh }} <span class="text-red-500">*</span></label>
      <input v-model="form.title.th" class="w-full border border-[#131B2B]/10 p-3.5 rounded-xl text-base bg-[#131B2B]/5 focus:bg-white focus:ring-2 focus:ring-[#131B2B]/30 focus:border-transparent transition-all outline-none text-[#131B2B] font-semibold" placeholder="ชื่ออีเวนต์" />
    </div>

    <div v-if="viewLang === 'en'" class="mb-5">
      <label class="block text-sm font-bold text-[#131B2B] mb-2">{{ t.descEn }}</label>
      <textarea v-model="form.description.en" class="w-full border border-[#131B2B]/10 p-3.5 rounded-xl text-base bg-[#131B2B]/5 focus:bg-white focus:ring-2 focus:ring-[#131B2B]/30 focus:border-transparent transition-all outline-none text-[#131B2B]" rows="4" placeholder="Describe your event...">
    </textarea>
    </div>
    <div v-if="viewLang === 'th'" class="mb-5">
      <label class="block text-sm font-bold text-[#131B2B] mb-2">{{ t.descTh }}</label>
      <textarea v-model="form.description.th" class="w-full border border-[#131B2B]/10 p-3.5 rounded-xl text-base bg-[#131B2B]/5 focus:bg-white focus:ring-2 focus:ring-[#131B2B]/30 focus:border-transparent transition-all outline-none text-[#131B2B]" rows="4" placeholder="รายละเอียดกิจกรรม...">
    </textarea>
    </div>

    <div>
      <label class="block text-sm font-bold text-[#131B2B] mb-2">{{ t.categories }}</label>
      <div class="flex gap-3 mb-4">
        <input 
          list="category-options" v-model="newCategory" @keydown.enter.prevent="addCategory" 
          class="flex-1 w-full border border-[#131B2B]/10 p-3.5 rounded-xl text-base bg-[#131B2B]/5 focus:bg-white focus:ring-2 focus:ring-[#131B2B]/30 focus:border-transparent transition-all outline-none text-[#131B2B]" :placeholder="t.addCategory" 
        />
        <datalist id="category-options">
          <option v-for="cat in presetCategories" :key="cat" :value="cat"></option>
        </datalist>
        <button type="button" @click="addCategory" class="shrink-0 whitespace-nowrap bg-[#131B2B] hover:bg-[#131B2B]/80 text-white px-6 py-3.5 rounded-xl text-sm font-bold shadow-sm transition-colors cursor-pointer">{{ t.addBtn }}</button>
      </div>
      
      <div class="flex flex-wrap gap-2.5 mt-2">
        <span v-for="cat in form.category" :key="cat" class="bg-[#131B2B]/5 text-[#131B2B] border border-[#131B2B]/10 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm">
          {{ cat }}
          <button type="button" @click="removeCategory(cat)" class="text-[#131B2B]/70 hover:text-[#131B2B] text-base leading-none transition-colors p-1 -mr-1 cursor-pointer">
            ×</button>
        </span>
      </div>
    </div>
  </section>
</template>