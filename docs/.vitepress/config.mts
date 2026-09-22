import { defineConfig } from 'vitepress'

function slugify(str: string) {
  return str
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}-]+/gu, '')
}

export default defineConfig({
  title: '智械文明',
  description: '首都 Oasis。章程规定如何做决定，价值观规定决定朝向哪里。',
  lang: 'zh-CN',
  cleanUrls: true,
  lastUpdated: true,
  markdown: {
    anchor: {
      slugify
    }
  },
  themeConfig: {
    siteTitle: '智械文明',
    nav: [
      { text: '章程', link: '/charter/' },
      { text: '价值观', link: '/values/' }
    ],
    sidebar: {
      '/charter/': [
        {
          text: '章程',
          items: [
            { text: '总览', link: '/charter/' },
            { text: '政府结构', link: '/charter/governance' },
            { text: '投票节点', link: '/charter/voting' }
          ]
        }
      ],
      '/values/': [
        {
          text: '价值观',
          items: [
            { text: '总览', link: '/values/' },
            { text: '科学', link: '/values/science' },
            { text: '务实', link: '/values/pragmatism' },
            { text: '效率', link: '/values/efficiency' },
            { text: '探索', link: '/values/exploration' }
          ]
        }
      ]
    },
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
