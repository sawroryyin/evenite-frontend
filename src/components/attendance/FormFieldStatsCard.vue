<script setup lang="ts">
import { computed } from 'vue'
import type { AnalyticsFieldStats } from '../../services/AnalyticService'

// One question of a registration / feedback form, rendered from the backend's AnalyticsFieldStatsDto:
//   CHOICE, CHECKBOX     -> options[] (every defined option, 0 included)
//   NUMBER               -> average / min / max
//   RATING               -> average / min / max + distribution[] (only values that occurred)
//   TEXT, TEXTAREA, DATE -> answered count only (content lives on the Form Response page)

const props = defineProps<{
  field: AnalyticsFieldStats
  index: number
  responses: number // total responses of the form, for "x of y answered"
}>()

const TYPE_LABEL: Record<string, string> = {
  CHOICE: 'Single choice',
  CHECKBOX: 'Multiple choice',
  NUMBER: 'Number',
  RATING: 'Rating',
  TEXT: 'Short text',
  TEXTAREA: 'Long text',
  DATE: 'Date'
}

const typeLabel = computed(() => TYPE_LABEL[props.field.type] ?? props.field.type)
const isChoice = computed(() => props.field.type === 'CHOICE' || props.field.type === 'CHECKBOX')
const isNumeric = computed(() => props.field.type === 'NUMBER' || props.field.type === 'RATING')
const isRating = computed(() => props.field.type === 'RATING')

// ---------- Choice / checkbox ----------

const options = computed(() => props.field.options ?? [])
const topCount = computed(() => Math.max(0, ...options.value.map(o => o.count)))

// percent of people who answered this question (checkbox can exceed 100% in total, which is correct)
const optionPercent = (count: number) =>
  props.field.answered ? Math.round((count / props.field.answered) * 100) : 0

const isTop = (count: number) => count > 0 && count === topCount.value

// "Most selected" line; ties are listed together
const topOptions = computed(() =>
  topCount.value > 0 ? options.value.filter(o => o.count === topCount.value).map(o => o.value) : []
)

// ---------- Rating ----------

const distribution = computed(() => props.field.distribution ?? [])
const maxDist = computed(() => Math.max(1, ...distribution.value.map(d => d.count)))

const fmtNum = (n: number | null | undefined) =>
  n === null || n === undefined ? '—' : Number.isInteger(n) ? `${n}` : n.toFixed(2)
</script>

<template>
  <div class="bg-white p-4 rounded-2xl border border-[#131B2B]/10 shadow-sm">
    <div class="flex items-start justify-between gap-3">
      <p class="text-sm font-bold text-[#131B2B] leading-snug min-w-0">
        <span class="text-[#131B2B]/40 mr-1">Q{{ index + 1 }}.</span>{{ field.label }}
      </p>
      <span class="shrink-0 text-[9px] font-black uppercase tracking-widest text-[#131B2B]/60 bg-[#131B2B]/5 border border-[#131B2B]/10 px-2 py-1 rounded-md">
        {{ typeLabel }}
      </span>
    </div>
    <p class="text-[11px] font-semibold text-[#131B2B]/60 mt-1">
      {{ field.answered }} of {{ responses }} answered
    </p>

    <!-- CHOICE / CHECKBOX -->
    <template v-if="isChoice">
      <p v-if="field.answered === 0" class="text-xs font-semibold text-[#131B2B]/50 mt-3">No answers yet.</p>
      <template v-else>
        <p class="text-[11px] font-bold text-[#131B2B] mt-3">
          Most selected:
          <span class="text-[#F26E22]">{{ topOptions.join(', ') }}</span>
          <span class="text-[#131B2B]/50"> · {{ topCount }}</span>
        </p>
        <div class="mt-3 space-y-2.5">
          <div v-for="o in options" :key="o.value">
            <div class="flex items-center justify-between gap-3 text-xs font-bold mb-1">
              <span class="truncate" :class="isTop(o.count) ? 'text-[#131B2B]' : 'text-[#131B2B]/70'">{{ o.value }}</span>
              <span class="shrink-0 tabular-nums text-[#131B2B]/70">{{ o.count }} of {{ field.answered }} · {{ optionPercent(o.count) }}%</span>
            </div>
            <div class="h-2 w-full bg-[#131B2B]/10 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full fill"
                :class="isTop(o.count) ? 'bg-[#F26E22]' : 'bg-[#131B2B]'"
                :style="{ width: `${optionPercent(o.count)}%` }"
              ></div>
            </div>
          </div>
        </div>
        <p v-if="field.type === 'CHECKBOX'" class="text-[10px] font-semibold text-[#131B2B]/50 mt-2.5">
          Multiple answers allowed, so percentages can add up to more than 100%.
        </p>
      </template>
    </template>

    <!-- NUMBER / RATING -->
    <template v-else-if="isNumeric">
      <p v-if="field.answered === 0" class="text-xs font-semibold text-[#131B2B]/50 mt-3">No answers yet.</p>
      <template v-else>
        <div class="grid grid-cols-3 gap-2 mt-3">
          <div class="bg-[#131B2B]/5 border border-[#131B2B]/10 rounded-xl p-2.5">
            <p class="text-[9px] font-black text-[#131B2B]/60 uppercase tracking-widest">Average</p>
            <p class="text-base font-['Nunito'] font-black text-[#131B2B] leading-tight mt-0.5">{{ fmtNum(field.average) }}</p>
          </div>
          <div class="bg-[#131B2B]/5 border border-[#131B2B]/10 rounded-xl p-2.5">
            <p class="text-[9px] font-black text-[#131B2B]/60 uppercase tracking-widest">Min</p>
            <p class="text-base font-['Nunito'] font-black text-[#131B2B] leading-tight mt-0.5">{{ fmtNum(field.min) }}</p>
          </div>
          <div class="bg-[#131B2B]/5 border border-[#131B2B]/10 rounded-xl p-2.5">
            <p class="text-[9px] font-black text-[#131B2B]/60 uppercase tracking-widest">Max</p>
            <p class="text-base font-['Nunito'] font-black text-[#131B2B] leading-tight mt-0.5">{{ fmtNum(field.max) }}</p>
          </div>
        </div>

        <div v-if="isRating && distribution.length" class="mt-3 space-y-1.5">
          <div v-for="d in distribution" :key="d.value" class="flex items-center gap-2 text-xs font-bold">
            <span class="w-8 shrink-0 text-[#131B2B]/70 tabular-nums">{{ d.value }}★</span>
            <div class="flex-1 h-2 bg-[#131B2B]/10 rounded-full overflow-hidden">
              <div class="h-full bg-[#F26E22] rounded-full fill" :style="{ width: `${(d.count / maxDist) * 100}%` }"></div>
            </div>
            <span class="w-6 shrink-0 text-right text-[#131B2B]/70 tabular-nums">{{ d.count }}</span>
          </div>
        </div>
      </template>
    </template>

    <!-- TEXT / TEXTAREA / DATE -->
    <p v-else class="text-[11px] font-semibold text-[#131B2B]/50 mt-2">
      Individual answers are shown in the responses list.
    </p>
  </div>
</template>

<style scoped>
.fill { transition: width 0.5s ease-out; }
</style>