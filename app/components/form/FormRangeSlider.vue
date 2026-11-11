<script setup lang="ts">
/*
 * Arc-shaped agreement slider (1–5 by default). The value is continuous:
 * it follows the pointer along the dial and only snaps to `step` (0.1 by
 * default). Labels and ticks are independent of `step`.
 *
 * USlider can't draw an arc, so this is custom: an SVG dial plus our own
 * pointer, wheel/trackpad and keyboard handling, exposed as a WAI-ARIA
 * slider. The value is
 * null until the person interacts, so an untouched question is never
 * recorded as a neutral answer.
 *
 * Pass `aria-label` / `aria-labelledby` to name it.
 */
const model = defineModel<number | null>({ default: null })

const props = withDefaults(defineProps<{
  min?: number
  max?: number
  // Value precision
  step?: number
  // Distance between labelled values; also the PageUp/PageDown jump
  labelStep?: number
  // Tick intervals per label: 5 → a tick every 0.2 on a 1–5 scale, so each
  // 0.1 step lands on a tick or halfway between two
  ticksPerLabel?: number
  // Change the value with the mouse wheel / trackpad while hovering
  wheel?: boolean
  disabled?: boolean
}>(), {
  wheel: true,
  min: 1,
  max: 5,
  step: 0.1,
  labelStep: 1,
  ticksPerLabel: 5,
  disabled: false
})

// ── Geometry (SVG user units) ────────────────────────────────────────────────
const WIDTH = 320
const HEIGHT = 128
const SPAN = (36 * Math.PI) / 180 // half-angle of the arc
const RADIUS = 238
const TICK_LENGTH = 22
const CX = WIDTH / 2
const CY = RADIUS + TICK_LENGTH + 30 // leaves room for the dot above the arc

// Position along the arc for t in [0, 1] at a given radius
function point(t: number, radius: number) {
  const angle = (2 * t - 1) * SPAN
  return {
    x: CX + radius * Math.sin(angle),
    y: CY - radius * Math.cos(angle),
    deg: (angle * 180) / Math.PI
  }
}

const range = computed(() => props.max - props.min)
const toT = (value: number) => (value - props.min) / range.value

const valueT = computed(() => (model.value == null ? null : toT(model.value)))

const ticks = computed(() => {
  const count = Math.round((range.value / props.labelStep) * props.ticksPerLabel)
  return Array.from({ length: count + 1 }, (_, index) => {
    const t = index / count
    const from = point(t, RADIUS)
    const to = point(t, RADIUS + TICK_LENGTH)
    return {
      t,
      from,
      to,
      // Fade both ends of the dial
      opacity: 0.15 + 0.85 * Math.min(1, Math.min(t, 1 - t) * 3.5),
      active: valueT.value != null && t <= valueT.value + 1e-6
    }
  })
})

const labels = computed(() => {
  const values: number[] = []
  const count = Math.round(range.value / props.labelStep)
  for (let index = 0; index <= count; index++) values.push(props.min + index * props.labelStep)
  return values.map(value => ({ value, ...point(toT(value), RADIUS - 16) }))
})

// Untouched: show a faded dot in the middle as a hint
const dot = computed(() => point(valueT.value ?? 0.5, RADIUS + TICK_LENGTH + 14))

// ── Interaction ──────────────────────────────────────────────────────────────
// Decimals of `step`, to strip float noise (1.1 + 0.1 = 1.2000000000000002)
const decimals = computed(() => (String(props.step).split('.')[1] ?? '').length)

function clampToStep(value: number) {
  const stepped = Math.round((value - props.min) / props.step) * props.step + props.min
  const clamped = Math.min(props.max, Math.max(props.min, stepped))
  return Number(clamped.toFixed(decimals.value))
}

const valueText = computed(() =>
  model.value == null ? undefined : model.value.toFixed(decimals.value)
)

// Unrounded wheel position. Trackpads send many tiny deltas that would each
// round away to nothing, so accumulate here and only round what we emit.
let wheelValue: number | null = null

// Drop the accumulator if the parent sets a different value. Compared on
// change (not per event) because v-model updates lag a burst of events.
watch(model, (value) => {
  if (wheelValue != null && value !== clampToStep(wheelValue)) wheelValue = null
})

function set(value: number, { fromWheel = false } = {}) {
  if (props.disabled) return
  if (!fromWheel) wheelValue = null
  model.value = clampToStep(value)
}

const svg = useTemplateRef<SVGSVGElement>('svg')
const dragging = ref(false)

function valueFromPointer(event: PointerEvent) {
  const element = svg.value
  const matrix = element?.getScreenCTM()
  if (!element || !matrix) return null
  const local = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse())
  const angle = Math.atan2(local.x - CX, CY - local.y)
  const t = Math.min(1, Math.max(0, (angle / SPAN + 1) / 2))
  return props.min + t * range.value
}

function onPointerDown(event: PointerEvent) {
  if (props.disabled) return
  const target = event.currentTarget as HTMLElement
  target.setPointerCapture(event.pointerId)
  dragging.value = true
  const value = valueFromPointer(event)
  if (value != null) set(value)
}

function onPointerMove(event: PointerEvent) {
  if (!dragging.value) return
  const value = valueFromPointer(event)
  if (value != null) set(value)
}

function onPointerUp() {
  dragging.value = false
}

// Scroll distance (px) that moves the value by one label: a mouse wheel
// notch (~100px) moves ~0.4, trackpads glide smoothly
const WHEEL_PX_PER_LABEL = 250
// deltaMode → px (pixels, lines, pages)
const WHEEL_UNIT = [1, 16, 400]

function onWheel(event: WheelEvent) {
  if (!props.wheel || props.disabled) return
  // While hovering the dial, the wheel drives it instead of the page
  event.preventDefault()

  // Scroll up / swipe right increases; use whichever axis dominates
  const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : -event.deltaY
  const px = delta * (WHEEL_UNIT[event.deltaMode] ?? 1)

  const base = wheelValue ?? model.value ?? props.min + range.value / 2
  wheelValue = Math.min(props.max, Math.max(props.min, base + (px / WHEEL_PX_PER_LABEL) * props.labelStep))
  set(wheelValue, { fromWheel: true })
}

function onKeydown(event: KeyboardEvent) {
  const big = props.labelStep
  const middle = props.min + range.value / 2
  const current = model.value

  const next: Record<string, () => number> = {
    ArrowRight: () => (current == null ? middle : current + props.step),
    ArrowUp: () => (current == null ? middle : current + props.step),
    ArrowLeft: () => (current == null ? middle : current - props.step),
    ArrowDown: () => (current == null ? middle : current - props.step),
    PageUp: () => (current ?? middle) + big,
    PageDown: () => (current ?? middle) - big,
    Home: () => props.min,
    End: () => props.max
  }

  const compute = next[event.key]
  if (!compute) return
  event.preventDefault()
  set(compute())
}
</script>

<template>
  <div
    role="slider"
    :tabindex="disabled ? -1 : 0"
    :aria-valuemin="min"
    :aria-valuemax="max"
    :aria-valuenow="model ?? undefined"
    :aria-valuetext="valueText"
    :aria-disabled="disabled || undefined"
    class="
      w-full max-w-sm cursor-pointer touch-none rounded-xl select-none
      focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-500
      aria-disabled:cursor-not-allowed aria-disabled:opacity-50
    "
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
    @wheel="onWheel"
    @keydown="onKeydown"
  >
    <svg
      ref="svg"
      :viewBox="`0 0 ${WIDTH} ${HEIGHT}`"
      class="block h-auto w-full overflow-visible"
      aria-hidden="true"
    >
      <line
        v-for="tick in ticks"
        :key="tick.t"
        :x1="tick.from.x"
        :y1="tick.from.y"
        :x2="tick.to.x"
        :y2="tick.to.y"
        stroke-width="2.5"
        stroke-linecap="round"
        :stroke-opacity="tick.opacity"
        :class="tick.active ? 'stroke-brand-500' : 'stroke-current opacity-45'"
        class="transition-[stroke] duration-150"
      />

      <text
        v-for="label in labels"
        :key="label.value"
        :x="label.x"
        :y="label.y"
        :transform="`rotate(${label.deg} ${label.x} ${label.y})`"
        text-anchor="middle"
        dominant-baseline="hanging"
        class="fill-current text-[12px] font-light"
      >{{ label.value }}</text>

      <circle
        :cx="dot.x"
        :cy="dot.y"
        r="7"
        class="fill-brand-500 transition-opacity"
        :class="model == null ? 'opacity-25' : 'opacity-100'"
      />
    </svg>
  </div>
</template>
