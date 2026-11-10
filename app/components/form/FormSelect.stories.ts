import type { Meta, StoryObj } from '@nuxtjs/storybook'
import { ref } from 'vue'
import FormSelect from './FormSelect.vue'

const meta = {
  title: 'Form/Select',
  component: FormSelect,
  tags: ['autodocs'],
  args: {
    placeholder: 'Selecciona...',
    items: [
      { value: 'male', label: 'Masculino' },
      { value: 'female', label: 'Femenino' },
      { value: 'nonBinary', label: 'No binario' },
      { value: 'undisclosed', label: 'Prefiero no decirlo' }
    ]
  },
  render: args => ({
    components: { FormSelect },
    setup: () => ({ args, value: ref<string | string[] | null>(args.modelValue ?? null) }),
    template: `
      <div class="flex max-w-60 flex-col gap-4">
        <FormSelect v-bind="args" aria-label="Género" v-model="value" />
        <p class="text-sm">Value: {{ value?.length ? value : '—' }}</p>
      </div>
    `
  })
} satisfies Meta<typeof FormSelect>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {}

export const Selected: Story = {
  args: { modelValue: 'female' }
}

export const LongOptions: Story = {
  args: {
    items: [
      { value: 'engineering', label: 'Ingeniería, industria y fabricación' },
      { value: 'technology', label: 'Tecnología, informática y digitalización' },
      { value: 'naturalSciences', label: 'Ciencias naturales, física y química' },
      { value: 'health', label: 'Salud y ciencias de la vida' },
      { value: 'business', label: 'Economía, empresa y gestión' },
      { value: 'socialSciences', label: 'Derecho, política y ciencias sociales' },
      { value: 'humanities', label: 'Humanidades, comunicación y educación' },
      { value: 'arts', label: 'Arte, diseño y creatividad' },
      { value: 'other', label: 'Otros ámbitos' }
    ]
  }
}

export const OnLight: Story = {
  globals: { surface: 'light' }
}

// Several answers; "Ninguna de las anteriores" clears the rest and vice versa
export const Multiple: Story = {
  args: {
    multiple: true,
    exclusiveValue: 'none',
    modelValue: ['lgtbiq', 'racialized'],
    items: [
      { value: 'lgtbiq', label: 'LGTBIQ+' },
      { value: 'racialized', label: 'Persona racializada' },
      { value: 'functionalDiversity', label: 'Persona con diversidad funcional' },
      { value: 'otherMinority', label: 'Persona de otro colectivo minorizado' },
      { value: 'none', label: 'Ninguna de las anteriores' }
    ]
  }
}
