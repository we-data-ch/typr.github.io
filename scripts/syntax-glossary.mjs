/**
 * Le versant *documentaire* de la référence de syntaxe.
 *
 * Le manifeste (`syntaxes/typr.syntax.json`, généré par le compilateur) dit
 * **quels lexèmes existent** ; il ne dit pas ce qu'ils veulent dire. Ce fichier
 * porte l'autre moitié : une glose par lexème, et les rangs de priorité — que
 * le manifeste n'a pas, parce qu'ils vivent dans `Op::get_binding_power`
 * (`components/language/operators.rs`) et pas dans la description des lexèmes.
 *
 * L'invariant est vérifié dans les deux sens par `gen-syntax-reference.mjs` :
 *
 *   - un lexème du manifeste sans entrée ici  → erreur (mot-clé ajouté au
 *     langage et jamais documenté) ;
 *   - une entrée ici absente du manifeste     → erreur (mot-clé retiré du
 *     langage et toujours documenté).
 *
 * C'est la même clôture à double sens que les deux tests du compilateur
 * (`components::syntax::tests`), transportée jusqu'à la doc : ajouter un
 * mot-clé sans écrire sa ligne de doc casse la CI de ce dépôt.
 */

/**
 * Rôle de chaque rang de priorité, tel qu'affiché dans le tableau.
 * Les rangs eux-mêmes viennent de `Op::get_binding_power` ; ils sont recopiés
 * dans le champ `prec` des lexèmes ci-dessous et regroupés à la génération.
 */
export const PRECEDENCE_ROLES = {
  4: 'member access / UFCS, pipe, membership, validating cast',
  3: 'multiplicative',
  2: 'additive',
  1: 'comparison, logical, custom operators',
};

/**
 * Une glose par lexème du manifeste.
 *
 * `form` : la forme réellement écrite, quand le lexème seul induirait en erreur
 * — le parseur ne reconnaît `c` que collé à sa parenthèse, et le manifeste
 * l'exprime par un `followed_by` regex, illisible dans un tableau. Le
 * générateur vérifie que `form` contient bien le lexème.
 *
 * `prec` : rang de priorité, pour les seuls opérateurs *infixes*. Son absence
 * est une information : `<-`, `->`, `=`, `...`, `;` ne sont pas des opérateurs,
 * ils ne participent à aucune expression binaire.
 */
export const LEXEMES = {
  // --- annotations -----------------------------------------------------------
  '@export': { gloss: 'Exports the binding from the generated R package (roxygen2 `@export`).' },
  '@pub': { gloss: 'Makes a module member visible outside its `module`.' },
  '@testable': { gloss: 'Exposes a private member as `M$.test_<name>` under `typr build --test` only.' },
  '@extern': { gloss: 'Declares an R function that already exists: `@extern stats::sd: (x: [Any, num]) -> num;`.' },
  '@importFrom': { gloss: 'Hoists a roxygen2 `@importFrom`: `@importFrom dplyr filter select;`.' },

  // --- mots-clés de contrôle -------------------------------------------------
  if: { gloss: 'Conditional. An expression, not a statement — it returns the value of the taken branch.' },
  else: { gloss: 'Alternative branch of an `if`; chains as `else if`.' },
  match: { gloss: 'Exhaustive pattern match over tags, types, records, tuples and `_`.' },
  for: { gloss: 'Iteration over a collection: `for (item in items) { ... };`.' },
  while: { gloss: 'Loop while a condition holds.' },
  loop: { gloss: 'Unconditional loop, left with `break`.' },
  break: { gloss: 'Leaves the innermost loop.' },
  next: { gloss: "Skips to the next iteration. The R spelling — TypR has no `continue`." },
  return: { gloss: 'Early return. The last expression of a block is already its value, so it is rarely needed.' },

  // --- mots-clés de déclaration ----------------------------------------------
  let: { gloss: 'Binds a value. The name must be `snake_case`.' },
  fn: { gloss: 'Typed function literal — the return type is mandatory: `fn(x: int): int { ... }`.' },
  function: { gloss: "R's untyped function form. Accepted, and typed as `UnknownFunction`." },
  type: { gloss: 'Transparent type alias. The name must be `PascalCase`.' },
  opaque: { gloss: 'Opaque alias: the underlying type is hidden from callers.' },
  typeconstructor: { gloss: 'Registers a generic record/recursive constructor: `typeconstructor Tibble[N] record;`.' },
  recursive: { gloss: 'Kind of a `typeconstructor` whose parameters may recur: `typeconstructor Matrix[N, M, T] recursive;`.' },
  interface: { gloss: 'Structural capability: any type carrying the listed functions satisfies it.' },
  record: { gloss: 'Record literal type (`record { x: int }`), and the record kind of a `typeconstructor`.' },
  object: { gloss: 'Third spelling of the record literal type, alongside `list { ... }` and `record { ... }`.' },
  module: { gloss: 'Declares a module, transpiled to an R environment.' },
  mod: { gloss: 'Pulls in a module held in another file: `mod utils;`.' },
  import: { gloss: 'Imports a module as a whole: `import Math;`, `import Math as M;`.' },
  use: { gloss: 'Four grammars in one keyword: `use M::f;`, `use M::{f, g as h};`, `use M::*;` and the legacy R adapter `use("dplyr", c("filter"));`.' },
  extern: { gloss: 'Opens a raw R body whose signature TypR checks: `extern (x: int) -> int r#"..."#`.' },
  embed: { gloss: 'Named type embedding on a record field: `list { embed coords: Position }`. A soft keyword — a field genuinely named `embed` still parses.' },

  // --- mots-clés d'entête de bloc --------------------------------------------
  R: { form: 'R { ... }', gloss: 'Escape hatch: a block of raw R, left untouched by the transpiler.' },
  JS: { form: 'JS { ... }', gloss: 'Escape hatch for the JavaScript target.' },
  Test: { form: 'Test { ... }', gloss: 'Test block, transpiled to testthat. `Test[...]` is the file-level form.' },

  // --- cast et opérateurs mot ------------------------------------------------
  'as!': { prec: 4, gloss: 'Validating cast: calls the generated `validate_T(x)` at runtime.' },
  as: { gloss: 'Renames on import: `import Math as M;`, `use Math::{sin as s};`. Never a cast — that is `as!`.' },
  and: { prec: 1, gloss: 'Logical *and*, word spelling of `&&`.' },
  or: { prec: 1, gloss: 'Logical *or*, word spelling of `||`.' },
  in: { prec: 4, gloss: 'Membership. Iterates in `for (x in xs)`, and refines in the conditional type `T if T1 in T2`.' },

  // --- constantes ------------------------------------------------------------
  true: { gloss: 'Boolean truth. `TRUE` is the R spelling of the same value.' },
  TRUE: { gloss: "R spelling of `true`." },
  false: { gloss: 'Boolean falsity. `FALSE` is the R spelling of the same value.' },
  FALSE: { gloss: "R spelling of `false`." },
  null: { gloss: "Absence of a value (R's `NULL`) — distinct from `na`." },
  NULL: { gloss: 'R spelling of `null`.' },
  na: { gloss: "Missing value (R's `NA`) — distinct from `null`." },
  NA: { gloss: 'R spelling of `na`.' },

  // --- types primitifs -------------------------------------------------------
  int: { gloss: 'Integer.' },
  num: { gloss: 'Floating-point number.' },
  char: { gloss: 'Character string.' },
  bool: { gloss: 'Boolean.' },
  logic: { gloss: 'Accepted alias of `bool`.' },
  Any: { gloss: 'Top type — every value satisfies it.' },
  Empty: { gloss: 'Bottom type — no value satisfies it. The return type of a side-effect-only function.' },
  Self: { gloss: 'Inside an `interface`, the type that implements it.' },

  // --- types intégrés --------------------------------------------------------
  Vec: { form: 'Vec[...]', gloss: 'Native R vector: `Vec[num]`, `Vec[#N, num]`.' },
  Array: { form: 'Array[...]', gloss: 'S3 array with an indexed size: `Array[3, int]`. Short form: `[#N, int]`.' },
  Tuple: { form: 'Tuple[...]', gloss: 'Positional tuple: `Tuple[int, char]`, variadic `Tuple[T..., U]`.' },
  Record: { form: 'Record[...]', gloss: 'Bracket record type: `Record[name: char]`, variadic `Record[Fs..., id: int]`.' },
  UnknownFunction: { gloss: 'The type given to an R function TypR knows nothing about.' },
  dataframe: { form: 'dataframe[...]{...}', gloss: 'Data frame with typed columns: `dataframe[#N]{ name: char }`.' },
  df: { form: 'df[...]{...}', gloss: 'Short spelling of `dataframe`.' },
  'data.frame': { gloss: "R's own data-frame name, accepted as a type." },
  data__frame: { gloss: 'The `__` spelling of `data.frame` — `__` becomes `.` in the emitted R.' },
  list: { form: 'list { ... }', gloss: 'Record literal type: `list { x: int, y: int }`.' },
  tuple: { form: 'tuple { ... }', gloss: 'Tuple literal type: `tuple { int, char }`.' },

  // --- constructeurs intégrés ------------------------------------------------
  c: { form: 'c(...)', gloss: "R's vector constructor." },
  seq: { form: 'seq[...]', gloss: 'Sequence literal. The range sugar `1:10` desugars to the R `seq(1, 10, 1)`.' },
  Class: { form: 'Class(...)', gloss: 'Type denoting an existing R class: `Class("data.frame", "tbl")`.' },
  library: { form: 'library(...)', gloss: 'Declares an R package dependency, as in R.' },

  // --- opérateurs ------------------------------------------------------------
  '->': { gloss: 'Return type of a function type: `(x: int) -> int`.' },
  '=>': { gloss: 'Arm separator in a `match`.' },
  '<-': { gloss: 'Binds, in `let` and `type`. Never an operator inside an expression.' },
  '==': { prec: 1, gloss: 'Equality.' },
  '!=': { prec: 1, gloss: 'Inequality.' },
  '<=': { prec: 1, gloss: 'Less than or equal.' },
  '>=': { prec: 1, gloss: 'Greater than or equal.' },
  '<': { prec: 1, gloss: 'Less than.' },
  '>': { prec: 1, gloss: 'Greater than.' },
  '&&': { prec: 1, gloss: 'Logical *and* (scalar), spelled `and` in words.' },
  '||': { prec: 1, gloss: 'Logical *or* (scalar), spelled `or` in words.' },
  '&': { prec: 1, gloss: 'Vectorized *and*, as in R.' },
  '!': { gloss: 'Negation as a prefix; postfixed to an expression (`x!;`) it is the mutation sugar.' },
  '|>': { prec: 4, gloss: 'Pipe: `x |> f()` ≡ `f(x)`.' },
  '+': { prec: 2, gloss: 'Addition; also type-level arithmetic on indices (`type Combined <- A + B;`).' },
  '-': { prec: 2, gloss: 'Subtraction, and unary minus.' },
  '*': { prec: 3, gloss: 'Multiplication.' },
  '/': { prec: 3, gloss: 'Division.' },
  '%': { prec: 3, gloss: 'Modulo.' },
  '@{': { gloss: 'Opens a vectorized block, `@{ ... }@`.' },
  '}@': { gloss: 'Closes a vectorized block.' },
  '...': { gloss: 'Runtime spread and variadic parameter.' },
  '..': { gloss: 'Nominal spread, in a record literal: `Point:{ ..source, x = 1 }`.' },
  '::': { prec: 4, gloss: 'Module member access. A historical alias of `$`, which it parses to.' },
  $: { prec: 4, gloss: 'Record field and module member access.' },
  '.': { prec: 4, gloss: 'UFCS call `x.f(y)` ≡ `f(x, y)`, and positional tuple access `t.1` (1-based).' },
  '=': { gloss: 'Named-field and default-value separator (`greeting: char = "Hi"`). Never a comparison — that is `==`.' },
  ';': { gloss: 'Ends an instruction. Omitting it is tolerated with a warning, except on the last expression of a block.' },
  ',': { gloss: 'Separates arguments, fields and type parameters.' },
  ':': { gloss: 'Type annotation (`x: int`), and the range operator (`1:10`, `1:2:10`).' },
};

/**
 * Les règles du manifeste dont le corps est une regex ou un span : elles n'ont
 * pas de liste de lexèmes, donc rien à clore dans les deux sens. Chacune doit
 * quand même être déclarée ici — `null` veut dire « décrite en prose sur la
 * page, pas de ligne générée ». C'est le pendant de la liste `NOT_A_LEXEME`
 * du compilateur : une exemption est permise, mais jamais silencieuse.
 */
export const RULES = {
  'strings.raw-r': null,
  comments: null,
  'strings.double': null,
  'strings.single': null,
  'strings.backtick': null,
  'numbers.float': null,
  'numbers.integer': null,
  'types.variant': null,
  'types.sigil-generic': null, // rendu depuis `manifest.sigils`
  'types.generic': null,
  'types.alias': null,
  'operators.type-union': {
    section: 'operators',
    form: '|',
    prec: 1,
    gloss: 'Union of types (`.A(int) | .B`), and the vectorized *or* of R.',
  },
  'operators.custom': {
    section: 'operators',
    form: '%op%',
    prec: 1,
    gloss: 'R-style custom infix operator, declared with a backquoted name: `` `%+%` ``.',
  },
  'operators.lambda': {
    section: 'operators',
    form: '\\(x) ...',
    gloss: "R 4.1's lambda shorthand.",
  },
  'functions.call': null,
  'variables.parameter': null,
  'variables.other': null,
  'punctuation.brackets': null,
};
