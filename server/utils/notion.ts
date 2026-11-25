import { Client } from '@notionhq/client'
import type { CreatePageParameters, UpdateDataSourceParameters } from '@notionhq/client'
import type { InstanceDefinition } from '#shared/survey/instance'
import { resolveProfile } from '#shared/survey/scoring'
import { buildSteps, isSavedStep, profilingKey, questionKey, stepKey } from '#shared/survey/steps'

/*
 * Two Notion data sources (tables) per deployment:
 *
 * - responses: one row per person with their answers, never any contact
 *   details.
 * - emails: the addresses left on the thanks screen, with the instance, the
 *   privacy policy consent, the age confirmation and the day they were given
 *   only, so an email can't be matched to a response. It can be shared by
 *   several instances.
 *
 * Neither table has time columns: dates are kept to the day, so they don't
 * help match an email to a response. Notion still records each row's
 * creation time in its metadata, so emails aren't written when they are left
 * but queued and written in a daily batch, in random order
 * (server/utils/email-queue.ts).
 *
 * Responses are stored one row per person.
 * Column names are built from the stable ids of the instance definition and
 * select options are the option ids, so the table can be analysed without
 * the i18n texts drifting under it. Profiling and question columns are
 * named like their step (`profiling.age`, `question.w1q2_wantCareer`, see
 * shared/survey/steps.ts), so the `step` value of a row names the column
 * where it stopped. Moving a question therefore renames its column (see
 * ensureColumns). The `step` options are listed in flow order, so grouping
 * or sorting by step in Notion reads as a drop-off funnel.
 *
 * Whenever columns are added, the table views are also laid out in the
 * definition order (title first, columns not defined here last), so new
 * columns land where they belong instead of at the end. Otherwise the views
 * are left alone, so manual layout changes in Notion stick.
 *
 * The columns of both tables are created on the first write of each server
 * process from the instance definition (ensureColumns): an empty table only
 * needs its title column. Existing columns are never renamed or removed.
 */

type PropertyValue = NonNullable<CreatePageParameters['properties']>[string]
type PropertySchema = NonNullable<UpdateDataSourceParameters['properties']>[string]

interface Column<Row> {
  name: string
  // Type the column must have, and how to create it if missing
  type: string
  schema: PropertySchema
  // Value written to the row; undefined = column filled in by Notion
  value?: (row: Row) => PropertyValue
  // Written when the row is created only, never on later updates
  createOnly?: boolean
}

export interface EmailSignup {
  email: string
  consent: true
  atLeast14: true
}

// A row of the emails table: a queued signup (server/utils/email-queue.ts)
// with the day it was left
export interface EmailRow extends EmailSignup {
  day: string
}

const select = (value: string | null | undefined): PropertyValue => ({ select: value ? { name: value } : null })
const options = (values: readonly string[]) => values.map(name => ({ name }))

// A day (YYYY-MM-DD) as a Notion date without time
const day = (value: string): PropertyValue => ({ date: { start: value } })

const instanceColumn = (instance: InstanceDefinition): Column<unknown> => ({
  name: 'instance',
  type: 'select',
  schema: { select: { options: options([instance.name]) } },
  value: () => select(instance.name)
})

function buildResponseColumns(instance: InstanceDefinition): Column<SurveyResponse>[] {
  const questionIds = instance.worlds.flatMap(world => world.questions)
  const savedSteps = buildSteps(instance).filter(isSavedStep).map(step => stepKey(instance, step))

  const profiling = instance.profiling.map((field): Column<SurveyResponse> => {
    const name = profilingKey(field.id)
    const read = (response: SurveyResponse) => response.profiling[field.id]
    switch (field.kind) {
      case 'number':
        return {
          name,
          type: 'number',
          schema: { number: { format: 'number' } },
          value: response => ({ number: (read(response) as number | null | undefined) ?? null })
        }
      case 'postalCode':
        return {
          name,
          type: 'rich_text',
          schema: { rich_text: {} },
          value: (response) => {
            const value = read(response) as string | null | undefined
            return { rich_text: value ? [{ text: { content: value } }] : [] }
          }
        }
      case 'select':
        return field.multiple
          ? {
              name,
              type: 'multi_select',
              schema: { multi_select: { options: options(field.options) } },
              value: response => ({ multi_select: options((read(response) as string[] | undefined) ?? []) })
            }
          : {
              name,
              type: 'select',
              schema: { select: { options: options(field.options) } },
              value: response => select(read(response) as string | null | undefined)
            }
    }
  })

  const questions = instance.worlds.flatMap((world, worldIndex) =>
    world.questions.map((id, questionIndex): Column<SurveyResponse> => ({
      name: questionKey(worldIndex, questionIndex, id),
      type: 'number',
      schema: { number: { format: 'number' } },
      value: response => ({ number: response.answers[id] ?? null })
    }))
  )

  // Also the column order of the table views (see ensureColumns)
  return [
    // The day the person started (kept on later saves, even past midnight)
    { name: 'date', type: 'date', schema: { date: {} }, createOnly: true, value: () => day(todayInSpain()) },
    // Each instance has its own table (its questions differ); the column
    // keeps every row self-describing anyway
    instanceColumn(instance),
    {
      name: 'locale',
      type: 'select',
      schema: { select: { options: options(['es', 'eu', 'en']) } },
      value: response => select(response.locale)
    },
    {
      name: 'step',
      type: 'select',
      schema: { select: { options: options(savedSteps) } },
      value: response => select(response.step)
    },
    ...profiling,
    ...questions,
    {
      // Only once every question is answered: a partial score means nothing
      name: 'result',
      type: 'select',
      schema: { select: { options: options(instance.profiles.map(profile => profile.id)) } },
      value: response => select(
        questionIds.every(id => response.answers[id] != null)
          ? resolveProfile(instance.profiles, response.answers)
          : null
      )
    }
  ]
}

// The email goes in the title column (see tableRow)
function buildEmailColumns(instance: InstanceDefinition): Column<EmailRow>[] {
  return [
    instanceColumn(instance),
    {
      // Always ticked: an email is only accepted with the consent
      name: 'consent',
      type: 'checkbox',
      schema: { checkbox: {} },
      value: signup => ({ checkbox: signup.consent })
    },
    {
      // Always ticked too: the person confirmed being 14 or older (LOPDGDD
      // art. 7), a box of its own as the DPO asked
      name: 'atLeast14',
      type: 'checkbox',
      schema: { checkbox: {} },
      value: signup => ({ checkbox: signup.atLeast14 })
    },
    {
      // Proof of when consent was given, as the privacy policy promises: the
      // day the email was left, not the day it reached Notion (emails are
      // written in daily batches)
      name: 'consentDate',
      type: 'date',
      schema: { date: {} },
      value: row => day(row.day)
    }
  ]
}

type TableName = 'responses' | 'emails'
interface TableRow { responses: SurveyResponse, emails: EmailRow }

interface Table<Row> {
  name: TableName
  dataSourceId: string
  columns: Column<Row>[]
  // Text of the title column, which every row must fill
  title: (row: Row) => string
}

let client: Client | undefined
const columnsCache: { [Name in TableName]?: Column<TableRow[Name]>[] } = {}
// Per table: name of its title column, once its columns are checked
const ready: { [Name in TableName]?: Promise<string> } = {}

function useNotionTable<Name extends TableName>(name: Name): { client: Client } & Table<TableRow[Name]> {
  const { apiKey, dataSourceId, emailsDataSourceId } = useRuntimeConfig().notion
  const tableId = name === 'responses' ? dataSourceId : emailsDataSourceId
  if (!apiKey || !tableId) {
    throw createError({ statusCode: 503, statusMessage: `Notion persistence is not configured (${name})` })
  }
  client ??= new Client({ auth: apiKey })
  const instance = useSurveyInstance()
  const table = name === 'responses'
    ? {
        columns: columnsCache.responses ??= buildResponseColumns(instance),
        // Short reference to find a row by eye; the real key is the page id
        title: () => crypto.randomUUID().slice(0, 8)
      }
    : {
        columns: columnsCache.emails ??= buildEmailColumns(instance),
        title: (row: EmailRow) => row.email
      }
  return { client, name, dataSourceId: tableId, ...table } as { client: Client } & Table<TableRow[Name]>
}

/**
 * Puts the table views of the data source in definition order: title, our
 * columns, then any other column. Keeps each column's visibility and width;
 * a column the view has no settings for yet is shown (Notion hides any
 * column sent without `visible: true`).
 */
async function orderTableViews(name: TableName, properties: Record<string, { id: string, name: string, type: string }>) {
  const { client, dataSourceId, columns } = useNotionTable(name)
  const all = Object.values(properties)
  const ordered = [
    ...all.filter(property => property.type === 'title'),
    ...columns.flatMap(column => all.filter(property => property.name === column.name)),
    ...all.filter(property => property.type !== 'title' && !columns.some(column => column.name === property.name))
  ]

  const { results } = await client.views.list({ data_source_id: dataSourceId })
  for (const { id } of results) {
    const view = await client.views.retrieve({ view_id: id })
    const configuration = 'configuration' in view ? view.configuration : null
    if (configuration?.type !== 'table') continue

    const current = configuration.properties ?? []
    await client.views.update({
      view_id: id,
      configuration: {
        type: 'table',
        properties: ordered.map((property) => {
          // Data sources return property ids URL-encoded, views decoded
          const id = decodeURIComponent(property.id)
          const { visible = true, width, wrap } = current.find(config => config.property_id === id) ?? {}
          return { property_id: id, visible, width, wrap }
        })
      }
    })
  }
}

/**
 * Creates the missing columns once per process (and lays out the views);
 * fails on a type mismatch.
 */
async function ensureColumns(name: TableName): Promise<string> {
  const { client, dataSourceId, columns } = useNotionTable(name)
  const { properties } = await client.dataSources.retrieve({ data_source_id: dataSourceId })
  const existing = Object.values(properties)

  const mismatched = columns.filter((column) => {
    const property = existing.find(property => property.name === column.name)
    return property && property.type !== column.type
  })
  if (mismatched.length) {
    throw new Error(`Notion columns with the wrong type in ${name}: ${mismatched.map(column => `${column.name} (expected ${column.type})`).join(', ')}`)
  }

  const missing = columns.filter(column => !existing.some(property => property.name === column.name))
  if (missing.length) {
    const updated = await client.dataSources.update({
      data_source_id: dataSourceId,
      properties: Object.fromEntries(missing.map(column => [column.name, column.schema]))
    })
    if ('properties' in updated) await orderTableViews(name, updated.properties)
  }

  return existing.find(property => property.type === 'title')!.name
}

/**
 * Checks once per process that a table can be written to: configured,
 * reachable with the API key, and with the right columns (created if
 * missing). Resolves to the name of its title column. A failure is retried
 * on the next call (e.g. after fixing the table).
 */
export function ensureNotionTable(name: TableName): Promise<string> {
  ready[name] ??= ensureColumns(name).catch((error) => {
    ready[name] = undefined
    throw error
  })
  return ready[name]
}

async function tableRow<Name extends TableName>(name: Name, row: TableRow[Name], { create = false } = {}) {
  const titleColumn = await ensureNotionTable(name)
  const { columns, title } = useNotionTable(name)

  const properties: Record<string, PropertyValue> = Object.fromEntries(
    columns
      .filter(column => column.value && (create || !column.createOnly))
      .map(column => [column.name, column.value!(row)])
  )
  if (create) properties[titleColumn] = { title: [{ text: { content: title(row) } }] }
  return properties
}

/** Creates the row of a new response; returns its Notion page id. */
export async function createResponseRow(response: SurveyResponse): Promise<string> {
  const { client, dataSourceId } = useNotionTable('responses')
  const page = await client.pages.create({
    parent: { type: 'data_source_id', data_source_id: dataSourceId },
    properties: await tableRow('responses', response, { create: true })
  })
  return page.id
}

/** Overwrites the row of a response with its latest snapshot. */
export async function updateResponseRow(pageId: string, response: SurveyResponse): Promise<void> {
  const { client } = useNotionTable('responses')
  await client.pages.update({ page_id: pageId, properties: await tableRow('responses', response) })
}

/**
 * Adds an email to the emails table (nothing ties it to a response). Only the
 * daily flush of the email queue calls it.
 */
export async function createEmailRow(row: EmailRow): Promise<void> {
  const { client, dataSourceId } = useNotionTable('emails')
  await client.pages.create({
    parent: { type: 'data_source_id', data_source_id: dataSourceId },
    properties: await tableRow('emails', row, { create: true })
  })
}
