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
  <section class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
    <h2 class="text-base font-bold text-gray-900 mb-4">{{ t.basicInfo }}</h2>
    
    <div v-if="viewLang === 'en'" class="mb-4">
      <label class="block text-xs font-bold text-gray-700 mb-1.5">{{ t.titleEn }} <span class="text-red-500">*</span></label>
      <input v-model="form.title.en" required class="w-full border border-gray-200 p-2.5 rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none" placeholder="Event Title" />
    </div>
    <div v-if="viewLang === 'th'" class="mb-4">
      <label class="block text-xs font-bold text-gray-700 mb-1.5">{{ t.titleTh }} <span class="text-red-500">*</span></label>
      <input v-model="form.title.th" required class="w-full border border-gray-200 p-2.5 rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none" placeholder="ชื่ออีเวนต์" />
    </div>

    <div v-if="viewLang === 'en'" class="mb-4">
      <label class="block text-xs font-bold text-gray-700 mb-1.5">{{ t.descEn }}</label>
      <textarea v-model="form.description.en" class="w-full border border-gray-200 p-3 rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none" rows="3" placeholder="Describe your event..."></textarea>
    </div>
    <div v-if="viewLang === 'th'" class="mb-4">
      <label class="block text-xs font-bold text-gray-700 mb-1.5">{{ t.descTh }}</label>
      <textarea v-model="form.description.th" class="w-full border border-gray-200 p-3 rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none" rows="3" placeholder="รายละเอียดกิจกรรม..."></textarea>
    </div>

    <div>
      <label class="block text-xs font-bold text-gray-700 mb-1.5">{{ t.categories }}</label>
      <div class="flex flex-col sm:flex-row gap-2 mb-3">
        <input 
          list="category-options" v-model="newCategory" @keydown.enter.prevent="addCategory" 
          class="w-full border border-gray-200 p-2.5 rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none" :placeholder="t.addCategory" 
        />
        <datalist id="category-options">
          <option v-for="cat in presetCategories" :key="cat" :value="cat"></option>
        </datalist>
        <button type="button" @click="addCategory" class="w-full sm:w-auto bg-gray-800 hover:bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors">{{ t.addBtn }}</button>
      </div>
      
      <div class="flex flex-wrap gap-2 mt-2">
        <span v-for="cat in form.category" :key="cat" class="bg-purple-50 text-purple-700 border border-purple-100 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
          {{ cat }}
          <button type="button" @click="removeCategory(cat)" class="text-purple-400 hover:text-purple-900 text-sm leading-none transition-colors">×</button>
        </span>
      </div>
    </div>
  </section>
</template>