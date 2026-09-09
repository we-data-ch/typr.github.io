// Les schémas de la page d'accueil.
//
// La spécification les décrit en art ASCII. Ils sont rendus ici en HTML plutôt
// qu'en `<pre>` : le texte reste sélectionnable et lisible par un lecteur
// d'écran, la taille suit celle de la page, et sur mobile la ramification se
// replie en colonne au lieu de déborder horizontalement. Les traits sont des
// bordures CSS ; les flèches sont décoratives et masquées aux lecteurs d'écran,
// la structure étant déjà portée par la liste.

import React, {type ReactNode} from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

export interface Node {
  label: string;
  /** Une précision sous le libellé — le rôle de l'étape, pas sa définition. */
  hint?: string;
  /** Met le nœud en avant : c'est TypR dans la chaîne. */
  accent?: boolean;
  /** Grise le nœud : une possibilité, pas une fonctionnalité livrée. */
  planned?: boolean;
  /** Affiche une image à la place du libellé — `label` sert alors d'alternative textuelle. */
  img?: string;
}

function Box({label, hint, accent, planned, img}: Node) {
  return (
    <div
      className={clsx(
        styles.node,
        accent && styles.nodeAccent,
        planned && styles.nodePlanned,
      )}>
      {img ? (
        <img className={styles.nodeImg} src={img} alt={label} />
      ) : (
        <span className={styles.nodeLabel}>{label}</span>
      )}
      {hint && <span className={styles.nodeHint}>{hint}</span>}
    </div>
  );
}

/** Une chaîne verticale : chaque étape mène à la suivante. */
export function Flow({nodes, caption}: {nodes: Node[]; caption?: ReactNode}) {
  return (
    <figure className={styles.diagram}>
      <ol className={styles.flow}>
        {nodes.map((node, i) => (
          <li key={node.label} className={styles.flowStep}>
            {i > 0 && (
              <span className={styles.flowArrow} aria-hidden="true">
                ↓
              </span>
            )}
            <Box {...node} />
          </li>
        ))}
      </ol>
      {caption && <figcaption className={styles.diagramCaption}>{caption}</figcaption>}
    </figure>
  );
}

/**
 * Un centre entouré de quatre nœuds, chacun relié à lui : un seul binaire,
 * plusieurs outils — à la différence de `Branch`, où la racine est unique et
 * les feuilles n'existent que parce qu'elle les définit, ici les quatre
 * autour de `typr` sont des façades du même outil, pas des dérivés.
 *
 * Une grille 5×5 plutôt qu'un positionnement en `calc()` : les nœuds occupent
 * les colonnes/lignes impaires, les traits de connexion les colonnes/lignes
 * paires qui les séparent.
 */
export function Hub({
  center,
  top,
  right,
  bottom,
  left,
  caption,
}: {
  center: Node;
  top: Node;
  right: Node;
  bottom: Node;
  left: Node;
  caption?: ReactNode;
}) {
  return (
    <figure className={styles.diagram}>
      <div className={styles.hub}>
        <div className={styles.hubCenter}>
          <Box {...center} />
        </div>
        <div className={styles.hubTop}>
          <Box {...top} />
        </div>
        <div className={styles.hubRight}>
          <Box {...right} />
        </div>
        <div className={styles.hubBottom}>
          <Box {...bottom} />
        </div>
        <div className={styles.hubLeft}>
          <Box {...left} />
        </div>
        <span
          className={clsx(styles.hubConnectorV, styles.hubConnectorTop)}
          aria-hidden="true"
        />
        <span
          className={clsx(styles.hubConnectorV, styles.hubConnectorBottom)}
          aria-hidden="true"
        />
        <span
          className={clsx(styles.hubConnectorH, styles.hubConnectorLeft)}
          aria-hidden="true"
        />
        <span
          className={clsx(styles.hubConnectorH, styles.hubConnectorRight)}
          aria-hidden="true"
        />
      </div>
      {caption && <figcaption className={styles.diagramCaption}>{caption}</figcaption>}
    </figure>
  );
}

/**
 * Une racine et ses branches : une seule définition, plusieurs destinations.
 *
 * La barre horizontale est positionnée en calc() plutôt que dessinée : les
 * feuilles sont des colonnes de largeur égale, donc le centre de la première et
 * celui de la dernière se calculent depuis leur nombre et l'écart entre elles.
 * `--branch-count` porte ce nombre jusqu'au CSS.
 */
export function Branch({
  root,
  leaves,
  caption,
}: {
  root: Node;
  leaves: Node[];
  caption?: ReactNode;
}) {
  return (
    <figure className={styles.diagram}>
      <div className={styles.branch}>
        <Box {...root} />
        <span className={styles.branchStem} aria-hidden="true" />
        <ul
          className={styles.branchRow}
          style={{'--branch-count': leaves.length} as React.CSSProperties}>
          <span className={styles.branchBar} aria-hidden="true" />
          {leaves.map((leaf) => (
            <li key={leaf.label} className={styles.branchLeaf}>
              <Box {...leaf} />
            </li>
          ))}
        </ul>
      </div>
      {caption && <figcaption className={styles.diagramCaption}>{caption}</figcaption>}
    </figure>
  );
}
