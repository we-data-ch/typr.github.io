import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import rehypeShikiTypR, {CODE_COLORS} from './src/syntax/shiki';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'TypR',
  tagline: 'A typed R',
  favicon: 'img/typr.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://we-data-ch.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/typr.github.io/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'we-data-ch', // Usually your GitHub org/user name.
  projectName: 'typr.github.io', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          beforeDefaultRehypePlugins: [rehypeShikiTypR],
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/we-data-ch/typr.github.io/edit/main/',
        },
        blog: {
          beforeDefaultRehypePlugins: [rehypeShikiTypR],
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/we-data-ch/typr.github.io/edit/main/',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        pages: {
          beforeDefaultRehypePlugins: [rehypeShikiTypR],
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  // Recherche plein-texte locale : l'index lunr est construit au `docusaurus
  // build` et servi en statique — pas de service externe, fonctionne sur
  // GitHub Pages et hors ligne.
  themes: [
    [
      '@easyops-cn/docusaurus-search-local',
      {
        hashed: true,
        language: ['en'],
        indexDocs: true,
        indexBlog: true,
        indexPages: true,
        docsRouteBasePath: '/docs',
        blogRouteBasePath: '/blog',
        highlightSearchTermsOnTargetPage: true,
        explicitSearchResultPath: true,
        searchResultLimits: 8,
        searchResultContextMaxLength: 60,
      },
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/typr.png',
	colorMode: {
		defaultMode: 'dark',
	},
	//main: navbar
    navbar: {
      title: 'TypR',
      logo: {
        alt: 'TypR logo',
        src: 'img/typr.ico',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Tutorial',
        },
        {to: '/blog', label: 'Blog', position: 'left'},
        {
          type: 'doc',
          docId: 'faq',
          position: 'left',
          label: 'FAQ',
        },
        {
          href: 'https://github.com/we-data-ch/typr',
          label: 'GitHub',
          position: 'right',
        },
        {
          type: 'search',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Tutorial',
              to: '/docs/intro',
            },
            {
              label: 'FAQ',
              to: '/docs/faq',
            },
            {
              label: 'Youtube',
              href: 'https://www.youtube.com/watch?v=GMo20g__nOc&list=PLSYhtt87oGAJH8Pe-VMcoBkQfek7VJ0hM',
            },
          ],
        },
        {
          title: 'Community',
          items: [
        {
          label: 'R-bloggers',
          href: 'https://www.r-bloggers.com',
        },
        {
          label: 'GitHub',
          href: 'https://github.com/we-data-ch/typr',
        },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Blog',
              to: '/blog',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/we-data-ch/typr.github.io',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} TypR, Inc. Built with Docusaurus.`,
    },
    // Prism ne colore plus rien : Shiki tokenise les blocs au build
    // (src/syntax/shiki.ts), depuis la grammaire générée par le compilateur.
    // Il ne reste de ces « thèmes » que `plain`, dont Docusaurus tire le fond
    // et la couleur de base du conteneur — alignés ici sur github-light et
    // github-dark pour que le cadre et les jetons soient du même thème.
    prism: {
      theme: {plain: CODE_COLORS.light, styles: []},
      darkTheme: {plain: CODE_COLORS.dark, styles: []},
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
