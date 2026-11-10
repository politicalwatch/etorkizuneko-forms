import type { Meta, StoryObj } from '@nuxtjs/storybook'
import { ref } from 'vue'
import FormRangeSlider from './FormRangeSlider.vue'

const meta = {
  title: 'Form/RangeSlider',
  component: FormRangeSlider,
  tags: ['autodocs'],
  globals: { surface: 'light' },
  args: {
    min: 1,
    max: 5,
    step: 0.1,
    disabled: false
  },
  render: args => ({
    components: { FormRangeSlider },
    setup: () => ({ args, value: ref<number | null>(args.modelValue ?? null) }),
    template: `
      <div class="flex max-w-sm flex-col gap-4">
        <FormRangeSlider v-bind="args" aria-label="Agreement" v-model="value" />
        <p class="text-sm">Value: {{ value ?? '— (untouched)' }}</p>
      </div>
    `
  })
} satisfies Meta<typeof FormRangeSlider>

export default meta
type Story = StoryObj<typeof meta>

export const Untouched: Story = {}

export const WithValue: Story = {
  args: { modelValue: 2.7 }
}

export const OnDark: Story = {
  args: { modelValue: 3.8 },
  globals: { surface: 'dark' }
}

// Opt back into whole-number answers
export const IntegerSteps: Story = {
  args: { modelValue: 3, step: 1 }
}

export const Disabled: Story = {
  args: { modelValue: 2.3, disabled: true }
}
