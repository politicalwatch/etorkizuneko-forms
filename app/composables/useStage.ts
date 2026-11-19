import manifest from '~/assets/stage/abstract-blob.json'

/*
 * The central animation (StageVisual): one After Effects render, played on
 * canvas from its frames (scripts/stage-frames.sh). It holds a short loop per
 * stage of the flow, played back and forth; the frames between two loops are
 * the transition from one to the next.
 *
 * There's a single player for the whole app: every StageVisual draws the same
 * frame, so the animation carries on across screens (and the incoming copy of
 * a scroll transition matches the leaving one). The page sets the target loop
 * from the current step.
 *
 * Moving on, the animation never skips a frame: it turns around wherever it
 * is in the loop (the loops are symmetric, so it looks the same either way),
 * plays to the end of it and through the transition. Moving back (only on a
 * reset) it cuts.
 */

/** Frame ranges of the loops, at 60 fps (AE timecode s:ff → s * 60 + ff). */
const LOOPS: readonly (readonly [number, number])[] = [
  [0, 14], // opening splash: 00:00–00:14
  [60, 76], // world 1: 01:00–01:16
  [125, 153], // world 2: 02:05–02:33
  [212, 234], // world 3: 03:32–03:54
  [358, 384], // world 4: 05:58–06:24
  [402, 421] // closing splash: 06:42–07:01, the last 20 frames, back to where it started
]

/** Loops: the opening splash's, one per world, the closing splash's. */
export const STAGE_LOOP_COUNT = LOOPS.length

const BASE = '/stage/abstract-blob/'
// Transitions play at the render's frame rate; the loops at half of it, so
// they breathe slower
const TRANSITION_MS = 1000 / manifest.fps
const LOOP_MS = TRANSITION_MS * 2
// Frames caught up in one go after a stall (hidden tab, slow device): more
// than that and it resyncs instead of fast-forwarding
const MAX_CATCH_UP = 3

// One decoded image per distinct frame; null until it has loaded
const images: (HTMLImageElement | null)[] = Array.from(
  { length: Math.max(...manifest.frames) + 1 },
  () => null
)
let loading = false

// Every frame of the timeline, and where the player is heading
let frame = 0
let direction: 1 | -1 = 1
let loop = 0
let target = 0

const canvases = new Set<HTMLCanvasElement>()
let drawn = -1
let raf = 0
let last = 0
let lag = 0

const ready = ref(false)

const imageAt = (index: number) => images[manifest.frames[index]!] ?? null

function step() {
  if (target < loop) {
    loop = target
    frame = LOOPS[loop]![0]
    direction = 1
    return
  }

  const next = target > loop ? frame + 1 : pingPong()
  if (!imageAt(next)) return // still loading: hold, don't skip it
  if (target > loop) direction = 1
  frame = next
  if (loop + 1 < LOOPS.length && frame === LOOPS[loop + 1]![0]) loop++
}

// How long the next frame lasts: moving on to a later loop, it's a transition
const frameMs = () => target > loop ? TRANSITION_MS : LOOP_MS

function pingPong() {
  const [start, end] = LOOPS[loop]!
  if (frame >= end) direction = -1
  else if (frame <= start) direction = 1
  return frame + direction
}

function draw(force = false) {
  const image = imageAt(frame)
  if (!image) return
  const id = manifest.frames[frame]!
  if (id === drawn && !force) return
  drawn = id
  ready.value = true
  for (const canvas of canvases) paint(canvas, image)
}

function paint(canvas: HTMLCanvasElement, image: HTMLImageElement) {
  const context = canvas.getContext('2d')
  if (!context) return
  context.clearRect(0, 0, canvas.width, canvas.height)
  context.drawImage(image, 0, 0, canvas.width, canvas.height)
}

function tick(now: number) {
  raf = requestAnimationFrame(tick)
  lag += now - last
  last = now
  if (lag > LOOP_MS * MAX_CATCH_UP) lag = frameMs()
  while (lag >= frameMs()) {
    lag -= frameMs()
    step()
  }
  draw()
}

function run() {
  if (raf || !canvases.size) return
  if (prefersReducedMotion()) {
    // A still of the loop: its first frame, no transitions
    loop = target
    frame = LOOPS[loop]![0]
    draw(true)
    return
  }
  last = performance.now()
  lag = 0
  raf = requestAnimationFrame(tick)
}

function stop() {
  cancelAnimationFrame(raf)
  raf = 0
}

// Loads every frame in timeline order (the opening loop first), a few at a
// time; the player waits for any it reaches before they're in
function preload(base: string) {
  if (loading) return
  loading = true
  const order = [...new Set(manifest.frames)]
  let cursor = 0
  const worker = async (): Promise<void> => {
    const id = order[cursor++]
    if (id === undefined) return
    const image = new Image()
    image.src = `${base}${String(id).padStart(3, '0')}.avif`
    try {
      await image.decode()
      images[id] = image
      if (id === manifest.frames[frame]) draw(true)
    } catch {
      // Left out: the player holds on the frame before it
    }
    return worker()
  }
  for (let n = 0; n < 4; n++) worker()
}

export function useStage() {
  const base = `${useRuntimeConfig().app.baseURL.replace(/\/$/, '')}${BASE}`

  return {
    /** Size of the frames, in px. */
    size: manifest.size,
    /** Whether a frame has been drawn yet. */
    ready: readonly(ready),

    preload: () => preload(base),

    /** Loop to head to: 0 opening splash, 1–4 worlds, 5 closing splash. */
    setTarget(index: number) {
      const clamped = Math.min(Math.max(index, 0), LOOPS.length - 1)
      if (clamped === target) return
      target = clamped
      if (prefersReducedMotion()) {
        stop()
        run()
      }
    },

    attach(canvas: HTMLCanvasElement) {
      canvases.add(canvas)
      preload(base)
      const image = imageAt(frame)
      if (image) paint(canvas, image)
      run()
    },

    detach(canvas: HTMLCanvasElement) {
      canvases.delete(canvas)
      if (!canvases.size) stop()
    },

    /** Redraws the current frame (after a canvas is resized). */
    redraw: (canvas: HTMLCanvasElement) => {
      const image = imageAt(frame)
      if (image) paint(canvas, image)
    }
  }
}
