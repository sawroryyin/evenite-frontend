import { defineStore } from 'pinia'
import type { EventData } from '../types'

export const useEventCreationStore = defineStore('eventCreation', {
  state: () => ({
    draftEvent: null as EventData | null,
    hasUnsavedChanges: false,
    
    // 1. ADDED: A place to hold forms in memory before the event is saved
    draftForms: {} as Record<string, any>
  }),
  
  actions: {
    setDraftEvent(data: EventData | null) {
      this.draftEvent = data
      this.hasUnsavedChanges = true
    },
    
    // 2. ADDED: Action to save a specific form type to memory
    setDraftForm(type: string, form: any) {
      this.draftForms[type] = form
    },
    
    // 3. ADDED: Action to clear just the forms
    clearDraftForms() {
      this.draftForms = {}
    },

    clearData() {
      this.draftEvent = null
      this.hasUnsavedChanges = false
      // 4. ADDED: Ensure forms are wiped out when all data is cleared
      this.draftForms = {} 
    }
  }
})