import type { Meta, StoryObj } from '@nuxtjs/storybook'
// Controls are built at module load, before there's an app to ask for the
// active instance, so stories show Industria's
import industria from '#shared/instances/industria'
import { useSurveyStore } from '../stores/survey'
import ProfilingField from './ProfilingField.vue'

const meta = {
  title: 'Survey/ProfilingField',
  component: ProfilingField,
  tags: ['autodocs'],
  argTypes: {
    fieldIndex: {
      control: 'select',
      options: industria.profiling.map((_, index) => index),
      labels: Object.fromEntries(industria.profiling.map((field, index) => [index, field.id]))
    }
  },
  args: {
    fieldIndex: 0
  },
  render: args => ({
    components: { ProfilingField },
    setup: () => {
      // The preview shares one Pinia store across stories
      useSurveyStore().reset()
      return { args }
    },
    // Keyed: the field reads its definition once, like in ScreenProfiling
    template: '<ProfilingField :key="args.fieldIndex" v-bind="args" />'
  })
} satisfies Meta<typeof ProfilingField>

export default meta
type Story = StoryObj<typeof meta>

export const NumberField: Story = {}

export const SelectField: Story = {
  args: { fieldIndex: industria.profiling.findIndex(field => field.kind === 'select') }
}
