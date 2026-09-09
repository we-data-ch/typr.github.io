// Le contrat entre le plugin (Node, au build) et la page (navigateur).
//
// Il vit à part parce qu'il est importé des deux côtés : `plugin.ts` lit le
// disque et charge Shiki, et rien de tout ça ne doit se retrouver dans le
// paquet envoyé au navigateur. Un simple `import {PLUGIN_NAME} from './plugin'`
// depuis un composant suffirait à l'y traîner.

/** L'identifiant passé à `usePluginData` côté page. */
export const PLUGIN_NAME = 'typr-homepage-snippets';

export interface Snippet {
  /** Le nom du fichier sans extension — `package.ty` → `package`. */
  name: string;
  /** Le langage Shiki : `typr`, `r`, `bash`, ou `text`. */
  lang: string;
  /** Le code brut, tel qu'il est sur le disque. */
  code: string;
  /** Le `<pre>` produit par Shiki, à injecter tel quel. */
  html: string;
}

/** Indexé par `<nom>.<langage>` : `package.typr`, `package.r`, `data-model.typr`. */
export type SnippetMap = Record<string, Snippet>;
