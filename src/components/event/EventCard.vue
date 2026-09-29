<script setup lang="ts">
import { computed } from 'vue'
import type { EventData } from '../../types'

const props = withDefaults(defineProps<{
  event: EventData | any,
  variant?: 'hero' | 'grid'
}>(), {
  variant: 'grid'
})

const displayTitle = computed(() =>
  props.event.title?.en || props.event.title?.th || 'Untitled Event'
)

const displayCategory = computed(() => {
  const cat = Array.isArray(props.event.category) ? props.event.category[0] : props.event.category
  // replaceAll: "CLUB_ACTIVITY" -> "CLUB ACTIVITY" (replace only fixed the first "_")
  return typeof cat === 'string' && cat ? cat.replaceAll('_', ' ') : 'EVENT'
})

const displayDate = computed(() => {
  if (!props.event.startAt) return 'TBA'
  const date = new Date(props.event.startAt)
  const sameYear = date.getFullYear() === new Date().getFullYear()
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
  })
})

const displayLocation = computed(() => {
  if (props.event.isOnline) return 'Online Event'
  return props.event.location?.en || props.event.location?.th || 'TBA'
})

const displayImage = computed(() =>
  props.event.bannerUrl || 'https://placehold.co/600x400/EEEDFE/3C3489?text=Event'
)
</script>

<template>
  <div
    class="@container border border-[#131B2B]/10 rounded-xl overflow-hidden shadow-sm bg-white hover:shadow-md transition-shadow cursor-pointer flex flex-col h-full font-['Lato']"
  >
    <img
      :src="displayImage"
      :alt="displayTitle"
      loading="lazy"
      class="w-full aspect-4/3 object-cover"
    />

    <div class="flex flex-col grow p-3 @min-[240px]:p-4">
      <!-- Category + date: stacked on narrow cards, side by side on wide ones -->
      <div class="flex items-center justify-between gap-2 mb-2 @min-[240px]:mb-2.5">
        <span
          class="min-w-0 truncate text-[9px] @min-[240px]:text-[10px] font-extrabold text-[#131B2B] bg-[#131B2B]/5 px-2 py-1 rounded-md uppercase tracking-wider @min-[240px]:tracking-widest border border-[#131B2B]/10 leading-none"
        >
          {{ displayCategory }}
        </span>
        <span class="hidden @min-[240px]:inline shrink-0 text-xs font-bold text-[#131B2B]/70 whitespace-nowrap">
          {{ displayDate }}
        </span>
      </div>

      <h3
        class="font-bold text-sm @min-[240px]:text-base text-[#131B2B] leading-snug mb-2 @min-[240px]:mb-3 line-clamp-2 grow tracking-tight"
      >
        {{ displayTitle }}
      </h3>

      <div class="mt-auto flex flex-col gap-1">
        <!-- Date line: only on narrow cards -->
        <div class="flex @min-[240px]:hidden items-center gap-1.5 text-[11px] font-semibold text-[#131B2B]/70">
          <svg class="w-3.5 h-3.5 text-[#131B2B]/50 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span class="truncate">{{ displayDate }}</span>
        </div>

        <!-- Location line -->
        <div class="flex items-center gap-1.5 text-[11px] @min-[240px]:text-xs font-semibold text-[#131B2B]/70">
          <svg class="w-3.5 h-3.5 @min-[240px]:w-4 @min-[240px]:h-4 text-[#131B2B]/50 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span class="truncate">{{ displayLocation }}</span>
        </div>
      </div>
    </div>
  </div>
</template>