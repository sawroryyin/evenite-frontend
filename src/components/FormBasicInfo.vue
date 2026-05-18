<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{ form: any; t: any; viewLang: 'en' | 'th'; viewMode: string }>()

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
  <section class="bg-white p-5 rounded-xl border shadow-sm">
    <h2 class="text-lg font-bold text-gray-800 mb-4">{{ t.basicInfo }}</h2>
    
    <div v-if="viewLang === 'en'" class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-1">{{ t.titleEn }} <span class="text-red-500">*</span></label>
      <input v-model="form.title.en" required class="w-full border p-2 rounded-lg disabled:bg-gray-50" placeholder="Event Title" />
    </div>
    <div v-if="viewLang === 'th'" class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-1">{{ t.titleTh }} <span class="text-red-500">*</span></label>
      <input v-model="form.title.th" required class="w-full border p-2 rounded-lg disabled:bg-gray-50" placeholder="ชื่ออีเวนต์" />
    </div>

    <div v-if="viewLang === 'en'" class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-1">{{ t.descEn }}</label>
      <textarea v-model="form.description.en" class="w-full border p-2 rounded-lg disabled:bg-gray-50" rows="3" placeholder="Describe your event..."></textarea>
    </div>
    <div v-if="viewLang === 'th'" class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-1">{{ t.descTh }}</label>
      <textarea v-model="form.description.th" class="w-full border p-2 rounded-lg disabled:bg-gray-50" rows="3" placeholder="รายละเอียดกิจกรรม..."></textarea>
    </div>

    <div class="mb-2">
      <label class="block text-sm font-medium text-gray-700 mb-1">{{ t.categories }}</label>
      <div class="flex gap-2 mb-2" v-if="viewMode !== 'preview'">
        <input 
          list="category-options" v-model="newCategory" @keydown.enter.prevent="addCategory" 
          class="flex-grow border p-2 rounded-lg bg-white" :placeholder="t.addCategory" 
        />
        <datalist id="category-options">
          <option v-for="cat in presetCategories" :key="cat" :value="cat"></option>
        </datalist>
        <button type="button" @click="addCategory" class="bg-gray-800 text-white px-4 py-2 rounded-lg">{{ t.addBtn }}</button>
      </div>
      
      <div class="flex flex-wrap gap-2">
        <span v-for="cat in form.category" :key="cat" class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
          {{ cat }}
          <button type="button" v-if="viewMode !== 'preview'" @click="removeCategory(cat)" class="text-red-500 font-bold hover:text-red-700">×</button>
        </span>
      </div>
    </div>
  </section>
</template>