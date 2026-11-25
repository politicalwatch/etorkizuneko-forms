/*
 * Initial profiling questions. Shared by every instance for now; an instance
 * picks them through its `profiling` list, so giving one its own set later is
 * a one-line change there.
 *
 * Structure only: texts live in i18n under `profiling.*`, keyed by these ids,
 * which are also the stable keys we persist — don't rename them lightly.
 */

/*
 * Basque Country provinces, asked instead of the postal code (data
 * minimisation: the province is all the analysis needs, and it keeps the
 * answers anonymous). Exception to the camelCase ids: the Basque names are
 * stored as they are, and shown untranslated in every language.
 */
export const provinceOptions = ['Araba', 'Bizkaia', 'Gipuzkoa'] as const
export const genderOptions = ['male', 'female', 'nonBinary', 'undisclosed'] as const
export const diversityOptions = ['lgtbiq', 'racialized', 'functionalDiversity', 'otherMinority', 'none'] as const
export const educationOptions = ['eso', 'bachillerato', 'gradoMedio', 'gradoSuperior', 'university', 'master', 'other'] as const
export const occupationOptions = ['studying', 'working', 'studyingAndWorking', 'jobSeeking', 'other'] as const
export const fieldOfStudyOptions = [
  'engineering',
  'technology',
  'naturalSciences',
  'health',
  'business',
  'socialSciences',
  'humanities',
  'arts',
  'other'
] as const

export type ProfilingField
  = | { id: 'age', kind: 'number', min: number, max: number }
    // Not asked by any instance for now (Industria asks the province); kept
    // for instances that need finer location
    | { id: 'postalCode', kind: 'postalCode' }
    | {
      id: 'gender' | 'province' | 'diversity' | 'education' | 'occupation' | 'fieldOfStudy'
      kind: 'select'
      options: readonly string[]
      // Several answers allowed (stored as an array)
      multiple?: boolean
      // Option that can't be combined with the others
      exclusiveOption?: string
    }

export type ProfilingFieldId = ProfilingField['id']

// Stored answer: age is a number, multiple-choice selects a list
export type ProfilingValue = number | string | string[] | null

export const sharedProfiling: readonly ProfilingField[] = [
  { id: 'age', kind: 'number', min: 1, max: 120 },
  { id: 'gender', kind: 'select', options: genderOptions },
  { id: 'province', kind: 'select', options: provinceOptions },
  { id: 'diversity', kind: 'select', options: diversityOptions, multiple: true, exclusiveOption: 'none' },
  { id: 'education', kind: 'select', options: educationOptions },
  { id: 'occupation', kind: 'select', options: occupationOptions },
  { id: 'fieldOfStudy', kind: 'select', options: fieldOfStudyOptions }
]
