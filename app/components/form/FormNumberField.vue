<script setup lang="ts">
/*
 * Digits-only pill field (age, postal code). The value stays a string so
 * leading zeros survive (postal codes like 01001); parse it where needed.
 * Extra attributes (id, aria-*, autocomplete…) reach the <input>.
 */
const model = defineModel<string>({ default: '' })

const props = defineProps<{
  maxlength?: number
  placeholder?: string
}>()

function onUpdate(value: string | number) {
  const digits = String(value).replace(/\D/g, '')
  model.value = props.maxlength ? digits.slice(0, props.maxlength) : digits
}
</script>

<template>
  <UInput
    :model-value="model"
    type="text"
    inputmode="numeric"
    autocomplete="off"
    variant="none"
    :maxlength="maxlength"
    :placeholder="placeholder"
    :ui="{ root: 'w-full', base: [fieldPill, 'text-center'] }"
    @update:model-value="onUpdate"
  />
</template>
