/**
 * Mesure d'audience — le transport (plan-phase2 §2.7).
 *
 * Pourquoi GoatCounter : le site est statique et servi par GitHub Pages, donc
 * tout ce qui a un état vit chez un tiers. GoatCounter est gratuit pour
 * l'open-source, hébergé, sans cookie et sans identifiant persistant — donc
 * sans bandeau de consentement à gérer, qui est le vrai coût caché d'une
 * mesure d'audience.
 *
 * Ce qu'on cherche à savoir, et rien d'autre : **quelles pages sont lues**, et
 * **quelles recherches ne renvoient aucun résultat**. La seconde est la
 * meilleure source d'idées de roadmap documentaire qui soit — elle dit ce que
 * les gens cherchent et ne trouvent pas.
 *
 * ## En sommeil par défaut
 *
 * L'adresse de collecte vient de `GOATCOUNTER_ENDPOINT`, lue au build et
 * recopiée dans `customFields` (docusaurus.config.ts). Tant qu'elle est vide —
 * `npm start`, `npm run build` en local, build de PR sans la variable — ce
 * module n'injecte aucun script et n'émet aucune requête. Il n'y a pas de
 * « mode désactivé » à maintenir : il n'y a rien à désactiver.
 *
 * ## Trois garde-fous
 *
 * - **Do Not Track** est honoré ici, explicitement. count.js ne le fait plus
 *   de lui-même ; comme c'est nous qui décidons de le charger, c'est à nous de
 *   ne pas le charger.
 * - **Le chargement est paresseux** : count.js n'est demandé qu'au premier hit
 *   réel, donc après l'hydratation. Une page qui n'est jamais comptée (DNT,
 *   mesure éteinte) ne paie pas la requête.
 * - **Tout échec est avalé.** Un bloqueur de publicité, un réseau coupé, un
 *   compte GoatCounter supprimé : la mesure n'est pas critique, elle ne doit
 *   ni casser la page ni polluer la console.
 */
import siteConfig from '@generated/docusaurus.config';

/** Le CDN officiel de GoatCounter. C'est le seul tiers que le site contacte. */
const SCRIPT_URL = 'https://gc.zgo.at/count.js';

/** Les chemins et noms d'évènement plus longs sont tronqués côté serveur. */
const MAX_PATH_LENGTH = 255;

interface GoatCounterHit {
  /** Le chemin compté, ou le nom de l'évènement quand `event` est vrai. */
  path?: string;
  title?: string;
  referrer?: string;
  event?: boolean;
}

interface GoatCounterApi {
  /** Empêche count.js de compter tout seul au chargement — voir plus bas. */
  no_onload?: boolean;
  /** count.js refuse de compter depuis localhost sans ce drapeau. */
  allow_local?: boolean;
  count?: (hit: GoatCounterHit) => void;
}

declare global {
  interface Window {
    goatcounter?: GoatCounterApi;
  }
}

interface AnalyticsSettings {
  /** `https://<compte>.goatcounter.com/count`, ou '' — c'est-à-dire éteint. */
  endpoint: string;
  /** Pour tester la mesure en local, où count.js se tairait autrement. */
  allowLocal: boolean;
}

function readSettings(): AnalyticsSettings {
  const raw = siteConfig.customFields?.analytics as
    | Partial<AnalyticsSettings>
    | undefined;
  return {
    endpoint: typeof raw?.endpoint === 'string' ? raw.endpoint : '',
    allowLocal: raw?.allowLocal === true,
  };
}

const settings = readSettings();

/** Vrai quand une mesure d'audience est configurée pour ce build. */
export const isConfigured = settings.endpoint !== '';

/**
 * `navigator.doNotTrack`, `navigator.msDoNotTrack`, `window.doNotTrack` : les
 * trois orthographes que les navigateurs ont successivement retenues. Aucune
 * n'est universelle, donc on les lit toutes et un seul « oui » suffit.
 */
function doNotTrack(): boolean {
  const nav = navigator as Navigator & {
    doNotTrack?: string | null;
    msDoNotTrack?: string | null;
  };
  const win = window as Window & {doNotTrack?: string | null};
  return [nav.doNotTrack, nav.msDoNotTrack, win.doNotTrack].some(
    (value) => value === '1' || value === 'yes',
  );
}

function isEnabled(): boolean {
  return (
    isConfigured && typeof window !== 'undefined' && !doNotTrack()
  );
}

let loading: Promise<void> | undefined;

function load(): Promise<void> {
  if (loading) {
    return loading;
  }
  loading = new Promise<void>((resolve, reject) => {
    // L'objet de configuration doit exister *avant* que count.js s'exécute :
    // le script fait `window.goatcounter = window.goatcounter || {}` puis pose
    // ses méthodes dessus, donc nos réglages survivent.
    //
    // `no_onload` est le point clé. count.js compte la page à son chargement,
    // ce qui ne se produit qu'une fois — or Docusaurus est une SPA : sans ce
    // drapeau on ne mesurerait jamais que les pages d'atterrissage. C'est
    // src/analytics/client.ts qui compte, à chaque changement de route.
    window.goatcounter = {
      no_onload: true,
      allow_local: settings.allowLocal,
    };
    const script = document.createElement('script');
    script.async = true;
    script.src = SCRIPT_URL;
    script.setAttribute('data-goatcounter', settings.endpoint);
    script.addEventListener('load', () => resolve());
    script.addEventListener('error', () =>
      reject(new Error('goatcounter: count.js n’a pas pu être chargé')),
    );
    document.head.appendChild(script);
  });
  return loading;
}

async function send(hit: GoatCounterHit): Promise<void> {
  if (!isEnabled()) {
    return;
  }
  try {
    await load();
    window.goatcounter?.count?.(hit);
  } catch {
    // Silence volontaire : voir l'en-tête du fichier.
  }
}

/** Une page vue. `path` est déjà débarrassé du baseUrl (voir client.ts). */
export function trackPageview(path: string): void {
  void send({path: path.slice(0, MAX_PATH_LENGTH)});
}

/**
 * Un évènement. GoatCounter n'a pas de type « évènement » à part : c'est un
 * hit dont le chemin est un nom libre et dont le drapeau `event` est levé.
 */
export function trackEvent(name: string): void {
  const path = name.slice(0, MAX_PATH_LENGTH);
  void send({path, title: path, event: true});
}
