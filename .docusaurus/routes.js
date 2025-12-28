import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/typr.github.io/blog',
    component: ComponentCreator('/typr.github.io/blog', 'c41'),
    exact: true
  },
  {
    path: '/typr.github.io/blog/archive',
    component: ComponentCreator('/typr.github.io/blog/archive', 'c91'),
    exact: true
  },
  {
    path: '/typr.github.io/blog/authors',
    component: ComponentCreator('/typr.github.io/blog/authors', '7bb'),
    exact: true
  },
  {
    path: '/typr.github.io/blog/authors/all-sebastien-lorber-articles',
    component: ComponentCreator('/typr.github.io/blog/authors/all-sebastien-lorber-articles', '500'),
    exact: true
  },
  {
    path: '/typr.github.io/blog/authors/yangshun',
    component: ComponentCreator('/typr.github.io/blog/authors/yangshun', '342'),
    exact: true
  },
  {
    path: '/typr.github.io/blog/first-blog-post',
    component: ComponentCreator('/typr.github.io/blog/first-blog-post', '60b'),
    exact: true
  },
  {
    path: '/typr.github.io/blog/long-blog-post',
    component: ComponentCreator('/typr.github.io/blog/long-blog-post', 'aff'),
    exact: true
  },
  {
    path: '/typr.github.io/blog/mdx-blog-post',
    component: ComponentCreator('/typr.github.io/blog/mdx-blog-post', '3fe'),
    exact: true
  },
  {
    path: '/typr.github.io/blog/tags',
    component: ComponentCreator('/typr.github.io/blog/tags', 'f50'),
    exact: true
  },
  {
    path: '/typr.github.io/blog/tags/docusaurus',
    component: ComponentCreator('/typr.github.io/blog/tags/docusaurus', '8a9'),
    exact: true
  },
  {
    path: '/typr.github.io/blog/tags/facebook',
    component: ComponentCreator('/typr.github.io/blog/tags/facebook', 'e28'),
    exact: true
  },
  {
    path: '/typr.github.io/blog/tags/hello',
    component: ComponentCreator('/typr.github.io/blog/tags/hello', '411'),
    exact: true
  },
  {
    path: '/typr.github.io/blog/tags/hola',
    component: ComponentCreator('/typr.github.io/blog/tags/hola', 'dcb'),
    exact: true
  },
  {
    path: '/typr.github.io/blog/welcome',
    component: ComponentCreator('/typr.github.io/blog/welcome', '73c'),
    exact: true
  },
  {
    path: '/typr.github.io/markdown-page',
    component: ComponentCreator('/typr.github.io/markdown-page', '71c'),
    exact: true
  },
  {
    path: '/typr.github.io/typr',
    component: ComponentCreator('/typr.github.io/typr', '201'),
    exact: true
  },
  {
    path: '/typr.github.io/docs',
    component: ComponentCreator('/typr.github.io/docs', '277'),
    routes: [
      {
        path: '/typr.github.io/docs',
        component: ComponentCreator('/typr.github.io/docs', 'c92'),
        routes: [
          {
            path: '/typr.github.io/docs',
            component: ComponentCreator('/typr.github.io/docs', 'a66'),
            routes: [
              {
                path: '/typr.github.io/docs/intro',
                component: ComponentCreator('/typr.github.io/docs/intro', '26f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/typr.github.io/docs/philosophy',
                component: ComponentCreator('/typr.github.io/docs/philosophy', 'b88'),
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
    path: '/typr.github.io/',
    component: ComponentCreator('/typr.github.io/', 'b84'),
    exact: true
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
