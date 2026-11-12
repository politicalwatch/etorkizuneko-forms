<script setup lang="ts">
import { gsap } from 'gsap'

/*
 * "Door" swap for a keyed single child: the old one swings open towards the
 * viewer on a hinge at one side, and the next one swings shut into place
 * from behind, both through blur and fade. Below md (stacked mobile layout,
 * where a side hinge makes little sense) the old one zooms towards the viewer
 * instead and the next one zooms in from behind. They overlap: the leaving
 * one is taken out of the flow where it was (so the parent must be
 * positioned) and made inert. With prefers-reduced-motion it is a plain
 * crossfade.
 */
const { hinge = 'left' } = defineProps<{
  // Side the door turns on
  hinge?: 'left' | 'right'
}>()

const ANGLE = 75
const PERSPECTIVE = 900
// Mobile zoom: scale when towards the viewer / behind. The next one comes
// from well behind, so the move reads (as with the elevator's distance)
const ZOOM_TOWARDS = 1.4
const ZOOM_BEHIND = 0.5
const BLUR = 'blur(10px)'
// Tailwind's md: where the layout goes side by side
const DOOR_MEDIA = '(min-width: 48rem)'

// rotateY > 0 sends the right side away from the viewer: the free edge comes
// forward with a negative angle on a left hinge, a positive one on a right one
const forwardAngle = () => (hinge === 'left' ? -ANGLE : ANGLE)

// Where the element is: open towards the viewer, or behind its place.
// Origin and depth are set, not tweened (a tweened origin would slide the hinge)
function motion(el: Element, towards: boolean) {
  if (prefersReducedMotion()) return {}

  if (!window.matchMedia(DOOR_MEDIA).matches) {
    gsap.set(el, { transformOrigin: 'center center' })
    return { scale: towards ? ZOOM_TOWARDS : ZOOM_BEHIND, filter: BLUR }
  }

  gsap.set(el, { transformOrigin: `${hinge} center`, transformPerspective: PERSPECTIVE })
  return { rotationY: towards ? forwardAngle() : -forwardAngle(), filter: BLUR }
}

/*
 * Opacity runs on its own curve, not the movement's: tied together, the next
 * one only showed up once it had nearly landed, and the old one was gone
 * before it had swung, so the move didn't read. Here the next one is visible
 * through most of its swing, and the old one fades only near the end of its.
 */

function onEnter(el: Element, done: () => void) {
  gsap.timeline({
    // Let the old one mostly clear the way first
    delay: 0.5,
    onComplete: () => {
      gsap.set(el, { clearProps: 'transform,transform-origin,filter,opacity' })
      done()
    }
  })
    // From behind
    .from(el, { ...motion(el, false), duration: 1.1, ease: 'power3.out' }, 0)
    .from(el, { opacity: 0, duration: 0.45, ease: 'power1.out' }, 0)
}

function onLeave(el: Element, done: () => void) {
  pinLeaving(el as HTMLElement)
  gsap.timeline({ onComplete: done })
    .to(el, { ...motion(el, true), duration: 0.7, ease: 'power2.in' }, 0)
    .to(el, { opacity: 0, duration: 0.7, ease: 'power3.in' }, 0)
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
