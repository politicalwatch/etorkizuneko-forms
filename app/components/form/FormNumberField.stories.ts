import type { Meta, StoryObj } from '@nuxtjs/storybook'
import { ref } from 'vue'
import FormNumberField from './FormNumberField.vue'

const meta = {
  title: 'Form/NumberField',
  component: FormNumberField,
  tags: ['autodocs'],
  args: {
    maxlength: 3
  },
  render: args => ({
    components: { FormNumberField },
    setup: () => ({ args, value: ref(args.modelValue ?? '') }),
    template: `
      <div class="flex max-w-28 flex-col gap-4">
        <FormNumberField v-bind="args" aria-label="Number field" v-model="value" />
        <p class="text-sm">Value: "{{ value }}"</p>
      </div>
    `
  })
} satisfies Meta<typeof FormNumberField>

export default meta
type Story = StoryObj<typeof meta>

export const Age: Story = {
  args: { modelValue: '21' }
}

export const PostalCode: Story = {
  args: { modelValue: '01001', maxlength: 5 }
}

export const OnLight: Story = {
  args: { modelValue: '21' },
  globals: { surface: 'light' }
}
