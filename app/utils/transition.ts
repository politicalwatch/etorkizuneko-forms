import { gsap } from 'gsap'

/*
 * Helpers for the swap transitions (TransitionElevator, TransitionDoor):
 * GSAP-driven <Transition>s of a keyed single child where the old and the
 * new one overlap.
 */

export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Takes a leaving element out of the flow, pinned where it is, and makes it
 * inert, so the next one can take its place while it animates out. Call it
 * from the leave hook: the next element isn't inserted yet. Its container
 * must be positioned.
 */
export function pinLeaving(el: HTMLElement) {
  el.inert = true
  gsap.set(el, {
    position: 'absolute',
    top: el.offsetTop,
    left: el.offsetLeft,
    width: el.offsetWidth
  })
}

/** Swapped again mid-way: the next tween starts from where this one stopped. */
export const stopSwap = (el: Element) => gsap.killTweensOf(el)
