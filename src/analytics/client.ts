/**
 * Mesure d'audience — les pages vues (plan-phase2 §2.7).
 *
 * Déclaré dans `clientModules` (docusaurus.config.ts). Docusaurus appelle
 * `onRouteDidUpdate` après chaque rendu de route, y compris le tout premier
 * (`previousLocation` vaut alors `null`) : c'est exactement le crochet qu'il
 * faut, puisque count.js a été privé de son comptage automatique
 * (`no_onload`, voir goatcounter.ts).
 *
 * Le transport est en sommeil tant que `GOATCOUNTER_ENDPOINT` n'est pas
 * fournie au build : importer ce module ne mesure rien par lui-même.
 */
import type {ClientModule} from '@docusaurus/types';
import siteConfig from '@generated/docusaurus.config';
import {trackPageview} from './goatcounter';

/**
 * Retire le baseUrl du chemin : les routes de Docusaurus le portent
 * (`/typr.github.io/docs/intro`), et le tableau de bord n'a que faire de le
 * répéter sur chaque ligne. Surtout, ça rend l'historique stable si le site
 * passe un jour sur un domaine propre — sans quoi toutes les pages
 * changeraient d'identité le jour du déménagement.
 */
export function normalizePath(pathname: string, baseUrl: string): string {
  // baseUrl se termine toujours par '/' ; on garde ce '/' comme préfixe.
  const path = pathname.startsWith(baseUrl)
    ? pathname.slice(baseUrl.length - 1)
    : pathname;
  return path === '' ? '/' : path;
}

export const onRouteDidUpdate: ClientModule['onRouteDidUpdate'] = ({
  location,
  previousLocation,
}) => {
  // Une ancre cliquée dans le sommaire, ou le `?q=` que la page de recherche
  // réécrit à chaque frappe, produisent aussi un changement de route. Ce ne
  // sont pas des pages vues : seul le `pathname` fait foi.
  if (previousLocation && previousLocation.pathname === location.pathname) {
    return;
  }
  trackPageview(normalizePath(location.pathname, siteConfig.baseUrl));
};
