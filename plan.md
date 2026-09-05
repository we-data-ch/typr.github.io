# Plan de restructuration de la documentation TypR

> Objectif : transformer l'actuelle base Docusaurus (9 pages) en une documentation
> complète conforme au framework Diátaxis, ciblée sur les **développeurs de packages R**.

---

## 1. État actuel

| Section | Pages | Couverture |
|---------|-------|------------|
| Getting Started | 1 page | Tutorial + réference mélangés |
| Philosophy | 2 pages | Explication partielle |
| Reference | 5 pages | Syntaxe, types, fonctions, contrôle de flux, compatibilité R |

## 2. Problèmes identifiés

**1. Violation du framework Diátaxis** — `docs/intro.md` mélange tutorial (getting
started), référence (types primitifs, syntaxe) et explication (pourquoi TypR). Il
devrait être un pur tutoriel.

**2. Contenu massif absent** — `syntaxe.md` (730 lignes) contient 14 sections détaillées.
Seules ~30% de ce contenu apparaissent dans la doc Docusaurus. Manquent en total :
- Modules & imports
- Opérateurs & précédence
- Records & constructeurs (spread, named embedding)
- Unions, tags & match (détails des motifs)
- Signatures complètes (`@`, `@extern`, `Foreign<T>`)
- Typeconstructors
- Échappatoires (R blocks, JS blocks, `extern`)
- Alias vs opaque
- Génériques & sigils de kind
- Littéraux & lexique
- Liaisons & mutation
- Ambiguïtés & pièges

**3. Aucun "How-To Guide"** — Zéro page pratique pour les développeurs de packages R.
Exemples manquants : "Comment migrer un package existant", "Comment typer une fonction
dplyr", "Comment interopérer avec R6".

**4. Blocs de code mal étiquetés** — Tous les blocs TypR utilisent ` ```julia ` au lieu
d'un langage dédié (mapper sur `r` ou ajouter un langage Prism `typr`).

**5. Public cible** — La doc s'adresse aux "data scientists et statisticiens" mais
l'utilisateur veut cibler les **développeurs de packages R**. Le contenu devrait refléter
cet objectif.

**6. Configuration** — `editUrl` pointe vers `facebook/docusaurus` (défaut) au lieu de
`we-data-ch/typr.github.io`. Le lien footer "GitHub" pointe aussi vers le mauvais repo.

---

## 3. Nouvelle arborescence (Diátaxis)

```
docs/
├── intro.md                          # TUTORIAL — Getting started (réécrit)
├── tutorials/
│   ├── first-package.md              # "Créer votre premier package TypR"
│   ├── migrate-r-package.md          # "Migrer un package R existant vers TypR"
│   └── typed-data-modeling.md         # "Modéliser des données avec les types TypR"
├── howto/
│   ├── type-r-functions.md           # "Typer des fonctions R existantes (signatures @)"
│   ├── interop-r6-s4.md              # "Interopérer avec R6/S4/RC"
│   ├── use-dplyr-tidyr.md            # "Utiliser dplyr/tidyr depuis TypR"
│   ├── build-and-test.md             # "Builder, tester et documenter un package"
│   ├── r-raw-blocks.md               # "Utiliser des blocs R non typés"
│   └── generics-signatures.md        # "Déclarer des génériques S3/S4"
├── reference/
│   ├── intro.md                      # Introduction à la référence
│   ├── installation.md               # Installation (existant, amélioré)
│   ├── lexicon.md                    # Lexique & littéraux (DEPUIS syntaxe.md §1)
│   ├── bindings-mutation.md          # Liaisons & mutation (DEPUIS syntaxe.md §2)
│   ├── types.md                      # Système de types (existant + enrichi depuis syntaxe.md §3-4)
│   ├── functions.md                  # Fonctions (existant + enrichi depuis syntaxe.md §5)
│   ├── records.md                    # Records & constructeurs (DEPUIS syntaxe.md §6)
│   ├── unions-patterns.md            # Unions, tags & match (DEPUIS syntaxe.md §7)
│   ├── operators.md                  # Opérateurs & précédence (DEPUIS syntaxe.md §8)
│   ├── control-flow.md              # Contrôle de flux (existant, enrichi)
│   ├── modules.md                    # Modules & imports (DEPUIS syntaxe.md §10)
│   ├── interfaces.md                 # Interfaces (DEPUIS syntaxe.md §11)
│   ├── signatures.md                 # Signatures, @extern, Foreign<T> (DEPUIS syntaxe.md §4)
│   ├── escape-hatches.md             # Échappatoires R/JS (DEPUIS syntaxe.md §12)
│   ├── r-typr.md                     # Compatibilité R (existant)
│   └── cheatsheet.md                 # Tableau comparatif TypR vs R (DEPUIS syntaxe.md §13)
├── philosophy/
│   ├── intro.md                      # Existant (amélioré)
│   ├── vectorization_by_design.md    # Existant
│   └── type-system-design.md         # NOUVEAU — Pourquoi ce système de types
└── concepts/
    ├── generics-kind.md              # Génériques & sigils de kind (DEPUIS syntaxe.md §3.4)
    ├── type-constructors.md          # Typeconstructors (DEPUIS syntaxe.md §4)
    └── known-pitfalls.md             # Ambiguïtés & pièges (DEPUIS syntaxe.md §14)
```

---

## 4. Actions par priorité

| # | Action | Priorité |
|---|--------|----------|
| 1 | Créer les sous-dossiers `tutorials/`, `howto/`, `concepts/` | Haute |
| 2 | Réécrire `docs/intro.md` comme pur tutoriel Diátaxis | Haute |
| 3 | Créer les pages de référence manquantes depuis `syntaxe.md` | Haute |
| 4 | Créer les how-to guides pour devs de packages R | Haute |
| 5 | Créer les tutorials ciblés | Moyenne |
| 6 | Corriger `editUrl` dans `docusaurus.config.ts` | Moyenne |
| 7 | Ajouter `typr` comme langage Prism (ou utiliser `r`) | Moyenne |
| 8 | Enrichir philosophy avec un article sur le design du système de types | Basse |
| 9 | Nettoyer `sidebars.ts` pour refléter la nouvelle structure | Haute |
| 10 | Ajouter une page cheatsheet comparant TypR vs R | Basse |

---

## 5. Changements dans `docusaurus.config.ts`

- Corriger `editUrl` pour pointer vers `we-data-ch/typr.github.io`
- Corriger le lien footer "GitHub" qui pointe vers `facebook/docusaurus`
- Ajouter un langage Prism personnalisé `typr` ou mapper sur `r`

---

## 6. Sidebar restructurée

```ts
const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    'intro',
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
      items: ['reference/installation', 'reference/lexicon', 'reference/bindings-mutation', 'reference/types', 'reference/functions', 'reference/records', 'reference/unions-patterns', 'reference/operators', 'reference/control-flow', 'reference/modules', 'reference/interfaces', 'reference/signatures', 'reference/escape-hatches', 'reference/r-typr', 'reference/cheatsheet'],
    },
    {
      type: 'category',
      label: 'Philosophy',
      items: ['philosophy/intro', 'philosophy/vectorization_by_design', 'philosophy/type-system-design'],
    },
    {
      type: 'category',
      label: 'Deep Dives',
      items: ['concepts/generics-kind', 'concepts/type-constructors', 'concepts/known-pitfalls'],
    },
  ],
};
```

---

## 7. Résultat attendu

Ce plan passe de **9 pages** à **~30 pages**, en transformant chaque section de
`syntaxe.md` en page de référence dédiée et en ajoutant les volets tutorials et how-to
manquants — le tout orienté développeurs de packages R.
