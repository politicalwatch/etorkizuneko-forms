<script setup lang="ts">
import { SCALE_MAX, SCALE_MIN, SCALE_STEP } from '#shared/survey/scale'

// One world question. Remounted per step (keyed), like the profiling screen.
const { worldIndex, questionIndex } = defineProps<{
  worldIndex: number
  questionIndex: number
}>()

const { t } = useI18n()
const store = useSurveyStore()
const { instance, textKey } = useInstance()

const world = instance.worlds[worldIndex]!
const questionId = world.questions[questionIndex]!
const worldNumber = String(worldIndex + 1).padStart(2, '0')

const promptId = useId()
const statementId = useId()
const legendId = useId()

const draft = ref<number | null>(store.answers[questionId] ?? null)

function submit() {
  if (draft.value == null) return
  store.answers[questionId] = draft.value
  store.next()
}
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

    <form
      class="flex flex-col gap-5 md:order-1"
      @submit.prevent="submit"
    >
      <QuestionDots
        :total="world.questions.length"
        :current="questionIndex"
      />

      <div class="flex flex-col gap-2">
        <p
          :id="promptId"
          class="text-sm font-semibold text-brand-500 max-md:sr-only md:text-base md:font-bold"
        >
          {{ t('worlds.prompt') }}
        </p>
        <p
          :id="statementId"
          class="text-2xl leading-snug md:text-xl md:leading-[1.2] md:font-light"
        >
          “{{ t(textKey(`questions.${questionId}`)) }}”
        </p>
      </div>

      <!-- Legend above the dial on mobile, below on desktop -->
      <div class="flex flex-col gap-6 md:flex-col-reverse">
        <p
          :id="legendId"
          class="text-sm md:leading-[1.2] md:font-light"
        >
          <!-- DM Sans as loaded lacks "→": an icon instead, silent for screen readers -->
          {{ SCALE_MIN }} <UIcon
            name="i-lucide-arrow-right"
            class="align-[-0.125em]"
          /> {{ t('worlds.scale.min') }}<br>
          {{ SCALE_MAX }} <UIcon
            name="i-lucide-arrow-right"
            class="align-[-0.125em]"
          /> {{ t('worlds.scale.max') }}
        </p>

        <FormRangeSlider
          v-model="draft"
          :min="SCALE_MIN"
          :max="SCALE_MAX"
          :step="SCALE_STEP"
          :aria-labelledby="`${promptId} ${statementId}`"
          :aria-describedby="legendId"
          data-autofocus
          class="mx-auto md:mx-0"
        />
      </div>

      <UButton
        type="submit"
        :label="t('app.next')"
        :disabled="draft == null"
        size="xl"
        class="w-full md:w-32"
      />
    </form>
  </section>
</template>
