# Plan phase 2 — outillage de la documentation TypR

> **Objectif** : la phase 1 (`plan.md`, actions 1-11 ✅ toutes terminées) a restructuré le
> *contenu* selon Diátaxis — 33 pages. Cette phase 2 s'attaque à la *plateforme* : recherche,
> garantie de fraîcheur des exemples, consommation par les LLM, canaux de discussion et de
> proposition.
>
> Rédigé le **2026-09-09** à l'issue d'une discussion avec Fabrice. Les actions 1 à 7
> sont implémentées ; les suivantes sont à faire par une session ultérieure. Les priorités
> reflètent un arbitrage explicite valeur/coût, pas un ordre de préférence esthétique.

---

## 0. Contexte et contraintes

**Le site est statique, déployé sur GitHub Pages.** C'est *la* contrainte structurante : tout
ce qui a un état (propositions, comptes, messages, feedback) doit soit s'appuyer sur GitHub
lui-même, soit vivre chez un tiers. Aucune solution avec backend maison n'est envisageable.

**La CI sait déjà parler au dépôt du compilateur.** `.github/workflows/deploy.yml` :
- se déclenche sur `push`/`pull_request` sur `main`, sur `workflow_dispatch`, **et sur un
  `repository_dispatch` de type `typr-release`** émis par la release du compilateur ;
- récupère déjà des fichiers depuis `we-data-ch/typr@develop` via `raw.githubusercontent.com`
  (la version dans `Cargo.toml`, la grammaire `typr.tmLanguage.json`) ;
- sur une PR, s'arrête après le build sans déployer.

C'est le point d'ancrage des actions 2 et 6 — le mécanisme existe, il s'agit de l'étendre.

**Le compilateur est dans le même workspace mais dans un autre dépôt** :
`../typR/typr` (crates Rust, binaire `typr`). Voir `../CLAUDE.md` pour la carte du workspace
et `../typR/ai_context/CLAUDE.md` pour l'architecture du compilateur.

**Volumétrie actuelle des exemples** : 225 blocs ` ```typr ` répartis sur 36 fichiers
(`docs/`, `blog/`, `src/pages/`), dont 48 marqués `noplayground` (tableaux de syntaxe,
exemples volontairement invalides, projets `mod` multi-fichiers, formes que le parser ne sait
pas encore lire) — donc **177 blocs qui passent un `typr check`**, vérifiés en CI depuis
l'action 2. (Le compte était de 47/178 à la rédaction : le 178ᵉ était un exemple
volontairement invalide qui n'avait jamais été marqué — c'est le job de l'action 2 qui l'a
trouvé.)

> ⚠️ **Une note de `plan.md` est périmée.** Son action 7 décrit `typr` comme un alias de la
> grammaire Prism `r`, via un `src/theme/prism-include-languages.js` swizzlé. Ce n'est plus
> vrai : la coloration passe désormais par **Shiki** au moment du build
> (`src/syntax/shiki.ts`, branché en `beforeDefaultRehypePlugins`), à partir de la grammaire
> générée par le compilateur (`syntaxes/typr.tmLanguage.json`). Prism ne colore plus rien —
> il ne reste de ses « thèmes » dans `docusaurus.config.ts` que `plain`, dont Docusaurus tire
> le fond du conteneur. Le fichier `prism-include-languages.js` n'existe plus.

---

## 1. Actions par priorité

| # | Action | Priorité | Statut |
|---|--------|----------|--------|
| 1 | Barre de recherche plein-texte locale | Haute | ✅ Fait (2026-09-09) |
| 2 | Vérifier les blocs ` ```typr ` contre le vrai compilateur en CI | **Haute** | ✅ Fait (2026-09-09) |
| 3 | Rendre la doc « AI-ready » : `llms.txt`, copie Markdown, MCP | **Haute** | ✅ Fait (2026-09-09) — sauf MCP, voir §2.3 |
| 4 | Activer GitHub Discussions et le lier depuis le site | Haute | ✅ Fait (2026-09-09) |
| 5 | Processus RFC dans `we-data-ch/typr` + section « Design proposals » | Moyenne | ✅ Fait (2026-09-09) |
| 6 | Générer les pages de référence depuis `typr syntax --json` | Moyenne | ✅ Fait (2026-09-09) |
| 7 | Analytics respectueuses de la vie privée | Moyenne | ✅ Fait (2026-09-09) — en sommeil, voir §2.7 |
| 8 | Lien « signaler un problème sur cette page » | Basse | ✅ Fait (2026-09-09) |
| 9 | Versionnement de la doc | Basse | ⏸ Différé — décider le schéma d'URL maintenant |
| 10 | Section « TypR by example » | Basse | 🚧 À faire |
| 11 | Internationalisation française | Basse | ⏸ Optionnel |
| — | Assistant IA conversationnel (widget de chat) | — | ❌ Écarté — voir §2.3 |

---

## 2. Détail des actions

### 2.1 — ✅ Action 1 : barre de recherche locale *(fait le 2026-09-09)*

**Choix : `@easyops-cn/docusaurus-search-local`, pas Algolia DocSearch.** L'index lunr est
construit pendant `docusaurus build` et servi en statique : aucun service externe, aucune clé
d'API, aucun dossier de candidature, et ça fonctionne hors ligne. Algolia reste envisageable
plus tard (voir action 7).

Changements effectués :
- `docusaurus.config.ts` — bloc `themes` avant `themeConfig` : indexation docs + blog + pages,
  `highlightSearchTermsOnTargetPage`, `explicitSearchResultPath` (page `/search` dédiée),
  `hashed: true` ;
- `docusaurus.config.ts` — item `{type: 'search', position: 'right'}` ajouté **après** le lien
  GitHub dans la navbar, pour maîtriser le placement plutôt que de laisser le thème l'insérer
  en bout de liste ;
- `package.json` / `package-lock.json` — la dépendance.

Vérifié : `npm run typecheck` et `npm run build` passent ; `build/search-index.json` (1,2 Mo,
chargé en *lazy* uniquement à l'ouverture de la recherche) et `build/search/` sont générés ;
le markup de la barre est présent dans le HTML. En `npm start` le serveur répond bien sur
`/search-index.json` et `/search`, mais **tester de préférence avec `npm run build && npm run
serve`**, qui est le mode nominal du plugin.

> Point d'attention pour plus tard : la taille de l'index croît avec le contenu. Au-delà de
> ~3-4 Mo, envisager `indexBlog: false` ou le passage à Algolia.

---

### 2.2 — ✅ Action 2 : vérifier les blocs de code en CI *(fait le 2026-09-09)*

**Le problème.** 178 blocs ` ```typr ` étaient censés compiler, et **rien ne le vérifiait**. Un
changement de syntaxe dans le compilateur pouvait rendre la doc fausse sans qu'aucun build
n'échoue. Pour la documentation d'un *langage*, c'est le risque de correction n°1 : une doc
qui ment coûte plus cher qu'une doc absente. C'est aussi un objectif déjà formulé dans
`documentation.md` (« Exemples exécutables et testés … systématiquement intégrés au pipeline
de CI »).

**Ce qui a été fait.**

- `scripts/check-typr-blocks.mjs` — sans dépendance, donc exécutable en CI sans `npm ci`.
  Il parcourt `docs/`, `blog/` et `src/pages/`, extrait chaque bloc ` ```typr ` non marqué
  `noplayground`, l'écrit dans un fichier temporaire, lui applique `typr check`, et **réécrit
  les positions du diagnostic en lignes du fichier Markdown** pour que le message soit
  cliquable. Sortie 0 / 1 / 2 (2 = le script lui-même ne peut pas tourner). Options :
  `--typr`, `--only`, `--jobs`, `--list`, `--noplayground`, `--keep`.
- `npm run check:examples` — la même chose en local.
- `.github/workflows/deploy.yml` — job `examples`, **bloquant**, dont `build` dépend
  (`needs: examples`). Il télécharge le binaire de la dernière release de `we-data-ch/typr` ;
  sur un `repository_dispatch: typr-release`, il vise directement la version du
  `client_payload` plutôt que « latest », qui peut ne pas encore avoir basculé.
- `.github/workflows/examples-develop.yml` — le préavis : compile `typr` depuis
  `we-data-ch/typr@develop` et rejoue le script, en `::warning` seulement, une fois par nuit
  (`continue-on-error`). Quotidien plutôt qu'à chaque push : la compilation Rust dure
  plusieurs minutes et ne doit pas taxer les PR de contenu.

**Deux constats de mise en œuvre :**

- **`typr check` n'a pas besoin de R.** Il se contente d'un avertissement quand `Rscript` est
  absent — vérifié en environnement sans R. Rien à installer sur le runner.
- **Le premier `typr check` écrit `context.json` et `std.ty` dans le répertoire courant** (le
  préchargement de la bibliothèque standard). Le script lance donc le premier bloc seul avant
  de paralléliser les autres, pour qu'aucune course n'écrive ces fichiers à plusieurs. Coût
  total : ~3 s pour 177 blocs.

**Attention aux blocs auto-suffisants.** Les blocs destinés au playground sont volontairement
autonomes : quand un exemple a besoin de définitions d'un bloc précédent de la page, elles
sont répétées dans un préambule `# --- setup, ... ---`. Le script vérifie donc chaque bloc
**isolément**, jamais en concaténant les blocs d'une page.

**Première prise.** Le job a immédiatement trouvé un bloc faux :
`docs/tutorials/typr-for-dummies.md:51`, l'exemple « *TypR won't* » qui montre exprès un
réassignement interdit — il envoyait le lecteur du playground droit dans une erreur. C'est ce
bloc qui a motivé le corollaire ci-dessous.

**Corollaire — le mot-clé `compile_fail`.** Marquer ce bloc `noplayground` réglait le
symptôme et perdait l'information : le lecteur ne voyait toujours pas que l'exemple était un
contre-exemple, et le bloc sortait de toute vérification. D'où l'emprunt à rustdoc, fait dans
la foulée :

| | Lecteur | CI |
|---|---|---|
| `noplayground` | pas de bouton | rien |
| `compile_fail` | bandeau « This example does not compile » + bouton | le bloc **doit** échouer |

C'est le couple qui fait la valeur. Le bandeau (`src/components/CompileFailNotice`, posé par
le swizzle `CodeBlock/Content/Element` qui est le dernier à voir la metastring) empêche qu'un
contre-exemple passe pour un exemple. L'oracle inversé empêche qu'il pourrisse : le jour où le
langage change et où le bloc se met à compiler, la CI le dit — sans quoi le bandeau mentirait
sans que personne s'en aperçoive. `compile_fail` l'emporte sur `noplayground` : c'est une
assertion, pas une dispense.

Le bouton « playground » est conservé sur un `compile_fail` : le bandeau a prévenu, et cliquer
donne le message exact du compilateur — l'erreur *est* la démonstration. (`autorun` y est
ignoré : la compilation s'arrête avant.)

Trois blocs reclassés dans la foulée : `docs/tutorials/typr-for-dummies.md:51` et
`docs/reference/records.md:70` en `compile_fail`, et `docs/philosophy/beautiful_syntax.md:24`
— marqué `noplayground` alors qu'il compile et se dit lui-même « all valid » — rendu à la
vérification et au playground. Bilan : **178 blocs vérifiés, 2 contre-exemples, 45 exclus**.

**Ce qui reste.** Les 45 `noplayground` sont une dette : `npm run check:examples
-- --noplayground` en sort le tableau Markdown, **calculé et pas tenu à la main** — un tableau
figé se serait périmé dès la PR suivante. Un tri manuel a montré qu'ils se répartissent en
trois familles : des fragments de syntaxe (types isolés, corps en `/* ... */`, projets `mod`
multi-fichiers) qui doivent rester `noplayground` ; quelques blocs mixtes qui montrent côte à
côte l'interdit et l'autorisé, et qu'il faudrait couper en deux pour que `compile_fail` ait un
sens ; et **six blocs présentés comme valides qui ne compilent pas**.

Ces six-là ont été examinés un par un et vérifiés contre `typr` 0.5.10 : quatre sont des
erreurs de doc, deux sont des trous du compilateur (types singleton `bool`/`num`, et types de
fonction comparés nom de paramètre compris). Le détail, les repros et les corrections
proposées sont dans **`doc_correction.md`** à la racine — aucun n'est corrigé, l'un d'eux
(`philosophy/intro.md`) demande d'abord une décision de langage.

---

### 2.3 — ✅ Action 3 : rendre la doc « AI-ready » *(fait le 2026-09-09)*

**Pourquoi pas un widget de chat.** Kapa.ai / Inkeep / Mendable font très bien le travail et
ont des offres open-source, mais le rapport valeur/entretien est mauvais tant que le trafic
est faible — et surtout ça répond au mauvais problème. Le vrai problème de TypR, c'est que
**les LLM ne connaissent pas le langage** : à qui demande du TypR, un assistant rend du R ou
du Julia légèrement déguisé. Un widget aide le visiteur déjà présent sur le site ; ce qu'il
faut, c'est aider l'utilisateur **là où il écrit du TypR, dans son éditeur**. À rediscuter si
le trafic décolle.

**À implémenter, par ordre de coût croissant :**

1. **`llms.txt` et `llms-full.txt` générés au build** — un plugin Docusaurus le fait
   (`docusaurus-plugin-llms` ou équivalent ; vérifier la compatibilité Docusaurus 3.8 avant
   de l'ajouter). Un index structuré des pages plus une version agrégée en Markdown brut,
   chargeable dans une fenêtre de contexte. C'est déjà identifié comme une exigence dans
   `documentation.md` §3.
2. **Un bouton « copier la page en Markdown »** dans l'en-tête de chaque page de doc — à faire
   par swizzle, dans l'esprit de ce qui existe déjà sous `src/theme/CodeBlock/`.
3. **Un serveur MCP de la documentation**, plus tard : il exposerait la recherche et la
   lecture des pages à un assistant. À ne considérer qu'une fois 1 et 2 en place.

**Levier maximal, à ne pas oublier :** ce qui limite le plus les hallucinations, c'est la
qualité de la référence elle-même — signatures explicites, invariants, gestion d'erreurs — et
les pages « d'intention » (`philosophy/`) qui expliquent *pourquoi* une décision de design a
été prise. Elles existent déjà : les garder à jour sert autant les LLM que les humains.

**Ce qui a été fait (points 1 et 2 ; le 3 reste à faire).**

- **`docusaurus-plugin-llms` 0.6.0**, en `devDependency`. Compatibilité vérifiée avant l'ajout
  (peer `@docusaurus/core ^3.0.0`, trois dépendances : `gray-matter`, `minimatch`, `yaml`).
  Écrit en `postBuild`, donc **au `npm run build` seulement** — rien en `npm start`.
- **Trois sorties**, et c'est la troisième qui porte la valeur pratique :
  `llms.txt` (l'index, une ligne par page), `llms-full.txt` (la doc entière, 176 Ko ≈ 45 k
  jetons, chargeable d'un bloc) et, surtout, **le Markdown de chaque page à côté de son HTML** :
  `/docs/intro` ↔ `/docs/intro.md`. C'est la convention qui s'installe, et c'est ce qui rend le
  point 2 gratuit.
- **Bouton « Copy as Markdown »** (`src/components/CopyPageButton`), posé sur la ligne du fil
  d'Ariane par un swizzle de `@theme/DocItem/Layout`. Il ne transporte rien dans le bundle : il
  va chercher le `.md` de la page au clic. Un lien « View » à côté ouvre la source brute — c'est
  souvent l'URL qu'on veut donner à un assistant, pas le texte.
  Piège traité : le serveur de dev répond **200 + du HTML** pour une route inconnue, donc sans
  garde-fou le bouton mettrait la page d'accueil dans le presse-papier. Il vérifie le premier
  caractère de la réponse et affiche « Unavailable » plutôt que de mentir.
- **Un préambule commun aux deux fichiers** (`src/llms/preamble.md`) : ce que TypR est, l'avis
  explicite qu'un modèle ne le connaît pas et doit s'abstenir plutôt qu'extrapoler, et surtout
  **la convention des fences** — `typr` compile et c'est vérifié en CI, `typr compile_fail` est
  un contre-exemple à ne jamais présenter comme valide, `typr noplayground` est un fragment. Le
  plugin recopie les metastrings telles quelles : sans cette clé de lecture, `llms-full.txt`
  apprendrait les contre-exemples de l'action 2 comme du TypR correct.
- **L'ordre de lecture est dérivé de `sidebars.ts`** (`src/llms/order.ts`), pas réécrit à la
  main : la barre latérale *est* déjà l'ordre Diátaxis décidé pour les humains, et une seconde
  liste aurait divergé dès la page suivante. Les pages hors barre latérale tombent à la fin.
- **Le blog est exclu.** Ces fichiers servent à faire écrire du TypR correct ; les billets sont
  datés et certains portent encore des fences ` ```julia `. Leur matière de fond est reprise
  dans `docs/philosophy/`.
- **`description:` ajouté au front matter des 35 pages qui n'en avaient pas.** Ce n'était pas
  cosmétique : `llms.txt` n'est qu'un titre plus une ligne par page, et faute de `description`
  le plugin prenait le premier *paragraphe* puis le coupait à la première fin de ligne — donc en
  plein milieu d'une phrase, la doc étant rompue à 80 colonnes. Les mêmes descriptions servent
  la balise `<meta name="description">` et les extraits de recherche.
- **Question 33 de la FAQ** (« How do I get an AI assistant to write correct TypR? ») et un lien
  `llms.txt` dans le pied de page : sans point d'entrée, un fichier que personne ne connaît ne
  sert à rien.

**Un défaut connu, laissé tel quel.** Les dix pages qui déclarent un `title:` en front matter
différent de leur `<h1>` (les how-to et les tutoriels, dont le titre de barre latérale est plus
court que le titre de page) produisent deux titres consécutifs dans `llms-full.txt` : le plugin
ne déduplique que sur égalité exacte. Aligner les deux imposerait de réécrire des titres de
pages visibles — pour deux lignes redondantes qui n'induisent personne en erreur.

**Reste à faire : le serveur MCP** (point 3 ci-dessus), qui exposerait recherche et lecture des
pages à un assistant. Il a maintenant sa matière première : les `.md` par page et `llms.txt`
sont exactement ce qu'un tel serveur servirait.

**Vérifié :** `npm run typecheck`, `npm run build` et `npm run check:examples` passent ;
`build/llms.txt` liste les 36 pages dans l'ordre de la barre latérale, `build/llms-full.txt` les
contient toutes, et `curl` sur `/docs/intro.md` renvoie bien `text/markdown`.

---

### 2.4 — ✅ Action 4 : GitHub Discussions *(fait le 2026-09-09)*

Le canal d'aide canonique, gratuit, indexé par Google, et voisin des issues.

**Constat de départ : Discussions était déjà activé** sur `we-data-ch/typr`, avec le jeu de
catégories par défaut — donc **Q&A** (répondable, la seule qui permette de marquer une réponse),
**Ideas** et **Show and tell**, les trois demandées, plus Announcements, General et Polls.
Un seul fil existant (le message de bienvenue automatique). Rien à créer : les catégories par
défaut ont été gardées telles quelles plutôt que rognées — une catégorie inutilisée ne coûte
rien, alors qu'en supprimer une déplace les fils qu'elle contiendrait plus tard.

Ce qui manquait était donc **entièrement côté site** : le canal existait et personne ne pouvait
le trouver depuis la documentation (une seule mention, en question 35 de la FAQ).

**Ce qui a été fait.**

- **Navbar** (`docusaurus.config.ts`) — un item `Discussions` à droite, avant `GitHub`. Devant
  plutôt que derrière : le lecteur qui bloque cherche de l'aide, pas le dépôt.
- **Footer, section « Community »** — elle ne contenait que R-bloggers et GitHub. Elle ouvre
  maintenant sur **une porte par intention** plutôt que sur un lien « Discussions » unique :
  *Ask a question* → `categories/q-a`, *Share an idea* → `categories/ideas`, *Show and tell* →
  `categories/show-and-tell`. Les catégories existent pour trier ; les exposer à l'entrée évite
  la question posée au mauvais endroit, qui est le premier coût d'un forum. (Au passage,
  l'indentation du bloc, qui était cassée, a été remise d'aplomb.)
- **`docs/faq.md`** — deux renvois. Un en tête de page, juste après le chapeau (« *Not answered
  here?* »), parce que c'est là qu'on se trouve quand on constate que sa question n'y est pas ;
  et la **question 35 réécrite** : elle listait trois liens à plat, elle explique maintenant à
  quoi sert chaque catégorie et **où passe la frontière avec les issues** (un repro → une issue ;
  dans le doute → une discussion, convertible ensuite). Sans cette frontière, le tri retombe sur
  le mainteneur.
- **`docs/intro.md`** — une ligne en fin de « Where to go next ». C'est la page d'arrivée du
  débutant, et la fin du tutoriel est exactement le moment où l'on est bloqué.

Vérifié : `npm run typecheck` et `npm run build` passent (`onBrokenLinks: 'throw'`, donc le build
est aussi le contrôle des liens), et les trois URL de catégorie répondent 200.

**Un Discord ou un Zulip en plus seulement si tu es sûr de l'animer** — un salon mort fait plus
de mal que pas de salon du tout. Côté présence communautaire hors site : Posit Community et
Bluesky/Mastodon `#rstats` sont les endroits où se trouve le public R.

**Ce qui reste, et qui ne relève pas du code.** Un forum vide ne s'amorce pas tout seul : les
premières questions viennent d'être posées par le mainteneur (les trois ou quatre questions qu'on
vous pose déjà par e-mail, reposées en public et répondues), et une réponse rapide aux premiers
fils décide de la suite. C'est aussi le vivier de l'action 5 : une idée qui revient en **Ideas**
est le signal qu'il faut en faire une RFC.

---

### 2.5 — ✅ Action 5 : processus RFC et section « Design proposals » *(fait le 2026-09-09)*

**Le problème.** Les décisions de langage se prenaient quelque part entre des notes de
workspace en français (`../typR/spécifications/`, `../typR/ai_context/*.md`), des issues et la
tête du mainteneur. Rien de public, donc rien d'argumentable : un contributeur qui n'est pas
d'accord avec un choix de conception n'avait pas d'endroit où le dire, et six mois plus tard
« pourquoi TypR fait comme ça ? » n'avait pour réponse qu'un souvenir.

**Ce qui a été fait — dans `we-data-ch/typr`** (les propositions se relisent comme du code,
donc elles vivent avec le compilateur, pas ici) :

- **`rfcs/README.md`** — le processus. Il tient sur une frontière, énoncée telle quelle :
  *si la réponse à « que fait TypR ici ? » change, c'est une RFC ; si le compilateur ne fait
  que rattraper une réponse déjà donnée, c'est une issue.* Le reste en découle — un tableau
  à trois portes (issue / Ideas / RFC), le cycle de vie, et les critères qui ne sont **pas**
  ceux de Rust : le R engendré reste lisible, le R qui marche continue de marcher, on dit ce
  que fait le code non annoté, les messages d'erreur font partie du design.
- **`rfcs/0000-template.md`** — le gabarit. Sections classiques (résumé, motivation,
  explication guide/référence, alternatives, art antérieur) plus trois rubriques propres à
  TypR : **le R émis** pour chaque exemple, **le typage graduel** (que devient le code non
  annoté ?), et une **liste de vérification d'implémentation** qui renvoie aux invariants
  existants — un cas dans `cases/`, `typr syntax --write` si un lexème bouge, `syntaxe.md`
  synchronisé dans ses deux copies, la PR de doc dans la même release.
- **Numérotation = numéro de la PR.** Rien à réserver, rien à renuméroter, pas deux
  propositions qui se disputent le `0003`. Un fichier `0000-…` est une RFC en cours ; un
  fichier numéroté est une RFC acceptée.
- **`rfcs/` est l'ensemble accepté.** Une RFC refusée n'y entre pas : sa PR est close, avec le
  texte et le raisonnement lisibles dedans. C'est cet invariant qui permet au site de lister
  l'état des propositions **sans tenir une seconde liste à la main** — même réflexe que
  l'inventaire `--noplayground` de l'action 2.
- **`CONTRIBUTING.md`** — une section « Proposer un changement de langage (RFC) », en français
  comme le reste du fichier. Au passage, le paragraphe « les blocs de code TypR ne sont pas
  encore vérifiés contre le compilateur » a été corrigé : il décrivait le monde d'avant
  l'action 2, dans le fichier même qui explique aux contributeurs ce que la CI vérifie.
- **`.github/pull_request_template.md`** — une entrée « Si cette PR est une RFC », qui rappelle
  de ne pas force-pusher par-dessus une relecture (les fils se posent sur les phrases, pas sur
  des lignes de code).
- **`rfcs/0000-calling-untyped-r-functions.md`** — une première RFC en brouillon, tirée du
  point C de `doc_correction.md` : `function(a, b)` se définit mais ne s'appelle pas, alors que
  `docs/philosophy/intro.md` la présente comme « also a valid TypR code ». Le fond a été vérifié
  contre `typr` 0.5.10 pendant la rédaction, et la vérification a **élargi le diagnostic** :
  `Type::UnknownFunction` est un placeholder d'arité **zéro**, donc le trou ne touche pas
  seulement les `function(...)` de l'utilisateur mais **tous les noms de base R préchargés non
  typés** (`Position(1, 2)` échoue exactement pareil, `Position()` passe). La transpilation,
  elle, est déjà correcte : seul le type checker bloque. C'est ce qui rend la question
  arbitrable — ce n'était pas un design, c'était un placeholder qui n'a jamais reçu de liste de
  paramètres.

**Ce qui a été fait — côté site :**

- **`docs/philosophy/design-proposals.md`** — genre Diátaxis *explication*, donc sous
  `philosophy/` et surtout pas dans `reference/`. Elle explique les trois portes, le cycle de
  vie, et pointe vers **trois requêtes GitHub vivantes** (le dossier `rfcs/`, les PR ouvertes
  `rfc-draft`, les PR closes `rfc-rejected`) plutôt que vers un tableau recopié qui aurait
  divergé dès la première RFC. Elle dit aussi qu'**acceptée ≠ livrée**, avec le champ
  `Implemented in:` de l'en-tête comme seul juge.
- **`sidebars.ts`** — la page entre dans la catégorie Philosophy, donc aussi dans `llms.txt` à
  sa place (l'ordre vient de la barre latérale, action 3).
- **`docs/faq.md` question 35** — une quatrième porte après Q&A / Ideas / issues, avec la même
  frontière que le README des RFC. La question 35 est devenue le point de tri complet du projet.
- **`docs/philosophy/intro.md`** — une section finale « Disagreeing with any of this ». C'est la
  page qui porte les partis pris ; c'est là qu'on est quand on n'est pas d'accord.

**Les trois étiquettes existent** sur le dépôt, créées le 2026-09-09 :
`rfc-draft` (vert), `rfc-accepted` (bleu), `rfc-rejected` (rouge).

**Ce qui reste, et qui n'est pas du code.** Comme pour les Discussions de l'action 4, un
processus vide ne s'amorce pas tout seul : la RFC en brouillon est là pour ça — elle donne au
processus sa première PR, et à `doc_correction.md` §C la décision qui le débloque. Elle attend
dans l'arbre de travail de `we-data-ch/typr`, non commitée ; c'est sa PR qui lui donnera son
numéro.

**Vérifié :** `npm run typecheck`, `npm run build` et `npm run check:examples` passent
(181 blocs + 3 contre-exemples), et la nouvelle page apparaît dans `build/llms.txt` à sa place
dans l'ordre Diátaxis.

---

### 2.6 — ✅ Action 6 : générer les pages de référence depuis le compilateur *(fait le 2026-09-09)*

**Le problème.** `typr syntax --json` est **déjà la source de vérité unique** des grammaires
d'éditeur (`crates/typr-core/src/components/syntax/mod.rs`, avec deux tests qui verrouillent
l'invariant dans les deux sens). Les tableaux d'opérateurs et de mots-clés de
`docs/reference/operators.md` et `docs/reference/lexicon.md` étaient, eux, recopiés à la main —
la sixième copie de la syntaxe, celle que le manifeste n'avait pas encore absorbée. Elle avait
déjà dérivé : le tableau de priorités annonçait `@` comme **produit matriciel**, alors que
`@`/`@@` ont été retirés du tokenizer (`operators.rs::op()`) et que le manifeste ne connaît que
`+ - * / %`.

**Ce qui a été fait.**

- **`syntaxes/typr.syntax.json`** — le manifeste, commité à côté de la grammaire, et poussé par
  la release au même titre qu'elle (voir plus bas). Le build ne dépend donc d'aucun réseau : une
  PR, un `npm run build` hors ligne et la CI lisent le même fichier.
- **`scripts/gen-syntax-reference.mjs`** — sans dépendance, comme le script de l'action 2. Il
  dérive du manifeste les inventaires des deux pages : mots-clés de contrôle et de déclaration,
  entêtes de blocs, annotations, constantes, types primitifs et intégrés, constructeurs, sigils
  de kind, et tout l'inventaire des opérateurs et de la ponctuation.
- **`npm run syntax:reference`** (réécrit), **`npm run check:syntax`** (échoue sur dérive), et
  `prestart`/`prebuild` qui régénèrent — un `npm run build` ne peut pas publier un tableau
  périmé, même si le commit l'était.

**La décision de fond : le manifeste ne porte pas la prose.** Il dit *quels lexèmes existent*,
jamais ce qu'ils veulent dire. Une table de mots-clés nus aurait été une régression documentaire.
Les deux moitiés sont donc recollées sous une **clôture à double sens**, dans
`scripts/syntax-glossary.mjs` (une glose par lexème, plus les rangs de priorité, qui vivent dans
`Op::get_binding_power` et pas dans le manifeste) :

| Situation | Effet |
|---|---|
| Un lexème du manifeste sans glose | échec — mot-clé ajouté au langage, jamais documenté |
| Une glose sans lexème | échec — mot-clé retiré du langage, toujours documenté |
| Une *règle* nouvelle, ni glosée ni exemptée | échec — une règle ne peut pas passer inaperçue |

C'est exactement la paire de tests du compilateur (`components::syntax::tests`) transportée
jusqu'à la doc. Ajouter un mot-clé à TypR sans écrire sa ligne de documentation casse désormais
la CI de ce dépôt. Les exemptions existent (les règles regex : chaînes, nombres, génériques,
commentaires) mais sont **déclarées une par une**, comme la liste `NOT_A_LEXEME` du compilateur.

**Pourquoi pas un partiel MDX importé.** C'était le plan initial ; il aurait cassé l'action 3.
`docusaurus-plugin-llms` lit le **Markdown source**, pas le rendu : un `<Operators />` importé
aurait laissé `llms-full.txt` avec un composant JSX à la place des tableaux — c'est-à-dire
retiré l'inventaire de la syntaxe précisément du fichier destiné aux modèles qui ne connaissent
pas le langage. Le texte généré est donc écrit **dans les pages elles-mêmes**, entre deux
marqueurs HTML.

**Côté release du compilateur.** Le job `grammar` recopiait `typr.tmLanguage.json` vers les deux
sites. Il pousse maintenant aussi le manifeste vers la doc — et lui seul, le playground ne lisant
que la grammaire TextMate via Shiki. Le manifeste n'étant *pas un fichier du dépôt* (il n'existe
qu'en sortie de `typr syntax --json`), le job prend le binaire de la release pour le rendre, comme
le font déjà `docker` et `rstudio` ; d'où `needs: [verify, release]`. Ce changement attend sur la
branche locale **`syntax-manifest-to-docs`** de `we-data-ch/typr` (non poussée) : `release.yml`
n'existe que sur `main`, qui est release-only.

**Trois contrôles CI ajoutés à `deploy.yml`** :

- `check:syntax`, **bloquant** — il ne dépend ni du réseau ni d'une release, seulement de deux
  fichiers du dépôt ;
- le manifeste commité comparé à `typr syntax --json` du compilateur de référence (le binaire est
  déjà téléchargé par le job `examples`) — simple avertissement, comme pour la grammaire : entre
  deux releases la copie a le droit d'être en retard. Tant que la release installée ne connaît pas
  `typr syntax`, l'étape émet un `::notice` et passe ;
- **`syntaxe.md` comparé à celui du compilateur** — le petit gain facile identifié ici. Les deux
  copies sont identiques aujourd'hui ; deux copies d'un même fichier finissent toujours par
  diverger si personne ne regarde.

**Ce qui reste.** Le manifeste gagnerait à avoir un chemin canonique dans le dépôt du compilateur
(`typr syntax --write` ne rend aujourd'hui que les grammaires), ce qui lui donnerait le même
verrou `cargo test` qu'elles et permettrait à la doc de le comparer par `raw.githubusercontent.com`
comme la grammaire, sans binaire. Petit changement Rust, à faire quand le module `syntax` aura
rejoint `develop` — il n'est pour l'instant que sur `main`.

**Vérifié :** `npm run typecheck`, `npm run build`, `npm run check:examples` (181 blocs + 3
contre-exemples) et `npm run check:syntax` passent ; les trois modes d'échec de la clôture ont été
déclenchés sur un manifeste trafiqué ; les `|` des opérateurs (`|>`, `||`, `|`) sont correctement
échappés et rendus dans le HTML ; les tableaux générés apparaissent bien dans `llms-full.txt` et
dans `/docs/reference/operators.md`.

---

### 2.7 — ✅ Action 7 : analytics respectueuses de la vie privée *(fait le 2026-09-09)*

**Ce qu'on cherche à savoir, et rien d'autre.** Quelles pages sont lues, et —
maintenant que la recherche existe — **quelles recherches ne renvoient aucun
résultat**. La seconde est la meilleure source d'idées de roadmap documentaire
qui soit : elle dit ce que les lecteurs viennent chercher et ne trouvent pas,
ce qu'aucun compteur de pages vues ne peut révéler.

**Le choix : GoatCounter.** Gratuit pour l'open-source, hébergé, sans cookie et
sans identifiant persistant — donc **sans bandeau de consentement**, qui est le
vrai coût caché d'une mesure d'audience. Plausible Cloud (9 €/mois) a une
meilleure interface ; sa version auto-hébergeable demande un VPS, Postgres et
ClickHouse, ce qui n'a aucun sens pour un site statique. Le palier gratuit
d'Umami saute au moment précis où le trafic décolle, c'est-à-dire au moment où
l'on ne veut pas perdre son historique.

**La décision de fond : en sommeil par défaut.** L'adresse de collecte vient de
la variable d'environnement `GOATCOUNTER_ENDPOINT`, lue au build et recopiée
dans `customFields`. Tant qu'elle est vide — `npm start`, un build local, une
PR — aucun script tiers n'est injecté et aucune requête n'est émise. Il n'y a
pas de « mode désactivé » à maintenir : il n'y a rien à désactiver. Allumer la
mesure, c'est définir une **variable de dépôt** (pas un secret : la valeur finit
dans le JavaScript public du site, la ranger dans `secrets` ne masquerait que
les journaux de CI en laissant croire à une confidentialité qui n'existe pas) et
redéployer. Aucun changement de code.

**Ce qui a été fait.**

- **`src/analytics/goatcounter.ts`** — le transport. Chargement paresseux de
  `count.js` au premier hit réel, donc après l'hydratation ; **Do Not Track
  honoré explicitement** (count.js ne le fait plus de lui-même, et comme c'est
  nous qui décidons de le charger, c'est à nous de ne pas le charger) ; tout
  échec avalé — un bloqueur, un réseau coupé, un compte supprimé ne doivent ni
  casser la page ni polluer la console.
- **`src/analytics/client.ts`** — les pages vues, en `clientModules`. Le point
  non évident : **count.js compte au chargement du script, ce qui ne se produit
  qu'une fois dans une SPA.** Sans `no_onload` + un comptage manuel sur
  `onRouteDidUpdate`, on ne mesurerait que les pages d'atterrissage. Le baseUrl
  est retiré du chemin — le tableau de bord n'a que faire de le répéter, et
  l'historique survit ainsi à un futur domaine propre. Une ancre du sommaire et
  le `?q=` réécrit à chaque frappe changent aussi la route : seul le `pathname`
  compte.
- **`src/theme/SearchPage/`** — l'évènement de recherche. Le rendu n'est pas
  touché, on enveloppe l'original.

**Le point délicat : distinguer « zéro résultat » de « pas encore de résultat ».**
Le composant de `@easyops-cn/docusaurus-search-local` garde ses résultats dans un
`useState` privé, sans contexte ni rappel, et cherche dans un web worker dont le
module n'a pas d'alias `@theme/` : l'éjecter en entier pour connaître un nombre
de résultats coûterait 200 lignes à resynchroniser à chaque montée de version du
plugin. On lit donc son rendu — **par la structure, jamais par le texte** :
compter des `<article>` survit à une traduction, pas la recherche d'un « No
documents were found », et les classes sont des modules CSS aux noms hachés.

Mais tant que l'index se télécharge, la page ne rend aucun `<article>` — un
compte naïf y verrait une recherche infructueuse. Or le composant ne rend son
paragraphe de décompte **qu'une fois les résultats connus** : la présence d'un
`<p>` dans la zone de résultats est l'accusé de réception qui autorise à
conclure. Sans lui on se tait. Un faux « aucun résultat » empoisonnerait
exactement le signal qu'on cherche à lire, et il vaut mieux ne rien mesurer que
mesurer faux.

**Limite assumée : la liste déroulante de la navbar n'est pas instrumentée.**
Elle se rafraîchit à chaque frappe et son gabarit « aucun résultat » n'est
identifiable que par une classe hachée — un crochet fragile qui, le jour où il
casse en silence, dirait « personne ne cherche rien qui manque ». Pire que pas
de mesure. Le lecteur qui ne trouve rien dans la liste et valide arrive sur
`/search` (`explicitSearchResultPath`), où il est compté.

- **`docs/faq.md` question 36** et un lien **Privacy** en pied de page. La
  réponse ne demande pas au lecteur de la croire sur parole : elle lui dit quoi
  regarder dans l'onglet réseau (`gc.zgo.at/count.js`, le seul tiers que le site
  puisse contacter) et lui donne les deux sorties — DNT, et `skipgc` dans le
  `localStorage`, l'opt-out natif de count.js.
- **`CONTRIBUTING.md`** — comment allumer la mesure, et comment la vérifier en
  local avant de l'allumer (`GOATCOUNTER_ALLOW_LOCAL=1`, parce que count.js
  refuse de compter depuis `localhost`).

**Vérifié — de bout en bout, pas seulement à la compilation.** `npm run
typecheck`, `npm run build`, `npm run check:examples` (181 blocs + 3
contre-exemples) et `npm run check:syntax` passent. Puis, avec un faux point de
collecte local et Chrome headless :

| Cas | Résultat observé |
|---|---|
| Build sans la variable | aucun hit, `count.js` jamais demandé |
| Page de doc | un hit, `p=/docs/reference/records` — baseUrl bien retiré |
| Navigation SPA | un hit par page, pas seulement à l'atterrissage |
| `/search?q=zzzqqxnotfound` | `search-empty: zzzqqxnotfound`, `e=true` |
| `/search?q=Trait  objects` | `search: trait objects` — normalisation appliquée |
| `navigator.doNotTrack = '1'` | aucun hit, `count.js` jamais demandé (contrôle sans DNT : un hit) |

Les hypothèses faites sur `count.js` ont été relues dans le fichier réel et non
supposées : `window.goatcounter = window.goatcounter || {}` (nos réglages
survivent au chargement), `no_onload`, `allow_local`, et l'opt-out `skipgc`.

**Ce qui reste, et qui n'est pas du code.** Créer le compte GoatCounter et poser
la variable — cinq minutes, sans lesquelles tout ce qui précède ne mesure rien.
Et, une fois quelques semaines de données accumulées, relire la liste des
`search-empty:` : c'est la roadmap documentaire de la phase 3, écrite par les
lecteurs.

C'est aussi le seul argument sérieux pour **repasser à Algolia DocSearch** plus
tard (gratuit pour l'open-source) : la tolérance aux fautes de frappe et les
analytics de recherche intégrées. À faire seulement si le besoin se manifeste —
la recherche locale de l'action 1 couvre le cas nominal, et elle est maintenant
instrumentée.

---

### 2.8 — ✅ Action 8 : lien « signaler un problème sur cette page » *(fait le 2026-09-09)*

**Le problème.** « Edit this page » ne sert que le lecteur qui sait déjà quoi écrire à la place.
Celui qui constate qu'une phrase est fausse, qu'un exemple ne compile pas ou qu'il manque une
explication n'a pas de correctif à proposer — il a un signalement, et aucun endroit où le
déposer sans quitter sa page, trouver le dépôt (**qui n'est pas celui du compilateur**), ouvrir
l'onglet des issues et recopier l'URL. Ce coût-là suffit à ce que le signalement n'arrive jamais.

**Ce qui a été fait.**

- **`src/theme/EditThisPage/index.tsx`** — une **enveloppe**, pas une éjection : aucune ligne du
  thème n'est recopiée, donc rien à resynchroniser à la prochaine montée de version. Le point de
  greffe a été choisi pour ça : `@theme/EditThisPage` est le seul composant par lequel passent à
  la fois les pages de doc, les billets de blog et les pages MDX (tous les trois via
  `@theme/EditMetaRow`). Un seul crochet couvre les trois.
- **`src/components/ReportIssueLink`** — le lien. Il pré-remplit une issue avec **l'URL de la
  page** et **le chemin de son fichier source**, c'est-à-dire précisément les deux choses que le
  rapporteur ne recopie pas et ne connaît pas. Le corps propose deux rubriques (*what is wrong* /
  *what did you expect*) et demande, pour un exemple qui ne compile pas, la sortie de
  `typr check` et la version — le minimum sans lequel une issue de doc n'est pas actionnable.
  Étiquette `documentation`, qui existe déjà sur le dépôt.
- **Rien n'est configuré en double.** Le dépôt destinataire et le chemin du fichier sont
  **déduits de l'`editUrl`** que le thème passe déjà au lien voisin. Si `editUrl` change de dépôt
  ou de branche dans `docusaurus.config.ts`, le signalement suit sans qu'on y pense ; et une
  `editUrl` absente ou non-GitHub ne rend pas de lien du tout, plutôt qu'un lien qui tombe à côté.

**Le seul point non trivial : quand lire le titre de la page.** Le titre n'existe pas au rendu
serveur, et sur une navigation interne rien ne garantit que react-helmet ait déjà posé le nouveau
`document.title` quand les effets du composant s'exécutent — on prendrait alors le titre de la
page *précédente*, c'est-à-dire une issue qui désigne la mauvaise page. Le titre est donc lu **au
clic**, où la question ne se pose plus. Le `href` rendu reste valide en permanence : il retombe
sur le chemin du fichier source, qui identifie la page tout aussi sûrement. Un clic milieu ou un
« copier le lien » ouvre donc la bonne issue, avec un titre simplement moins joli.

**`docs/faq.md` question 35** gagne la cinquième porte : la question 35 est le point de tri
complet du projet, et il lui manquait le cas « le problème est dans la documentation », qui est
le seul à ne pas viser le dépôt du compilateur.

**Vérifié — pas seulement à la compilation.** `npm run typecheck`, `npm run build`,
`npm run check:examples` (181 blocs + 3 contre-exemples) et `npm run check:syntax` passent. Puis,
avec le site servi localement et Chrome headless :

| Cas | Résultat observé |
|---|---|
| Page de doc, à l'atterrissage | `Docs: Getting started`, corps pointant sur `/docs/intro` |
| Après une navigation SPA | titre **et** URL suivent la nouvelle page, pas la précédente |
| Billet de blog | `Blog: R and TypR`, source `blog/2026-01-14-r-and-typr.md` |
| Rendu HTML statique (avant hydratation) | `href` valide, titre replié sur le chemin du fichier |
| Largeur mobile | les deux liens s'empilent au lieu de rogner la zone cliquable |

### 2.9 — Action 9 : versionnement de la doc *(différé, mais à décider maintenant)*

Docusaurus sait versionner. **Ne pas le faire tout de suite** : ça double le coût de
maintenance de chaque page, pour un langage dont la syntaxe bouge encore.

Mais **décider le schéma d'URL dès maintenant**, parce que le changer après coup casse tous les
liens entrants. Le besoin deviendra réel dès qu'un utilisateur installera une release taguée
pendant que la doc décrit `develop` — et le `repository_dispatch: typr-release` de
`deploy.yml` montre que le couplage doc/release est déjà pensé.

Rappel de `../CLAUDE.md` : les versions sont fixées en un seul endroit,
`Cargo.toml [workspace.package].version`, propagées par `nu publish.nu sync`. La doc doit
consommer cette valeur, jamais en redéfinir une.

---

### 2.10 — Action 10 : section « TypR by example »

À la manière de *Rust by Example* : une progression d'exemples courts, **chacun exécutable dans
le playground**, qui couvre le langage par la pratique.

Le playground (`typr-playground.github.io`, protocole documenté dans son `INTEGRATION.md`) est
l'atout différenciant de TypR face aux autres langages jeunes, et il est aujourd'hui
sous-exploité comme porte d'entrée : le bouton « play » existe sur chaque bloc, mais aucune
page n'est *conçue* autour de l'exécution.

Genre Diátaxis : *tutoriel* — donc sous `docs/tutorials/`, sans mélanger avec la référence.
Contrainte : chaque bloc doit rester auto-suffisant (préambule `# --- setup, ... ---`), et il
passera le contrôle de l'action 2.

---

### 2.11 — Action 11 : internationalisation française *(optionnel)*

Docusaurus i18n avec une locale `fr`. Les notes de design sont en français et il existe un
public R francophone (académique notamment).

**Mais traduire double la charge sur chaque page**, et une traduction en retard est pire qu'une
absence de traduction. À ne faire que si ce public est explicitement visé — décision produit,
pas décision technique. C'est délibérément la dernière de la liste.

---

## 3. Fil rouge

Trois des actions ci-dessus (2, 6, et l'invariant de grammaire déjà en place dans
`deploy.yml`) relèvent du même principe : **la documentation d'un langage ne doit pas pouvoir
diverger silencieusement de son compilateur**. Quand un choix se présente entre « détecter la
dérive » et « rendre la dérive impossible », prendre la seconde.

Les actions 3, 4, 5 relèvent d'un autre principe : **s'appuyer sur GitHub plutôt que sur une
infrastructure**, parce que le site est statique et que le mainteneur est peu nombreux.

L'action 7 en ajoute un troisième, qui ne vaut que pour elle : **mesurer sans surveiller**. Une
mesure d'audience qui exige un bandeau de consentement a déjà perdu — elle coûte à chaque
visiteur pour renseigner le mainteneur. Le corollaire pratique est le mode par défaut : la
mesure est en sommeil tant que personne ne l'allume, et un build qui ne sait pas où envoyer ses
données n'en envoie pas.
