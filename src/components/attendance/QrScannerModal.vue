<script setup lang="ts">
import { ref, computed } from 'vue'
import { QrcodeStream } from 'vue-qrcode-reader'
import { type ScanOutcome, extractQrToken } from '../../services/AttendanceService'

const props = defineProps<{
  eventTitle: string
  submit: (qrToken: string) => Promise<ScanOutcome>
}>()

const emit = defineEmits<{ (e: 'close'): void }>()

type Phase = 'starting' | 'scanning' | 'processing' | 'result' | 'camera-error'

const phase = ref<Phase>('starting')
const outcome = ref<ScanOutcome | null>(null)
const cameraError = ref('')
const streamKey = ref(0)

// constant object so the camera is not restarted on every re-render
const constraints = { facingMode: 'environment' }

const isPaused = computed(() => phase.value === 'processing' || phase.value === 'result')

const onCameraOn = () => {
  if (phase.value === 'starting') phase.value = 'scanning'
}

const onDetect = async (codes: Array<{ rawValue: string }>) => {
  if (phase.value !== 'scanning') return
  const raw = codes[0]?.rawValue
  if (!raw) return

  phase.value = 'processing'
  try {
    outcome.value = await props.submit(extractQrToken(raw))
  } catch {
    outcome.value = { status: 'error', title: 'Check-in failed', message: 'Something went wrong. Please try again.' }
  }
  if (outcome.value?.status === 'success') navigator.vibrate?.(120)
  phase.value = 'result'
}

const scanNext = () => {
  outcome.value = null
  phase.value = 'scanning'
}

const onError = (err: Error) => {
  const messages: Record<string, string> = {
    NotAllowedError: 'Camera permission was denied. Please allow camera access in your browser settings.',
    NotFoundError: 'No camera was found on this device.',
    NotSupportedError: 'Camera access requires a secure (HTTPS) connection.',
    InsecureContextError: 'Camera access requires a secure (HTTPS) connection.',
    NotReadableError: 'The camera is being used by another app.',
    OverconstrainedError: 'No suitable camera was found on this device.',
    StreamApiNotSupportedError: 'This browser does not support camera access.'
  }
  cameraError.value = messages[err?.name] || 'Could not start the camera.'
  phase.value = 'camera-error'
}

const retryCamera = () => {
  cameraError.value = ''
  phase.value = 'starting'
  streamKey.value++
}

const resultStyle = computed(() => {
  switch (outcome.value?.status) {
    case 'success': return { circle: 'bg-emerald-50 text-emerald-600 border-emerald-200', icon: 'M5 13l4 4L19 7' }
    case 'warning': return { circle: 'bg-amber-50 text-amber-600 border-amber-200', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' }
    default: return { circle: 'bg-red-50 text-red-600 border-red-200', icon: 'M6 18L18 6M6 6l12 12' }
  }
})
</script>

<template>
  <div
    @click.self="emit('close')"
    class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 animate-fade-in p-4 pb-8 font-['Lato']"
  >
    <div class="bg-white p-6 rounded-3xl shadow-xl max-w-sm w-full">
      <div class="flex justify-between items-start gap-3 mb-4">
        <div class="min-w-0">
          <h3 class="font-['Nunito'] font-black text-xl text-[#131B2B] tracking-tight">Scan Ticket</h3>
          <p class="text-xs font-semibold text-[#131B2B]/60 mt-0.5 truncate">{{ eventTitle }}</p>
        </div>
        <button @click="emit('close')" class="text-[#131B2B]/50 hover:text-[#131B2B] hover:bg-[#131B2B]/5 p-1.5 rounded-full transition-colors cursor-pointer shrink-0">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <div class="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#131B2B] shadow-inner">
        <QrcodeStream
          v-if="phase !== 'camera-error'"
          :key="streamKey"
          :paused="isPaused"
          :constraints="constraints"
          @camera-on="onCameraOn"
          @detect="onDetect"
          @error="onError"
        />

        <!-- Viewfinder -->
        <div v-if="phase === 'scanning'" class="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div class="relative w-3/5 aspect-square">
            <span class="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-xl"></span>
            <span class="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-xl"></span>
            <span class="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-xl"></span>
            <span class="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-xl"></span>
            <div class="scan-line absolute left-2 right-2 h-0.5 bg-[#F26E22] shadow-[0_0_12px_#F26E22]"></div>
          </div>
        </div>

        <!-- Starting -->
        <div v-if="phase === 'starting'" class="absolute inset-0 flex flex-col items-center justify-center bg-[#131B2B]">
          <div class="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
          <p class="text-white/80 text-xs font-bold tracking-widest uppercase mt-3">Starting camera...</p>
        </div>

        <!-- Processing -->
        <div v-if="phase === 'processing'" class="absolute inset-0 flex flex-col items-center justify-center bg-[#131B2B]/70 backdrop-blur-sm">
          <div class="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
          <p class="text-white text-xs font-bold tracking-widest uppercase mt-3">Checking ticket...</p>
        </div>

        <!-- Result -->
        <div v-if="phase === 'result' && outcome" class="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-white/95 animate-fade-in">
          <div class="w-16 h-16 rounded-full border-2 flex items-center justify-center mb-4" :class="resultStyle.circle">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" :d="resultStyle.icon"></path>
            </svg>
          </div>
          <h4 class="font-['Nunito'] font-black text-lg text-[#131B2B] tracking-tight">{{ outcome.title }}</h4>
          <p class="text-sm font-semibold text-[#131B2B]/70 mt-1.5 whitespace-pre-line">{{ outcome.message }}</p>
        </div>

        <!-- Camera error -->
        <div v-if="phase === 'camera-error'" class="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
          <div class="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center mb-4">
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
          </div>
          <p class="text-white text-sm font-bold">{{ cameraError }}</p>
          <button @click="retryCamera" class="mt-4 bg-white text-[#131B2B] px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-sm hover:bg-white/90 transition-colors cursor-pointer">
            Retry
          </button>
        </div>
      </div>

      <p class="text-xs font-semibold text-[#131B2B]/60 text-center mt-4">
        Point the camera at the participant's ticket QR code.
      </p>

      <div class="flex gap-3 mt-5">
        <button @click="emit('close')" class="flex-1 bg-white border border-[#131B2B]/10 hover:bg-[#131B2B]/5 text-[#131B2B] py-3 rounded-xl font-bold text-sm transition-colors shadow-sm cursor-pointer">
          Close
        </button>
        <button
          v-if="phase === 'result'"
          @click="scanNext"
          class="flex-1 bg-[#131B2B] hover:bg-[#131B2B]/80 text-white py-3 rounded-xl font-bold text-sm transition-colors shadow-sm cursor-pointer"
        >
          Scan Next
        </button>
      </div>
    </div>
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
.scan-line {
  animation: scan 2s ease-in-out infinite alternate;
}
@keyframes scan {
  from { top: 8%; }
  to { top: 92%; }
}
</style>