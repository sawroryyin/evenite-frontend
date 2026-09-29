<script setup lang="ts">
import { ref, nextTick } from 'vue';

const emit = defineEmits<{
  (e: 'send', payload: { content: string; isAnnouncement: boolean }): void
}>();

const props = defineProps<{
  disabled?: boolean;
  isOrganizer?: boolean;
}>();

const content = ref('');
const isAnnouncement = ref(false);
const textareaRef = ref<HTMLTextAreaElement | null>(null);

const autoResize = () => {
  const el = textareaRef.value;
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = `${Math.min(el.scrollHeight, 96)}px`; // 96px = max-h-24
};

const submit = async () => {
  if (!content.value.trim() || props.disabled) return;

  emit('send', { content: content.value.trim(), isAnnouncement: isAnnouncement.value });

  content.value = '';
  isAnnouncement.value = false;
  await nextTick();
  autoResize();
  textareaRef.value?.focus(); // keep the keyboard open, like a messenger
};

const onEnter = (e: KeyboardEvent) => {
  if (e.isComposing) return;   // don't send mid-composition (IME keyboards)
  if (e.shiftKey) return;      // Shift+Enter = new line on desktop
  e.preventDefault();
  submit();
};
</script>

<template>
  <div class="bg-transparent px-4 pt-3 font-['Lato']">
    <div class="flex flex-col gap-2">
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

      <div class="flex items-end gap-2">
        <textarea
          ref="textareaRef"
          v-model="content"
          @input="autoResize"
          @keydown.enter="onEnter"
          :disabled="disabled"
          enterkeyhint="send"
          placeholder="Type your message..."
          rows="1"
          class="flex-1 max-h-24 resize-none rounded-xl border border-[#131B2B]/20 bg-[#131B2B]/5 focus:bg-white focus:border-[#131B2B] focus:outline-none focus:ring-1 focus:ring-[#131B2B] px-3 py-2.5 text-base md:text-sm leading-snug text-[#131B2B] disabled:opacity-50 transition-colors"
        ></textarea>

        <!-- mousedown.prevent keeps focus in the textarea so the keyboard doesn't close -->
        <button
          @mousedown.prevent
          @click="submit"
          :disabled="disabled || !content.trim()"
          class="bg-[#131B2B] hover:bg-[#131B2B]/80 text-white rounded-xl w-11 h-11 flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0 cursor-pointer"
        >
          <svg class="w-5 h-5 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>