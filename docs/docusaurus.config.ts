import { themes as prismThemes } from 'prism-react-renderer'
import type { Config } from '@docusaurus/types'
import type * as Preset from '@docusaurus/preset-classic'

const config: Config = {
  title: 'OpenBudy Agent 实战',
  tagline: '用 TypeScript + Electron + pi-ai 从零构建桌面 AI Agent',
  favicon: 'img/favicon.ico',

  // GitHub Pages 部署配置（项目站点 <user>.github.io/<repo>/ 需要带前缀）
  url: 'https://pengjinning.github.io',
  baseUrl: '/openbudy/',

  onBrokenLinks: 'warn',

  i18n: {
    defaultLocale: 'zh-cn',
    locales: ['zh-cn'],
  },

  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },
  themes: ['@docusaurus/theme-mermaid'],

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/pengjinning/openbudy/tree/main/docs',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'OpenBudy Agent 实战',
      logo: {
        alt: 'OpenBudy',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'doc',
          docId: 'intro/what-is-agent',
          position: 'left',
          label: '教程',
        },
        {
          href: 'https://www.weiyuai.cn',
          position: 'right',
          label: '微语官网',
        },
        {
          href: 'https://github.com/Bytedesk/bytedesk',
          position: 'right',
          label: '开源智能客服',
        },
        {
          href: 'https://github.com/pengjinning/openbudy',
          position: 'right',
          label: 'GitHub',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: '教程',
          items: [
            {
              label: '准备篇',
              to: '/intro/what-is-agent',
            },
            {
              label: 'Electron 基础',
              to: '/electron/process-model',
            },
            {
              label: 'Agent Loop',
              to: '/agent-loop/',
            },
          ],
        },
        {
          title: '更多',
          items: [
            {
              label: 'GitHub 仓库',
              href: 'https://github.com/pengjinning/openbudy',
            },
            {
              label: 'pi-ai',
              href: 'https://www.npmjs.com/package/@earendil-works/pi-ai',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} OpenBudy. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'diff'],
    },
  } satisfies Preset.ThemeConfig,
}

export default config
