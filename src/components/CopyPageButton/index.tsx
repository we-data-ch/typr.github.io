/**
 * « Copy as Markdown » — le bouton qui donne la page au format que lit un
 * modèle, pas celui que lit un navigateur.
 *
 * Pourquoi il existe : copier une page depuis le HTML rendu ramène la barre
 * latérale, les fils d'Ariane et des blocs de code découpés en <span> par
 * Shiki. Ce qu'on veut coller dans un assistant, c'est la source Markdown.
 *
 * D'où elle vient : `docusaurus-plugin-llms` écrit, au build, le Markdown de
 * chaque page à côté de son HTML — `/docs/intro` ↔ `/docs/intro.md` (voir
 * docusaurus.config.ts). Le bouton n'a donc rien à embarquer dans le bundle :
 * il va chercher ce fichier au clic.
 *
 * Conséquence à connaître : ces .md ne sont produits qu'au `docusaurus build`
 * (lifecycle postBuild). En `npm start`, ils n'existent pas — et le serveur de
 * dev répond alors du HTML avec un code 200 plutôt qu'un 404, ce qui mettrait
 * une page HTML dans le presse-papier. D'où le contrôle de `Content-Type` et
 * du premier caractère avant de copier quoi que ce soit : mieux vaut un bouton
 * qui dit « Unavailable » en dev qu'un bouton qui ment.
 */
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useLocation} from '@docusaurus/router';
import styles from './styles.module.css';

type Status = 'idle' | 'busy' | 'copied' | 'failed';

const LABELS: Record<Status, string> = {
  idle: 'Copy as Markdown',
  busy: 'Copying…',
  copied: 'Copied!',
  failed: 'Unavailable',
};

/** L'URL du Markdown d'une page : sa route, plus `.md`. */
export function markdownUrl(pathname: string): string {
  return `${pathname.replace(/\/+$/, '')}.md`;
}

async function fetchMarkdown(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  const text = await response.text();
  // Le serveur de dev sert son index HTML pour toute route inconnue, avec un
  // 200 : sans ce garde-fou, on copierait la page d'accueil.
  if (text.trimStart().startsWith('<')) {
    throw new Error('not markdown');
  }
  return text;
}

export default function CopyPageButton(): React.ReactNode {
  const {pathname} = useLocation();
  const [status, setStatus] = useState<Status>('idle');
  const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Revenir à l'état neutre après le message, et ne jamais laisser un
  // setState() courir après un démontage (navigation en cours de fetch).
  useEffect(() => () => clearTimeout(timeout.current), []);
  useEffect(() => {
    clearTimeout(timeout.current);
    setStatus('idle');
  }, [pathname]);

  const onClick = useCallback(async () => {
    clearTimeout(timeout.current);
    setStatus('busy');
    try {
      const markdown = await fetchMarkdown(markdownUrl(pathname));
      await navigator.clipboard.writeText(markdown);
      setStatus('copied');
    } catch {
      setStatus('failed');
    }
    timeout.current = setTimeout(() => setStatus('idle'), 2500);
  }, [pathname]);

  return (
    <div className={styles.group}>
      <button
        type="button"
        className={styles.button}
        onClick={onClick}
        disabled={status === 'busy'}
        title="Copy this page as Markdown, for pasting into an AI assistant">
        <svg
          className={styles.icon}
          viewBox="0 0 24 24"
          aria-hidden="true"
          focusable="false">
          <path
            fill="currentColor"
            d="M16 1H4a2 2 0 0 0-2 2v14h2V3h12V1Zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Zm0 16H8V7h11v14Z"
          />
        </svg>
        {/* aria-live : l'utilisateur qui lit à l'oreille doit apprendre que la
            copie a eu lieu, ou qu'elle a échoué. */}
        <span aria-live="polite">{LABELS[status]}</span>
      </button>
      {/* Un <a> nu, pas un <Link> : la cible est un fichier du dossier de
          sortie, pas une route de l'application — le routeur ne saurait pas la
          rendre, et le contrôleur de liens morts n'a pas à la connaître. */}
      <a
        className={styles.button}
        href={markdownUrl(pathname)}
        title="Open the Markdown source of this page">
        View
      </a>
    </div>
  );
}
