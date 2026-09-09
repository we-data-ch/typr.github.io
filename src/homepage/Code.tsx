// Les blocs de code de la page d'accueil.
//
// Le HTML arrive déjà coloré : il a été produit au build par src/homepage/plugin.ts,
// avec le même surligneur Shiki que la documentation. Il ne reste ici qu'à
// l'injecter et à l'habiller — d'où le `dangerouslySetInnerHTML`, qui ne voit
// jamais autre chose que la sortie de Shiki sur des fichiers du dépôt.

import React, {type ReactNode} from 'react';
import clsx from 'clsx';
import {usePluginData} from '@docusaurus/useGlobalData';
import {PLUGIN_NAME, type Snippet, type SnippetMap} from './shared';
import styles from './styles.module.css';

export function useSnippet(key: string): Snippet {
  const snippets = usePluginData(PLUGIN_NAME) as SnippetMap;
  const snippet = snippets[key];
  if (!snippet) {
    // Au build, pas dans le navigateur : une faute de frappe sur une clé doit
    // arrêter la construction du site, pas rendre un trou dans la page.
    throw new Error(
      `Extrait introuvable : « ${key} ». ` +
        `Disponibles : ${Object.keys(snippets).join(', ')}. ` +
        `Un extrait est un fichier de src/homepage/snippets/.`,
    );
  }
  return snippet;
}

/** Le label affiché en tête d'un bloc — la langue, pas le nom du fichier. */
const LANG_LABELS: Record<string, string> = {
  typr: 'TypR',
  r: 'R',
  bash: 'Terminal',
  text: 'Compiler',
};

export function CodePane({
  snippet: key,
  label,
  tone = 'neutral',
  className,
}: {
  snippet: string;
  /** Remplace le label déduit de la langue. */
  label?: ReactNode;
  /** `accent` met le bloc en avant (le côté TypR d'une comparaison). */
  tone?: 'neutral' | 'accent' | 'error';
  className?: string;
}) {
  const snippet = useSnippet(key);
  return (
    <figure className={clsx(styles.pane, styles[`pane_${tone}`], className)}>
      <figcaption className={styles.paneLabel}>
        {label ?? LANG_LABELS[snippet.lang] ?? snippet.lang}
      </figcaption>
      <div
        className={styles.paneBody}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{__html: snippet.html}}
      />
    </figure>
  );
}

/** Deux blocs côte à côte, avec une flèche entre eux : R devient TypR. */
export function CodeComparison({before, after}: {before: string; after: string}) {
  return (
    <div className={styles.comparison}>
      <CodePane snippet={before} />
      <div className={styles.comparisonArrow} aria-hidden="true">
        →
      </div>
      <CodePane snippet={after} tone="accent" />
    </div>
  );
}
