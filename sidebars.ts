import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Diátaxis structure for the TypR documentation.
 *
 * Deployed incrementally: categories with no pages yet are commented out and
 * enabled as their content lands (see plan.md §6 for the target structure).
 *
 * Targeted sidebar (as pages are created):
 *   intro, faq
 *   Tutorials  -> tutorials/*
 *   How-To     -> howto/*
 *   Reference  -> reference/*
 *   Philosophy -> philosophy/*
 *   Deep Dives -> concepts/*
 */
const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    'intro',
    'faq',
    {
      type: 'category',
      label: 'Tutorials',
      items: ['tutorials/typr-for-dummies', 'tutorials/first-package', 'tutorials/migrate-r-package', 'tutorials/typed-data-modeling'],
    },
    {
      type: 'category',
      label: 'How-To Guides',
      items: ['howto/type-r-functions', 'howto/interop-r6-s4', 'howto/use-dplyr-tidyr', 'howto/build-and-test', 'howto/r-raw-blocks', 'howto/generics-signatures', 'howto/mcp-server', 'howto/shiny-integration'],
    },
    {
      type: 'category',
      label: 'Reference',
      items: [
        'reference/intro',
        'reference/installation',
        'reference/editor-setup',
        'reference/lexicon',
        'reference/bindings-mutation',
        'reference/types',
        'reference/functions',
        'reference/records',
        'reference/unions-patterns',
        'reference/operators',
        'reference/control-flow',
        'reference/modules',
        'reference/interfaces',
        'reference/signatures',
        'reference/escape-hatches',
        'reference/cheatsheet',
        'reference/r-typr',
      ],
    },
    {
      type: 'category',
      label: 'Philosophy',
      items: [
        'philosophy/intro',
        'philosophy/beautiful_syntax',
        'philosophy/type-system-design',
        'philosophy/vectorization_by_design',
        'philosophy/design-proposals',
      ],
    },
    {
      type: 'category',
      label: 'Deep Dives',
      items: ['concepts/generics-kind', 'concepts/type-constructors', 'concepts/known-pitfalls'],
    },
  ],
};

export default sidebars;
