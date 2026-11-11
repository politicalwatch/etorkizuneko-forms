import { defineInstance } from '../survey/instance'
import { sharedProfiling } from '../survey/profiling'

// Texts: i18n/locales/instances/industria/*.json
export default defineInstance({
  name: 'industria',

  profiling: sharedProfiling,

  worlds: [
    {
      // Desirability of industry as a workplace
      id: 'w1',
      questions: ['likelyJob', 'wantCareer', 'goodSalary', 'stableJob', 'fun', 'creative']
    },
    {
      // Access to industry as a workplace
      id: 'w2',
      questions: ['informed', 'basqueRequired', 'meritOnly']
    },
    {
      // General perception of industry
      id: 'w3',
      questions: ['manualOnly', 'socialSciences', 'masculine', 'localOwners', 'modern']
    },
    {
      // Social impact of industry
      id: 'w4',
      questions: ['wellbeing', 'pollution', 'innovation']
    }
  ],

  // Two answers per profile, so each scores 2–10
  profiles: [
    { id: 'imagina', questions: [{ id: 'creative' }, { id: 'fun' }] },
    { id: 'proyecta', questions: [{ id: 'wantCareer' }, { id: 'stableJob' }] },
    { id: 'innova', questions: [{ id: 'modern' }, { id: 'innovation' }] },
    { id: 'transforma', questions: [{ id: 'wellbeing' }, { id: 'socialSciences', inverted: true }] }
  ]
})
