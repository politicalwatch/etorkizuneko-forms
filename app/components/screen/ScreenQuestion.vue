<script setup lang="ts">
// The worlds. The page keeps this mounted through all of them: within a world
// only the question changes (elevator transition); to the next world, its
// title and question column swing out like doors and the next ones in. The
// animation stays, and plays its way into the next world's loop.
const { worldIndex } = defineProps<{
  worldIndex: number
  questionIndex: number
}>()

const { t } = useI18n()
const { instance } = useInstance()

const world = computed(() => instance.worlds[worldIndex]!)
const worldNumber = computed(() => String(worldIndex + 1).padStart(2, '0'))
</script>

<template>
  <section
    class="
      relative flex flex-1 flex-col gap-8
      md:grid md:grid-cols-[minmax(0,25rem)_1fr_auto] md:items-center md:gap-10 md:pe-8
    "
  >
    <TransitionDoor hinge="right">
      <h1
        :key="worldIndex"
        tabindex="-1"
        class="
          text-[2.75rem] leading-none font-semibold uppercase outline-none
          md:order-3 md:w-min md:text-end md:text-6xl md:leading-[0.96] md:font-bold
        "
      >
        {{ t('worlds.title', { number: worldNumber }) }}
      </h1>
    </TransitionDoor>

    <StageVisual class="mx-auto md:order-2" />

    <!-- Within a world the dots stay (and light up); only the question rises out
    and the next one in. On desktop the column is centered, so its height must
    not change with the statement's length or the dots would jump: min-h fits
    the tallest question (4-line statement in Industria/es) and the spare room
    stays below the button -->
    <TransitionDoor hinge="left">
      <div
        :key="worldIndex"
        class="relative flex flex-col gap-5 md:order-1 md:min-h-113"
      >
        <QuestionDots
          :total="world.questions.length"
          :current="questionIndex"
        />

        <TransitionElevator>
          <QuestionField
            :key="questionIndex"
            :world-index="worldIndex"
            :question-index="questionIndex"
          />
        </TransitionElevator>
      </div>
    </TransitionDoor>
  </section>
</template>
