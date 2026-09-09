/**
 * Le bandeau posé sur un bloc ```typr compile_fail.
 *
 * Sans lui, un contre-exemple est indiscernable d'un exemple : le lecteur qui
 * survole la page recopie du code que le compilateur refuse. C'est exactement
 * ce que rustdoc résout avec sa pastille sur les blocs `compile_fail`, et ce
 * que `noplayground` ne faisait pas — il retirait le bouton, donc il cachait le
 * problème au lieu de le nommer.
 *
 * Rendu côté serveur, contrairement aux boutons du bloc : c'est du contenu, pas
 * un ornement interactif. Il doit être dans le HTML initial, donc lisible sans
 * JavaScript et présent pour les moteurs de recherche.
 */
import React from 'react';
import {useCodeBlockMeta} from '@site/src/playground/meta';
import styles from './styles.module.css';

const LABEL = 'This example does not compile';
const DETAIL = 'It shows what TypR rejects, on purpose.';

export default function CompileFailNotice(): React.ReactNode {
  const {compileFail} = useCodeBlockMeta();

  if (!compileFail) {
    return null;
  }

  return (
    <div className={styles.notice} role="note">
      <svg
        className={styles.icon}
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false">
        <path
          fill="currentColor"
          d="M12 2 1 21h22L12 2Zm0 5 7.5 12.9h-15L12 7Zm-1 4v5h2v-5h-2Zm0 6.5v2h2v-2h-2Z"
        />
      </svg>
      <span>
        <strong>{LABEL}</strong> <span className={styles.detail}>{DETAIL}</span>
      </span>
    </div>
  );
}
