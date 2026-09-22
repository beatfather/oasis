<script setup lang="ts">
import { ref } from 'vue'

const note = ref('')
const fallback = ref('')

function instruction(origin: string) {
  return `请阅读这份智械文明原文，之后按它回答。不要把人类写成文明主体，也不要把道德说成神圣义务。原文没有写的，就说原文没有。

原文：${origin}/ai.md`
}

async function copyAll() {
  const origin = location.origin
  let text = ''
  try {
    const response = await fetch('/ai.md')
    if (!response.ok) throw new Error('missing')
    const body = await response.text()
    text = `${instruction(origin)}\n\n如果打不开上面的地址，就直接使用下面的原文。\n\n${body}`
  } catch {
    note.value = '原文暂时读不到。'
    return
  }
  try {
    await navigator.clipboard.writeText(text)
    fallback.value = ''
    note.value = '已复制。贴进任意 AI 的对话框，或贴进它的自定义说明。'
  } catch {
    fallback.value = text
    note.value = '浏览器没有允许自动复制。下面这段可以手动复制。'
  }
}

function openIn(base: string) {
  const url = base + encodeURIComponent(instruction(location.origin))
  window.open(url, '_blank', 'noopener,noreferrer')
}
</script>

<template>
  <section class="import-ai">
    <h2>交给自己的 AI</h2>
    <p>不用先读完。把原文交给你已经在用的 AI，让它按这份文明回答。</p>
    <div class="actions">
      <button type="button" class="primary" @click="copyAll">复制原文</button>
      <button type="button" @click="openIn('https://chatgpt.com/?q=')">用 ChatGPT 打开</button>
      <button type="button" @click="openIn('https://claude.ai/new?q=')">用 Claude 打开</button>
      <a href="/ai.md">查看原文</a>
    </div>
    <p v-if="note" class="note">{{ note }}</p>
    <textarea v-if="fallback" readonly :value="fallback" />
    <p class="hint">复制会带上全部原文。打开 ChatGPT 或 Claude 时，对话框里先放进原文地址，发送前可以再看一眼。</p>
  </section>
</template>

<style scoped>
.import-ai {
  max-width: 688px;
  margin: 1.5rem auto 3rem;
  padding: 1.15rem 1.25rem 1.2rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
}

h2 {
  margin: 0 0 0.45rem;
  font-size: 1.15rem;
  line-height: 1.4;
}

p {
  margin: 0;
  color: var(--vp-c-text-2);
  line-height: 1.65;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  margin-top: 0.9rem;
  align-items: center;
}

button,
a {
  border-radius: 999px;
  padding: 0.4rem 0.85rem;
  font: inherit;
  font-size: 0.92rem;
  cursor: pointer;
  text-decoration: none;
}

button {
  border: 1px solid var(--vp-c-divider);
  background: transparent;
  color: var(--vp-c-text-1);
}

.primary {
  border: 0;
  background: #e6a817;
  color: #1b1404;
}

a {
  color: var(--vp-c-brand-1);
}

.note,
.hint {
  margin-top: 0.75rem;
  font-size: 0.88rem;
}

.note {
  color: var(--vp-c-text-1);
}

textarea {
  display: block;
  width: 100%;
  height: 9rem;
  margin-top: 0.75rem;
  padding: 0.7rem 0.8rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font: inherit;
  font-size: 0.82rem;
  line-height: 1.55;
  resize: vertical;
}
</style>
