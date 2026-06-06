import { defineStore } from 'pinia';

export const useEventCreationStore = defineStore('eventCreation', {
  state: () => ({
    tempEventData: {} as Record<string, any>, 
    draftForms: {} as Record<string, any>,
    hasUnsavedChanges: false,
  }),
  actions: {
    setTempEventData(data: Record<string, any>) {
      this.tempEventData = data;
    },

    clearTempData() {
      this.tempEventData = {};
      this.hasUnsavedChanges = false;
    },
    
    setDraftForm(formType: string, formData: any) {
      this.draftForms[formType] = formData;
    },
    clearDraftForms() {
      this.draftForms = {};
    }
  }
});