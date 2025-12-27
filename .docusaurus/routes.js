import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/typr.github.io/build/blog',
    component: ComponentCreator('/typr.github.io/build/blog', 'ab5'),
    exact: true
  },
  {
    path: '/typr.github.io/build/blog/archive',
    component: ComponentCreator('/typr.github.io/build/blog/archive', '2a3'),
    exact: true
  },
  {
    path: '/typr.github.io/build/blog/authors',
    component: ComponentCreator('/typr.github.io/build/blog/authors', 'c63'),
    exact: true
  },
  {
    path: '/typr.github.io/build/blog/authors/all-sebastien-lorber-articles',
    component: ComponentCreator('/typr.github.io/build/blog/authors/all-sebastien-lorber-articles', '04d'),
    exact: true
  },
  {
    path: '/typr.github.io/build/blog/authors/yangshun',
    component: ComponentCreator('/typr.github.io/build/blog/authors/yangshun', '331'),
    exact: true
  },
  {
    path: '/typr.github.io/build/blog/first-blog-post',
    component: ComponentCreator('/typr.github.io/build/blog/first-blog-post', 'ba4'),
    exact: true
  },
  {
    path: '/typr.github.io/build/blog/long-blog-post',
    component: ComponentCreator('/typr.github.io/build/blog/long-blog-post', 'a44'),
    exact: true
  },
  {
    path: '/typr.github.io/build/blog/mdx-blog-post',
    component: ComponentCreator('/typr.github.io/build/blog/mdx-blog-post', '550'),
    exact: true
  },
  {
    path: '/typr.github.io/build/blog/tags',
    component: ComponentCreator('/typr.github.io/build/blog/tags', 'a1b'),
    exact: true
  },
  {
    path: '/typr.github.io/build/blog/tags/docusaurus',
    component: ComponentCreator('/typr.github.io/build/blog/tags/docusaurus', '816'),
    exact: true
  },
  {
    path: '/typr.github.io/build/blog/tags/facebook',
    component: ComponentCreator('/typr.github.io/build/blog/tags/facebook', 'f46'),
    exact: true
  },
  {
    path: '/typr.github.io/build/blog/tags/hello',
    component: ComponentCreator('/typr.github.io/build/blog/tags/hello', '056'),
    exact: true
  },
  {
    path: '/typr.github.io/build/blog/tags/hola',
    component: ComponentCreator('/typr.github.io/build/blog/tags/hola', '32e'),
    exact: true
  },
  {
    path: '/typr.github.io/build/blog/welcome',
    component: ComponentCreator('/typr.github.io/build/blog/welcome', '5cc'),
    exact: true
  },
  {
    path: '/typr.github.io/build/markdown-page',
    component: ComponentCreator('/typr.github.io/build/markdown-page', '46b'),
    exact: true
  },
  {
    path: '/typr.github.io/build/typr',
    component: ComponentCreator('/typr.github.io/build/typr', '34f'),
    exact: true
  },
  {
    path: '/typr.github.io/build/docs',
    component: ComponentCreator('/typr.github.io/build/docs', '120'),
    routes: [
      {
        path: '/typr.github.io/build/docs',
        component: ComponentCreator('/typr.github.io/build/docs', '3e0'),
        routes: [
          {
            path: '/typr.github.io/build/docs',
            component: ComponentCreator('/typr.github.io/build/docs', 'bbe'),
            routes: [
              {
                path: '/typr.github.io/build/docs/category/tutorial---basics',
                component: ComponentCreator('/typr.github.io/build/docs/category/tutorial---basics', 'f09'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/typr.github.io/build/docs/category/tutorial---extras',
                component: ComponentCreator('/typr.github.io/build/docs/category/tutorial---extras', 'bfa'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/typr.github.io/build/docs/intro',
                component: ComponentCreator('/typr.github.io/build/docs/intro', 'df0'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/typr.github.io/build/docs/tutorial-basics/congratulations',
                component: ComponentCreator('/typr.github.io/build/docs/tutorial-basics/congratulations', '713'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/typr.github.io/build/docs/tutorial-basics/create-a-blog-post',
                component: ComponentCreator('/typr.github.io/build/docs/tutorial-basics/create-a-blog-post', '268'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/typr.github.io/build/docs/tutorial-basics/create-a-document',
                component: ComponentCreator('/typr.github.io/build/docs/tutorial-basics/create-a-document', 'c63'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/typr.github.io/build/docs/tutorial-basics/create-a-page',
                component: ComponentCreator('/typr.github.io/build/docs/tutorial-basics/create-a-page', '4e3'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/typr.github.io/build/docs/tutorial-basics/deploy-your-site',
                component: ComponentCreator('/typr.github.io/build/docs/tutorial-basics/deploy-your-site', 'c53'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/typr.github.io/build/docs/tutorial-basics/markdown-features',
                component: ComponentCreator('/typr.github.io/build/docs/tutorial-basics/markdown-features', 'a73'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/typr.github.io/build/docs/tutorial-extras/manage-docs-versions',
                component: ComponentCreator('/typr.github.io/build/docs/tutorial-extras/manage-docs-versions', '37c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/typr.github.io/build/docs/tutorial-extras/translate-your-site',
                component: ComponentCreator('/typr.github.io/build/docs/tutorial-extras/translate-your-site', 'efa'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/typr.github.io/build/docs/typr-start/getting-started',
                component: ComponentCreator('/typr.github.io/build/docs/typr-start/getting-started', 'f49'),
                exact: true,
                sidebar: "tutorialSidebar"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '/typr.github.io/build/',
    component: ComponentCreator('/typr.github.io/build/', '5a7'),
    exact: true
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
