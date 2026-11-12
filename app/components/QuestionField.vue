<script setup lang="ts">
import { SCALE_MAX, SCALE_MIN, SCALE_STEP } from '#shared/survey/scale'

// One world question: its prompt, statement, dial with legend, and button.
// ScreenQuestion remounts it per question (keyed), so the question is fixed
// for its lifetime.
const { worldIndex, questionIndex } = defineProps<{
  worldIndex: number
  questionIndex: number
}>()

const { t } = useI18n()
const store = useSurveyStore()
const { instance, textKey } = useInstance()

const world = instance.worlds[worldIndex]!
const questionId = world.questions[questionIndex]!

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
  <form
    class="flex flex-col gap-5"
    @submit.prevent="submit"
  >
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
</template>
