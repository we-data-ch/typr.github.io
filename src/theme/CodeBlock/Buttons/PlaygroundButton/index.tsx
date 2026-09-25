/**
 * « Essayer ce bloc dans le playground », à côté du bouton copier.
 *
 * Le lien porte le code du bloc encodé dans l'URL (contrat décrit par
 * `src/playground/url.ts`). Rien n'est partagé entre les deux sites : le
 * playground lit ses paramètres d'URL, la doc se contente de les écrire.
 *
 * Le bouton n'apparaît que sur les blocs ```typr — les blocs ```r, ```bash ou
 * ```json n'ont rien à y faire — et se retire sur ```typr noplayground.
 *
 * Il reste en revanche sur ```typr compile_fail, avec une autre infobulle :
 * `noplayground` existait pour ne pas envoyer le lecteur vers une erreur qu'il
 * n'attendait pas, alors qu'ici le bandeau l'a prévenu et l'erreur *est* la
 * démonstration. Cliquer donne le message exact du compilateur.
 *
 * ```typr graph (et ```typr graph focus=<bloc>) ouvrent le playground sur
 * l'onglet Graph plutôt que sur l'exécution habituelle — icône et infobulle
 * différentes, `autorun` n'a alors plus de sens et est ignoré (spec
 * visualization_graph_v2.md §11 "Documentation (G)").
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
const TITLE_COMPILE_FAIL = 'See this error in the TypR playground';
const TITLE_GRAPH = "See this code's block graph in the TypR playground";

export default function PlaygroundButton({
  className,
}: {
  readonly className?: string;
}): React.ReactNode {
  const {
    metadata: {code, language},
  } = useCodeBlockContext();
  const {autorun, noplayground, compileFail, graph, graphFocus} =
    useCodeBlockMeta();
  const {colorMode} = useColorMode();

  if (language !== PLAYGROUND_LANGUAGE || noplayground) {
    return null;
  }

  // Un contre-exemple ne s'exécute jamais tout seul : `autorun` n'aurait ici
  // aucun sens, la compilation s'arrête avant. `graph` non plus : ce bouton-là
  // ouvre l'onglet Graph, pas Output.
  const href = buildPlaygroundUrl(code, {
    autorun: autorun && !compileFail && !graph,
    theme: colorMode,
    view: graph ? 'graph' : undefined,
    focus: graph && graphFocus ? graphFocus : undefined,
  });
  if (!href) {
    return null;
  }

  const title = graph ? TITLE_GRAPH : compileFail ? TITLE_COMPILE_FAIL : TITLE;

  return (
    <a
      className={clsx('clean-btn', className, styles.playgroundButton)}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={title}
      aria-label={title}>
      <svg
        className={styles.playgroundButtonIcon}
        viewBox="0 0 24 24"
        aria-hidden="true">
        {graph ? (
          // Trois nœuds reliés : distinct du triangle « lecture » pour que le
          // survol annonce déjà "vue graphe", avant même l'infobulle.
          <g>
            <line x1="12" y1="7" x2="6.5" y2="16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            <line x1="12" y1="7" x2="17.5" y2="16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            <circle cx="12" cy="5.5" r="2.3" fill="currentColor" />
            <circle cx="5.5" cy="17.5" r="2.3" fill="currentColor" />
            <circle cx="18.5" cy="17.5" r="2.3" fill="currentColor" />
          </g>
        ) : (
          <path fill="currentColor" d="M8,5.14V19.14L19,12.14L8,5.14Z" />
        )}
      </svg>
    </a>
  );
}
