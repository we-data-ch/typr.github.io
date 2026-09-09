#!/usr/bin/env node
/**
 * Génère les inventaires de syntaxe des pages de référence depuis le manifeste
 * du compilateur.
 *
 * Le principe est celui de l'action 2 poussé d'un cran : là où
 * `check-typr-blocks.mjs` *détecte* qu'un exemple a divergé du compilateur, ce
 * script rend la divergence impossible. La liste des mots-clés, des opérateurs
 * et des types intégrés n'est plus recopiée à la main dans `docs/reference/` :
 * elle est dérivée de `syntaxes/typr.syntax.json`, le manifeste que le
 * compilateur génère et qui est déjà la source de vérité unique des grammaires
 * d'éditeur (`crates/typr-core/src/components/syntax/mod.rs`).
 *
 * Le manifeste dit *quels lexèmes existent* ; il ne dit pas ce qu'ils veulent
 * dire. La glose est donc côté doc, dans `syntax-glossary.mjs`, et les deux
 * moitiés sont recollées ici sous une clôture à double sens :
 *
 *   - un lexème du manifeste sans glose → échec (mot-clé ajouté au langage,
 *     jamais documenté) ;
 *   - une glose sans lexème → échec (mot-clé retiré du langage, toujours
 *     documenté) ;
 *   - une *règle* du manifeste ni glosée ni explicitement exemptée → échec
 *     (une règle nouvelle ne peut pas passer inaperçue).
 *
 * Le texte produit est écrit **dans les pages elles-mêmes**, entre deux
 * marqueurs HTML, et pas dans un partiel MDX importé : `docusaurus-plugin-llms`
 * (action 3) lit le Markdown source, pas le rendu. Un `<Operators />` importé
 * laisserait `llms-full.txt` avec un composant JSX à la place des tableaux.
 *
 * Usage :
 *   node scripts/gen-syntax-reference.mjs           # réécrit les pages
 *   node scripts/gen-syntax-reference.mjs --check   # échoue si elles ont dérivé
 *
 * Sortie : 0 si tout est à jour (ou réécrit), 1 si `--check` trouve une
 * dérive, 2 si le script lui-même ne peut pas s'exécuter.
 */

import fs from 'node:fs';
import path from 'node:path';

import { LEXEMES, PRECEDENCE_ROLES, RULES } from './syntax-glossary.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const MANIFEST = path.join(ROOT, 'syntaxes', 'typr.syntax.json');

const IN_CI = Boolean(process.env.GITHUB_ACTIONS);
const RED = IN_CI || process.stdout.isTTY ? '\u001b[31m' : '';
const GREEN = IN_CI || process.stdout.isTTY ? '\u001b[32m' : '';
const DIM = IN_CI || process.stdout.isTTY ? '\u001b[2m' : '';
const RESET = RED ? '\u001b[0m' : '';

const HELP = `Usage: node scripts/gen-syntax-reference.mjs [options]

  --check     ne rien écrire ; échouer si une page a dérivé du manifeste
  --manifest  chemin du manifeste (défaut : syntaxes/typr.syntax.json)
`;

/** Le schéma du manifeste que ce script sait lire. */
const SUPPORTED_SCHEMA = 1;

// --- plan des pages ----------------------------------------------------------

/**
 * Ce que chaque page reçoit, dans l'ordre. Une règle du manifeste porteuse de
 * lexèmes doit apparaître ici — sinon ses lexèmes ne seraient documentés nulle
 * part, et la clôture le dira.
 */
const PAGES = [
  {
    id: 'lexicon',
    file: 'docs/reference/lexicon.md',
    sections: [
      { heading: 'Control-flow keywords', rules: ['keywords.control'], column: 'Keyword' },
      { heading: 'Declaration keywords', rules: ['keywords.declaration'], column: 'Keyword' },
      { heading: 'Block heads', rules: ['keywords.block'], column: 'Form' },
      { heading: 'Annotations', rules: ['annotations'], column: 'Annotation' },
      { heading: 'Constants', rules: ['constants'], column: 'Constant' },
      { heading: 'Primitive types', rules: ['types.primitive'], column: 'Type' },
      {
        heading: 'Built-in type names',
        rules: ['types.builtin', 'types.builtin-indexed'],
        column: 'Type',
      },
      { heading: 'Built-in constructors', rules: ['types.constructor'], column: 'Form' },
      { heading: 'Kind sigils', kind: 'sigils' },
    ],
  },
  {
    id: 'operators',
    file: 'docs/reference/operators.md',
    sections: [
      { heading: 'Precedence', kind: 'precedence' },
      {
        heading: 'Binding, arrows and separators',
        rules: ['operators.bind', 'operators.arrow', 'operators.assign', 'punctuation.terminator', 'punctuation.separator'],
        column: 'Token',
      },
      {
        heading: 'Access and pipe',
        rules: ['operators.access', 'operators.pipe'],
        extra: ['operators.lambda'],
        column: 'Operator',
      },
      { heading: 'Arithmetic', rules: ['operators.arithmetic'], column: 'Operator' },
      {
        heading: 'Comparison and logic',
        rules: ['operators.comparison', 'operators.logical'],
        extra: ['operators.type-union'],
        column: 'Operator',
      },
      { heading: 'Cast and word operators', rules: ['keywords.cast', 'keywords.operator-word'], column: 'Operator' },
      {
        heading: 'Spread and blocks',
        rules: ['operators.spread', 'operators.vectorial-block'],
        extra: ['operators.custom'],
        column: 'Token',
      },
    ],
  },
];

// --- arguments ---------------------------------------------------------------

function parseArgs(argv) {
  const opts = { check: false, manifest: MANIFEST };
  for (let i = 0; i < argv.length; i++) {
    switch (argv[i]) {
      case '--check':
        opts.check = true;
        break;
      case '--manifest': {
        const v = argv[++i];
        if (v === undefined) fail("l'option --manifest attend une valeur");
        opts.manifest = path.resolve(v);
        break;
      }
      case '-h':
      case '--help':
        process.stdout.write(HELP);
        process.exit(0);
        break;
      default:
        fail(`option inconnue : ${argv[i]}\n\n${HELP}`);
    }
  }
  return opts;
}

function fail(message) {
  process.stderr.write(`${RED}erreur${RESET} : ${message}\n`);
  process.exit(2);
}

// --- Markdown ----------------------------------------------------------------

/**
 * Dans une cellule de tableau, `|` ferme la colonne — y compris à l'intérieur
 * d'un code span. C'est un piège classique, et il vise en plein les lexèmes
 * qui nous intéressent (`|>`, `||`, `|`).
 */
const cell = (text) => text.replace(/\|/g, '\\|');

const code = (text) => `\`${text}\``;

function table(header, rows) {
  const lines = [`| ${header.join(' | ')} |`, `|${header.map(() => '---').join('|')}|`];
  for (const row of rows) lines.push(`| ${row.map(cell).join(' | ')} |`);
  return lines.join('\n');
}

// --- lecture du manifeste ----------------------------------------------------

function loadManifest(file) {
  let raw;
  try {
    raw = fs.readFileSync(file, 'utf8');
  } catch {
    fail(
      `manifeste introuvable : ${path.relative(ROOT, file)}\n` +
        `  Il est produit par « typr syntax --json » et recopié ici par la release du compilateur.`,
    );
  }
  let manifest;
  try {
    manifest = JSON.parse(raw);
  } catch (error) {
    fail(`manifeste illisible (${path.relative(ROOT, file)}) : ${error.message}`);
  }
  if (manifest.schema_version !== SUPPORTED_SCHEMA) {
    fail(
      `le manifeste est en schema_version ${manifest.schema_version}, ce script lit la ${SUPPORTED_SCHEMA}.\n` +
        `  Le compilateur a changé la forme du manifeste : relire crates/typr-core/src/components/syntax/mod.rs\n` +
        `  avant de mettre ce script à jour.`,
    );
  }
  return manifest;
}

/** Les lexèmes portés par une règle (vide pour les règles regex / span). */
const lexemesOf = (rule) => rule.lexemes ?? [];

// --- clôture à double sens ---------------------------------------------------

/**
 * Vérifie que le manifeste et le glossaire se recouvrent exactement, et que
 * chaque règle est soit placée sur une page, soit exemptée explicitement.
 * Toute erreur est fatale : une doc qui a perdu un mot-clé ment aussi sûrement
 * qu'un exemple qui ne compile pas.
 */
function checkCoverage(manifest) {
  const problems = [];

  const byName = new Map(manifest.rules.map((r) => [r.name, r]));
  const placed = new Map(); // règle → section qui l'affiche
  for (const page of PAGES) {
    for (const section of page.sections) {
      for (const name of [...(section.rules ?? []), ...(section.extra ?? [])]) {
        if (!byName.has(name)) {
          problems.push(
            `la section « ${section.heading} » de ${page.file} affiche la règle « ${name} », absente du manifeste.`,
          );
          continue;
        }
        if (placed.has(name)) {
          problems.push(`la règle « ${name} » est affichée deux fois (${placed.get(name)} et ${section.heading}).`);
        }
        placed.set(name, section.heading);
      }
    }
  }

  // Sens 1 : tout lexème du manifeste est documenté.
  const manifestLexemes = new Set();
  for (const rule of manifest.rules) {
    const lexemes = lexemesOf(rule);
    if (lexemes.length > 0 && !placed.has(rule.name)) {
      problems.push(
        `la règle « ${rule.name} » porte ${lexemes.length} lexème(s) (${lexemes.join(', ')}) ` +
          `et n'est affichée sur aucune page — ajoute-la à une section de PAGES.`,
      );
    }
    for (const lexeme of lexemes) {
      manifestLexemes.add(lexeme);
      const entry = LEXEMES[lexeme];
      if (!entry) {
        problems.push(
          `le lexème « ${lexeme} » (règle ${rule.name}) n'a pas de glose : ajoute-le à scripts/syntax-glossary.mjs.`,
        );
        continue;
      }
      if (entry.form && !entry.form.includes(lexeme)) {
        problems.push(`la glose de « ${lexeme} » affiche la forme « ${entry.form} », qui ne contient pas le lexème.`);
      }
    }
    // Une règle sans lexème doit être déclarée, fût-ce à `null`.
    if (lexemes.length === 0 && !(rule.name in RULES)) {
      problems.push(
        `la règle « ${rule.name} » (${rule.kind}) est inconnue du glossaire : déclare-la dans RULES, ` +
          `avec une glose si elle décrit une syntaxe à documenter, à \`null\` sinon.`,
      );
    }
  }

  // Sens 2 : toute glose correspond à un lexème vivant.
  for (const lexeme of Object.keys(LEXEMES)) {
    if (!manifestLexemes.has(lexeme)) {
      problems.push(
        `« ${lexeme} » est glosé mais n'existe plus dans le manifeste : le langage l'a retiré, la doc doit suivre.`,
      );
    }
  }
  for (const name of Object.keys(RULES)) {
    if (!byName.has(name)) {
      problems.push(`la règle « ${name} » est déclarée dans RULES mais n'existe plus dans le manifeste.`);
    }
  }

  // Les rangs de priorité doivent tous avoir un rôle affichable.
  const ranks = new Set();
  for (const entry of Object.values(LEXEMES)) if (entry.prec) ranks.add(entry.prec);
  for (const entry of Object.values(RULES)) if (entry?.prec) ranks.add(entry.prec);
  for (const rank of ranks) {
    if (!PRECEDENCE_ROLES[rank]) problems.push(`le rang de priorité ${rank} n'a pas de rôle dans PRECEDENCE_ROLES.`);
  }

  return problems;
}

// --- rendu -------------------------------------------------------------------

/** Les entrées affichables d'une section, dans l'ordre du manifeste. */
function entriesOf(section, byName) {
  const out = [];
  for (const name of section.rules ?? []) {
    for (const lexeme of lexemesOf(byName.get(name))) {
      const entry = LEXEMES[lexeme];
      out.push({ form: entry.form ?? lexeme, gloss: entry.gloss });
    }
  }
  for (const name of section.extra ?? []) {
    const entry = RULES[name];
    out.push({ form: entry.form, gloss: entry.gloss });
  }
  return out;
}

function renderSigils(manifest) {
  const live = manifest.sigils.filter((s) => !s.reserved);
  const reserved = manifest.sigils.filter((s) => s.reserved);

  const rows = live.map((s) => [code(`${s.sigil}${s.kind[0]}`), s.kind, code(s.sigil)]);
  let out = `A sigil prefixes a single-uppercase-letter generic to fix its kind.\n\n${table(
    ['Example', 'Kind', 'Sigil'],
    rows,
  )}`;

  if (reserved.length > 0) {
    const list = reserved.map((s) => code(s.sigil)).join(', ');
    out +=
      `\n\nReserved for future kinds and **not parsed today**: ${cell(list)}. ` +
      `Each is already a live operator, so writing one as a sigil does not do what it looks like.`;
  }
  return out;
}

function renderPrecedence() {
  const byRank = new Map();
  const add = (prec, form) => {
    if (!prec) return;
    if (!byRank.has(prec)) byRank.set(prec, []);
    byRank.get(prec).push(form);
  };
  for (const [lexeme, entry] of Object.entries(LEXEMES)) add(entry.prec, entry.form ?? lexeme);
  for (const entry of Object.values(RULES)) if (entry) add(entry.prec, entry.form);

  const ranks = [...byRank.keys()].sort((a, b) => b - a);
  const strongest = ranks[0];
  const weakest = ranks[ranks.length - 1];

  const rows = ranks.map((rank) => {
    const label = rank === strongest ? `${rank} (strongest)` : rank === weakest ? `${rank} (weakest)` : String(rank);
    return [label, byRank.get(rank).map(code).join(' '), PRECEDENCE_ROLES[rank]];
  });

  return (
    'From strongest (evaluated first) to weakest. Member access and the pipe bind ' +
    '**more tightly** than arithmetic, unlike most languages.\n\n' +
    table(['Rank', 'Operators', 'Role'], rows) +
    '\n\nOnly infix operators have a precedence. `<-`, `->`, `=`, `...` and `;` never ' +
    'take part in a binary expression, so they appear in the tables below and not here.'
  );
}

function renderPage(page, manifest) {
  const byName = new Map(manifest.rules.map((r) => [r.name, r]));
  const blocks = [];

  for (const section of page.sections) {
    let body;
    if (section.kind === 'sigils') body = renderSigils(manifest);
    else if (section.kind === 'precedence') body = renderPrecedence();
    else {
      const rows = entriesOf(section, byName).map((e) => [code(e.form), e.gloss]);
      body = table([section.column, 'Meaning'], rows);
    }
    blocks.push(`### ${section.heading}\n\n${body}`);
  }

  return blocks.join('\n\n');
}

// --- écriture dans les pages -------------------------------------------------

const BEGIN = (id) =>
  `<!-- BEGIN GENERATED ${id} — généré depuis syntaxes/typr.syntax.json par scripts/gen-syntax-reference.mjs ; ne pas éditer à la main -->`;
const END = (id) => `<!-- END GENERATED ${id} -->`;

function spliceRegion(source, id, body, file) {
  const begin = BEGIN(id);
  const end = END(id);
  const start = source.indexOf(begin);
  const stop = source.indexOf(end);
  if (start === -1 || stop === -1 || stop < start) {
    fail(
      `${file} n'a pas de région « ${id} ».\n` +
        `  Encadre l'inventaire par ces deux lignes :\n    ${begin}\n    ${end}`,
    );
  }
  return `${source.slice(0, start)}${begin}\n\n${body}\n\n${source.slice(stop)}`;
}

// --- main --------------------------------------------------------------------

function main() {
  const opts = parseArgs(process.argv.slice(2));
  const manifest = loadManifest(opts.manifest);

  const problems = checkCoverage(manifest);
  if (problems.length > 0) {
    process.stderr.write(`${RED}La doc et le manifeste ont divergé${RESET} :\n\n`);
    for (const problem of problems) process.stderr.write(`  • ${problem}\n`);
    process.stderr.write(
      `\n${DIM}Le manifeste est généré par le compilateur ` +
        `(crates/typr-core/src/components/syntax/mod.rs) ; c'est la doc qui doit suivre.${RESET}\n`,
    );
    process.exit(1);
  }

  let drifted = 0;
  for (const page of PAGES) {
    const file = path.join(ROOT, page.file);
    const before = fs.readFileSync(file, 'utf8');
    const after = spliceRegion(before, page.id, renderPage(page, manifest), page.file);
    if (before === after) continue;
    drifted++;
    if (opts.check) {
      process.stderr.write(`${RED}✗${RESET} ${page.file} n'est plus à jour avec le manifeste.\n`);
    } else {
      fs.writeFileSync(file, after);
      process.stdout.write(`${GREEN}✓${RESET} ${page.file} régénéré.\n`);
    }
  }

  if (opts.check) {
    if (drifted > 0) {
      process.stderr.write(
        `\n${drifted} page(s) à régénérer : ${DIM}npm run syntax:reference${RESET}\n`,
      );
      process.exit(1);
    }
    process.stdout.write(`${GREEN}✓${RESET} les inventaires de syntaxe sont à jour avec le manifeste.\n`);
  } else if (drifted === 0) {
    process.stdout.write(`${GREEN}✓${RESET} les inventaires de syntaxe étaient déjà à jour.\n`);
  }
}

main();
