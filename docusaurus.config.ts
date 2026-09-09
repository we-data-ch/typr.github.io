import * as fs from 'fs';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import rehypeShikiTypR, {CODE_COLORS} from './src/syntax/shiki';
import homepageSnippetsPlugin from './src/homepage/plugin';
import {PLAYGROUND_URL} from './src/playground/url';
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

  // Mesure d'audience (plan-phase2 §2.7) — GoatCounter, sans cookie et sans
  // identifiant persistant, donc sans bandeau de consentement à gérer.
  //
  // **En sommeil par défaut, et c'est le point important** : l'adresse de
  // collecte vient d'une variable d'environnement lue ici, au build. Tant
  // qu'elle est vide — `npm start`, un build local, une PR — src/analytics
  // n'injecte aucun script et n'émet aucune requête. Allumer la mesure ne
  // demande aucun changement de code : on définit la variable de dépôt
  // GOATCOUNTER_ENDPOINT (voir .github/workflows/deploy.yml et CONTRIBUTING.md).
  //
  // Ce n'est pas un secret : la valeur finit dans le JavaScript public du
  // site. La ranger dans `secrets` masquerait juste les journaux de CI, en
  // laissant croire à une confidentialité qui n'existe pas.
  customFields: {
    analytics: {
      endpoint: process.env.GOATCOUNTER_ENDPOINT ?? '',
      // count.js refuse de compter depuis localhost ; ce drapeau est là pour
      // qui veut vérifier la mesure de bout en bout avant de l'allumer.
      allowLocal: process.env.GOATCOUNTER_ALLOW_LOCAL === '1',
    },
  },

  // Les pages vues : Docusaurus est une SPA, un chargement de script ne suffit
  // pas à compter les pages suivantes. Voir src/analytics/client.ts.
  clientModules: ['./src/analytics/client.ts'],

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
        // Le site n'est pas versionné, et c'est un choix (plan-phase2 §2.9).
        // Le schéma d'URL, lui, est arrêté : `/docs/<page>` ne désignera jamais
        // autre chose que la **dernière release**, et la doc de `develop`
        // déménagera sous `/docs/next/` le jour où l'on versionnera. C'est le
        // comportement par défaut de Docusaurus dès que `versioned_docs/`
        // existe — il n'y a donc rien à ajouter ici pour l'obtenir, seulement
        // une chose à ne pas faire : `lastVersion: 'current'`, qui ferait
        // décrire `develop` par `/docs/` et enverrait le lecteur sur une
        // syntaxe que son compilateur ne connaît pas. Le runbook complet (et
        // les pièges mesurés, dont ceux du plugin llms) est dans
        // CONTRIBUTING.md, « Versionnement de la documentation ».
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
    // Les extraits de code de la page d'accueil, colorés au build par le
    // surligneur de la doc. Voir src/homepage/plugin.ts pour le pourquoi.
    homepageSnippetsPlugin,
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
        // `docsDir` reste la source de ces fichiers le jour où le site sera
        // versionné : ils devront alors décrire la **release** (donc
        // `versioned_docs/version-<x.y>`), pas `develop` — un modèle écrit pour
        // le compilateur que l'utilisateur a installé. Ne pas passer par
        // `versions: 'auto'` : le plugin préfixe les versions à la racine du
        // site là où Docusaurus les préfixe après `/docs`. Voir CONTRIBUTING.md.
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
    // La barre de navigation porte les quatre destinations de la page
    // d'accueil — Documentation, Playground, GitHub, Download — plus les deux
    // que le site a par ailleurs : le blog, et Discussions, qui est le canal
    // d'aide canonique (plan-phase2 §2.4) et vaut d'être visible partout.
    // « Download » est l'action principale : c'est un bouton, habillé dans
    // src/css/custom.css.
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
          label: 'Documentation',
        },
        {to: '/blog', label: 'Blog', position: 'left'},
        {
          href: PLAYGROUND_URL,
          label: 'Playground',
          position: 'right',
        },
        {
          href: 'https://github.com/we-data-ch/typr/discussions',
          label: 'Discussions',
          position: 'right',
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
        {
          // Vers le guide d'installation, pas vers la page des releases : le
          // binaire n'est qu'une des trois voies (release, Docker, cargo), et
          // la page les présente toutes avec la vérification qui suit.
          to: '/docs/reference/installation',
          label: 'Download',
          position: 'right',
          className: 'navbar-download',
        },
      ],
    },
    // Trois colonnes de navigation (TypR / Community / Ecosystem), plus une
    // quatrième pour ce qui n'est ni l'une ni l'autre et qu'on ne veut pas
    // perdre : le blog, `llms.txt`, et le lien « Privacy », que l'on vient
    // chercher ici et qui pointe vers la FAQ plutôt que vers une page dédiée
    // de quatre lignes que personne ne relirait.
    footer: {
      style: 'dark',
      links: [
        {
          title: 'TypR',
          items: [
            {
              label: 'Documentation',
              to: '/docs/intro',
            },
            {
              label: 'Playground',
              href: PLAYGROUND_URL,
            },
            {
              label: 'Download',
              to: '/docs/reference/installation',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/we-data-ch/typr',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            // Une porte par intention, plutôt qu'un seul lien « Discussions » :
            // les catégories existent pour trier, autant s'en servir dès l'entrée.
            {
              label: 'Ask a question',
              href: 'https://github.com/we-data-ch/typr/discussions/categories/q-a',
            },
            {
              label: 'Share an idea',
              href: 'https://github.com/we-data-ch/typr/discussions/categories/ideas',
            },
            {
              label: 'Show and tell',
              href: 'https://github.com/we-data-ch/typr/discussions/categories/show-and-tell',
            },
            {
              label: 'Contributing',
              href: 'https://github.com/we-data-ch/typr.github.io/blob/main/CONTRIBUTING.md',
            },
            {
              label: 'Issues',
              href: 'https://github.com/we-data-ch/typr/issues',
            },
          ],
        },
        {
          title: 'Ecosystem',
          items: [
            {
              label: 'R',
              href: 'https://www.r-project.org/',
            },
            {
              label: 'R-bloggers',
              href: 'https://www.r-bloggers.com',
            },
            {
              label: 'WeData',
              href: 'https://github.com/we-data-ch',
            },
            {
              label: 'Youtube',
              href: 'https://www.youtube.com/watch?v=GMo20g__nOc&list=PLSYhtt87oGAJH8Pe-VMcoBkQfek7VJ0hM',
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
              label: 'FAQ',
              to: '/docs/faq',
            },
            {
              // `pathname://` : un fichier du dossier de sortie, pas une route
              // — le routeur ne doit pas essayer de le rendre, mais le baseUrl
              // doit quand même être ajouté.
              label: 'llms.txt',
              to: 'pathname:///llms.txt',
            },
            {
              label: 'Privacy',
              to: '/docs/faq#site-analytics',
            },
          ],
        },
      ],
      copyright: `TypR — a typed language for long-lived R software.<br />Copyright © ${new Date().getFullYear()} TypR / WeData. Built with Docusaurus.`,
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
