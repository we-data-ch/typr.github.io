#!/usr/bin/env node
/**
 * Vérifie chaque bloc ```typr de la documentation contre le vrai compilateur.
 *
 * Le principe : la doc d'un langage ne doit pas pouvoir diverger silencieusement
 * de son compilateur. Chaque bloc destiné au playground est censé être un
 * programme complet et autonome ; ce script le prouve en lui appliquant
 * `typr check`.
 *
 * Deux mots-clés de fence changent l'oracle :
 *
 *   - `noplayground` — bloc ignoré. Fragment, tableau de syntaxe, forme que le
 *     parser ne sait pas encore lire : rien à affirmer dessus.
 *   - `compile_fail` — bloc vérifié *à l'envers* : il DOIT être rejeté par le
 *     compilateur. C'est l'emprunt à rustdoc, et c'est ce qui garde un
 *     contre-exemple vivant : le jour où il se met à compiler, le langage a
 *     bougé sous lui et le bandeau affiché au lecteur ment. `compile_fail`
 *     l'emporte sur `noplayground` — c'est une assertion, pas une dispense.
 *
 * Chaque bloc est vérifié *isolément* : les exemples du playground sont
 * volontairement auto-suffisants (préambule `# --- setup, ... ---` quand ils ont
 * besoin d'une définition d'un bloc précédent), donc les concaténer masquerait
 * justement les blocs incomplets.
 *
 * Usage :
 *   node scripts/check-typr-blocks.mjs [options]
 *
 * Sortie : 0 si tous les blocs passent, 1 si au moins un échoue, 2 si le script
 * lui-même ne peut pas s'exécuter (binaire introuvable, par exemple).
 */

import { execFile } from 'node:child_process';
import { cpus, tmpdir } from 'node:os';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');

/** Racines parcourues, relatives à la racine du dépôt. */
const SOURCES = ['docs', 'blog', 'src/pages'];
const EXTENSIONS = new Set(['.md', '.mdx']);

/**
 * Les extraits de la page d'accueil, qui ne sont pas du Markdown.
 *
 * Ce sont de vrais fichiers `.ty` (src/homepage/snippets/), lus et colorés au
 * build par src/homepage/plugin.ts. Ils sont vérifiés ici comme les blocs de la
 * doc, et pour la même raison : la page d'accueil est la première chose qu'un
 * visiteur lit du langage, un exemple faux y coûte plus cher qu'ailleurs.
 *
 * Un nom terminé par `-broken` est un contre-exemple : il DOIT être rejeté par
 * le compilateur. Le même oracle inversé que `compile_fail` dans le Markdown —
 * la page d'accueil affiche le diagnostic, il ne doit pas cesser d'exister.
 */
const SNIPPETS_DIR = 'src/homepage/snippets';
const SNIPPETS_EXTENSION = '.ty';
const BROKEN_SUFFIX = '-broken';

const IN_CI = Boolean(process.env.GITHUB_ACTIONS);
const RED = IN_CI || process.stdout.isTTY ? '\u001b[31m' : '';
const GREEN = IN_CI || process.stdout.isTTY ? '\u001b[32m' : '';
const DIM = IN_CI || process.stdout.isTTY ? '\u001b[2m' : '';
const RESET = RED ? '\u001b[0m' : '';

const HELP = `Usage: node scripts/check-typr-blocks.mjs [options]

  --typr <chemin>   binaire typr à utiliser (défaut : $TYPR_BIN, sinon « typr »)
  --only <motif>    ne vérifier que les blocs dont le chemin contient <motif>
  --jobs <n>        vérifications en parallèle (défaut : nombre de CPU)
  --list            lister les blocs sans les vérifier
  --noplayground    inventorier (en Markdown) les blocs exclus de la vérification
  --keep            conserver le répertoire temporaire (débogage)
`;

// --- arguments ---------------------------------------------------------------

function parseArgs(argv) {
  const opts = {
    typr: process.env.TYPR_BIN || 'typr',
    only: null,
    jobs: Math.max(1, cpus().length),
    list: false,
    noplayground: false,
    keep: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const value = () => {
      const v = argv[++i];
      if (v === undefined) fail(`l'option ${arg} attend une valeur`);
      return v;
    };
    switch (arg) {
      case '--typr': opts.typr = value(); break;
      case '--only': opts.only = value(); break;
      case '--jobs': opts.jobs = Math.max(1, Number.parseInt(value(), 10) || 1); break;
      case '--list': opts.list = true; break;
      case '--noplayground': opts.noplayground = true; break;
      case '--keep': opts.keep = true; break;
      case '-h':
      case '--help':
        process.stdout.write(HELP);
        process.exit(0);
        break;
      default:
        fail(`option inconnue : ${arg}\n\n${HELP}`);
    }
  }
  return opts;
}

function fail(message) {
  process.stderr.write(`check-typr-blocks: ${message}\n`);
  process.exit(2);
}

// --- collecte des blocs ------------------------------------------------------

function* walk(dir) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return; // une racine absente n'est pas une erreur
  }
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (EXTENSIONS.has(path.extname(entry.name))) yield full;
  }
}

/**
 * Extrait les blocs ```typr d'un fichier Markdown.
 *
 * Machine à états sur les clôtures : une clôture ouvrante retient son caractère
 * (` ou ~) et sa longueur, et seule une clôture du même caractère, au moins
 * aussi longue et sans info-string, la referme. C'est ce qui permet à un bloc
 * ```` de contenir des ``` sans qu'on s'y perde.
 */
function extractBlocks(file) {
  const rel = path.relative(ROOT, file);
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  const blocks = [];
  let open = null;

  for (let i = 0; i < lines.length; i++) {
    const m = /^\s*(`{3,}|~{3,})(.*)$/.exec(lines[i]);
    if (open === null) {
      // Une info-string ne peut pas contenir de backtick pour une clôture en `.
      if (m && !(m[1][0] === '`' && m[2].includes('`'))) {
        open = { marker: m[1], info: m[2].trim(), fenceLine: i + 1, body: [] };
      }
    } else if (
      m &&
      m[1][0] === open.marker[0] &&
      m[1].length >= open.marker.length &&
      m[2].trim() === ''
    ) {
      const [lang, ...meta] = open.info.split(/\s+/);
      if (lang === 'typr') {
        const compileFail = meta.includes('compile_fail');
        blocks.push({
          file: rel,
          fenceLine: open.fenceLine,       // ligne de la clôture ```typr
          firstCodeLine: open.fenceLine + 1,
          meta,
          compileFail,
          // `compile_fail` est une assertion, pas une dispense : le bloc est
          // vérifié, à l'envers. Il l'emporte donc sur `noplayground`, qui n'est
          // qu'un « ne regarde pas ce fragment ».
          skipped: meta.includes('noplayground') && !compileFail,
          code: open.body.join('\n'),
        });
      }
      open = null;
    } else {
      open.body.push(lines[i]);
    }
  }
  return blocks;
}

/**
 * Les extraits de la page d'accueil, présentés comme des blocs pour que la
 * suite du script n'ait qu'une seule sorte d'objet à traiter. `fenceLine` vaut
 * 1 : le fichier *est* le bloc.
 */
function collectSnippets() {
  const dir = path.join(ROOT, SNIPPETS_DIR);
  let entries;
  try {
    entries = fs.readdirSync(dir).sort();
  } catch {
    return []; // le dossier peut disparaître sans que ce script soit en cause
  }
  return entries
    .filter((name) => path.extname(name) === SNIPPETS_EXTENSION)
    .map((name) => ({
      file: path.join(SNIPPETS_DIR, name),
      fenceLine: 1,
      firstCodeLine: 1,
      meta: [],
      compileFail: path.basename(name, SNIPPETS_EXTENSION).endsWith(BROKEN_SUFFIX),
      skipped: false,
      code: fs.readFileSync(path.join(dir, name), 'utf8'),
    }));
}

/** Tous les blocs ```typr du site, vérifiables ou non (`skipped`). */
function collectBlocks(only) {
  const blocks = [];
  for (const source of SOURCES) {
    for (const file of walk(path.join(ROOT, source))) blocks.push(...extractBlocks(file));
  }
  blocks.push(...collectSnippets());
  return only ? blocks.filter((b) => b.file.includes(only)) : blocks;
}

// --- vérification ------------------------------------------------------------

// eslint-disable-next-line no-control-regex
const ANSI = /\u001b\[[0-9;]*m/g;

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Le compilateur rapporte les positions dans le fichier temporaire ; on les
 * réécrit vers le fichier de doc et sa vraie ligne, pour que le message soit
 * directement cliquable.
 */
function remapDiagnostics(output, block) {
  const name = escapeRegExp(block.tmpName);
  const offset = block.firstCodeLine - 1;
  return output
    .replace(new RegExp(`${name}:(\\d+):(\\d+)`, 'g'), (_, l, c) => `${block.file}:${Number(l) + offset}:${c}`)
    .replace(new RegExp(`${name}:(\\d+)`, 'g'), (_, l) => `${block.file}:${Number(l) + offset}`)
    .replaceAll(block.tmpName, block.file);
}

function runCheck(typrBin, cwd, block) {
  return new Promise((resolve, reject) => {
    execFile(
      typrBin,
      ['check', block.tmpName],
      { cwd, maxBuffer: 8 * 1024 * 1024 },
      (error, stdout, stderr) => {
        if (error && error.code === 'ENOENT') return reject(error);
        resolve({ ok: !error, output: `${stdout}${stderr}` });
      },
    );
  });
}

/** Petite piscine de workers : `jobs` vérifications en vol au maximum. */
async function pool(items, jobs, worker) {
  const results = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(jobs, items.length) }, async () => {
      for (;;) {
        const i = next++;
        if (i >= items.length) return;
        results[i] = await worker(items[i]);
      }
    }),
  );
  return results;
}

// --- rapport -----------------------------------------------------------------

/** Le bruit du binaire (avertissement devtools, étapes du pipeline) n'aide personne ici. */
function cleanOutput(output) {
  return output
    .replace(ANSI, '')
    .split('\n')
    .filter((l) => !/missing R package/.test(l))
    .filter((l) => !/typr init/.test(l))
    .filter((l) => !/^\s*(Parsing|Type checking)\.\.\.\s*(done.*)?$/.test(l))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function indent(text, prefix) {
  return `${text.split('\n').map((l) => (l ? prefix + l : l)).join('\n')}\n`;
}

function report(blocks, failures) {
  const out = process.stdout;
  const expectedFail = blocks.filter((b) => b.compileFail).length;
  const tally =
    expectedFail === 0
      ? `${blocks.length} bloc(s)`
      : `${blocks.length - expectedFail} bloc(s) + ${expectedFail} contre-exemple(s) \`compile_fail\``;

  if (failures.length === 0) {
    out.write(`${GREEN}✓${RESET} ${tally} \`\`\`typr : chacun se comporte comme annoncé.\n`);
    return;
  }

  for (const { block, output } of failures) {
    if (block.compileFail) {
      // Pas de diagnostic à montrer : le problème, c'est justement qu'il n'y en
      // a plus.
      out.write(
        `\n${RED}✗${RESET} ${block.file}:${block.fenceLine} — marqué \`compile_fail\`, mais le bloc compile\n`,
      );
      out.write(
        `${DIM}    Le langage a changé sous ce contre-exemple : soit il n'illustre plus rien\n` +
          `    et il faut le réécrire, soit il est devenu valide et le mot-clé doit sauter.${RESET}\n`,
      );
    } else {
      out.write(`\n${RED}✗${RESET} ${block.file}:${block.fenceLine} — le bloc ne passe pas \`typr check\`\n`);
      // Les positions en tête de diagnostic sont réécrites en lignes du fichier
      // Markdown ; la marge de gauche, elle, reste numérotée depuis le bloc.
      out.write(`${DIM}    (marge du diagnostic : lignes relatives au bloc, qui commence ligne ${block.firstCodeLine})${RESET}\n`);
      out.write(indent(output, '    '));
    }

    if (IN_CI) {
      const title = block.compileFail ? 'compile_fail qui compile' : 'Bloc typr invalide';
      const message = block.compileFail
        ? "Ce bloc est marqué compile_fail mais le compilateur l'accepte."
        : output.replaceAll('\n', '%0A');
      out.write(`::error file=${block.file},line=${block.fenceLine},title=${title}::${message}\n`);
    }
  }

  out.write(
    `\n${RED}${failures.length}${RESET} bloc(s) en échec sur ${blocks.length} vérifié(s).\n` +
      `${DIM}Trois issues pour un bloc qui ne compile pas : le corriger ; le marquer\n` +
      `\`\`\`typr compile_fail si le refus du compilateur est ce qu'il démontre ; le marquer\n` +
      `\`\`\`typr noplayground s'il n'a jamais été un programme complet et autonome.${RESET}\n`,
  );
}

/** Tableau Markdown des blocs exclus de la vérification, par fichier. */
function inventory(skipped, total) {
  const out = process.stdout;
  const byFile = new Map();
  for (const b of skipped) {
    if (!byFile.has(b.file)) byFile.set(b.file, []);
    byFile.get(b.file).push(b);
  }

  out.write(`# Blocs \`\`\`typr noplayground\n\n`);
  out.write(
    `${skipped.length} bloc(s) sur ${total} sont exclus de \`npm run check:examples\`.\n` +
      `Chacun est soit une limite connue du parser, soit un exemple à corriger — ou un\n` +
      `contre-exemple qui gagnerait à passer en \`compile_fail\`, qui lui est vérifié.\n\n`,
  );
  out.write('| Fichier | Ligne | Première ligne du bloc |\n|---|---|---|\n');
  for (const [file, list] of [...byFile].sort(([a], [b]) => a.localeCompare(b))) {
    for (const b of list) {
      const firstLine = b.code.split('\n').find((l) => l.trim() !== '') ?? '';
      out.write(`| \`${file}\` | ${b.fenceLine} | \`${firstLine.trim().slice(0, 60).replaceAll('|', '\\|')}\` |\n`);
    }
  }
}

// --- programme ---------------------------------------------------------------

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const all = collectBlocks(opts.only);

  // Un `noplayground` est une dette : soit une limite connue du parser, soit un
  // exemple à corriger. L'inventaire est calculé, jamais tenu à la main — une
  // liste écrite dans un fichier se serait périmée dès la PR suivante.
  if (opts.noplayground) {
    inventory(all.filter((b) => b.skipped), all.length);
    return 0;
  }

  const blocks = all.filter((b) => !b.skipped);

  if (blocks.length === 0) {
    process.stdout.write('Aucun bloc ```typr à vérifier.\n');
    return 0;
  }

  if (opts.list) {
    for (const b of blocks) {
      process.stdout.write(`${b.file}:${b.fenceLine}${b.compileFail ? '\tcompile_fail' : ''}\n`);
    }
    process.stdout.write(`\n${blocks.length} bloc(s).\n`);
    return 0;
  }

  const tmpDir = fs.mkdtempSync(path.join(process.env.RUNNER_TEMP || tmpdir(), 'typr-blocks-'));
  try {
    const used = new Map();
    for (const b of blocks) {
      // Le nom du fichier temporaire apparaît dans les diagnostics : on le rend
      // lisible, et unique même si deux clôtures partagent une ligne d'origine.
      const base = `${b.file.replace(/\.mdx?$/, '').replace(/[^\w.-]+/g, '_')}_L${b.fenceLine}`;
      const n = (used.get(base) ?? 0) + 1;
      used.set(base, n);
      b.tmpName = `${n === 1 ? base : `${base}_${n}`}.ty`;
      fs.writeFileSync(path.join(tmpDir, b.tmpName), b.code.endsWith('\n') ? b.code : `${b.code}\n`);
    }

    // Le premier `typr check` génère le préchargement de la bibliothèque
    // standard (context.json, std.ty) dans le répertoire courant. On le lance
    // seul, avant de paralléliser, pour qu'aucune course n'écrive ces fichiers
    // à plusieurs — et au passage ça valide que le binaire est exécutable.
    const [first, ...rest] = blocks;
    let firstResult;
    try {
      firstResult = await runCheck(opts.typr, tmpDir, first);
    } catch (e) {
      fail(
        `impossible d'exécuter « ${opts.typr} » (${e.code || e.message}).\n` +
          `  Installe le compilateur, ou passe son chemin avec --typr / TYPR_BIN.`,
      );
    }

    const results = [firstResult, ...(await pool(rest, opts.jobs, (b) => runCheck(opts.typr, tmpDir, b)))];

    // L'oracle a deux sens. Un bloc ordinaire doit compiler ; un bloc
    // `compile_fail` doit échouer — et le jour où il se met à compiler, c'est
    // que le langage a bougé sous lui : le contre-exemple ne démontre plus rien
    // et le bandeau ment au lecteur.
    const failures = [];
    results.forEach((r, i) => {
      const block = blocks[i];
      if (block.compileFail === r.ok) {
        failures.push({
          block,
          output: r.ok ? '' : remapDiagnostics(cleanOutput(r.output), block),
        });
      }
    });

    report(blocks, failures);
    return failures.length === 0 ? 0 : 1;
  } finally {
    if (opts.keep) process.stdout.write(`\nRépertoire temporaire conservé : ${tmpDir}\n`);
    else fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

process.exitCode = await main();
