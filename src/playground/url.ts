// Contrat d'URL avec le playground.
//
// L'autorité sur le format est `src/lib/share.ts` du dépôt
// we-data-ch/typr-playground.github.io (résumé dans son INTEGRATION.md) : la
// documentation ne partage aucun code avec le playground, elle se contente de
// produire des liens conformes. Toute évolution du format se fait donc là-bas
// d'abord, ici ensuite.

export const PLAYGROUND_URL =
  'https://we-data-ch.github.io/typr-playground.github.io/';

/** Au-delà, les navigateurs et les proxies commencent à tronquer l'URL. */
export const MAX_URL_CODE_LENGTH = 8000;

export type PlaygroundTheme = 'light' | 'dark';

export interface PlaygroundLinkOptions {
  /** Compile et exécute dès que le compilateur et WebR sont prêts (`?run=1`). */
  autorun?: boolean;
  /** Ouvre le playground dans le thème de la page (`?theme=`), sans écraser
   *  la préférence enregistrée du visiteur. */
  theme?: PlaygroundTheme;
}

/**
 * base64url : le base64 standard dont les `+` et `/` deviennent `-` et `_`,
 * sans padding. Ce n'est pas une coquetterie — `URLSearchParams` transforme les
 * `+` en espaces, un base64 standard se retrouverait corrompu au décodage.
 */
export function encodeCode(code: string): string {
  const bytes = new TextEncoder().encode(code);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * `null` quand le bloc est trop long pour tenir dans une URL : l'appelant
 * n'affiche alors pas de bouton, plutôt que d'ouvrir un playground avec un
 * code tronqué. (Le plus long bloc du site fait aujourd'hui ~460 caractères,
 * la garde est là pour la page qui ne l'est pas encore.)
 */
export function buildPlaygroundUrl(
  code: string,
  options: PlaygroundLinkOptions = {},
): string | null {
  const encoded = encodeCode(code);
  if (encoded.length > MAX_URL_CODE_LENGTH) {
    return null;
  }

  const url = new URL(PLAYGROUND_URL);
  url.searchParams.set('code', encoded);
  if (options.autorun) {
    url.searchParams.set('run', '1');
  }
  if (options.theme) {
    url.searchParams.set('theme', options.theme);
  }

  return url.toString();
}
