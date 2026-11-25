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
| `NUXT_PUBLIC_INSTANCE_NAME` | Thematic instance this deployment serves, one of `shared/instances` (`industria`). |
| `NUXT_NOTION_API_KEY` | Token of the Notion integration that writes the responses. Secret, server only. |
| `NUXT_NOTION_DATA_SOURCE_ID` | The responses table's **data source** id (not the database id). |
| `NUXT_NOTION_EMAILS_DATA_SOURCE_ID` | The emails table's **data source** id. |

Each deployment serves one instance and has its own responses table, since the questions (and so the columns) differ per instance. Rows still record their `instance`, so a table's origin stays clear. The emails table can be shared by several deployments.

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
- `shared/survey/`: survey model used by both the app and the server (profiling questions, answer scale, steps, result scoring).
- `shared/instances/`: one definition per thematic instance (its worlds, questions and result profiles), plus the registry.
- `i18n/locales/`: shared UI texts, and each instance's own texts in `instances/<name>/`.
- `server/`: API that saves responses and emails to Notion.
- `scripts/`: command-line tools.

### Adding an instance

1. Create `shared/instances/<name>.ts` with `defineInstance` (see `industria.ts`) and register it in `shared/instances/index.ts`.
2. Add its texts in `i18n/locales/instances/<name>/es.json` (required; `eu.json` and `en.json` are optional). Restart the dev server to pick up new files.
3. Deploy with `NUXT_PUBLIC_INSTANCE_NAME=<name>` and a responses table of its own (the emails table can be shared).

The ids used in the definitions (profiling fields, options, questions, profiles) are the keys stored in Notion. Don't rename them once responses are being collected.

## Response storage (Notion)

Responses are saved as people go through the survey, so unfinished ones are kept too. From the first profiling answer on, every step sends the whole response to the server. The first request creates a row in the responses table and later ones update it. Reloading the page starts a new response.

Emails left on the thanks screen go to a separate emails table, with only the instance next to them. The request carries nothing that refers to the response, and the responses table has no contact details, so an email can't be matched to the answers by their content.

If either table is not configured or not writable, the intro shows an error and the survey can't be started.

### Setting up the tables

1. In Notion, create an [internal integration](https://www.notion.so/profile/integrations) and copy its token into `NUXT_NOTION_API_KEY`.
2. Create two empty databases (only their default title column), one for responses and one for emails, and share both with the integration (⋯ menu → Connections).
3. Copy each one's data source id (⋯ menu → Manage data sources → Copy data source ID) into `NUXT_NOTION_DATA_SOURCE_ID` (responses) and `NUXT_NOTION_EMAILS_DATA_SOURCE_ID` (emails).

The emails table gets the email in its title column, plus `instance`, `consent` (the privacy policy acceptance), `atLeast14` (the age confirmation; both always ticked, since an email is only accepted with them) and `consentDate` (the day it was given, as the privacy policy promises).

The responses table's columns are created on the first save, from the instance definition:

- `date` (the day the person started), `instance`, `locale`, and `step` (the screen the person was on at their last save; its options are in flow order, so grouping or sorting by it shows where people drop off)
- profiling answers prefixed `profiling.` (`profiling.age`, `profiling.diversity`…)
- question answers prefixed `question.` and their world and question position (`question.w1q1_likelyJob`…)
- `result` (only once every question is answered)

Neither table has time columns, only days, so dates can't be used to match an email to a response. Notion still records each row's creation and edit time in its own metadata.

When columns are added, the table views are also put in this order. Existing columns are never renamed or removed. Columns you hide or resize keep those settings, and columns you add yourself go at the end.

Moving a question to another position changes its column name. Once responses are coming in, rename the column in Notion to match.

## Backups (CSV export)

`npm run notion:export` downloads every response in the responses table as a CSV file:

```bash
npm run notion:export              # → exports/responses-<timestamp>.csv
npm run notion:export -- out.csv   # → a path of your choice
```

- It uses `NUXT_NOTION_API_KEY` and `NUXT_NOTION_DATA_SOURCE_ID` from `.env` (or the environment). To back up another deployment's table, set those two variables for the command. To back up the emails table, run it with `NUXT_NOTION_DATA_SOURCE_ID` set to the emails table's id.
- One row per response, oldest first. The first column is the Notion page id, then the columns in the table view's order, including hidden ones.
- Multiple-choice answers are joined with `;` (e.g. `lgtbiq;racialized`). Unanswered questions are empty.
- The file is UTF-8 encoded. In Excel, import it as UTF-8 (Data → From Text/CSV).

The exports contain personal data (profiling answers, or emails). `exports/` is git-ignored; store backups somewhere access-controlled.
