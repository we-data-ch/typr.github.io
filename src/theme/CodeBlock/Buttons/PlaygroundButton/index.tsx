/**
 * « Essayer ce bloc dans le playground », à côté du bouton copier.
 *
 * Le lien porte le code du bloc encodé dans l'URL (contrat décrit par
 * `src/playground/url.ts`). Rien n'est partagé entre les deux sites : le
 * playground lit ses paramètres d'URL, la doc se contente de les écrire.
 *
 * Le bouton n'apparaît que sur les blocs ```typr — les blocs ```r, ```bash ou
 * ```json n'ont rien à y faire — et se retire sur ```typr noplayground.
 */
import React from 'react';
import clsx from 'clsx';
import {useColorMode} from '@docusaurus/theme-common';
import {useCodeBlockContext} from '@docusaurus/theme-common/internal';
import {buildPlaygroundUrl} from '@site/src/playground/url';
import {useCodeBlockMeta} from '@site/src/playground/meta';
import styles from './styles.module.css';

/** La langue des fences qui décrivent un programme TypR exécutable. */
const PLAYGROUND_LANGUAGE = 'typr';

const TITLE = 'Try this code in the TypR playground';

export default function PlaygroundButton({
  className,
}: {
  readonly className?: string;
}): React.ReactNode {
  const {
    metadata: {code, language},
  } = useCodeBlockContext();
  const {autorun, noplayground} = useCodeBlockMeta();
  const {colorMode} = useColorMode();

  if (language !== PLAYGROUND_LANGUAGE || noplayground) {
    return null;
  }

  const href = buildPlaygroundUrl(code, {autorun, theme: colorMode});
  if (!href) {
    return null;
  }

  return (
    <a
      className={clsx('clean-btn', className, styles.playgroundButton)}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={TITLE}
      aria-label={TITLE}>
      <svg
        className={styles.playgroundButtonIcon}
        viewBox="0 0 24 24"
        aria-hidden="true">
        <path fill="currentColor" d="M8,5.14V19.14L19,12.14L8,5.14Z" />
      </svg>
    </a>
  );
}
