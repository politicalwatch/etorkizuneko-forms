# Etorkizuneko Forms

Thematic surveys for **Agertokiak** (_Euskal gazteen etorkizuna irudikatzen_): a short guided flow of profiling questions and agreement-scale questions grouped in "worlds", which ends by showing the person a result profile. The first instance is **Industria**.

Built with [Nuxt 4](https://nuxt.com), [Nuxt UI 4](https://ui.nuxt.com), Pinia and `@nuxtjs/i18n` (Spanish, Basque and English; missing texts fall back to Spanish). Responses are saved to a Notion table.

## Requirements

- Node.js 24 or later (the CSV export script runs TypeScript directly)
- npm

## Setup

```bash
npm install
cp .env.example .env   # then fill it in, see below
```

### Environment variables

| Variable | Description |
| --- | --- |
| `NUXT_PUBLIC_INSTANCE_NAME` | Thematic instance this deployment serves, one of `app/instances` (`industria`). |
| `NUXT_PUBLIC_LEARN_MORE_URL` | Target of the header "Saber más" button; the button is hidden while empty. |
| `NUXT_NOTION_API_KEY` | Token of the Notion integration that writes the responses. Secret, server only. |
| `NUXT_NOTION_DATA_SOURCE_ID` | The Notion table's **data source** id (not the database id). |

Each deployment serves one instance and has its own Notion table.

## Development

```bash
npm run dev
```

This starts the app on `http://localhost:3000` and Storybook on `http://localhost:6006`. Every component has stories.

| Command | Description |
| --- | --- |
| `npm run dev` | App and Storybook dev servers |
| `npm run build` | Production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | ESLint |
| `npm run typecheck` | Type check (`vue-tsc`) |
| `npm run storybook` | Storybook on its own |
| `npm run build-storybook` | Static Storybook build |
| `npm run notion:export` | Download all responses as CSV (see [Backups](#backups-csv-export)) |

CI (`.github/workflows/ci.yml`) runs lint and typecheck on every push.

## Project structure

- `app/pages/index.vue`: the whole experience is one page that renders the screen for the current step.
- `app/stores/survey.ts`: answers and the current step.
- `app/components/screen/`: one component per kind of screen (intro, profiling, splash, question, result, thanks, outro).
- `app/survey/`: shared survey definitions (profiling questions, answer scale, steps, result scoring).
- `app/instances/`: one definition per thematic instance (its worlds, questions and result profiles), plus the registry.
- `i18n/locales/`: shared UI texts, and each instance's own texts in `instances/<name>/`.
- `server/`: API that saves responses to Notion.
- `scripts/`: command-line tools.

### Adding an instance

1. Create `app/instances/<name>.ts` with `defineInstance` (see `industria.ts`) and register it in `app/instances/index.ts`.
2. Add its texts in `i18n/locales/instances/<name>/es.json` (required; `eu.json` and `en.json` are optional). Restart the dev server to pick up new files.
3. Deploy with `NUXT_PUBLIC_INSTANCE_NAME=<name>` and a Notion table of its own.

The ids used in the definitions (profiling fields, options, questions, profiles) are the keys stored in Notion. Don't rename them once responses are being collected.

## Response storage (Notion)

Responses are saved as people go through the survey, so unfinished ones are kept too. From the first profiling answer on, every step sends the whole response to the server. The first request creates a row in the Notion table and later ones update it. Reloading the page starts a new response.

### Setting up a table

1. In Notion, create an [internal integration](https://www.notion.so/profile/integrations) and copy its token into `NUXT_NOTION_API_KEY`.
2. Create an empty database (only its default title column) and share it with the integration (⋯ menu → Connections).
3. Copy its data source id (⋯ menu → Manage data sources → Copy data source ID) into `NUXT_NOTION_DATA_SOURCE_ID`.

The columns are created on the first save, from the instance definition:

- `createdAt`, `updatedAt`, `instance`, `locale`, and `step` (how far the person got)
- profiling answers prefixed `p_` (`p_age`, `p_diversity`…)
- question answers prefixed with their world and question position (`w1q1_likelyJob`…)
- `result` (only once every question is answered) and `email` (optional)

When columns are added, the table views are also put in this order. Existing columns are never renamed or removed. Columns you hide or resize keep those settings, and columns you add yourself go at the end.

Moving a question to another position changes its column name. Once responses are coming in, rename the column in Notion to match.

## Backups (CSV export)

`npm run notion:export` downloads every response in the Notion table as a CSV file:

```bash
npm run notion:export              # → exports/responses-<timestamp>.csv
npm run notion:export -- out.csv   # → a path of your choice
```

- It uses `NUXT_NOTION_API_KEY` and `NUXT_NOTION_DATA_SOURCE_ID` from `.env` (or the environment). To back up another deployment's table, set those two variables for the command.
- One row per response, oldest first. The first column is the Notion page id, then the columns in the table view's order, including hidden ones.
- Multiple-choice answers are joined with `;` (e.g. `lgtbiq;racialized`). Unanswered questions are empty.
- The file is UTF-8 encoded. In Excel, import it as UTF-8 (Data → From Text/CSV).

The exports contain personal data (emails and profiling answers). `exports/` is git-ignored; store backups somewhere access-controlled.
