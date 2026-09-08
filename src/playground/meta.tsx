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
  /** ```typr noplayground — pas de bouton : extrait volontairement incomplet,
   *  pseudo-code, exemple censé échouer à la compilation… */
  noplayground: boolean;
}

const EMPTY_META: CodeBlockMeta = {autorun: false, noplayground: false};

const CodeBlockMetaContext = createContext<CodeBlockMeta>(EMPTY_META);

export function parseCodeBlockMeta(metastring?: string): CodeBlockMeta {
  if (!metastring) {
    return EMPTY_META;
  }
  const words = metastring.split(/\s+/);
  return {
    autorun: words.includes('autorun'),
    noplayground: words.includes('noplayground'),
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
