<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import { useRoute, useRouter } from 'vitepress'

const STORAGE_KEY = 'oasis-read-state-v2'
const DWELL_MS = 800

type PageRecord = {
  hash?: string
  sections: Record<string, string>
}

type Captured = {
  key: string
  sections: Record<string, string>
  fresh: Record<string, string>
  pending: boolean
  hash?: string
}

const route = useRoute()
const router = useRouter()
const hunks = shallowRef<HTMLElement[]>([])
const cursor = ref(0)

let captured: Captured | null = null
let revisions: Record<string, string> = {}
let observer: IntersectionObserver | null = null
let dwellTimers = new Map<string, number>()
let previousBefore: ((to: string) => unknown) | undefined

function pageKey(path: string) {
  let key = path.split('#')[0].split('?')[0]
  key = key.replace(/\.html$/, '').replace(/\/index$/, '')
  if (key.length > 1 && key.endsWith('/')) key = key.slice(0, -1)
  return key || '/'
}

function normalize(text: string) {
  return text.replace(/[\u200b\u00a0]/g, ' ').replace(/\s+/g, ' ').trim()
}

function contentRoot() {
  const doc = document.querySelector('.vp-doc')
  if (!(doc instanceof HTMLElement)) return null
  const first = doc.firstElementChild
  if (!(first instanceof HTMLElement)) return null
  if (first.tagName === 'DIV') {
    return first.querySelector('h1, h2') ? first : null
  }
  return doc.querySelector('h1, h2') ? doc : null
}

function load(): Record<string, PageRecord> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function persist(store: Record<string, PageRecord>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

function collectSections(doc: Element) {
  const children = [...doc.children].filter(
    (el) => !(el instanceof HTMLElement && el.dataset.oasisInserted)
  )
  const sections: { id: string; title: string; els: Element[] }[] = []
  let current = { id: 'top', title: '开篇', els: [] as Element[] }

  for (const el of children) {
    if (el.tagName === 'H2' && current.els.length) {
      sections.push(current)
      current = {
        id: (el as HTMLElement).id || normalize(el.textContent || 'section'),
        title: normalize(el.textContent || '本节'),
        els: [el]
      }
    } else if (el.tagName === 'H2') {
      current = {
        id: (el as HTMLElement).id || normalize(el.textContent || 'section'),
        title: normalize(el.textContent || '本节'),
        els: [el]
      }
    } else {
      current.els.push(el)
    }
  }
  if (current.els.length) sections.push(current)
  return sections
}

function sectionText(els: Element[]) {
  return els
    .map((el) => normalize(el.textContent || ''))
    .filter(Boolean)
    .join('\n')
}

function clearInserted() {
  document.querySelectorAll('[data-oasis-inserted]').forEach((el) => el.remove())
  document.querySelectorAll('.vp-doc .is-seen, .vp-doc .is-updated').forEach((el) => {
    el.classList.remove('is-seen', 'is-updated')
  })
}

function paintChrome() {
  const store = load()
  const current = pageKey(route.path)
  document.querySelectorAll<HTMLAnchorElement>('.VPSidebar a, .VPNav a').forEach((anchor) => {
    const href = anchor.getAttribute('href')
    if (!href || href.startsWith('http') || href.startsWith('#')) return
    const key = pageKey(href)
    const record = store[key]
    const read = Boolean(record && Object.keys(record.sections).length)
    const changed =
      key === current
        ? Boolean(captured?.pending)
        : Boolean(record?.hash && revisions[key] && record.hash !== revisions[key])
    anchor.classList.toggle('is-read', read && !changed)
    anchor.classList.toggle('has-update', changed)
  })
}

function rememberFresh(id: string, text: string) {
  if (!captured || captured.sections[id] || captured.fresh[id]) return
  captured.fresh[id] = text
  const store = load()
  const prev = store[captured.key] ?? { sections: {} }
  if (!prev.sections[id]) {
    prev.sections[id] = text
    if (captured.hash && !captured.pending) prev.hash = captured.hash
    store[captured.key] = prev
    persist(store)
    paintChrome()
  }
}

function watchUnread(sections: { id: string; els: Element[] }[]) {
  observer?.disconnect()
  dwellTimers.forEach((timer) => window.clearTimeout(timer))
  dwellTimers = new Map()
  if (!captured) return

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const id = (entry.target as HTMLElement).dataset.oasisSection
        if (!id || !captured) continue
        if (!entry.isIntersecting) {
          const timer = dwellTimers.get(id)
          if (timer) window.clearTimeout(timer)
          dwellTimers.delete(id)
          continue
        }
        if (dwellTimers.has(id) || captured.sections[id] || captured.fresh[id]) continue
        const text = (entry.target as HTMLElement).dataset.oasisText || ''
        dwellTimers.set(
          id,
          window.setTimeout(() => rememberFresh(id, text), DWELL_MS)
        )
      }
    },
    { threshold: 0.01 }
  )

  for (const section of sections) {
    if (captured.sections[section.id]) continue
    const text = sectionText(section.els)
    for (const el of section.els) {
      if (!(el instanceof HTMLElement)) continue
      el.dataset.oasisSection = section.id
      el.dataset.oasisText = text
      observer.observe(el)
    }
  }
}

function apply() {
  clearInserted()
  hunks.value = []
  cursor.value = 0
  const doc = contentRoot()
  const key = pageKey(route.path)
  if (!doc) {
    captured = null
    paintChrome()
    return
  }

  const sections = collectSections(doc)
  const currentTexts: Record<string, string> = {}
  for (const section of sections) currentTexts[section.id] = sectionText(section.els)

  const store = load()
  const record = store[key]
  const seen = record?.sections ?? {}
  const nextHunks: HTMLElement[] = []

  for (const section of sections) {
    const text = currentTexts[section.id]
    const oldText = seen[section.id]
    if (!oldText) continue
    if (oldText === text) {
      section.els.forEach((el) => el.classList.add('is-seen'))
      continue
    }
    section.els.forEach((el) => {
      el.classList.add('is-updated')
      if (el instanceof HTMLElement) el.dataset.oasisHunk = ''
    })
    const anchor = section.els[0]
    if (anchor instanceof HTMLElement) nextHunks.push(anchor)
  }

  captured = {
    key,
    sections: seen,
    fresh: {},
    pending: nextHunks.length > 0,
    hash: revisions[key]
  }
  hunks.value = nextHunks
  watchUnread(sections)
  paintChrome()
}

function persistCaptured() {
  if (!captured) return
  const store = load()
  const prev = store[captured.key] ?? { sections: {} }
  const sections = { ...prev.sections, ...captured.fresh }
  if (captured.pending) {
    store[captured.key] = { hash: prev.hash, sections }
  } else {
    store[captured.key] = {
      hash: captured.hash ?? prev.hash,
      sections
    }
  }
  if (Object.keys(sections).length) persist(store)
}

function acknowledge() {
  if (!captured) return
  const doc = contentRoot()
  if (!doc) return
  const sections = collectSections(doc)
  const store = load()
  const prev = store[captured.key] ?? { sections: {} }
  const next = { ...prev.sections, ...captured.fresh }
  for (const section of sections) next[section.id] = sectionText(section.els)
  store[captured.key] = { hash: captured.hash ?? revisions[captured.key], sections: next }
  persist(store)
  captured = {
    key: captured.key,
    sections: next,
    fresh: {},
    pending: false,
    hash: captured.hash
  }
  clearInserted()
  sections.forEach((section) => section.els.forEach((el) => el.classList.add('is-seen')))
  hunks.value = []
  paintChrome()
}

function go(step: number) {
  if (!hunks.value.length) return
  cursor.value = (cursor.value + step + hunks.value.length) % hunks.value.length
  hunks.value[cursor.value].scrollIntoView({ behavior: 'smooth', block: 'center' })
}

async function refresh() {
  await nextTick()
  for (let attempt = 0; attempt < 20; attempt += 1) {
    if (contentRoot()) break
    await new Promise((resolve) => window.setTimeout(resolve, 50))
  }
  apply()
}

onMounted(async () => {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}revisions.json`)
    if (response.ok) revisions = await response.json()
  } catch {
    revisions = {}
  }
  previousBefore = router.onBeforeRouteChange
  router.onBeforeRouteChange = async (to) => {
    persistCaptured()
    captured = null
    if (previousBefore) return previousBefore(to)
  }
  window.addEventListener('pagehide', persistCaptured)
  await refresh()
})

onBeforeUnmount(() => {
  persistCaptured()
  observer?.disconnect()
  router.onBeforeRouteChange = previousBefore
  window.removeEventListener('pagehide', persistCaptured)
})

watch(() => route.path, () => {
  refresh()
})
</script>

<template>
  <div v-if="hunks.length" class="oasis-diff-nav">
    <span>{{ cursor + 1 }} / {{ hunks.length }} 处更新</span>
    <button type="button" @click="go(-1)">上一条</button>
    <button type="button" @click="go(1)">下一条</button>
    <button type="button" class="primary" @click="acknowledge">标为已读</button>
  </div>
</template>
