import type { StorybookConfig } from '@storybook-vue/nuxt'

const config: StorybookConfig = {
  stories: [
    '../app/**/*.mdx',
    '../app/**/*.stories.@(js|jsx|ts|tsx|mdx)'
  ],
  addons: [
    '@storybook/addon-a11y',
    '@storybook/addon-docs'
  ],
  framework: '@storybook-vue/nuxt',
  // Served at the root like Nuxt does (StageVisual's frames, …)
  staticDirs: ['../public']
}
export default config
