// Les extraits de code de la page d'accueil, colorés au build.
//
// Pourquoi un plugin plutôt que des chaînes dans le JSX : la page d'accueil est
// la seule page du site qui n'est pas du Markdown, donc la seule que le plugin
// rehype Shiki ne voit jamais passer. Recopier du code dans un littéral TSX
// aurait deux conséquences, et aucune n'est acceptable ici :
//
//   1. le code ne serait plus coloré (Prism ne colore plus rien sur ce site,
//      voir docusaurus.config.ts) — or « code first » est le principe de design
//      de cette page : les exemples *sont* l'argument ;
//   2. surtout, il ne serait plus vérifiable. Les blocs ```typr de la doc
//      passent tous par `typr check` en CI (scripts/check-typr-blocks.mjs).
//      Un exemple TypR faux sur la page d'accueil est la pire des vitrines.
//
// Les extraits sont donc de *vrais fichiers* dans src/homepage/snippets/ :
// `npm run check:examples` compile les `.ty` comme le reste, ce module les lit
// et les colore au build avec le surligneur de la doc, et la page les reçoit en
// HTML déjà prêt via `usePluginData`. Ajouter un exemple = déposer un fichier.

import fs from 'node:fs';
import path from 'node:path';
import type {LoadContext, Plugin} from '@docusaurus/types';
import {highlightToHtml} from '../syntax/shiki';
import {PLUGIN_NAME, type SnippetMap} from './shared';

// `process.cwd()` plutôt que `__dirname`, pour la même raison que dans
// src/syntax/shiki.ts : ce module est chargé depuis docusaurus.config.ts, dont
// le chargeur peut le livrer en CJS comme en ESM.
const SNIPPETS_DIR = path.join(process.cwd(), 'src/homepage/snippets');

/** Extension du fichier → langage Shiki. Une extension inconnue est ignorée. */
const LANGS: Record<string, string> = {
  '.ty': 'typr',
  '.R': 'r',
  '.sh': 'bash',
  // Les diagnostics du compilateur : pas un langage, du texte tel quel.
  '.txt': 'text',
};

function escapeHtml(code: string): string {
  return code
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

/** Le texte brut n'a rien à coloriser, mais il lui faut le même conteneur que
 *  les autres pour que la page n'ait qu'un seul style de bloc. */
function plainBlock(code: string): string {
  return `<pre><code>${escapeHtml(code)}</code></pre>`;
}

function loadSnippets(): SnippetMap {
  const snippets: SnippetMap = {};

  for (const file of fs.readdirSync(SNIPPETS_DIR).sort()) {
    const lang = LANGS[path.extname(file)];
    if (!lang) {
      continue;
    }
    const code = fs.readFileSync(path.join(SNIPPETS_DIR, file), 'utf8').trimEnd();
    const name = path.basename(file, path.extname(file));
    snippets[`${name}.${lang}`] = {
      name,
      lang,
      code,
      html: lang === 'text' ? plainBlock(code) : highlightToHtml(code, lang),
    };
  }

  return snippets;
}

export default function homepageSnippetsPlugin(
  _context: LoadContext,
): Plugin<SnippetMap> {
  return {
    name: PLUGIN_NAME,

    async loadContent() {
      return loadSnippets();
    },

    async contentLoaded({content, actions}) {
      actions.setGlobalData(content);
    },

    // `npm start` doit recolorer quand un extrait change : sans ça, corriger un
    // exemple demanderait de redémarrer le serveur de développement.
    getPathsToWatch() {
      return [path.join(SNIPPETS_DIR, '*')];
    },
  };
}
