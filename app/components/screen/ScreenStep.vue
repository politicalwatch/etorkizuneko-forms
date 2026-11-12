<script setup lang="ts">
import type { Step } from '#shared/survey/steps'

// The screen for a step of the flow. The page renders the current step with
// it, and the next one too while a scroll transition brings it in.
defineProps<{
  step: Step
}>()

// The splash asks to move on (scroll transition, played whole)
const emit = defineEmits<{
  continue: []
}>()
</script>

<template>
  <ScreenIntro v-if="step.kind === 'intro'" />
  <ScreenProfiling
    v-else-if="step.kind === 'profiling'"
    :field-index="step.fieldIndex"
  />
  <ScreenSplash
    v-else-if="step.kind === 'splash'"
    @continue="emit('continue')"
  />
  <ScreenQuestion
    v-else-if="step.kind === 'question'"
    :world-index="step.worldIndex"
    :question-index="step.questionIndex"
  />
  <ScreenResult v-else-if="step.kind === 'result'" />
  <ScreenThanks v-else-if="step.kind === 'thanks'" />
  <ScreenOutro v-else />
</template>
