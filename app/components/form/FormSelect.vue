<script setup lang="ts">
/*
 * Profiling selector: pill trigger + white rounded listbox. Built on USelect
 * (keyboard, typeahead, a11y). Extra attributes (id, aria-*) reach the
 * trigger button.
 *
 * With `multiple` the model is an array (kept in the items' order) and the
 * list stays open while picking. `exclusiveValue` names an option that
 * can't be combined with the rest (e.g. "None of the above"): picking it
 * clears the others, and picking any other clears it.
 */
export interface FormSelectItem {
  label: string
  value: string
}

const model = defineModel<string | string[] | null>({ default: null })

const props = withDefaults(defineProps<{
  items: FormSelectItem[]
  placeholder?: string
  multiple?: boolean
  exclusiveValue?: string
}>(), {
  placeholder: undefined,
  multiple: false,
  exclusiveValue: undefined
})

function onUpdate(value: unknown) {
  if (!props.multiple) {
    model.value = typeof value === 'string' ? value : null
    return
  }

  let next = Array.isArray(value) ? (value as string[]) : []
  const exclusive = props.exclusiveValue

  if (exclusive && next.includes(exclusive) && next.length > 1) {
    const previous = Array.isArray(model.value) ? model.value : []
    // Just picked the exclusive option → keep only it; otherwise drop it
    next = previous.includes(exclusive) ? next.filter(item => item !== exclusive) : [exclusive]
  }

  // Stable order regardless of click order
  model.value = props.items.map(item => item.value).filter(item => next.includes(item))
}
</script>

<template>
  <!-- Look: `pill` variant in app.config.ts -->
  <USelect
    :model-value="model ?? undefined"
    :items="items"
    :placeholder="placeholder"
    :multiple="multiple"
    trailing-icon="i-lucide-chevron-down"
    @update:model-value="onUpdate"
  />
</template>
