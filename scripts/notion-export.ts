/*
 * Downloads every response in the Notion responses table as a CSV backup:
 *
 *   npm run notion:export              → exports/responses-<timestamp>.csv
 *   npm run notion:export -- out.csv   → out.csv
 *
 * Reads NUXT_NOTION_API_KEY and NUXT_NOTION_DATA_SOURCE_ID from .env (or the
 * environment). Columns follow the table view's order (the survey order, see
 * server/utils/notion.ts), hidden ones included, after the row's page id.
 * Multiple choices are joined with ";".
 *
 * The file holds personal data (profiling answers): exports/ is
 * git-ignored, keep backups somewhere access-controlled.
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { Client } from '@notionhq/client'

const apiKey = process.env.NUXT_NOTION_API_KEY
const dataSourceId = process.env.NUXT_NOTION_DATA_SOURCE_ID
if (!apiKey || !dataSourceId) {
  console.error('Set NUXT_NOTION_API_KEY and NUXT_NOTION_DATA_SOURCE_ID (see .env.example).')
  process.exit(1)
}

const client = new Client({ auth: apiKey })

// Property value as it is returned by a data source query
type Property = { type: string } & Record<string, unknown>

function cellText(property: Property): string {
  const value = property[property.type]
  switch (property.type) {
    case 'title':
    case 'rich_text':
      return (value as { plain_text: string }[]).map(part => part.plain_text).join('')
    case 'select':
    case 'status':
      return (value as { name: string } | null)?.name ?? ''
    case 'date':
      return (value as { start: string } | null)?.start ?? ''
    case 'multi_select':
      return (value as { name: string }[]).map(option => option.name).join(';')
    default:
      // number, email, created_time, last_edited_time…
      return value == null ? '' : String(value)
  }
}

// RFC 4180: quote fields with a separator, quote or line break
function csvField(text: string): string {
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

/** Column names: the first table view's order, then any others. */
async function columnNames(): Promise<string[]> {
  const { properties } = await client.dataSources.retrieve({ data_source_id: dataSourceId! })
  // Data sources return property ids URL-encoded, views decoded
  const byId = new Map(Object.values(properties).map(property => [decodeURIComponent(property.id), property.name]))

  const ordered: string[] = []
  const { results } = await client.views.list({ data_source_id: dataSourceId! })
  for (const { id } of results) {
    const view = await client.views.retrieve({ view_id: id })
    const configuration = 'configuration' in view ? view.configuration : null
    if (configuration?.type !== 'table') continue
    for (const { property_id } of configuration.properties ?? []) {
      const name = byId.get(property_id)
      if (name) ordered.push(name)
    }
    break
  }

  return [...ordered, ...[...byId.values()].filter(name => !ordered.includes(name))]
}

async function* rows() {
  let cursor: string | undefined
  do {
    const page = await client.dataSources.query({
      data_source_id: dataSourceId!,
      start_cursor: cursor,
      page_size: 100,
      sorts: [{ timestamp: 'created_time', direction: 'ascending' }]
    })
    for (const row of page.results) {
      if ('properties' in row) yield row
    }
    cursor = page.next_cursor ?? undefined
  } while (cursor)
}

const columns = await columnNames()
const lines = [['id', ...columns].map(csvField).join(',')]
for await (const row of rows()) {
  const properties = row.properties as Record<string, Property>
  const cells = columns.map(name => (properties[name] ? cellText(properties[name]) : ''))
  lines.push([row.id, ...cells].map(csvField).join(','))
}

const timestamp = new Date().toISOString().slice(0, 19).replaceAll(':', '-')
const file = process.argv[2] ?? `exports/responses-${timestamp}.csv`
await mkdir(dirname(file), { recursive: true })
await writeFile(file, `${lines.join('\r\n')}\r\n`)
console.log(`${lines.length - 1} responses → ${file}`)
