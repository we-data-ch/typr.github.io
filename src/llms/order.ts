// Ordre de lecture des pages dans `llms.txt` / `llms-full.txt`.
//
// Il est dérivé de `sidebars.ts` plutôt que réécrit à la main : la barre
// latérale *est* déjà l'ordre de lecture décidé pour les humains (Diátaxis :
// prise en main, tutoriels, how-to, référence, philosophie, deep dives), et une
// seconde liste tenue à la main aurait divergé dès la page suivante. Un modèle
// qui lit dans cet ordre voit la langue avant ses cas particuliers.
//
// Les pages absentes de la barre latérale ne sont pas perdues : le plugin les
// place à la fin (`includeUnmatchedLast`).

type SidebarItem = unknown;

/** Aplatit la config de barre latérale en identifiants de doc, dans l'ordre. */
function collectDocIds(item: SidebarItem, out: string[]): void {
  if (typeof item === 'string') {
    out.push(item);
    return;
  }
  if (Array.isArray(item)) {
    item.forEach((child) => collectDocIds(child, out));
    return;
  }
  if (item && typeof item === 'object') {
    const node = item as {type?: string; id?: string; items?: unknown};
    if (node.type === 'doc' && typeof node.id === 'string') {
      out.push(node.id);
    }
    if (node.items !== undefined) {
      collectDocIds(node.items, out);
    }
  }
}

/**
 * Motifs `includeOrder` (chemins relatifs à la racine du site) pour toutes les
 * pages listées dans les barres latérales données.
 */
export function docOrderFromSidebars(sidebars: {
  [key: string]: unknown;
}): string[] {
  const ids: string[] = [];
  Object.values(sidebars).forEach((sidebar) => collectDocIds(sidebar, ids));
  // Un id peut apparaître dans deux barres latérales ; le premier passage gagne.
  return [...new Set(ids)].map((id) => `docs/${id}.md`);
}
