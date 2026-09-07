# Plan de restructuration de la documentation TypR

> Objectif : transformer l'actuelle base Docusaurus (9 pages) en une documentation
> complète conforme au framework Diátaxis, ciblée sur les **développeurs de packages R**.

---

## 1. État actuel

| Section | Pages | Couverture |
|---------|-------|------------|
| Getting Started | 1 page | `intro.md` **réécrit** en pur tutoriel Diátaxis |
| FAQ | 1 page | Intégrée (navbar, footer, sidebar) |
| Tutorials | 0 page | Sous-dossier créé, contenu à venir |
| How-To Guides | 0 page | Sous-dossier créé, contenu à venir |
| Reference | 16 pages | intro, installation, lexicon, bindings-mutation, types, fonctions, records, unions-patterns, operators, control-flow, modules, interfaces, signatures, escape-hatches, cheatsheet, r-typr |
| Philosophy | 2 pages | intro, vectorization_by_design |
| Concepts (Deep Dives) | 1 page | known-pitfalls (placeholder) |

---

## 2. Problèmes identifiés

**1. Violation du framework Diátaxis** — ~~`docs/intro.md` mélange tutorial (getting
started), référence (types primitifs, syntaxe) et explication (pourquoi TypR). Il
devrait être un pur tutoriel.~~ → **RÉSOLU** (réécrit en pur tutoriel, contenu déplacé
vers `reference/types.md` et `reference/functions.md`).

**2. Contenu massif absent** — ~~`syntaxe.md` (730 lignes) contient 14 sections détaillées.
Seules ~30% de ce contenu apparaissent dans la doc Docusaurus.~~ → **RÉSOLU** (Action 3 :
10 pages de référence créées depuis syntaxe.md, types.md et functions.md enrichis).

**3. Aucun "How-To Guide"** — Zéro page pratique pour les développeurs de packages R.
Exemples manquants : "Comment migrer un package existant", "Comment typer une fonction
dplyr", "Comment interopérer avec R6". → **À faire** (Action 4).

**4. Blocs de code mal étiquetés** — Tous les blocs TypR utilisent ` ```julia ` au lieu
d'un langage dédié (mapper sur `r` ou ajouter un langage Prism `typr`). → **RÉSOLU**
(langage Prism `typr` ajouté — alias de la grammaire `r` via un `prism-include-languages`
swizzlé dans `src/theme/`, 42 blocs ` ```julia ` migrés vers ` ```typr `).

**5. Public cible** — La doc s'adresse aux "data scientists et statisticiens" mais
l'utilisateur veut cibler les **développeurs de packages R**. Le contenu devrait refléter
cet objectif.

**6. Configuration** — ~~`editUrl` pointe vers `facebook/docusaurus` (défaut) au lieu de
`we-data-ch/typr.github.io`. Le lien footer "GitHub" pointe aussi vers le mauvais repo.~~ → **RÉSOLU**
(`editUrl` corrigé, liens footer vers `we-data-ch/typr` et `we-data-ch/typr.github.io`).

---

## 3. Nouvelle arborescence (Diátaxis)

```
Légende :  ✅ créé —  🚧 à créer
docs/
├── intro.md                          # ✅ TUTORIAL — Getting started (réécrit)
├── faq.md                            # ✅ FAQ pour utilisateurs R (conservée telle quelle)
├── tutorials/                        # ✅ dossier créé, 3 pages
│   ├── first-package.md              # ✅ "Créer votre premier package TypR"
│   ├── migrate-r-package.md          # ✅ "Migrer un package R existant vers TypR"
│   └── typed-data-modeling.md         # ✅ "Modéliser des données avec les types TypR"
├── howto/                            # ✅ dossier créé, 6 pages
│   ├── type-r-functions.md           # ✅ "Typer des fonctions R existantes (signatures @)"
│   ├── interop-r6-s4.md              # ✅ "Interopérer avec R6/S4/RC"
│   ├── use-dplyr-tidyr.md            # ✅ "Utiliser dplyr/tidyr depuis TypR"
│   ├── build-and-test.md             # ✅ "Builder, tester et documenter un package"
│   ├── r-raw-blocks.md               # ✅ "Utiliser des blocs R non typés"
│   └── generics-signatures.md        # ✅ "Déclarer des génériques S3/S4"
├── reference/
│   ├── intro.md                      # ✅ Introduction à la référence
│   ├── installation.md               # ✅ Installation
│   ├── lexicon.md                    # ✅ Lexique & littéraux (depuis syntaxe.md §1)
│   ├── bindings-mutation.md          # ✅ Liaisons & mutation (depuis syntaxe.md §2)
│   ├── types.md                      # ✅ Système de types (enrichi depuis syntaxe.md §3)
│   ├── functions.md                  # ✅ Fonctions (enrichi depuis syntaxe.md §5)
│   ├── records.md                    # ✅ Records & constructeurs (depuis syntaxe.md §6)
│   ├── unions-patterns.md            # ✅ Unions, tags & match (depuis syntaxe.md §7)
│   ├── operators.md                  # ✅ Opérateurs & précédence (depuis syntaxe.md §8)
│   ├── control-flow.md              # ✅ Contrôle de flux
│   ├── modules.md                    # ✅ Modules & imports (depuis syntaxe.md §10)
│   ├── interfaces.md                 # ✅ Interfaces (depuis syntaxe.md §11)
│   ├── signatures.md                 # ✅ Signatures, @extern, Foreign<T> (depuis syntaxe.md §4)
│   ├── escape-hatches.md             # ✅ Échappatoires R/JS (depuis syntaxe.md §12)
│   ├── r-typr.md                     # ✅ Compatibilité R
│   └── cheatsheet.md                 # ✅ Tableau comparatif TypR vs R (depuis syntaxe.md §13)
├── philosophy/
│   ├── intro.md                      # ✅ Existant
│   ├── vectorization_by_design.md    # ✅ Existant
│   └── type-system-design.md         # ✅ NOUVEAU — Pourquoi ce système de types
└── concepts/                         # Dossier créé, 3 pages
    ├── generics-kind.md              # ✅ Génériques & sigils de kind (DEPUIS syntaxe.md §3.4)
    ├── type-constructors.md          # ✅ Typeconstructors (DEPUIS syntaxe.md §4)
    └── known-pitfalls.md             # ✅ Placeholder créé (liens depuis reference/)
```

> **Note sur la FAQ** — Ajoutée récemment par un contributeur, `docs/faq.md` est un
> hybride Diátaxis (explication + référence). On la conserve comme page de premier
> niveau (déjà branchée sur la navbar et le footer), et chaque nouvelle page devra
> **pointer vers elle** (les Q16-18, 21-22, 29-31 font déjà doublon avec les futurs
> how-tos, tutorials et pages de référence — on ne réécrit pas ce contenu, on y
> renvoie). Ses blocs ` ```julia ` ont été migrés vers ` ```typr ` par l'action n°7.
> Les vestiges `FAQ.md` / `FAQ.md.bak` à la racine ont été supprimés (action n°11).

---

## 4. Actions par priorité

| # | Action | Priorité | Statut |
|---|--------|----------|--------|
| 1 | Créer les sous-dossiers `tutorials/`, `howto/`, `concepts/` | Haute | ✅ Fait |
| 2 | Réécrire `docs/intro.md` comme pur tutoriel Diátaxis | Haute | ✅ Fait |
| 3 | Créer les pages de référence manquantes depuis `syntaxe.md` | Haute | ✅ Fait (10 fichiers + enrichissements types.md/functions.md) |
| 4 | Créer les how-to guides pour devs de packages R | Haute | ✅ Fait (6 fichiers howto/ + sidebar activée) |
| 5 | Créer les tutorials ciblés | Moyenne | ✅ Fait (3 fichiers tutorials/ + sidebar activée) |
| 6 | Corriger `editUrl` dans `docusaurus.config.ts` | Moyenne | ✅ Fait |
| 7 | Ajouter `typr` comme langage Prism (ou utiliser `r`) | Moyenne | ✅ Fait (langage `typr` = alias de la grammaire `r` via swizzle `prism-include-languages` ; 42 blocs migrés) |
| 8 | Enrichir philosophy avec un article sur le design du système de types | Basse | ✅ Fait (`philosophy/type-system-design.md` créé) |
| 9 | Nettoyer `sidebars.ts` pour refléter la nouvelle structure | Haute | ✅ Fait (sidebar complète avec les 16 pages reference) |
| 10 | Ajouter une page cheatsheet comparant TypR vs R | Basse | ✅ Fait (`reference/cheatsheet.md` créé lors de l'action 3) |
| 11 | Supprimer les vestiges `FAQ.md` / `FAQ.md.bak` à la racine (contenu désormais dans `docs/faq.md`) | Basse | ✅ Fait |

---

## 5. Changements dans `docusaurus.config.ts`

- ✅ Corriger `editUrl` pour pointer vers `we-data-ch/typr.github.io`
- ✅ Corriger le lien footer "GitHub" qui pointe vers `facebook/docusaurus`
- ✅ Ajouter un langage Prism personnalisé `typr` — `typr` est enregistré comme alias de
  la grammaire `r` via un composant `src/theme/prism-include-languages.js` swizzlé. Tous
  les blocs ` ```julia ` sont migrés vers ` ```typr `. `julia` retiré de
  `additionalLanguages` ; `r` conservé pour les blocs R purs.

---

## 6. Sidebar restructurée

✅ Implémentée dans `sidebars.ts` (sidebar manuelle, plus `autogenerated`). Les
catégories *Tutorials* et *How-To Guides* sont activées. La catégorie
*Deep Dives* est présente en placeholder (commentée) et sera activée au fil
des créations de pages :

```ts
const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    'intro',
    'faq',
    {
      type: 'category',
      label: 'Tutorials',
      items: ['tutorials/first-package', 'tutorials/migrate-r-package', 'tutorials/typed-data-modeling'],
    },
    {
      type: 'category',
      label: 'How-To Guides',
      items: ['howto/type-r-functions', 'howto/interop-r6-s4', 'howto/use-dplyr-tidyr', 'howto/build-and-test', 'howto/r-raw-blocks', 'howto/generics-signatures'],
    },
    {
      type: 'category',
      label: 'Reference',
      items: [
        'reference/intro',
        'reference/installation',
        'reference/lexicon',
        'reference/bindings-mutation',
        'reference/types',
        'reference/functions',
        'reference/records',
        'reference/unions-patterns',
        'reference/operators',
        'reference/control-flow',
        'reference/modules',
        'reference/interfaces',
        'reference/signatures',
        'reference/escape-hatches',
        'reference/cheatsheet',
        'reference/r-typr',
      ],
    },
    {
      type: 'category',
      label: 'Philosophy',
      items: ['philosophy/intro', 'philosophy/vectorization_by_design'],
    },
    // Deep Dives -> concepts/*            (à activer)
  ],
};
```

---

## 7. Résultat attendu

Ce plan passe de **9 pages** à **~30 pages**, en transformant chaque section de
`syntaxe.md` en page de référence dédiée et en ajoutant les volets tutorials et how-to
manquants — le tout orienté développeurs de packages R.

> **Avancement (mis à jour)** — Actions 1 à 11 ✅ **toutes terminées**. La section
> Reference est complète (16 pages), les 6 How-To Guides, les 3 Tutorials, les 3
> articles Philosophy et les 3 Deep Dives (`concepts/`) sont en place. La category
> *Deep Dives* a été activée dans la sidebar (`concepts/generics-kind`,
> `concepts/type-constructors`, `concepts/known-pitfalls`). Nettoyage final effectué :
> - migration `julia → typr` (action 7) : 42 blocs migrés, langage Prism `typr` actif
> - suppression des vestiges `FAQ.md` / `FAQ.md.bak` (action 11)
>
> Total actuel : **33 pages publiées** — arborescence Diátaxis complète.
