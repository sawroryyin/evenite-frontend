<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { FormService } from '../services/FormService';
import { FormType, FieldType, type Form } from '../types';
import { useEventCreationStore } from '../stores/eventCreation';
import ConfirmModal from '../components/ConfirmModal.vue';

const store = useEventCreationStore();

const route = useRoute();
const router = useRouter();

const eventId = route.params.id as string;
const formType = route.params.formType as FormType;

const isEditMode = ref(false);
const showFieldTypeModal = ref(false);
const form = ref<Form>({ eventId, type: formType, title: '', description: '', fields: [] });
const originalForm = ref<Form | null>(null);

// Mocks for Event Status (Replace with actual Event status fetch)
const eventStatus = ref('DRAFT'); 
const hasResponses = ref(false);

const availableFieldTypes = Object.values(FieldType);

const isNewForm = ref(route.query.isNew === 'true');

onMounted(async () => {
  if (eventId === 'new') {
    const existingDraft = store.draftForms[formType];
    if (existingDraft) {
      form.value = JSON.parse(JSON.stringify(existingDraft));
      originalForm.value = JSON.parse(JSON.stringify(existingDraft));
      isEditMode.value = true;
    } else {
      isEditMode.value = true;
      originalForm.value = JSON.parse(JSON.stringify(form.value));
    }
    return;
  }

  try {
    // 1. Check if the form exists using the safe endpoint (returns [] instead of 404)
    const existingForms = await FormService.getFormsByEventId(eventId);
    const formExists = existingForms.some((f: any) => f.type === formType);

    if (formExists) {
      // 2. It exists! Now we can safely fetch the full details knowing it won't 404
      const data = await FormService.getForm(eventId, formType);
      
      form.value = data;
      originalForm.value = JSON.parse(JSON.stringify(data));
      isEditMode.value = false;
      isNewForm.value = false;
      
      if (route.query.isNew) {
        const query = { ...route.query };
        delete query.isNew;
        router.replace({ query });
      }
    } else {
      // 3. It doesn't exist. Gracefully switch to Create Mode WITHOUT a 404 error!
      isEditMode.value = true; 
      isNewForm.value = true;
      originalForm.value = JSON.parse(JSON.stringify(form.value));
    }
  } catch (error: any) {
    console.error('Failed to load form details', error);
    // Safely fallback to create mode if the API fails
    isEditMode.value = true; 
    isNewForm.value = true;
    originalForm.value = JSON.parse(JSON.stringify(form.value));
  }
});

const toggleEdit = () => {
  if (eventStatus.value !== 'DRAFT') {
    return showAlert('Edit Restricted', 'Form can only be edited while the event is in draft state.', 'red');
  }
  if (hasResponses.value) {
    return showAlert('Edit Restricted', 'Form cannot be updated because it has existing responses.', 'red');
  }
  isEditMode.value = true;
};

const addField = (type: FieldType) => {
  form.value.fields.push({
    type,
    label: '',
    isRequired: false,
    order: form.value.fields.length,
    options: (type === FieldType.CHOICE || type === FieldType.CHECKBOX) ? ['Option 1', 'Option 2'] : [],
    maxRating: type === 'RATING' ? 5 : undefined
  });
  showFieldTypeModal.value = false;
};

const removeField = (index: number) => {
  showConfirm(
    'Delete Field',
    'Are you sure you want to delete this field?',
    'Delete',
    'red',
    () => {
      form.value.fields.splice(index, 1);
      confirmState.value.show = false;
    }
  );
};

const moveField = (index: number, direction: -1 | 1) => {
  const targetIndex = index + direction;
  if (targetIndex >= 0 && targetIndex < form.value.fields.length) {
    const temp = form.value.fields[index];
    form.value.fields[index] = form.value.fields[targetIndex];
    form.value.fields[targetIndex] = temp;
  }
};

const saveForm = async () => {
  // Validation
  if (!form.value.title?.trim()) return showAlert('Validation Error', 'Form Title is required.', 'red');
  if (!form.value.description?.trim()) return showAlert('Validation Error', 'Form Description is required.', 'red');
  if (form.value.fields.length === 0) return showAlert('Validation Error', 'At least one field is required.', 'red');

  for (const field of form.value.fields) {
    if (!field.label.trim()) return showAlert('Validation Error', 'Field label is required.', 'red');
    if ((field.type === FieldType.CHOICE || field.type === FieldType.CHECKBOX) && field.options.length < 2) {
      return showAlert('Validation Error', 'At least two options are required for choice/checkbox fields.', 'red');
    }
  }

  try {
    if (eventId === 'new') {
      store.setDraftForm(formType, JSON.parse(JSON.stringify(form.value)));
      showAlert('Success', 'Form created successfully', 'blue');
      isEditMode.value = false;
      originalForm.value = JSON.parse(JSON.stringify(form.value));
      return;
    }

    if (isNewForm.value) {
      await FormService.createForm(eventId, form.value);
      showAlert('Success', 'Form created successfully', 'blue');
      isNewForm.value = false; 
      
      // ✅ CLEANUP: Remove isNew from URL so returning via router.back() is safe
      const query = { ...route.query };
      delete query.isNew;
      router.replace({ query });
      
    } else {
      await FormService.updateForm(eventId, formType, form.value);
      showAlert('Success', 'Form updated successfully', 'blue');
    }
    
    isEditMode.value = false;
    originalForm.value = JSON.parse(JSON.stringify(form.value));
  } catch (err: any) {
    showAlert('Error', err.response?.data?.message || 'Error saving form', 'red');
  }
};

const goBack = () => {
  const hasChanges = JSON.stringify(form.value) !== JSON.stringify(originalForm.value);

  if (isEditMode.value && hasChanges) {
    showConfirm(
      'Unsaved Changes',
      'You have unsaved changes. Are you sure you want to go back?',
      'Discard Changes',
      'red',
      () => {
        executeGoBack();
        confirmState.value.show = false;
      }
    );
  } else {
    executeGoBack();
  }
};

const executeGoBack = () => {
  // 1. NEW FORM: If the form hasn't been saved to the database yet, leave the page.
  if (isNewForm.value || eventId === 'new') {
    if (eventStatus.value === 'DRAFT') { // <-- ADD THIS CHECK
      sessionStorage.setItem('returnToEventEditMode', 'true');
    }
    router.back();
    return;
  }

  // 2. EXISTING FORM (EDITING): Cancel the edits and return to Preview Mode.
  if (isEditMode.value && originalForm.value) {
    form.value = JSON.parse(JSON.stringify(originalForm.value));
    isEditMode.value = false;
    return;
  }

  // 3. EXISTING FORM (PREVIEW): Leave the page.
  if (eventStatus.value === 'DRAFT') { // <-- ADD THIS CHECK
    sessionStorage.setItem('returnToEventEditMode', 'true');
  }
  router.back();
};

const alertState = ref({
  show: false,
  title: '',
  description: '',
  theme: 'blue' as 'blue' | 'red'
});

const confirmState = ref({
  show: false,
  title: '',
  description: '',
  confirmText: '',
  theme: 'blue' as 'blue' | 'red',
  onConfirm: () => {}
});

// Helper for simple OK alerts (validations, success, errors)
const showAlert = (title: string, description: string, theme: 'blue' | 'red' = 'blue') => {
  alertState.value = { show: true, title, description, theme };
};

// Helper for actions requiring Cancel/Confirm
const showConfirm = (title: string, description: string, confirmText: string, theme: 'blue' | 'red', action: () => void) => {
  confirmState.value = { show: true, title, description, confirmText, theme, onConfirm: action };
};

</script>

<template>
  <div class="pt-4 pb-24 max-w-3xl mx-auto bg-[#fafafa] min-h-screen font-['Lato'] px-4">
    
    <button @click="goBack" class="mb-4 text-gray-500 hover:text-purple-700 flex items-center gap-1.5 text-[11px] font-bold transition-colors cursor-pointer">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
      </svg>
      BACK
    </button>

    <div class="mb-5 border-b border-gray-100 pb-3">
      <h1 class="text-xl font-bold text-gray-900 tracking-tight uppercase">
  {{ isEditMode ? `${formType} Form` : form.title || `${formType} Form` }}
</h1>
      <p v-if="!isEditMode && form.description" class="text-sm text-gray-500 mt-1">{{ form.description }}</p>
    </div>

    <div v-if="isEditMode" class="space-y-4 animate-fade-in">
      <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-3">
        <input v-model="form.title" placeholder="Form Title" class="w-full text-lg font-bold p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:bg-white transition-all" />
        <textarea v-model="form.description" placeholder="Form Description" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 focus:bg-white transition-all h-24 resize-none"></textarea>
      </div>

      <div class="space-y-3">
        <div v-for="(field, index) in form.fields" :key="index" class="p-4 border border-gray-100 rounded-2xl bg-white shadow-sm flex flex-col gap-3">
          
          <div class="flex flex-col gap-2">
             <div class="flex justify-between items-center">
                <span class="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-md uppercase tracking-wide">{{ field.type }}</span>
                
                <div class="flex items-center bg-gray-50 border border-gray-200 rounded-lg shadow-sm shrink-0">
                  <button type="button" @click="moveField(index, -1)" :disabled="index === 0" class="p-1 text-gray-500 hover:text-purple-600 disabled:opacity-30 disabled:hover:text-gray-500 transition-colors">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 15l7-7 7 7"></path></svg>
                  </button>
                  <div class="w-px h-4 bg-gray-200"></div>
                  <button type="button" @click="moveField(index, 1)" :disabled="index === form.fields.length - 1" class="p-1 text-gray-500 hover:text-purple-600 disabled:opacity-30 disabled:hover:text-gray-500 transition-colors">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"></path></svg>
                  </button>
                </div>
             </div>
             
             <input v-model="field.label" placeholder="Field Label" class="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold focus:outline-none focus:border-purple-500 transition-all shadow-inner" required />
          </div>

          <div v-if="field.type === 'CHOICE' || field.type === 'CHECKBOX'" class="pl-2 border-l-2 border-purple-100 space-y-2 mt-2">
            <div v-for="(_, optIndex) in field.options" :key="optIndex" class="flex items-center gap-2">
              <div class="w-4 h-4 rounded-full border-2 border-gray-300 shrink-0" :class="field.type === 'CHECKBOX' ? 'rounded-sm' : ''"></div>
              <input v-model="field.options[optIndex]" placeholder="Option text" class="flex-1 p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-purple-500" />
              <button @click="field.options.splice(optIndex, 1)" class="text-red-400 hover:text-red-600 p-2 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <button type="button" @click="field.options.push(`Option ${field.options.length + 1}`)" class="text-purple-600 text-[11px] font-bold mt-1 flex items-center gap-1 hover:text-purple-800 transition-colors">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
              Add Option
            </button>
          </div>

            <div v-if="field.type === 'RATING'" class="pl-2 border-l-2 border-purple-100 mt-2 py-1">
                <label class="flex items-center gap-3 text-xs font-bold text-gray-600">
                    Maximum Rating:
                <input 
                type="number" 
                v-model.number="field.maxRating" 
                min="2" 
                placeholder="e.g. 5"
                class="w-20 p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-purple-500 transition-colors" 
              />
            </label>
          </div>

          <div class="flex justify-between items-center mt-2 border-t border-gray-50">
            <label class="flex items-center gap-2 text-xs font-bold text-gray-600 cursor-pointer">
              <input type="checkbox" v-model="field.isRequired" class="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500" /> 
              Required
            </label>
            
            <button type="button" @click="removeField(index)" class="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors tracking-wide uppercase">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              Remove
            </button>
          </div>
        </div>
      </div>

      <button type="button" @click="showFieldTypeModal = true" class="w-full py-4 border-2 border-dashed border-purple-200 bg-purple-50/50 rounded-2xl text-purple-700 font-bold text-[12px] flex items-center justify-center gap-2 hover:bg-purple-50 transition-colors tracking-wide">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
        ADD FIELD
      </button>
    </div>

    <div v-else class="space-y-4 animate-fade-in">
      <div v-if="form.fields.length === 0" class="text-center py-10 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <p class="text-gray-400 text-sm">No fields added to this form yet.</p>
      </div>

      <div v-for="(field, index) in form.fields" :key="field.id" class="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
        <label class="block font-bold text-gray-800 mb-3 text-sm">
          {{ field.label }} <span v-if="field.isRequired" class="text-red-500 ml-1">*</span>
        </label>
        
        <input v-if="['TEXT', 'NUMBER', 'DATE'].includes(field.type)" :type="field.type.toLowerCase()" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" disabled placeholder="Participant response..." />
        
        <textarea v-if="field.type === 'TEXTAREA'" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm h-24 resize-none" disabled placeholder="Participant response..."></textarea>
        
        <div v-if="field.type === 'CHOICE'" class="space-y-2.5">
          <label v-for="opt in field.options" :key="opt" class="flex items-center gap-3">
            <div class="w-4 h-4 rounded-full border-2 border-gray-300 bg-gray-50"></div> 
            <span class="text-sm text-gray-600">{{ opt }}</span>
          </label>
        </div>
        
        <div v-if="field.type === 'CHECKBOX'" class="space-y-2.5">
          <label v-for="opt in field.options" :key="opt" class="flex items-center gap-3">
            <div class="w-4 h-4 rounded-sm border-2 border-gray-300 bg-gray-50"></div> 
            <span class="text-sm text-gray-600">{{ opt }}</span>
          </label>
        </div>

        <div v-if="field.type === 'RATING'" class="flex flex-wrap gap-2 mt-3">
          <label v-for="n in (field.maxRating || 5)" :key="n" class="cursor-not-allowed group">
            <input type="radio" disabled :name="`preview-rating-${field.id || index}`" :value="n" class="peer sr-only" />
            
            <div class="w-10 h-10 rounded-full border-2 border-gray-200 bg-gray-50 flex items-center justify-center text-sm font-bold text-gray-400 peer-disabled:opacity-70 shadow-sm transition-all">
              {{ n }}
            </div>
          </label>
        </div>
      </div>
    </div>

    <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-3 flex justify-center shadow-[0_-4px_10px_-2px_rgba(0,0,0,0.03)] z-20">
      <div class="max-w-3xl w-full flex justify-center gap-4 md:gap-6 px-4 md:px-0">
        <template v-if="!isEditMode">
          <button @click="router.push(`/events/${eventId}/forms/${formType}/responses`)" class="w-35 md:w-40 bg-gray-50 hover:bg-purple-50 text-gray-700 hover:text-purple-700 border border-gray-200 hover:border-purple-200 py-2.5 rounded-xl font-bold text-[11px] transition-all">
            Responses
          </button>
          <button @click="toggleEdit" class="w-35 md:w-40 bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-2.5 rounded-xl font-bold text-[11px] transition-all shadow-sm">
            Edit Form
          </button>
        </template>
        <template v-else>
          <button @click="saveForm" class="w-35 md:w-40 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 py-2.5 rounded-xl font-bold text-[11px] transition-all">
            SAVE FORM
          </button>
        </template>
      </div>
    </div>

    <div v-if="showFieldTypeModal" @click.self="showFieldTypeModal = false" class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 animate-fade-in p-4 pb-8">
      <div class="bg-white p-6 rounded-3xl shadow-xl max-w-sm w-full transform transition-all">
        
        <div class="flex justify-between items-center mb-4">
          <h3 class="font-bold text-lg text-gray-900 tracking-tight">Select Field Type</h3>
          <button @click="showFieldTypeModal = false" class="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-full transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div class="flex flex-col gap-2 max-h-[60vh] overflow-y-auto pr-2">
          <button v-for="type in availableFieldTypes" :key="type" @click="addField(type)" class="p-3 border border-gray-100 bg-gray-50 rounded-xl hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700 text-left text-sm font-semibold text-gray-700 transition-colors">
            {{ type }}
          </button>
        </div>
        
      </div>
    </div>

    <ConfirmModal 
      v-if="alertState.show"
      :title="alertState.title"
      :description="alertState.description"
      :confirmTheme="alertState.theme"
      confirmText="OK"
      @confirm="alertState.show = false"
    />

    <ConfirmModal 
      v-if="confirmState.show"
      :title="confirmState.title"
      :description="confirmState.description"
      :confirmTheme="confirmState.theme"
      :confirmText="confirmState.confirmText"
      cancelText="Cancel"
      @cancel="confirmState.show = false"
      @confirm="confirmState.onConfirm"
    />

  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.2s ease-in-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>