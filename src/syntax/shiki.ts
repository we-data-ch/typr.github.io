// Coloration syntaxique du site : une seule grammaire, générée.
//
// `syntaxes/typr.tmLanguage.json` est un fichier *généré* par
// `typr syntax --target tmlanguage` depuis le manifeste du compilateur
// (crates/typr-core/src/components/syntax/mod.rs, dépôt we-data-ch/typr) et
// recopié ici par le pipeline de release. Il ne se modifie pas à la main :
// voir syntaxes/README.md.
//
// Avant, la doc n'avait aucune grammaire TypR — `additionalLanguages: ['r']`
// puis `Prism.languages.typr = Prism.languages.r` faisaient passer 197 blocs
// ```typr pour du R. Les mots-clés propres à TypR (`opaque`, `module`,
// `record`, `interface`, `typeconstructor`, les blocs `R {}` / `JS {}`, les
// sigils de kind) n'étaient donc jamais colorés, et `julia` ne l'était pas non
// plus faute d'être déclaré.

import fs from 'node:fs';
import path from 'node:path';
import { createHighlighterCoreSync } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';
import rehypeShikiFromHighlighter from '@shikijs/rehype/core';
import type { ShikiTransformer } from 'shiki/core';
import type { RehypeShikiCoreOptions } from '@shikijs/rehype/core';
import githubLight from '@shikijs/themes/github-light';
import githubDark from '@shikijs/themes/github-dark';
import langR from '@shikijs/langs/r';
import langJulia from '@shikijs/langs/julia';
import langBash from '@shikijs/langs/bash';
import type { Plugin } from 'unified';
import type { Root } from 'hast';

/** Le fond et la couleur de base des blocs, alignés sur les deux thèmes. */
export const CODE_COLORS = {
  light: { color: '#24292e', backgroundColor: '#f6f8fa' },
  dark: { color: '#e1e4e8', backgroundColor: '#24292e' },
};

// `process.cwd()` plutôt que `__dirname` : ce module est chargé depuis
// docusaurus.config.ts, dont le chargeur peut le livrer en CJS comme en ESM —
// `__dirname` n'existe pas dans le second cas. La CLI Docusaurus tourne
// toujours depuis la racine du site.
const grammarPath = path.join(process.cwd(), 'syntaxes/typr.tmLanguage.json');
const typrGrammar = JSON.parse(fs.readFileSync(grammarPath, 'utf8'));

// Moteur regex JS plutôt qu'Oniguruma : pas de WASM à charger, la construction
// est synchrone, et surtout la grammaire générée est vérifiée dans le dialecte
// que Shiki utilisera aussi côté navigateur (playground).
const highlighter = createHighlighterCoreSync({
  themes: [githubLight, githubDark],
  // `name` est la clé d'indexation de Shiki : elle doit valoir la langue écrite
  // dans les fences ```typr, alors que la grammaire porte le nom d'affichage.
  langs: [{ ...typrGrammar, name: 'typr' }, langR, langJulia, langBash],
  engine: createJavaScriptRegexEngine(),
});

// Shiki remplace le noeud <pre> d'origine par le sien : tout ce que Docusaurus
// avait posé dessus disparaît, la metastring de la fence comprise (elle arrive
// en propriété du <code> via le remark `codeCompatPlugin`). Sans ce
// transformer, `` ```typr noplayground `` serait indiscernable de `` ```typr ``
// dans les composants du thème — voir src/playground/meta.tsx.
const preserveMetastring: ShikiTransformer = {
  name: 'typr:preserve-metastring',
  code(node) {
    const raw = this.options.meta?.__raw;
    if (raw) {
      node.properties.metastring = raw;
    }
  },
};

/** Les deux thèmes, écrits une fois : rehype et `highlightToHtml` les partagent. */
const THEMES = { light: 'github-light', dark: 'github-dark' } as const;

const options: RehypeShikiCoreOptions = {
  themes: THEMES,
  transformers: [preserveMetastring],
  // Les deux thèmes en variables CSS (--shiki-light / --shiki-dark) : le
  // basculement clair/sombre de Docusaurus se fait alors en CSS, sans
  // re-rendre les blocs. Voir src/css/custom.css.
  defaultColor: false,
  // Remet `language-xxx` sur le <code>, que Docusaurus propage au conteneur :
  // c'est le point d'accroche des règles CSS ci-dessus.
  addLanguageClass: true,
  // Une fence sans langage reste du texte brut plutôt qu'une erreur de build.
  defaultLanguage: 'text',
  fallbackLanguage: 'text',
};

/**
 * Le plugin rehype, monté dans `beforeDefaultRehypePlugins` : il doit passer
 * avant les plugins de Docusaurus, qui transforment ensuite le bloc en
 * `<CodeBlock>`.
 */
const rehypeShikiTypR: Plugin<[], Root> = () =>
  rehypeShikiFromHighlighter(highlighter, options);

export default rehypeShikiTypR;

/**
 * Le même surligneur, appelé à la main plutôt que par rehype.
 *
 * Les blocs de la page d'accueil ne viennent pas d'un Markdown : ce sont de
 * vrais fichiers (src/homepage/snippets/), lus et colorés au build par
 * src/homepage/plugin.ts. Ils doivent l'être par *ce* surligneur — même
 * grammaire générée, mêmes thèmes, mêmes variables CSS — sans quoi la page
 * d'accueil colorerait le TypR autrement que la documentation.
 */
export function highlightToHtml(code: string, lang: string): string {
  return highlighter.codeToHtml(code, {
    lang,
    themes: THEMES,
    defaultColor: false,
  });
}
