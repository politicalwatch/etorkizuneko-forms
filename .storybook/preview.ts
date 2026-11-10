import type { Preview } from '@storybook-vue/nuxt'
import UApp from '@nuxt/ui/components/App.vue'

const preview: Preview = {
  parameters: {
    layout: 'fullscreen',
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    }
  },

  // The app paints black and white screens; components read their colors
  // from the surrounding surface, so every story renders inside one.
  globalTypes: {
    surface: {
      description: 'Screen surface',
      toolbar: {
        title: 'Surface',
        icon: 'contrast',
        items: [
          { value: 'dark', title: 'Dark (black)' },
          { value: 'light', title: 'Light (white)' }
        ],
        dynamicTitle: true
      }
    }
  },
  initialGlobals: {
    surface: 'dark'
  },

  decorators: [
    (story, context) => ({
      components: { story, UApp },
      setup: () => ({
        surfaceClass: context.globals.surface === 'light' ? 'surface-light' : 'surface-dark'
      }),
      template: '<UApp><div :class="surfaceClass" class="min-h-screen p-8"><story /></div></UApp>'
    })
  ]
}

export default preview
