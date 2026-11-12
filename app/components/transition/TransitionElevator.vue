<script setup lang="ts">
import { gsap } from 'gsap'

/*
 * "Elevator" swap for a keyed single child: the old one rises out of sight
 * and the next one rises into place from below, both through blur and fade,
 * while everything around stays still. They overlap: the leaving one is taken
 * out of the flow where it was (so the parent must be positioned) and made
 * inert. With prefers-reduced-motion it is a plain crossfade.
 */

// How far they travel: the next one comes from well below, the old one only
// drifts up as it fades
const ENTER_DISTANCE = '30vh'
const LEAVE_DISTANCE = '-8vh'
const BLUR = 'blur(10px)'

const motion = (y: string) => (prefersReducedMotion() ? {} : { y, filter: BLUR })

function onEnter(el: Element, done: () => void) {
  gsap.from(el, {
    ...motion(ENTER_DISTANCE),
    opacity: 0,
    duration: 0.75,
    // Let the old one mostly clear the way first
    delay: 0.3,
    ease: 'power3.out',
    clearProps: 'transform,filter,opacity',
    onComplete: done
  })
}

function onLeave(el: Element, done: () => void) {
  pinLeaving(el as HTMLElement)
  gsap.to(el, {
    ...motion(LEAVE_DISTANCE),
    opacity: 0,
    duration: 0.45,
    ease: 'power2.in',
    onComplete: done
  })
}
</script>

<template>
  <Transition
    :css="false"
    @enter="onEnter"
    @leave="onLeave"
    @enter-cancelled="stopSwap"
    @leave-cancelled="stopSwap"
  >
    <slot />
  </Transition>
</template>
