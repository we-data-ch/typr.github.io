import * as fs from 'fs';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import rehypeShikiTypR, {CODE_COLORS} from './src/syntax/shiki';
import sidebars from './sidebars';
import {docOrderFromSidebars} from './src/llms/order';

// Préambule commun à `llms.txt` et `llms-full.txt`. Il vit dans un .md à part
// plutôt qu'en littéral ici : c'est de la prose destinée à être lue (par un
// modèle), elle se relit et se corrige mieux hors du fichier de config.
const LLMS_PREAMBLE = fs.readFileSync('./src/llms/preamble.md', 'utf8').trim();

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

  // Documentation « AI-ready » (plan-phase2 §2.3). Au `docusaurus build`, le
  // plugin écrit dans le dossier de sortie :
  //   - `llms.txt`      — l'index : une ligne par page, dans l'ordre Diátaxis ;
  //   - `llms-full.txt` — la doc entière en un seul Markdown, à charger dans une
  //                       fenêtre de contexte ;
  //   - `<route>.md`    — la source Markdown de chaque page, à côté du HTML
  //                       (`/docs/intro` ↔ `/docs/intro.md`). C'est ce que copie
  //                       le bouton « Copy as Markdown » (src/components/CopyPageButton).
  //
  // Le blog est délibérément exclu : ces fichiers servent à faire écrire du TypR
  // correct, et les billets sont datés (certains portent encore des fences
  // ```julia) — les y verser reviendrait à apprendre au modèle une syntaxe
  // périmée. La matière de fond des billets est reprise dans docs/philosophy/.
  plugins: [
    [
      'docusaurus-plugin-llms',
      {
        docsDir: 'docs',
        includeBlog: false,
        generateLLMsTxt: true,
        generateLLMsFullTxt: true,
        // Les .md par page — ce sont eux que `llms.txt` référence (addMdExtension),
        // et eux que le bouton de copie va chercher.
        generateMarkdownFiles: true,
        preserveDirectoryStructure: true,
        addMdExtension: true,
        removeDuplicateHeadings: true,
        title: 'TypR',
        description:
          'A statically typed superset of R that compiles to plain, readable R.',
        // Ordre de lecture repris de la barre latérale — voir src/llms/order.ts.
        includeOrder: docOrderFromSidebars(sidebars),
        includeUnmatchedLast: true,
        rootContent: `${LLMS_PREAMBLE}\n\nEvery page is listed below. Fetch a page's \`.md\` URL to get its full Markdown source, or \`llms-full.txt\` for all of them at once.`,
        fullRootContent: `${LLMS_PREAMBLE}\n\nThe full text of every documentation page follows, in reading order.`,
      },
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
            {
              // `pathname://` : un fichier du dossier de sortie, pas une route
              // — le routeur ne doit pas essayer de le rendre, mais le baseUrl
              // doit quand même être ajouté.
              label: 'llms.txt',
              to: 'pathname:///llms.txt',
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
