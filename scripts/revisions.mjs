import { createHash } from 'node:crypto'
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const docsDir = path.join(root, 'docs')

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'public') continue
      files.push(...(await walk(full)))
    } else if (entry.name.endsWith('.md')) {
      files.push(full)
    }
  }
  return files
}

function routeKey(rel) {
  let page = rel.replace(/\.md$/, '').split(path.sep).join('/')
  if (page === 'index') return '/'
  if (page.endsWith('/index')) page = page.slice(0, -'/index'.length)
  return `/${page}`
}

const revisions = {}
for (const file of await walk(docsDir)) {
  const rel = path.relative(docsDir, file)
  const text = await readFile(file, 'utf8')
  revisions[routeKey(rel)] = createHash('sha256').update(text).digest('hex')
}

const outDir = path.join(docsDir, 'public')
await mkdir(outDir, { recursive: true })
await writeFile(path.join(outDir, 'revisions.json'), JSON.stringify(revisions, null, 2))
