/**
 * Swizzle de `@theme/CodeBlock/Buttons`.
 *
 * Pourquoi : ajouter le bouton « playground » à côté du bouton copier. C'est le
 * seul endroit qui convient — il vaut pour les deux chemins de rendu d'un bloc
 * (`Content/Element` et `Content/String`), et il hérite du cadre commun aux
 * boutons de bloc (position, opacité au survol).
 *
 * Par rapport à l'original, deux différences seulement : `<PlaygroundButton />`
 * en tête du groupe, et `styles.module.css` recopié depuis le thème classique
 * (un swizzle ne peut pas importer le CSS module du paquet) avec ses sélecteurs
 * étendus aux `<a>`, puisque le bouton playground est un lien.
 */
import React from 'react';
import clsx from 'clsx';
import BrowserOnly from '@docusaurus/BrowserOnly';
import CopyButton from '@theme/CodeBlock/Buttons/CopyButton';
import WordWrapButton from '@theme/CodeBlock/Buttons/WordWrapButton';
import PlaygroundButton from './PlaygroundButton';
import styles from './styles.module.css';

// Les boutons ne sont volontairement pas rendus côté serveur : les ajouter au
// HTML initial est inutile et coûteux (SVG en JSX). Ils sont masqués par défaut
// et n'apparaissent qu'une fois React interactif.
export default function CodeBlockButtons({
  className,
}: {
  readonly className?: string;
}): React.ReactNode {
  return (
    <BrowserOnly>
      {() => (
        <div className={clsx(className, styles.buttonGroup)}>
          <PlaygroundButton />
          <WordWrapButton />
          <CopyButton />
        </div>
      )}
    </BrowserOnly>
  );
}
