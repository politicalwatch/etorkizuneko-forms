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

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const motion = (y: string) => (reducedMotion() ? {} : { y, filter: BLUR })

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
  const element = el as HTMLElement
  element.inert = true
  // Still in the flow here (the next one isn't inserted yet): pin it in place
  gsap.set(element, {
    position: 'absolute',
    top: element.offsetTop,
    left: element.offsetLeft,
    width: element.offsetWidth
  })
  gsap.to(element, {
    ...motion(LEAVE_DISTANCE),
    opacity: 0,
    duration: 0.45,
    ease: 'power2.in',
    onComplete: done
  })
}

// Swapped again mid-way: the next tween starts from where this one stopped
const stop = (el: Element) => gsap.killTweensOf(el)
</script>

<template>
  <Transition
    :css="false"
    @enter="onEnter"
    @leave="onLeave"
    @enter-cancelled="stop"
    @leave-cancelled="stop"
  >
    <slot />
  </Transition>
</template>
