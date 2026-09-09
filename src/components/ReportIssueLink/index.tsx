/**
 * « Report an issue » — le voisin de « Edit this page » (plan-phase2 §2.8).
 *
 * Pourquoi il existe : « Edit this page » ne sert que le lecteur qui sait déjà
 * quoi écrire à la place. Celui qui constate qu'une phrase est fausse, qu'un
 * exemple ne compile pas ou qu'il manque une explication n'a pas de correctif
 * à proposer — il a un signalement. Sans un lien, ce signalement n'arrive
 * jamais : il faut trouver le dépôt, ouvrir l'onglet des issues, retrouver
 * l'URL de la page. Ici, un clic ouvre une issue déjà remplie.
 *
 * Deux choses sont pré-remplies, et ce sont exactement les deux que le
 * rapporteur oublie :
 *   - **l'URL de la page**, qu'il ne recopie pas ;
 *   - **le chemin du fichier source**, qu'il ne connaît pas — il est déduit de
 *     l'`editUrl` que le thème passe déjà à « Edit this page », donc de la même
 *     source de vérité, jamais d'une seconde configuration à tenir à jour.
 *
 * Le dépôt destinataire vient lui aussi de l'`editUrl` : si `editUrl` change de
 * dépôt un jour (docusaurus.config.ts), le lien suit sans qu'on y pense.
 */
import React, {useCallback} from 'react';
import {useLocation} from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './styles.module.css';

type Source = {
  /** `org/dépôt`, tel qu'il apparaît dans l'URL GitHub. */
  repo: string;
  /** Chemin du fichier source dans ce dépôt. */
  path: string;
};

/** `https://github.com/org/dépôt/edit/main/docs/intro.md` → org/dépôt + docs/intro.md */
const EDIT_URL = /^https?:\/\/github\.com\/([^/]+\/[^/]+)\/(?:edit|blob|tree)\/[^/]+\/(.+)$/;

export function parseEditUrl(editUrl: string): Source | undefined {
  const match = EDIT_URL.exec(editUrl);
  return match ? {repo: match[1]!, path: match[2]!} : undefined;
}

/**
 * Le titre de l'onglet, débarrassé du suffixe que Docusaurus y ajoute
 * (`Records | TypR`) : dans une liste d'issues, répéter le nom du site à
 * chaque ligne ne distingue rien.
 */
export function pageTitleFrom(
  documentTitle: string,
  siteTitle: string,
  delimiter: string,
): string | undefined {
  const suffix = ` ${delimiter} ${siteTitle}`;
  const title = documentTitle.endsWith(suffix)
    ? documentTitle.slice(0, -suffix.length)
    : documentTitle;
  return title.trim() || undefined;
}

export function issueUrl(
  {repo, path}: Source,
  pageUrl: string,
  pageTitle?: string,
): string {
  const body = [
    `**Page:** ${pageUrl}`,
    `**Source:** \`${path}\``,
    '',
    '### What is wrong?',
    '',
    "<!-- Quote the sentence or the code block, if you can: it's the fastest way to find it. -->",
    '',
    '### What did you expect instead?',
    '',
    '<!-- Optional. If an example did not compile, paste what `typr check` printed,',
    '     and the version reported by `typr --version`. -->',
    '',
  ].join('\n');

  const params = new URLSearchParams({
    // Le libellé existe sur le dépôt ; GitHub l'applique tel quel.
    labels: 'documentation',
    // Sans titre de page (rendu serveur, voir plus bas), le chemin du fichier
    // identifie la page tout aussi sûrement — et plus précisément.
    title: `${path.startsWith('blog/') ? 'Blog' : 'Docs'}: ${pageTitle ?? path}`,
    body,
  });
  return `https://github.com/${repo}/issues/new?${params.toString()}`;
}

export default function ReportIssueLink({
  editUrl,
}: {
  editUrl?: string;
}): React.ReactNode {
  const {siteConfig} = useDocusaurusContext();
  const {pathname} = useLocation();
  const source = editUrl ? parseEditUrl(editUrl) : undefined;

  // `pathname` contient déjà le baseUrl ; `siteConfig.url` n'en a pas.
  const pageUrl = source ? new URL(pathname, siteConfig.url).href : '';

  // Le titre de la page n'est lu qu'**au clic**, pas au rendu. Deux raisons :
  // au rendu serveur il n'existe pas (`document` non plus), et sur une
  // navigation interne rien ne garantit que react-helmet ait déjà posé le
  // nouveau titre quand nos effets s'exécutent — on prendrait alors celui de la
  // page précédente, c'est-à-dire une issue qui désigne la mauvaise page. Au
  // clic, la question ne se pose plus. Le `href` rendu reste valide en
  // permanence (il retombe sur le chemin du fichier), donc un clic milieu ou un
  // « copier le lien » ouvre malgré tout la bonne issue.
  const onClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      if (!source) {
        return;
      }
      event.currentTarget.href = issueUrl(
        source,
        pageUrl,
        pageTitleFrom(
          document.title,
          siteConfig.title,
          siteConfig.titleDelimiter,
        ),
      );
    },
    [source?.repo, source?.path, pageUrl, siteConfig],
  );

  // Pas d'`editUrl`, ou une forge qui n'est pas GitHub : pas de lien plutôt
  // qu'un lien qui tombe à côté.
  if (!source) {
    return null;
  }

  return (
    <a
      className={styles.reportIssue}
      href={issueUrl(source, pageUrl)}
      onClick={onClick}
      // Nouvel onglet : signaler un problème est une digression, le lecteur
      // revient à sa page ensuite.
      target="_blank"
      rel="noopener noreferrer"
      title="Open a pre-filled GitHub issue about this page">
      <svg
        className={styles.icon}
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        focusable="false">
        <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm-1-13h2v7h-2V7Zm0 9h2v2h-2v-2Z" />
      </svg>
      Report an issue
    </a>
  );
}
