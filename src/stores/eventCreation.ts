import { defineStore } from 'pinia'
import type { EventData } from '../types'

export const useEventCreationStore = defineStore('eventCreation', {
  state: () => ({
    draftEvent: null as EventData | null,
    hasUnsavedChanges: false
  }),
  actions: {
    setDraftEvent(data: EventData | null) {
      this.draftEvent = data
      this.hasUnsavedChanges = true
    },
    clearData() {
      this.draftEvent = null
      this.hasUnsavedChanges = false
    }
  }
})