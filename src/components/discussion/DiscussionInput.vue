<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits<{
  (e: 'send', payload: { content: string; isAnnouncement: boolean }): void
}>();

const props = defineProps<{
  disabled?: boolean;
  isOrganizer?: boolean;
}>();

const content = ref('');
const isAnnouncement = ref(false);

const submit = () => {
  if (!content.value.trim() || props.disabled) return;
  
  emit('send', { 
    content: content.value.trim(), 
    isAnnouncement: isAnnouncement.value 
  });
  
  content.value = '';
  isAnnouncement.value = false;
};
</script>

<template>
  <div class="bg-transparent p-4 font-['Lato']">
    <div class="flex flex-col gap-2">
      
      <!-- Organizer Extras -->
      <div v-if="isOrganizer" class="flex items-center">
        <label class="flex items-center text-xs font-bold text-[#131B2B]/70 uppercase tracking-widest cursor-pointer hover:text-[#131B2B] transition-colors">
          <input 
            type="checkbox" 
            v-model="isAnnouncement" 
            class="mr-2 rounded text-[#131B2B] focus:ring-[#131B2B] border-[#131B2B]/20" 
          />
          Send as Announcement
        </label>
      </div>
      
      <!-- Input Space and Send Button -->
      <div class="flex items-end gap-2">
        <textarea 
          v-model="content"
          @keydown.enter.prevent="submit"
          :disabled="disabled"
          placeholder="Type your message..."
          class="flex-1 max-h-24 resize-none rounded-xl border border-[#131B2B]/20 bg-[#131B2B]/5 focus:bg-white shadow-inner focus:border-[#131B2B] focus:ring-1 focus:ring-[#131B2B] p-3 text-sm text-[#131B2B] disabled:opacity-50 transition-colors"
          rows="1"
        ></textarea>
        
        <button 
          @click="submit"
          :disabled="disabled || !content.trim()"
          class="bg-[#131B2B] hover:bg-[#131B2B]/80 text-white rounded-xl w-12 h-12 flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0 cursor-pointer"
        >
          <!-- Send Icon -->
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
          </svg>
        </button>
      </div>
      
    </div>
  </div>
</template>