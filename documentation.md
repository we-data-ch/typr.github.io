Les discussions récentes et les standards actuels dans la communauté dev (notamment autour de frameworks comme le Diátaxis framework) mettent en avant une séparation claire des rôles et l'adaptation à l'intégration des agents IA.
Une excellente documentation de langage de programmation repose aujourd'hui sur deux axes majeurs : l'expérience développeur (DX) pour les humains et l'optimisation pour la consommation par l'IA (LLMs/LSP).
1. La Structure Quadrilatérale (Framework Diátaxis)
Une documentation moderne ne mélange pas les genres. Elle s'articule autour de 4 quadrants distincts :
 * Tutoriels (Apprentissage) : Guidés pas à pas pour les débutants (ex: "Écrire son premier serveur Web").
 * Guides Pratiques / How-To (Résolution de problème) : Recettes concrètes pour accomplir une tâche spécifique (ex: "Comment gérer le multithreading avec un pool de workers").
 * Référence (Information technique) : Description austère, exhaustive et rigoureuse de la syntaxe, des modules de la bibliothèque standard, des types et des fonctions (spécifications de l'API, signatures, complexité théorique).
 * Explications / Architecture (Compréhension) : Articles de fond sur la philosophie du langage, le fonctionnement du compilateur/runtime, la gestion de la mémoire (GC, ownership) et le système de types.
2. Les Piliers de l'Expérience Développeur (DX)
 * Exemples exécutables et testés : Des snippets simples, réalistes et systématiquement intégrés au pipeline de CI (pour éviter que la doc ne périme quand le langage évolue).
 * Moteur de recherche performant : Recherche typée ou floue instantanée (ex: Algolia/Pagefind) capable de filtrer par symbole, méthode ou module.
 * Progression linguistique claire : Différenciation nette entre les concepts de base, les fonctionnalités avancées et les cas d'usage de niche.
 * Tooling & Interactive Playground : Un REPL en ligne (type Go Playground ou Rust Playground) permettant de tester du code directement dans le navigateur sans installation locale.
3. Les Nouvelles Exigences : La Documentation "AI-Ready"
Avec la généralisation des assistants de code, des LSP et de la génération automatique, les exigences d'une bonne documentation ont évolué :
 * Typage explicite et annotations sans ambiguïté : La référence doit préciser les contraintes de types, les invariants et la gestion des erreurs (exceptions vs types Result/Option) pour limiter les hallucinations des assistants.
 * Fichiers récapitulatifs pour le contexte (ex: llms.txt) : La mise à disposition de versions agrégées et structurées en Markdown brut permet de charger facilement la spec du langage dans la fenêtre de contexte d'un LLM.
 * Documentations d'intention : Expliquer pourquoi une décision de design a été prise (ex: immutabilité par défaut), permettant aux outils d'analyse statique et aux agents d'écrire du code idiomatique.
 * 
