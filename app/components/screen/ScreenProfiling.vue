<script setup lang="ts">
import type { FormSelectItem } from '~/components/form/FormSelect.vue'

// One profiling question. The page remounts this per step (keyed), so the
// field is fixed for the lifetime of the component.
const { fieldIndex } = defineProps<{ fieldIndex: number }>()

const { t } = useI18n()
const store = useSurveyStore()
const { instance } = useInstance()

const field = instance.profiling[fieldIndex]!
const inputId = useId()

const multiple = field.kind === 'select' && !!field.multiple
const exclusiveValue = field.kind === 'select' ? field.exclusiveOption : undefined

// Local drafts: the store only receives validated values. `choices` backs
// multiple-choice selects, `text` everything else.
const stored = store.profiling[field.id]
const text = ref(Array.isArray(stored) ? '' : String(stored ?? ''))
const choices = ref<string[]>(Array.isArray(stored) ? [...stored] : [])

const items = computed<FormSelectItem[]>(() =>
  field.kind === 'select'
    ? field.options.map(value => ({ value, label: t(`profiling.options.${field.id}.${value}`) }))
    : []
)

const isValid = computed(() => {
  if (multiple) return choices.value.length > 0

  const value = text.value
  if (!value) return false

  switch (field.kind) {
    case 'number': {
      const number = Number(value)
      return Number.isInteger(number) && number >= field.min && number <= field.max
    }
    case 'postalCode':
      return /^\d{5}$/.test(value)
    case 'select':
      return true
    default:
      return false
  }
})

function onSelect(value: string | string[] | null) {
  if (Array.isArray(value)) choices.value = value
  else text.value = value ?? ''
}

function submit() {
  if (!isValid.value) return
  const value = multiple
    ? choices.value
    : field.kind === 'number' ? Number(text.value) : text.value
  Object.assign(store.profiling, { [field.id]: value })
  store.next()
}
</script>

<template>
  <section class="flex flex-1 flex-col justify-between gap-12 md:flex-row-reverse md:items-start md:justify-between md:pe-8 md:pt-21">
    <h1
      tabindex="-1"
      class="
        w-min text-[2.75rem] leading-none font-semibold uppercase outline-none
        md:text-end md:text-6xl md:leading-[0.96] md:font-bold
      "
    >
      {{ t('profiling.title') }}
    </h1>

    <form
      class="flex w-full flex-col gap-6 md:max-w-md"
      novalidate
      @submit.prevent="submit"
    >
      <label
        :for="inputId"
        class="text-[2.75rem] leading-none font-semibold uppercase md:text-6xl md:leading-[0.96] md:font-bold"
      >
        <!-- The no-break space glues the arrow to the last word: it never wraps alone.
        Inline SVG (not the default mask) so the stroke can be thickened like the design's bold arrow -->
        {{ t(`profiling.fields.${field.id}`) }}<span class="whitespace-nowrap">&nbsp;<UIcon
          name="i-lucide-arrow-right"
          mode="svg"
          class="inline size-[0.85em] align-[-0.1em] md:-my-[0.1em] md:-ms-[0.08em] md:size-[1.05em] md:align-[-0.06em] md:[&_path]:stroke-[3.5]"
        /></span>
      </label>

      <FormNumberField
        v-if="field.kind === 'number'"
        :id="inputId"
        v-model="text"
        :maxlength="3"
        data-autofocus
        class="md:w-38"
      />
      <FormNumberField
        v-else-if="field.kind === 'postalCode'"
        :id="inputId"
        v-model="text"
        :maxlength="5"
        autocomplete="postal-code"
        data-autofocus
        class="md:w-38"
      />
      <FormSelect
        v-else
        :id="inputId"
        :model-value="multiple ? choices : text || null"
        :items="items"
        :multiple="multiple"
        :exclusive-value="exclusiveValue"
        :placeholder="t('profiling.selectPlaceholder')"
        data-autofocus
        class="md:w-84"
        @update:model-value="onSelect"
      />

      <UButton
        type="submit"
        :label="t('app.next')"
        :disabled="!isValid"
        size="xl"
        class="w-full md:mt-4 md:w-32"
      />
    </form>
  </section>
</template>
