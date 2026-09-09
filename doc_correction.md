# Corrections de doc en attente

> Six blocs d'exemple de la documentation divergent du compilateur. Chacun a été **vérifié
> contre `typr` 0.5.10** : les verdicts ci-dessous ne sont pas des soupçons de lecture, ce sont
> des exécutions. Chaque entrée porte un repro minimal exécutable tel quel.
>
> Établi le **2026-09-09**, en triant les 45 blocs ` ```typr noplayground ` restants après la
> mise en place du contrôle CI des exemples (`plan-phase2.md` action 2). Deux sont corrigés
> (D, F — 2026-09-09). Les quatre autres attendent un arbitrage ou un fix compilateur.

---

## 0. D'où vient cette liste

Les 45 blocs exclus de `npm run check:examples` ont été passés au compilateur un par un. Ils se
répartissent en trois familles :

1. **Fragments** — types isolés, corps remplacés par `/* ... */`, `# ... existing code ...`,
   projets `mod` multi-fichiers, formes que le parser ne lit pas encore. `noplayground` est le
   bon marqueur, rien à faire. C'est la grande majorité.
2. **Blocs mixtes** — ils montrent côte à côte l'interdit et l'autorisé (par exemple
   `docs/philosophy/beautiful_syntax.md:12` : `data.frame(...)` « not allowed » puis
   `data__frame(...)` « works »). Un `compile_fail` y serait techniquement vrai mais trompeur,
   puisqu'une moitié du bloc est présentée comme valide. Il faudrait les couper en deux.
3. **Divergences réelles** — le bloc est présenté comme du TypR valide et ne compile pas.
   **C'est cette famille-ci, et elle fait six blocs.**

Quatre sont des erreurs de documentation, deux sont des trous du compilateur.

| | Bloc | Verdict | Effort |
|---|---|---|---|
| [A](#a--docsreferencetypesmd27--types-littéraux) | `docs/reference/types.md:27` | compilateur | `cases/` dans `we-data-ch/typr` |
| [B](#b--docsreferencefunctionsmd131--closures) | `docs/reference/functions.md:131` | compilateur | `cases/` dans `we-data-ch/typr` |
| [C](#c--docsphilosophyintromd25--functiona-b-présenté-comme-du-typr-valide) | `docs/philosophy/intro.md:25` | doc — **décision de langage d'abord** | à trancher |
| ~~[D](#d--docsphilosophybeautiful_syntaxmd174--constructeur-dunion)~~ | `docs/philosophy/beautiful_syntax.md:174` | ~~doc~~ **corrigé** | ~~une ligne~~ |
| [E](#e--docsconceptstype-constructorsmd28--opaque) | `docs/concepts/type-constructors.md:28` | doc | réécriture en deux blocs |
| ~~[F](#f--docsreferenceoperatorsmd33--pipe)~~ | `docs/reference/operators.md:33` | ~~doc~~ **corrigé** | ~~une ligne~~ |

---

# Le compilateur a tort (la doc a raison)

Ces deux-là ne se corrigent pas ici : le dépôt à toucher est `we-data-ch/typr`, et la bonne
porte d'entrée est `typr case add` — un correctif sans cas derrière lui n'a rien qui l'empêche
de régresser (voir `cases/README.md`). Les blocs de doc restent `noplayground` en attendant, et
redeviendront vérifiables le jour où le compilateur passe.

## A · `docs/reference/types.md:27` — types littéraux

La page annonce les types singleton. Vérifié ligne à ligne :

| Ligne | Résultat |
|---|---|
| `let x: 3 = 3;` | ✅ |
| `let name: "hello" = "hello";` | ✅ |
| `let flag: true = true;` | ❌ `Type error: type true doesn't match type bool` |
| `let x: 3.14 = 3.14;` | ❌ `Type error: type 3.14 doesn't match type num` |

**Diagnostic.** Les entiers et les chaînes reçoivent leur type singleton, **pas les booléens ni
les flottants** : le littéral est typé `bool` / `num`. Ce sont des *type errors*, pas des
erreurs de syntaxe — le parser accepte la forme, c'est le type checker qui n'attribue pas le
singleton.

**Pourquoi la doc a raison.** `syntaxe.md:100` (la carte autoritative, établie par lecture du
parseur) liste explicitement les quatre : « Les littéraux peuvent aussi apparaître *comme type*
(types singleton) : `3`, `3.14`, `true`, `"chat"` ». Elle décrit la syntaxe, et la syntaxe passe
bien ; le trou est en aval, dans l'attribution du type.

**Repro** (deux cas, à séparer ou à réunir selon ce que dit le code) :

```
let flag: true = true;
```
```
let x: 3.14 = 3.14;
```

**À faire.** Un cas dans `we-data-ch/typr`, puis retirer `noplayground` du bloc de `types.md`
une fois le compilateur corrigé.

---

## B · `docs/reference/functions.md:131` — closures

L'exemple `make_adder` de la page est correct ; c'est le compilateur qui le refuse.

**Repro minimal, une ligne :**

```
let f: (int) -> int <- fn(a: int): int { a };   # ✅
let f: (int) -> int <- fn(z: int): int { z };   # ❌
```

> ```
> Type error: The output type of the function don't match it's type annotation
> Expected: fn(a: int) -> int
> Found:    fn(z: int) -> int
> ```

**Diagnostic.** `(int) -> int` se désucre en `fn(a: int) -> int` — paramètre nommé `a` par
défaut — et **les types de fonction sont comparés nom de paramètre compris**. Renommer `x` en
`a` dans le bloc de la doc suffit à le faire passer.

**Pourquoi c'est un bug et pas un choix.** Un type de fonction est structurel : il ne devrait
pas dépendre du nom des paramètres. Le nom est une commodité d'écriture côté implémentation,
pas une information de type. En l'état, toute annotation de retour de fonction — donc toute
closure, tout callback — n'est acceptée que si l'implémenteur devine le nom que le désucrage a
choisi.

C'est le plus net des six : une ligne le reproduit, et il mord dès qu'on annote.

**À faire.** Un cas dans `we-data-ch/typr`. Le bloc de `functions.md` redevient vérifiable
ensuite, sans le toucher.

---

# La doc a tort

## C · `docs/philosophy/intro.md:25` — `function(a, b)` présenté comme du TypR valide

**Ce que dit la page.** Le bloc est commenté « *Also a valid TypR code: weak on safety, strong
on freedom* ». Il définit une fonction R non typée, puis l'appelle :

```
let my_addition <- function(a, b) {
	a + b
};

my_addition(num1, num2)
```

**Ce que fait le compilateur.** On peut la *définir*. On ne peut pas l'*appeler* :

> ```
> Type error: No signature of function 'my_addition' matches this call.
>   Called with 2 argument(s): (int, int)
> help: 'my_addition' exists but none of its signature(s) accepts these arguments:
>           () -> UnknownFunction
> ```

**Ce que dit `syntaxe.md`.** Lignes 459 et 476 : `function(x, y) { x + y }` est une **fonction R
brute non typée (`RFunction`)**, rangée au chapitre « Échappatoires vers du code brut », au même
titre que `R { ... }` et `JS { ... }`, et décrite comme n'ayant « aucune vérification du tout ».
Ce n'est donc pas le cran souple d'un typage graduel : c'est une sortie du système de types, et
la valeur obtenue n'est pas appelable depuis TypR.

**Pourquoi c'est le plus gênant des quatre.** Il porte l'argument central de la page — la
promesse d'un dial graduel entre R et TypR. Le corriger, ce n'est pas retoucher un exemple,
c'est reformuler la thèse.

> ⚠ **Piège de vérification, à ne pas refaire.** Un premier test avec le nom `add` passait —
> parce que `add` existe dans la bibliothèque standard avec une vraie signature, et que la
> définition locale ne faisait que l'ombrager. Avec n'importe quel autre nom, ça échoue.
> Toujours tester ce genre de cas avec un identifiant inventé.

**La décision à prendre, avant toute correction.** Elle est de langage, pas de rédaction :

- **Option 1 — la doc s'aligne.** `function(...)` reste une échappatoire non appelable ; la page
  cesse de la présenter comme du « TypR valide » et la range explicitement parmi les
  échappatoires, avec un renvoi vers `docs/reference/escape-hatches.md`. Le bloc devient un
  `compile_fail` : « voici ce que TypR n'accepte pas ». Coût : la page perd son argument de
  gradualité, ou doit le reconstruire sur autre chose (l'inférence, qui elle marche —
  `let x <- 3;` est déjà du TypR sans annotation).
- **Option 2 — le compilateur s'aligne.** Un `RFunction` devient appelable, avec des arguments
  non vérifiés et un retour `Any`. Ça rend la promesse vraie, au prix d'un trou assumé dans le
  typage — exactement ce que la page revendique. À arbitrer contre la philosophie du projet.

Tant que ce n'est pas tranché, le bloc reste `noplayground`.

---

## D · `docs/philosophy/beautiful_syntax.md:174` — constructeur d'union

> ✅ **Corrigé le 2026-09-09.** Bloc remplacé, `noplayground` retiré, passe la CI.

**Bloc actuel :**

```
# Build an union type
type PersonOrInt <- Person | int;

# You can use the alias to build the
# elements with their own constructor
# Useful for autocompletion
PersonOrInt.7;
PersonOrInt.Person:{name: "Bob", age: 12};
```

**Vérifié :**

| Forme | Résultat |
|---|---|
| `PersonOrInt.7;` | ❌ `Unknown element '.7;'` |
| `PersonOrInt.Person:{name: "Bob", age: 12};` | ✅ |
| `let a: PersonOrInt <- 7;` | ✅ |

**Diagnostic.** On ne qualifie pas un membre **scalaire** d'une union. `syntaxe.md:312` ne
prévoit `Union.Membre` que dans deux cas : un tag nu (`Color.Red`) ou un alias record utilisé
tel quel comme membre de l'union — c'est exactement le second exemple, qui passe. Pour un `int`
membre d'une union, on écrit simplement la valeur.

*(Au passage : `:{name: "Bob"}` et `:{name = "Bob"}` fonctionnent tous les deux.)*

**Correction proposée** — remplacer la ligne fautive, garder le reste :

```
# Build an union type
type PersonOrInt <- Person | int;

# A scalar member is written as itself
let n: PersonOrInt <- 7;

# A record member is built through the qualified constructor
# (useful for autocompletion)
let p: PersonOrInt <- PersonOrInt.Person:{name: "Bob", age: 12};
```

Avec `Person` défini dans un préambule `# --- setup, ... ---`, le bloc devient auto-suffisant :
`noplayground` saute et il passe la CI.

---

## E · `docs/concepts/type-constructors.md:28` — `opaque`

**Bloc actuel :**

```
opaque Meters <- int;

let d: Meters <- 42;
let n: int <- d;   # ERROR: cannot implicitly convert opaque type
```

**Vérifié :**

| Forme | Résultat |
|---|---|
| `opaque Meters <- int;` puis `let d: Meters <- 42;` — au niveau fichier | ❌ `type Meters doesn't match type int` |
| ... puis `let d: Meters <- Meters(42);` | ❌ `Function Meters<int> not defined in this scope` |
| les deux mêmes lignes **dans un `module`** | ✅ |
| `@pub let make <- fn(v: int): Meters { v };` dans le module | ✅ |

**Diagnostic.** L'exemple oublie le module. Sans lui, `Meters` est simplement **inhabitable** :
ni le littéral (refusé) ni un constructeur (aucun n'est généré) ne permettent d'en fabriquer un.
L'opacité mord *à la frontière du module de définition* — ce que la prose de la page dit d'
ailleurs très bien juste en dessous : « code outside the module where the alias is defined
cannot freely mix the opaque type with its underlying type ». Le code, lui, ne montre aucune
frontière, donc il démontre l'inverse de son intention. Voir `syntaxe.md:417`
(`@pub opaque Radians <- num;` à l'intérieur de `module Math { ... }`).

**Correction proposée** — deux blocs, dont un vrai contre-exemple :

````
Inside the module that defines it, the underlying type is still visible:

```typr
module Distance {
    @pub opaque Meters <- int;
    @pub let make <- fn(v: int): Meters { v };
};
```

Outside, the boundary holds:

```typr compile_fail
# --- setup: the module above ---
module Distance {
    @pub opaque Meters <- int;
    @pub let make <- fn(v: int): Meters { v };
};

let d <- Distance$make(42);
let n: int <- d;   # the opaque type does not convert back on its own
```
````

Le second bloc est à vérifier avant d'être écrit tel quel — il faut confirmer la forme d'accès
(`Distance$make` ou `use Distance::make;`) et que l'erreur tombe bien sur la dernière ligne.

---

## F · `docs/reference/operators.md:33` — pipe

> ✅ **Corrigé le 2026-09-09.** Bloc remplacé, `noplayground` retiré, passe la CI.

**Bloc actuel :**

```
# TypR
data |> filter(x > 0) |> mean()
```

Suivi, dans la page, d'un bloc ` ```r ` contenant **la même ligne**.

**Vérifié :**

| Forme | Résultat |
|---|---|
| `data \|> filter(x > 0) \|> mean();` | ❌ `Undefined variable 'x'` |
| `data \|> filter(fn(x: int): bool { x > 0 }) \|> mean();` | ✅ |

**Diagnostic.** C'est du NSE dplyr présenté comme du TypR. La signature réelle est
`([#N, T], fn(a: T) -> bool) -> [#N, T]` : `filter` prend une **vraie fonction**, pas une
expression capturée. Et comme le bloc R voisin contient la ligne à l'identique, la section
« Comparison with R » ne compare rien du tout — alors que c'est justement là que la différence
est intéressante.

**Correction proposée :**

````
```typr
# --- setup ---
let data <- [1, 2, 3, -4];

# TypR — filter takes a real function, not a captured expression
let r <- data |> filter(fn(x: int): bool { x > 0 }) |> mean();
```
```r
# R — dplyr captures the expression (NSE)
data |> filter(x > 0) |> mean()
# or with magrittr: data %>% filter(...) %>% mean()
```
````

Auto-suffisant, donc `noplayground` saute et le bloc passe la CI. C'est la correction la plus
rentable des quatre : la page est dans `reference/`, celle qu'on croit sur parole.

---

## Rappel de méthode

Pour rejouer n'importe lequel de ces repros :

```bash
cd "$(mktemp -d)"
printf 'let flag: true = true;\n' > t.ty
typr check t.ty
```

Le premier `typr check` d'un répertoire y écrit `context.json` et `std.ty` (préchargement de la
bibliothèque standard) — c'est normal, et c'est pour ça qu'on travaille dans un répertoire
jetable.

Après toute correction de bloc :

```bash
npm run check:examples                    # les 180 blocs
npm run check:examples -- --noplayground  # ce qui reste exclu
```
