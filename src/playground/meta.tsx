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
}

const EMPTY_META: CodeBlockMeta = {
  autorun: false,
  noplayground: false,
  compileFail: false,
};

const CodeBlockMetaContext = createContext<CodeBlockMeta>(EMPTY_META);

export function parseCodeBlockMeta(metastring?: string): CodeBlockMeta {
  if (!metastring) {
    return EMPTY_META;
  }
  const words = metastring.split(/\s+/);
  return {
    autorun: words.includes('autorun'),
    noplayground: words.includes('noplayground'),
    compileFail: words.includes('compile_fail'),
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
