<script setup lang="ts">
// A world: its title and shape stay put from one question to the next (the
// page keeps this mounted through the world); only the question itself
// changes, with the elevator transition.
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
      flex flex-1 flex-col gap-8
      md:grid md:grid-cols-[minmax(0,25rem)_1fr_auto] md:items-center md:gap-10 md:pe-8
    "
  >
    <h1
      tabindex="-1"
      class="
        text-[2.75rem] leading-none font-semibold uppercase outline-none
        md:order-3 md:w-min md:text-end md:text-6xl md:leading-[0.96] md:font-bold
      "
    >
      {{ t('worlds.title', { number: worldNumber }) }}
    </h1>

    <StageVisual
      variant="world"
      class="mx-auto md:order-2"
    />

    <!-- Dots stay (and light up); only the question rises out and the next one in.
    On desktop the column is centered, so its height must not change with the
    statement's length or the dots would jump: min-h fits the tallest question
    (4-line statement in Industria/es) and the spare room stays below the button -->
    <div class="relative flex flex-col gap-5 md:order-1 md:min-h-113">
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
  </section>
</template>
