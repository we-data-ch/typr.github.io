// Les mots-clés écrits après la langue d'une fence, rendus lisibles par les
// boutons du bloc.
//
// Pourquoi un contexte à nous plutôt que celui de Docusaurus : `CodeBlockMetadata`
// (donc `useCodeBlockContext()`) expose le code, la langue, le titre et les
// lignes, mais pas la metastring d'origine — et `@theme/CodeBlock/Buttons` ne
// reçoit qu'un `className`. Le seul composant qui voit encore la metastring est
// `CodeBlock/Content/Element`, qui est justement l'ancêtre des boutons : il la
// republie ici.

import React, {createContext, useContext, useMemo, type ReactNode} from 'react';

export interface CodeBlockMeta {
  /** ```typr autorun — exécute le bloc à l'ouverture du playground. */
  autorun: boolean;
  /** ```typr noplayground — pas de bouton : extrait volontairement incomplet
   *  ou pseudo-code, que le playground ne saurait pas compiler. */
  noplayground: boolean;
  /** ```typr compile_fail — le bloc *doit* être rejeté par le compilateur.
   *
   *  Emprunté à rustdoc. Deux effets, et c'est le couple qui fait la valeur :
   *  le lecteur voit un bandeau qui dit que l'exemple ne compile pas (sinon il
   *  croit lire du TypR valide), et la CI vérifie qu'il échoue *toujours* — un
   *  contre-exemple qui se met à compiler est un contre-exemple mort, que rien
   *  ne signalerait autrement. Voir scripts/check-typr-blocks.mjs. */
  compileFail: boolean;
  /** ```typr graph — le bouton ouvre le playground sur l'onglet Graph
   *  (`?view=graph`) plutôt que sur l'exécution habituelle (spec
   *  visualization_graph_v2.md §11 "Documentation (G)"). */
  graph: boolean;
  /** ```typr graph focus=norm2 — bloc affiché à l'ouverture (`?focus=`).
   *  Sans `:`, `val:` est sous-entendu (`focus=norm2` → `val:norm2`,
   *  `focus=norm2/a` → `val:norm2/a`) — le cas courant, sans faire épeler le
   *  namespace dans chaque fence ; avec `:`, la `BlockKey` complète passe telle
   *  quelle (`focus=type:Point`). Ignoré sans `graph`. */
  graphFocus: string | null;
}

const EMPTY_META: CodeBlockMeta = {
  autorun: false,
  noplayground: false,
  compileFail: false,
  graph: false,
  graphFocus: null,
};

const CodeBlockMetaContext = createContext<CodeBlockMeta>(EMPTY_META);

export function parseCodeBlockMeta(metastring?: string): CodeBlockMeta {
  if (!metastring) {
    return EMPTY_META;
  }
  const words = metastring.split(/\s+/);
  const focusWord = words.find((w) => w.startsWith('focus='));
  const focusValue = focusWord?.slice('focus='.length) || null;
  return {
    autorun: words.includes('autorun'),
    noplayground: words.includes('noplayground'),
    compileFail: words.includes('compile_fail'),
    graph: words.includes('graph'),
    graphFocus: focusValue && !focusValue.includes(':') ? `val:${focusValue}` : focusValue,
  };
}

export function CodeBlockMetaProvider({
  metastring,
  children,
}: {
  metastring?: string;
  children: ReactNode;
}): ReactNode {
  const value = useMemo(() => parseCodeBlockMeta(metastring), [metastring]);
  return (
    <CodeBlockMetaContext.Provider value={value}>
      {children}
    </CodeBlockMetaContext.Provider>
  );
}

/** Hors d'un `CodeBlockMetaProvider`, aucun mot-clé : le comportement par défaut. */
export function useCodeBlockMeta(): CodeBlockMeta {
  return useContext(CodeBlockMetaContext);
}
