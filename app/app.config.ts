export default defineAppConfig({
  ui: {
    colors: {
      primary: 'brand',
      neutral: 'neutral'
    },
    // Every button in the design is a pill
    button: {
      slots: {
        base: 'rounded-full justify-center font-semibold'
      }
    }
  }
})
