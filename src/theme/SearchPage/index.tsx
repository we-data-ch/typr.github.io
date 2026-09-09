/**
 * Enveloppe de `@theme/SearchPage` (le thème `@easyops-cn/docusaurus-search-local`).
 *
 * Le rendu n'est pas touché : on rend l'original tel quel. Ce fichier n'existe
 * que pour émettre un évènement par recherche aboutie, et surtout **par
 * recherche qui ne renvoie rien** — c'est le signal que l'action 7 du
 * plan-phase2 cherche à récolter : ce que les lecteurs viennent chercher dans
 * la doc et n'y trouvent pas.
 *
 * ## Pourquoi observer le DOM plutôt que l'état du composant
 *
 * Le composant d'origine garde ses résultats dans un `useState` privé et
 * n'expose ni contexte ni rappel ; sa recherche part dans un web worker dont
 * le module n'est pas non plus accessible depuis un alias `@theme/`. Le
 * réimplémenter pour en connaître le nombre de résultats reviendrait à
 * l'éjecter en entier — un fichier de 200 lignes à resynchroniser à chaque
 * montée de version du plugin, pour une mesure. On lit donc ce qu'il a rendu.
 *
 * L'observation porte sur la **structure**, jamais sur du texte : compter des
 * `<article>` survit à une traduction, pas la recherche d'un « No documents
 * were found ». Les classes, elles, sont des modules CSS aux noms hachés au
 * build : inutilisables comme sélecteur.
 *
 * ## Distinguer « zéro résultat » de « pas encore de résultat »
 *
 * C'est le seul vrai piège. Tant que l'index se télécharge, la page ne rend
 * aucun `<article>` — et un compte naïf verrait là une recherche infructueuse.
 * Or le composant ne rend son paragraphe de décompte (« N documents found » /
 * « No documents were found ») **qu'une fois les résultats connus**. La
 * présence d'un `<p>` dans la zone de résultats est donc l'accusé de réception
 * qui autorise à conclure. Sans lui, on se tait : un faux « aucun résultat »
 * empoisonnerait précisément le signal qu'on veut lire.
 *
 * ## Limite connue
 *
 * Seule la page `/search` est instrumentée, pas la liste déroulante de la
 * barre de recherche de la navbar. Celle-ci se rafraîchit à chaque frappe et
 * son gabarit « aucun résultat » n'est identifiable que par une classe hachée :
 * un crochet fragile qui, le jour où il casse en silence, dirait « personne ne
 * cherche rien qui manque » — pire que pas de mesure du tout. Un lecteur qui
 * ne trouve rien dans la liste déroulante et valide arrive sur `/search`
 * (`explicitSearchResultPath`), où il est compté.
 */
import React, {useEffect, useRef} from 'react';
import SearchPage from '@theme-original/SearchPage';
import {useLocation} from '@docusaurus/router';
import {isConfigured, trackEvent} from '@site/src/analytics/goatcounter';

/** Délai sans la moindre mutation au bout duquel on considère l'affichage stable. */
const SETTLE_MS = 1200;

/** Au-delà, ce n'est plus une requête de recherche mais un copier-coller. */
const MAX_QUERY_LENGTH = 64;

/** En deçà, c'est une frappe en cours, pas une intention. */
const MIN_QUERY_LENGTH = 2;

/**
 * Normalise la requête avant de l'émettre : espaces réduits, minuscules — pour
 * que « Trait » et « trait » comptent ensemble — et longueur plafonnée, parce
 * que ce champ est du texte libre saisi par un visiteur et qu'on n'a aucune
 * raison d'en conserver plus que le mot cherché.
 */
export function normalizeQuery(query: string): string {
  return query.trim().replace(/\s+/g, ' ').toLowerCase().slice(0, MAX_QUERY_LENGTH);
}

/**
 * La zone de résultats : le conteneur qui porte le champ de recherche de la
 * page. On part du champ (`input[name="q"]`, posé par le composant d'origine)
 * plutôt que du conteneur, pour ne pas embarquer la navbar et le pied de page
 * — dont les `<p>` fausseraient l'accusé de réception décrit plus haut.
 */
function resultsRegion(): Element | null {
  return document.querySelector('input[name="q"]')?.closest('.container') ?? null;
}

export default function SearchPageWrapper(
  props: Record<string, unknown>,
): React.ReactNode {
  const {search} = useLocation();
  const reported = useRef<string>('');

  useEffect(() => {
    if (!isConfigured) {
      return undefined;
    }
    const query = normalizeQuery(new URLSearchParams(search).get('q') ?? '');
    if (query.length < MIN_QUERY_LENGTH || query === reported.current) {
      return undefined;
    }
    const region = resultsRegion();
    if (!region) {
      return undefined;
    }

    // Chaque frappe réécrit le `?q=` de l'URL, donc rejoue cet effet : le
    // nettoyage ci-dessous fait office de debounce, et seule la requête sur
    // laquelle le visiteur s'arrête finit par être émise.
    let timer: ReturnType<typeof setTimeout>;
    const settle = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (!region.querySelector('p')) {
          // Résultats pas encore connus (voir l'en-tête). On laisse
          // l'observateur en place : la mutation suivante relancera le compte
          // à rebours. S'il n'en vient jamais, on se tait, et c'est bien ainsi.
          return;
        }
        observer.disconnect();
        reported.current = query;
        const hits = region.querySelectorAll('article').length;
        trackEvent(hits === 0 ? `search-empty: ${query}` : `search: ${query}`);
      }, SETTLE_MS);
    };
    const observer = new MutationObserver(settle);
    observer.observe(region, {childList: true, subtree: true});
    settle();

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [search]);

  return <SearchPage {...props} />;
}
