// « From R to TypR » — le cœur de la page.
//
// Un sélecteur, quatre situations, et à chaque fois le même geste : le code R
// tel qu'on l'écrit, le même code en TypR, puis ce que le changement apporte.
// C'est la section qui doit *montrer* plutôt qu'expliquer — les deux blocs de
// code portent l'argument, la prose ne fait que le nommer.
//
// Les extraits sont de vrais fichiers (src/homepage/snippets/) : les `.ty` sont
// compilés par `npm run check:examples`, donc aucun ne peut mentir sur la
// syntaxe du langage.

import React, {useRef, useState, type ReactNode} from 'react';
import clsx from 'clsx';
import {CodeComparison, CodePane} from './Code';
import {Flow} from './Diagram';
import styles from './useCases.module.css';

interface UseCase {
  id: string;
  /** Le libellé de l'onglet. */
  tab: string;
  title: string;
  /** Clés d'extraits : le fichier R, puis son équivalent TypR. */
  before: string;
  after: string;
  /** La phrase qui répond à « What changes? ». */
  message: string;
  /** Un schéma ou un diagnostic, sous la comparaison. */
  extra?: ReactNode;
}

const USE_CASES: UseCase[] = [
  {
    id: 'package',
    tab: 'R Package',
    title: 'Build packages with explicit contracts.',
    before: 'package.r',
    after: 'package.typr',
    message:
      'A function signature becomes part of the documentation and the contract of your package.',
  },
  {
    id: 'shiny',
    tab: 'Shiny App',
    title: 'Make reactive data easier to reason about.',
    before: 'shiny.r',
    after: 'shiny.typr',
    message: 'Know what your application is reacting to.',
  },
  {
    id: 'pipeline',
    tab: 'Data Pipeline',
    title: 'Make data transformations verifiable.',
    before: 'pipeline.r',
    after: 'pipeline.typr',
    message: 'Make the shape of your data visible across your pipeline.',
    extra: (
      <div className={styles.extra}>
        <Flow
          nodes={[
            {label: 'RawSale', hint: 'as read from the CSV'},
            {label: 'CleanSale', hint: 'parsed and validated', accent: true},
            {label: 'num', hint: 'the aggregate'},
          ]}
          caption="Each stage of the pipeline has a type, so the compiler can follow the data through it."
        />
        <div>
          <p className={styles.extraLead}>
            Drop the parsing step, and the mistake surfaces at compile time
            rather than in production:
          </p>
          <CodePane
            snippet="pipeline-error.text"
            label="typr check"
            tone="error"
          />
        </div>
      </div>
    ),
  },
  {
    id: 'api',
    tab: 'API',
    title: 'Turn functions into explicit contracts.',
    before: 'api.r',
    after: 'api.typr',
    message:
      'Your types describe the contract between your application and its users.',
    extra: (
      <div className={styles.extraSingle}>
        <Flow
          nodes={[
            {label: 'Request'},
            {label: 'int', hint: 'the id, checked'},
            {label: 'get_user', accent: true},
            {label: 'User', hint: 'the response, named'},
          ]}
          caption="The route, the argument and the answer are the same contract, read from one signature."
        />
      </div>
    ),
  },
];

export default function UseCases(): ReactNode {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Flèches, Origine et Fin : ce qu'on attend d'un `tablist`, et ce sans quoi
  // le sélecteur n'est utilisable qu'à la souris.
  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const last = USE_CASES.length - 1;
    let next: number | null = null;
    if (event.key === 'ArrowRight') next = active === last ? 0 : active + 1;
    else if (event.key === 'ArrowLeft') next = active === 0 ? last : active - 1;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = last;
    if (next === null) return;
    event.preventDefault();
    setActive(next);
    tabRefs.current[next]?.focus();
  }

  const useCase = USE_CASES[active];

  return (
    <>
      <div
        role="tablist"
        aria-label="Use cases"
        className={styles.tabs}
        onKeyDown={onKeyDown}>
        {USE_CASES.map((item, i) => (
          <button
            key={item.id}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`usecase-tab-${item.id}`}
            aria-selected={i === active}
            aria-controls={`usecase-panel-${item.id}`}
            tabIndex={i === active ? 0 : -1}
            className={clsx(styles.tab, i === active && styles.tabActive)}
            onClick={() => setActive(i)}>
            {item.tab}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`usecase-panel-${useCase.id}`}
        aria-labelledby={`usecase-tab-${useCase.id}`}
        tabIndex={0}
        className={styles.panel}>
        <h3 className={styles.panelTitle}>{useCase.title}</h3>

        <CodeComparison before={useCase.before} after={useCase.after} />

        <div className={styles.changes}>
          <p className={styles.changesLead}>{useCase.message}</p>
        </div>

        {useCase.extra}
      </div>
    </>
  );
}
