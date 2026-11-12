import { Client } from '@notionhq/client'
import type { CreatePageParameters, UpdateDataSourceParameters } from '@notionhq/client'
import type { InstanceDefinition } from '#shared/survey/instance'
import { resolveProfile } from '#shared/survey/scoring'

/*
 * Responses are stored one row per person in a Notion data source (a table).
 * Column names are built from the stable ids of the instance definition and
 * select options are the option ids, so the table can be analysed without
 * the i18n texts drifting under it. Profiling columns are prefixed `p_`
 * (`p_age`) and questions with their 1-based world and question position
 * (`w1q2_wantCareer`), so they group and sort together in Notion. Moving a
 * question therefore renames its column (see ensureColumns).
 *
 * Whenever columns are added, the table views are also laid out in the
 * definition order (title first, columns not defined here last), so new
 * columns land where they belong instead of at the end. Otherwise the views
 * are left alone, so manual layout changes in Notion stick.
 *
 * The columns are created on the first write of each server process from the
 * instance definition (ensureColumns): an empty table only needs its title
 * column. Existing columns are never renamed or removed.
 */

type PropertyValue = NonNullable<CreatePageParameters['properties']>[string]
type PropertySchema = NonNullable<UpdateDataSourceParameters['properties']>[string]

interface Column {
  name: string
  // Type the column must have, and how to create it if missing
  type: string
  schema: PropertySchema
  // Value written to the row; undefined = column filled in by Notion
  value?: (response: SurveyResponse) => PropertyValue
}

const select = (value: string | null | undefined): PropertyValue => ({ select: value ? { name: value } : null })
const options = (values: readonly string[]) => values.map(name => ({ name }))

function buildColumns(instance: InstanceDefinition): Column[] {
  const questionIds = instance.worlds.flatMap(world => world.questions)

  const profiling = instance.profiling.map((field): Column => {
    const name = `p_${field.id}`
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
    world.questions.map((id, questionIndex): Column => ({
      name: `w${worldIndex + 1}q${questionIndex + 1}_${id}`,
      type: 'number',
      schema: { number: { format: 'number' } },
      value: response => ({ number: response.answers[id] ?? null })
    }))
  )

  // Also the column order of the table views (see ensureColumns)
  return [
    { name: 'createdAt', type: 'created_time', schema: { created_time: {} } },
    { name: 'updatedAt', type: 'last_edited_time', schema: { last_edited_time: {} } },
    {
      // Each instance has its own table (its questions differ); the column
      // keeps every row self-describing anyway
      name: 'instance',
      type: 'select',
      schema: { select: { options: options([instance.name]) } },
      value: () => select(instance.name)
    },
    {
      name: 'locale',
      type: 'select',
      schema: { select: { options: options(['es', 'eu', 'en']) } },
      value: response => select(response.locale)
    },
    {
      name: 'step',
      type: 'select',
      schema: { select: {} },
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
    },
    {
      name: 'email',
      type: 'email',
      schema: { email: {} },
      value: response => ({ email: response.email || null })
    }
  ]
}

let client: Client | undefined
let columns: Column[] | undefined
// Name of the table's title column, which every row must fill
let ready: Promise<string> | undefined

export function useNotion() {
  const { apiKey, dataSourceId } = useRuntimeConfig().notion
  if (!apiKey || !dataSourceId) {
    throw createError({ statusCode: 503, statusMessage: 'Notion persistence is not configured' })
  }
  client ??= new Client({ auth: apiKey })
  columns ??= buildColumns(useSurveyInstance())
  return { client, dataSourceId, columns }
}

/**
 * Puts the table views of the data source in definition order: title, our
 * columns, then any other column. Keeps each column's visibility and width;
 * a column the view has no settings for yet is shown (Notion hides any
 * column sent without `visible: true`).
 */
async function orderTableViews(properties: Record<string, { id: string, name: string, type: string }>) {
  const { client, dataSourceId, columns } = useNotion()
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
async function ensureColumns(): Promise<string> {
  const { client, dataSourceId, columns } = useNotion()
  const { properties } = await client.dataSources.retrieve({ data_source_id: dataSourceId })
  const existing = Object.values(properties)

  const mismatched = columns.filter((column) => {
    const property = existing.find(property => property.name === column.name)
    return property && property.type !== column.type
  })
  if (mismatched.length) {
    throw new Error(`Notion columns with the wrong type: ${mismatched.map(column => `${column.name} (expected ${column.type})`).join(', ')}`)
  }

  const missing = columns.filter(column => !existing.some(property => property.name === column.name))
  if (missing.length) {
    const updated = await client.dataSources.update({
      data_source_id: dataSourceId,
      properties: Object.fromEntries(missing.map(column => [column.name, column.schema]))
    })
    if ('properties' in updated) await orderTableViews(updated.properties)
  }

  return existing.find(property => property.type === 'title')!.name
}

async function rowProperties(response: SurveyResponse, { create = false } = {}) {
  ready ??= ensureColumns().catch((error) => {
    // Retry on the next request (e.g. after fixing the table)
    ready = undefined
    throw error
  })
  const titleColumn = await ready
  const { columns } = useNotion()

  const properties: Record<string, PropertyValue> = Object.fromEntries(
    columns.filter(column => column.value).map(column => [column.name, column.value!(response)])
  )
  // Short reference to find a row by eye; the real key is the page id
  if (create) {
    properties[titleColumn] = { title: [{ text: { content: crypto.randomUUID().slice(0, 8) } }] }
  }
  return properties
}

/** Creates the row of a new response; returns its Notion page id. */
export async function createResponseRow(response: SurveyResponse): Promise<string> {
  const { client, dataSourceId } = useNotion()
  const page = await client.pages.create({
    parent: { type: 'data_source_id', data_source_id: dataSourceId },
    properties: await rowProperties(response, { create: true })
  })
  return page.id
}

/** Overwrites the row of a response with its latest snapshot. */
export async function updateResponseRow(pageId: string, response: SurveyResponse): Promise<void> {
  const { client } = useNotion()
  await client.pages.update({ page_id: pageId, properties: await rowProperties(response) })
}
