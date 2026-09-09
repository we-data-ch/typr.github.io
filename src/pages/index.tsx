// La page d'accueil.
//
// Elle raconte une histoire, et l'ordre des sections *est* cette histoire :
// vos données ont une forme, et elle ne devrait pas vivre dans la tête des gens
// → voici ce que les types changent au code que vous écrivez déjà → voici les
// outils → installez TypR.
//
// Une section = une question, et une seule. Déplacer une section, c'est
// déplacer une réponse : le fil se lit du haut vers le bas.
//
// Le pourquoi ne fait pas de section à lui seul — un paragraphe sur « quand
// les scripts deviennent des systèmes » expliquait moins bien que la
// démonstration qui suit. Il tient donc en deux phrases, en tête du modèle de
// données, et « See R become typed » fait le reste en code.
//
// « TypR compile vers du R ordinaire » ne fait pas non plus de section : c'est
// la première objection d'un lecteur qui vient de R, donc elle est répondue
// dès le hero, avant même le titre d'une section.
//
// La section « Vision » (R / JS / WASM) a été retirée le temps de clarifier la
// roadmap — elle reviendra quand ce sera pertinent, pas avant.

import React, {useEffect, useState, type ReactNode} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import clsx from 'clsx';
import {CodePane} from '@site/src/homepage/Code';
import {Branch, Hub} from '@site/src/homepage/Diagram';
import UseCases from '@site/src/homepage/UseCases';
import {PLAYGROUND_URL} from '@site/src/playground/url';
import styles from './index.module.css';

const GITHUB_URL = 'https://github.com/we-data-ch/typr';

// Écrite ici parce qu'aucun fichier de ce dépôt ne la connaît : la version vit
// dans le Cargo.toml du compilateur (dépôt we-data-ch/typr). À reprendre à la
// main à chaque release, comme la grammaire de syntaxes/.
const VERSION = '0.5.10';

/** Le compteur d'étoiles, à charger côté client — il n'existe pas au build. */
function GitHubStars(): ReactNode {
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('https://api.github.com/repos/we-data-ch/typr')
      .then((res) => res.json())
      .then((data) => {
        // L'API répond aussi 403 (quota) avec un corps JSON : sans le champ,
        // on n'affiche simplement rien.
        if (!cancelled && typeof data?.stargazers_count === 'number') {
          setStars(data.stargazers_count);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (stars === null) {
    return null;
  }

  return (
    <>
      <span className={styles.metaSeparator} aria-hidden="true">
        ·
      </span>
      <a
        className={styles.metaLink}
        href={`${GITHUB_URL}/stargazers`}
        target="_blank"
        rel="noopener noreferrer">
        ★ {stars.toLocaleString('en-US')} on GitHub
      </a>
    </>
  );
}

function Section({
  id,
  tone,
  children,
}: {
  id: string;
  /** `alt` pose un fond légèrement différent, pour séparer deux sections. */
  tone?: 'alt';
  children: ReactNode;
}): ReactNode {
  return (
    <section id={id} className={clsx(styles.section, tone === 'alt' && styles.sectionAlt)}>
      <div className={styles.container}>{children}</div>
    </section>
  );
}

function Hero(): ReactNode {
  const logoUrl = useBaseUrl('/img/typr_carre.png');

  return (
    <header className={styles.hero}>
      <div className={styles.container}>
        <img className={styles.heroLogo} src={logoUrl} alt="" />

        <h1 className={styles.heroTitle}>
          Type-safe R for <span className={styles.nowrap}>long-lived</span> software.
        </h1>

        <p className={styles.heroSubtitle}>
          TypR is a typed programming language for building R packages,
          applications and data systems that are easier to understand, maintain
          and evolve. It compiles to plain R, so it fits into the ecosystem you
          already use.
        </p>

        <p className={styles.heroDomains}>
          Packages <span aria-hidden="true">·</span> Shiny applications{' '}
          <span aria-hidden="true">·</span> Data pipelines{' '}
          <span aria-hidden="true">·</span> APIs
        </p>

        <div className={styles.heroActions}>
          <Link className={styles.buttonPrimary} to="/docs/reference/installation">
            Download TypR
          </Link>
          <Link className={styles.buttonSecondary} to="/docs/intro">
            Get started
          </Link>
          <a
            className={styles.buttonGhost}
            href={PLAYGROUND_URL}
            target="_blank"
            rel="noopener noreferrer">
            Try the playground
          </a>
        </div>

        <p className={styles.heroMeta}>
          <span>version {VERSION} (alpha)</span>
          <GitHubStars />
        </p>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  const typrLogo = useBaseUrl('/img/typr_carre.png');

  return (
    <Layout
      title="Type-safe R for long-lived software"
      description="TypR is a typed programming language for building R packages, applications and data systems that are easier to understand, maintain and evolve.">
      <Hero />

      {/* Pourquoi les types sont-ils importants ? */}
      <Section id="data-model" tone="alt">
        <h2 className={styles.sectionTitle}>
          Your data model should not live in people’s heads.
        </h2>
        <p className={styles.sectionLead}>
          R projects start as scripts. The ones that turn into packages, Shiny
          applications or data pipelines end up maintained for years — and by
          then, the shape of the data is what everyone needs to know. Define it
          once, and use it throughout your system.
        </p>

        <div className={styles.split}>
          <CodePane snippet="data-model.typr" tone="accent" />
          <Branch
            root={{label: 'Customer', accent: true}}
            leaves={[
              {label: 'Package', hint: 'typed functions'},
              {label: 'Shiny', hint: 'typed reactives'},
              {label: 'API', hint: 'typed responses'},
            ]}
            caption="One definition, the same meaning everywhere it is used."
          />
        </div>
      </Section>

      {/* Qu'est-ce que cela change concrètement ? */}
      <Section id="from-r-to-typr">
        <h2 className={styles.sectionTitle}>See R become typed.</h2>
        <p className={styles.sectionLead}>
          The same ideas. More explicit contracts.
        </p>
        <UseCases />
      </Section>

      {/* Quels outils sont disponibles ? */}
      <Section id="toolchain" tone="alt">
        <h2 className={styles.sectionTitle}>One language. One toolchain.</h2>
        <p className={styles.sectionLead}>
          The <code>typr</code> command provides the tools needed to build,
          explore and maintain TypR projects.
        </p>

        <Hub
          center={{label: 'typr', accent: true, img: typrLogo}}
          top={{label: 'Compiler', hint: 'check, build'}}
          right={{label: 'REPL', hint: 'explore'}}
          bottom={{label: 'Project manager', hint: 'new, run, test'}}
          left={{label: 'LSP', hint: 'editors'}}
          caption="One binary. Every tool talks to the same compiler and the same types."
        />
      </Section>

      {/* Comment commencer ? */}
      <Section id="get-started" tone="alt">
        <div className={styles.cta}>
          <h2 className={styles.sectionTitle}>Build software that lasts.</h2>
          <p className={styles.sectionLead}>
            Start building your next R package, application or data system with
            TypR.
          </p>
          <div className={styles.heroActions}>
            <Link className={styles.buttonPrimary} to="/docs/reference/installation">
              Download TypR
            </Link>
            <Link className={styles.buttonSecondary} to="/docs/intro">
              Read the documentation
            </Link>
            <a
              className={styles.buttonGhost}
              href={PLAYGROUND_URL}
              target="_blank"
              rel="noopener noreferrer">
              Try the playground
            </a>
          </div>
        </div>
      </Section>
    </Layout>
  );
}
