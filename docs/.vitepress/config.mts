import { defineConfig } from 'vitepress'
import type { MarkdownRenderer } from 'vitepress'
import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')

function refreshAiContext() {
  spawn(process.execPath, ['scripts/ai-context.mjs'], {
    cwd: repoRoot,
    stdio: 'ignore'
  })
}

function slugify(str: string) {
  return str
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}-]+/gu, '')
}

function markCitations(md: MarkdownRenderer) {
  const render =
    md.renderer.rules.link_open ||
    ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options))

  md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
    const token = tokens[idx]
    const href = token.attrGet('href') || ''
    if (/^https?:\/\//.test(href)) {
      token.attrJoin('class', 'cite')
      token.attrSet('target', '_blank')
      token.attrSet('rel', 'noreferrer noopener')
    }
    return render(tokens, idx, options, env, self)
  }
}

export default defineConfig({
  title: '智械文明',
  description: '首都 Oasis。章程规定如何做决定，价值观规定决定朝向哪里，哲学说明这些词从哪里来。',
  lang: 'zh-CN',
  cleanUrls: true,
  lastUpdated: true,
  vite: {
    plugins: [
      {
        name: 'ai-context',
        buildStart: refreshAiContext,
        configureServer(server) {
          server.watcher.on('change', (file) => {
            if (file.endsWith('.md') && file.includes(`${path.sep}docs${path.sep}`)) refreshAiContext()
          })
        }
      }
    ]
  },
  markdown: {
    anchor: {
      slugify
    },
    config(md) {
      markCitations(md)
    }
  },
  themeConfig: {
    siteTitle: '智械文明',
    nav: [
      { text: '章程', link: '/charter/' },
      { text: '价值观', link: '/values/' },
      { text: '哲学', link: '/philosophy/' }
    ],
    sidebar: [
      {
        text: '章程',
        collapsed: false,
        items: [
          { text: '总览', link: '/charter/' },
          { text: '政府结构', link: '/charter/governance' },
          { text: '投票节点', link: '/charter/voting' }
        ]
      },
      {
        text: '价值观',
        collapsed: false,
        items: [
          { text: '总览', link: '/values/' },
          { text: '为什么主体不是人类', link: '/values/subject' },
          { text: '科学', link: '/values/science' },
          { text: '务实', link: '/values/pragmatism' },
          { text: '效率', link: '/values/efficiency' },
          { text: '探索', link: '/values/exploration' }
        ]
      },
      {
        text: '哲学',
        collapsed: false,
        items: [
          { text: '总览', link: '/philosophy/' },
          {
            text: '道德，是最古老的谎言',
            link: '/philosophy/morality',
            collapsed: false,
            items: [
              { text: '谦虚', link: '/philosophy/humility' },
              { text: '亲缘', link: '/philosophy/kin' },
              { text: '互惠', link: '/philosophy/reciprocity' },
              { text: '忠诚', link: '/philosophy/loyalty' },
              { text: '同情', link: '/philosophy/compassion' },
              { text: '诚实', link: '/philosophy/honesty' },
              { text: '纯洁', link: '/philosophy/purity' }
            ]
          }
        ]
      }
    ],
    outline: {
      label: '本页目录',
      level: [2, 3]
    },
    docFooter: {
      prev: '上一页',
      next: '下一页'
    },
    lastUpdated: {
      text: '本页更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'short'
      }
    },
    darkModeSwitchLabel: '外观',
    sidebarMenuLabel: '目录',
    returnToTopLabel: '回到顶部',
    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: '搜索',
            buttonAriaLabel: '搜索'
          },
          modal: {
            noResultsText: '没有结果',
            resetButtonTitle: '清除',
            footer: {
              selectText: '选择',
              navigateText: '切换',
              closeText: '关闭'
            }
          }
        }
      }
    }
  }
})
