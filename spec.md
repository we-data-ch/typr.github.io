# Spécification de la page d'accueil TypR

## 1. Objectif

La page d'accueil doit permettre à un visiteur de comprendre rapidement :

1. **Ce qu'est TypR**
2. **Pourquoi TypR existe**
3. **Pour quels projets TypR est utile**
4. **Ce que TypR change concrètement par rapport à R**
5. **Comment commencer**

La page ne doit pas chercher à documenter toutes les fonctionnalités du langage. Son rôle est de créer une compréhension immédiate de la proposition de valeur et d'amener le visiteur vers :

* le téléchargement ;
* la documentation ;
* le playground ;
* éventuellement le dépôt GitHub.

---

# 2. Header

## Contenu

À gauche :

**[Logo TypR] TypR**

À droite :

* Documentation
* Playground
* GitHub
* **Download**

Le bouton **Download** est l'action principale de navigation.

## Comportement

Le header reste simple et peu chargé.

Sur mobile, les liens secondaires peuvent être regroupés dans un menu.

---

# 3. Hero

## Objectif

Permettre au visiteur de comprendre TypR en quelques secondes.

## Contenu

### Logo

Le logo TypR doit être clairement visible dans le hero.

Il ne doit pas uniquement apparaître comme une petite icône dans la navigation. Il participe à l'identité du langage.

### Titre

# Type-safe R for long-lived software.

### Sous-titre

TypR is a typed programming language for building R packages, applications and data systems that are easier to understand, maintain and evolve.

### Domaines ciblés

Packages · Shiny applications · Data pipelines · APIs

### Actions

**Primary**

Download TypR

**Secondary**

Get started

Optionnel :

Try the playground

---

## Intention

Le hero doit immédiatement positionner TypR comme :

> un langage destiné à construire des logiciels durables autour de l'écosystème R.

Le message ne doit pas donner l'impression que TypR est simplement une bibliothèque de type hints.

---

# 4. Section — Why TypR?

## Titre

# R is great for working with data.

# TypR helps you build software around it.

## Introduction

Les projets R commencent souvent comme des scripts simples.

Mais certains deviennent :

* des packages ;
* des applications Shiny ;
* des pipelines de données ;
* des APIs ;
* des systèmes utilisés et maintenus pendant plusieurs années.

À cette étape, la structure du code, les contrats entre les composants et la représentation des données deviennent importants.

TypR introduit un système de types et un ensemble d'outils pour rendre ces systèmes plus explicites.

---

## Trois piliers

### Types

**Make data explicit.**

Décrire la forme des données directement dans le code.

Les développeurs et les outils peuvent alors comprendre ce qui circule dans le programme.

---

### Contracts

**Make code predictable.**

Les fonctions, modules et APIs déclarent explicitement ce qu'ils attendent et ce qu'ils produisent.

---

### Tooling

**Let your tools understand your code.**

Le compilateur, le LSP et les autres outils disposent d'informations structurelles sur le programme.

L'objectif est d'améliorer :

* l'autocomplétion ;
* la navigation ;
* la détection d'erreurs ;
* le refactoring ;
* la compréhension du code.

---

# 5. Section principale — From R to TypR

## Objectif

Cette section constitue le cœur de la landing page.

Elle doit montrer **concrètement** ce que TypR apporte.

## Titre

# See R become typed.

## Sous-titre

The same ideas. More explicit contracts.

---

## Interface

Un sélecteur permet de changer de cas d'utilisation :

`R Package` · `Shiny App` · `Data Pipeline` · `API`

Pour chaque cas, l'utilisateur voit :

```text
┌─────────────────────┐     ┌─────────────────────┐
│                     │     │                     │
│         R           │  →  │        TypR         │
│                     │     │                     │
│       code          │     │       code          │
│                     │     │                     │
└─────────────────────┘     └─────────────────────┘
```

Sous les exemples :

> **What changes?**

Une courte explication décrit le bénéfice du système de types.

---

# 6. Use case — R Packages

## Titre

# Build packages with explicit contracts.

## R

```r
summarise_data <- function(data, group) {
  ...
}
```

## TypR

```typr
fn summarise_data(
  data: DataFrame,
  group: String
) -> DataFrame {
  ...
}
```

## Message

A function signature becomes part of the documentation and the contract of your package.

### Bénéfices mis en avant

* comprendre immédiatement les entrées et sorties ;
* améliorer l'autocomplétion ;
* détecter certaines erreurs avant l'exécution ;
* faciliter le refactoring ;
* rendre les APIs de packages plus explicites.

---

# 7. Use case — Shiny applications

## Titre

# Make reactive data easier to reason about.

## Concept

Montrer que TypR peut rendre explicite la structure des données qui traversent une application.

Par exemple :

```typr
type User = {
  id: Int,
  name: String,
  active: Bool
}
```

Puis :

```typr
users: Reactive<User[]>
```

## Message

Know what your application is reacting to.

### Bénéfices

* expliciter la structure des données ;
* faciliter la compréhension des flux réactifs ;
* améliorer le support des outils ;
* réduire l'ambiguïté dans les grandes applications.

---

# 8. Use case — Data pipelines

## Titre

# Make data transformations verifiable.

## Exemple conceptuel

```text
RawData
   ↓
ValidatedData
   ↓
CleanData
   ↓
AggregatedData
```

Chaque étape du pipeline possède une représentation connue.

Le développeur peut alors raisonner sur :

```text
Input type
    ↓
Transformation
    ↓
Output type
```

## Exemple

```typr
users
  |> filter(active)
  |> join(orders)
  |> mutate(total = price * quantity)
```

Les outils peuvent signaler des incohérences comme :

```text
Error: `price` is String
Expected: Number
```

## Message

Make the shape of your data visible across your pipeline.

---

# 9. Use case — APIs

## Titre

# Turn functions into explicit contracts.

## Exemple

```typr
type User = {
  id: Int,
  name: String,
  email: String
}

fn get_user(id: Int) -> User
```

## Représentation

```text
Request
   │
   ▼
  Int
   │
   ▼
get_user
   │
   ▼
 User
```

## Message

Your types describe the contract between your application and its users.

### Évolution possible

À terme, cette représentation pourrait servir à générer ou assister :

* la documentation ;
* la validation ;
* les schémas ;
* les clients ;
* les interfaces entre différents runtimes.

---

# 10. Section — Define your data once

## Titre

# Your data model should not live in people's heads.

## Exemple

```typr
type Customer = {
  id: Int,
  name: String,
  orders: Order[]
}
```

## Visualisation

```text
                 Customer
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
     Package       Shiny         API
```

## Message

Define the shape of your data once and use it throughout your system.

---

# 11. Section — Keep using R

## Objectif

Rassurer les développeurs R.

## Titre

# TypR builds with R, not against it.

## Message

TypR is designed to work alongside the R ecosystem.

Existing R code, packages and projects remain part of the development environment.

## Visualisation

```text
            R ecosystem
                 │
                 ▼
               TypR
                 │
                 ▼
          Generated R code
                 │
                 ▼
             R runtime
```

## Idée clé

TypR ne demande pas aux développeurs d'abandonner R.

Il ajoute une couche de structure permettant de construire des systèmes plus grands et plus durables.

---

# 12. Section — One toolchain

## Titre

# One language. One toolchain.

## Visualisation

```text
              TypR
                │
    ┌───────────┼───────────┐
    │           │           │
    ▼           ▼           ▼
 Compiler      REPL         LSP
    │
    ▼
 Project Manager
```

Évolution possible :

```text
              TypR
                │
    ┌───────────┼────────────┬──────────┐
    │           │            │          │
 Compiler      REPL          LSP        MCP
    │
 Project Manager
```

## Message

The TypR command provides the tools needed to build, explore and maintain TypR projects.

### Commande illustrative

```bash
typr new my-project
cd my-project
typr run
```

---

# 13. Section — Future / Vision

Cette section doit être courte.

Elle ne doit pas donner l'impression que TypR est uniquement une collection de fonctionnalités futures.

## Titre

# A foundation for the next generation of R software.

## Message

TypR starts with types.

But explicit data models and program structure can become the foundation for better tooling, safer APIs and new ways of building applications across multiple runtimes.

## Possibilités illustratives

```text
                 TypR
                   │
        ┌──────────┼──────────┐
        │          │          │
        ▼          ▼          ▼
        R         JS         WASM
```

Cette partie prépare le terrain pour le concept de **multi-runtime compilation**, sans en faire la proposition de valeur principale tant que la fonctionnalité n'est pas encore disponible.

---

# 14. Section finale — Call to Action

## Titre

# Build software that lasts.

## Sous-titre

Start building your next R package, application or data system with TypR.

## Actions

### Primary

**Download TypR**

### Secondary

Read the documentation

### Tertiary

Try the playground

---

# 15. Footer

## Navigation

### TypR

* Documentation
* Playground
* Download
* GitHub

### Community

* Discussions
* Contributing
* Issues

### Ecosystem

* R
* WeData

## Bas de page

```text
TypR
A typed language for long-lived R software.

© 2026 TypR / WeData
```

---

# 16. Principes de design

La homepage doit respecter les principes suivants.

## Show, don't tell

Éviter les longues explications sur le système de types.

Montrer directement :

```text
R code → TypR code
```

---

## Code first

Le code fait partie de l'identité visuelle de la page.

Les exemples doivent être :

* courts ;
* réalistes ;
* compréhensibles sans lire la documentation ;
* représentatifs de vrais projets.

---

## Une idée par section

Chaque section doit répondre à une seule question.

| Section     | Question                                 |
| ----------- | ---------------------------------------- |
| Hero        | Qu'est-ce que TypR ?                     |
| Why TypR?   | Pourquoi en ai-je besoin ?               |
| Use cases   | Qu'est-ce que cela change concrètement ? |
| Data model  | Pourquoi les types sont-ils importants ? |
| R ecosystem | Dois-je abandonner R ?                   |
| Toolchain   | Quels outils sont disponibles ?          |
| Vision      | Où cela peut-il aller ?                  |
| CTA         | Comment commencer ?                      |

---

# 17. Principe narratif global

La page doit raconter cette histoire :

> **R est excellent pour travailler avec les données.**

↓

> **Mais lorsque les scripts deviennent des systèmes, la structure devient importante.**

↓

> **TypR rend cette structure explicite grâce aux types.**

↓

> **Cette information permet aux développeurs et aux outils de mieux comprendre le programme.**

↓

> **Le résultat est un code plus facile à comprendre, maintenir et faire évoluer.**

↓

> **Sans abandonner l'écosystème R.**

↓

> **Download TypR.**
