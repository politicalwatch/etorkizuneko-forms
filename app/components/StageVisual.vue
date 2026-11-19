<script setup lang="ts">
/*
 * The central animation, drawn by the app-wide player (useStage): which loop
 * it plays is up to the page, so every copy shows the same frame. Decorative.
 */
const stage = useStage()
const { ready } = stage
const canvas = useTemplateRef<HTMLCanvasElement>('canvas')

// The backing store follows the displayed size (sharp on any screen density),
// up to the frames' own size
function fit(el: HTMLCanvasElement) {
  const px = Math.min(Math.round(el.clientWidth * devicePixelRatio), stage.size)
  if (px && el.width !== px) {
    el.width = el.height = px
    stage.redraw(el)
  }
}

let observer: ResizeObserver | undefined

onMounted(() => {
  const el = canvas.value!
  fit(el)
  stage.attach(el)
  observer = new ResizeObserver(() => fit(el))
  observer.observe(el)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  stage.detach(canvas.value!)
})
</script>

<template>
  <div
    class="pointer-events-none relative aspect-square w-full max-w-72"
    aria-hidden="true"
  >
    <canvas
      ref="canvas"
      class="absolute inset-0 size-full transition-opacity duration-500"
      :class="ready ? 'opacity-100' : 'opacity-0'"
    />
  </div>
</template>
