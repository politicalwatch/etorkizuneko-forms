/*
 * Nuxt UI theme for the project. Custom variants defined here are merged into
 * the components' prop types, so `variant="pill"` / `variant="surface"` are
 * type-checked like the built-in ones.
 *
 * Colors of fields and outlined buttons come from the surrounding surface
 * (the surface-* utilities in main.css), so the same component works on the
 * black and white screens and inside modals.
 */

// Pill-shaped field: shared by UInput and the USelect trigger
const pill = [
  'h-10 rounded-full border border-(--surface-line) bg-transparent px-5',
  'text-base text-(--surface-fg) placeholder:text-(--surface-muted)',
  'focus-visible:border-(--surface-fg) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500'
]

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
      },
      variants: {
        variant: {
          // Outlined in the surface color: header "Saber más" and language
          surface: {
            base: [
              'ring ring-inset ring-(--surface-fg) text-(--surface-fg) bg-transparent font-normal',
              'hover:bg-(--surface-fg)/10 active:bg-(--surface-fg)/15'
            ]
          }
        }
      }
    },

    // Every field in the design is a pill, so it's the default variant
    input: {
      variants: {
        variant: {
          pill: {
            root: 'w-full',
            base: pill
          }
        }
      },
      defaultVariants: {
        variant: 'pill'
      }
    },

    select: {
      variants: {
        variant: {
          pill: {
            base: [...pill, 'w-full ps-4 pe-11 text-start'],
            placeholder: 'text-(--surface-fg)/80',
            trailing: 'pe-4',
            trailingIcon: 'size-5 text-(--surface-fg)',
            // White rounded listbox, whatever the surface
            content: 'mt-1 rounded-2xl bg-paper text-ink shadow-lg ring-0',
            viewport: 'divide-y-0',
            group: 'p-2',
            item: [
              'px-3 py-1.5 text-ink before:rounded-full data-[state=checked]:font-semibold',
              'data-highlighted:not-data-disabled:text-ink data-highlighted:not-data-disabled:before:bg-option-highlight'
            ],
            itemLabel: 'whitespace-normal',
            // Single choice closes on pick: no tick needed
            itemTrailingIcon: 'hidden'
          }
        }
      },
      compoundVariants: [
        {
          // With several answers, show which ones are ticked
          variant: 'pill',
          multiple: true,
          class: {
            itemTrailingIcon: 'block size-4 text-brand-500'
          }
        }
      ],
      defaultVariants: {
        variant: 'pill'
      }
    }
  }
})
