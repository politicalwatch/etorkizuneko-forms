import { gsap } from 'gsap'
import { Observer } from 'gsap/Observer'

// Share of the travel past which letting go completes the move
const THRESHOLD = 0.25
// Seconds the cover takes to catch up with the input: turns wheel steps into a glide
const SCRUB_SMOOTHING = 0.3

const FORWARD_KEYS = ['ArrowDown', 'PageDown', ' ']

/**
 * Scroll-driven move to the next step. `cover` is the next screen, laid over
 * the current one: while it is mounted, scrolling (wheel, trackpad or swipe)
 * makes it rise from the bottom, following the input. Letting go past
 * THRESHOLD completes the move and calls `onAdvance`; before that, it falls
 * back. Arrow down, Page down and Space, or `advance()` (e.g. from a button),
 * play the whole move.
 *
 * With prefers-reduced-motion the cover fades in instead of sliding.
 */
export function useScrollAdvance(
  cover: Readonly<Ref<HTMLElement | null>>,
  onAdvance: () => void
) {
  let el: HTMLElement | null = null
  let observer: Observer | undefined
  let progress = 0
  let advancing = false
  let reducedMotion = false

  // Cover state for a progress: 0 = out of view, 1 = in place
  function moveTo(target: number, duration: number, ease: string, onComplete?: () => void) {
    gsap.to(el, {
      ...(reducedMotion ? { autoAlpha: target } : { yPercent: 100 * (1 - target) }),
      duration,
      ease,
      overwrite: true,
      onComplete
    })
  }

  // delta in px, positive = forward
  function scrubBy(delta: number) {
    if (advancing) return
    progress = gsap.utils.clamp(0, 1, progress + delta / window.innerHeight)
    moveTo(progress, SCRUB_SMOOTHING, 'power3.out')
  }

  function release() {
    if (advancing) return
    if (progress >= THRESHOLD) {
      advance()
    } else {
      progress = 0
      moveTo(0, 0.4, 'power2.out')
    }
  }

  function advance() {
    if (advancing || !el) return
    advancing = true
    observer?.disable()
    // Shorter when the cover is already partly in
    moveTo(1, 0.35 + 0.5 * (1 - progress), 'power2.inOut', onAdvance)
  }

  function onKeydown(event: KeyboardEvent) {
    if (!FORWARD_KEYS.includes(event.key) || event.shiftKey || event.altKey || event.ctrlKey || event.metaKey) return
    if (event.target instanceof Element && event.target.closest('input, textarea, select, [contenteditable]')) return
    event.preventDefault()
    advance()
  }

  watch(cover, (element, _, onCleanup) => {
    if (!element) return

    el = element
    progress = 0
    advancing = false
    reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    gsap.registerPlugin(Observer)
    gsap.set(el, reducedMotion ? { autoAlpha: 0 } : { yPercent: 100 })

    observer = Observer.create({
      target: window,
      type: 'wheel,touch',
      // Wheel down reads like a swipe up: both give a negative deltaY
      wheelSpeed: -1,
      // No native scroll or pull-to-refresh meanwhile, but taps still click
      preventDefault: true,
      allowClicks: true,
      onChangeY: self => scrubBy(-self.deltaY),
      // Finger lifted
      onRelease: release,
      // Wheel / trackpad gone quiet (a still finger isn't a release)
      onStop: (self) => {
        if (self.event.type === 'wheel') release()
      },
      onStopDelay: 0.15
    })
    window.addEventListener('keydown', onKeydown)

    onCleanup(() => {
      observer?.kill()
      observer = undefined
      window.removeEventListener('keydown', onKeydown)
      gsap.killTweensOf(element)
      el = null
    })
  })

  return { advance }
}
