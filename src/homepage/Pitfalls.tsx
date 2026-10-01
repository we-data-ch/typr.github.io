// « What R lets through » — les erreurs que R signale tard, ou jamais.
//
// Même geste que « See R become typed », autre axe : là, un écosystème à la
// fois ; ici, une *classe d'erreur* à la fois. À chaque onglet, le code R tel
// qu'on l'écrit (et ce qu'il fait en silence), le même code en TypR — qui ne
// compile pas — et le diagnostic réel du compilateur.
//
// Les cinq erreurs viennent de ce que les développeurs R demandent depuis dix
// ans à un système de types : un contrat de fonction, la longueur d'un vecteur,
// le schéma d'un data frame, le sens d'une donnée (`factor`), et le cas
// oublié. Chacune s'appuie sur ce que le compilateur fait *aujourd'hui* : un
// exemple qui promet davantage vaut moins que pas d'exemple.
//
// Les extraits sont de vrais fichiers (src/homepage/snippets/). Les
// `*-broken.ty` DOIVENT être rejetés — `npm run check:examples` inverse
// l'oracle pour eux — et les `*-error.txt` sont la sortie réelle de
// `typr check` sur eux (voir snippets/README.md pour les régénérer).

import React, {type ReactNode} from 'react';
import {CodePane} from './Code';
import {UseCaseTabs, type UseCase} from './UseCases';
import styles from './useCases.module.css';

/** Le diagnostic du compilateur, sous la comparaison. */
function error(snippet: string): ReactNode {
  return (
    <div className={styles.extraSingle}>
      <CodePane snippet={snippet} label="typr check" tone="error" />
    </div>
  );
}

const PITFALLS: UseCase[] = [
  {
    id: 'contracts',
    tab: 'Contracts',
    title: 'Replace hand-written checks with a type.',
    before: 'contracts.r',
    after: 'contracts-broken.typr',
    message:
      'The range lives in the signature. A literal that breaks it is rejected at compile time; a value only known at run time gets one check, at the call.',
    extra: error('contracts-error.text'),
  },
  {
    id: 'recycling',
    tab: 'Vector length',
    title: 'Make the length of a vector part of its type.',
    before: 'recycling.r',
    after: 'recycling-broken.typr',
    message:
      'In R, length changes what an operation means. A [3, num] cannot silently become two values.',
    extra: error('recycling-error.text'),
  },
  {
    id: 'columns',
    tab: 'Data frames',
    title: 'Catch the typo before it becomes an empty vector.',
    before: 'columns.r',
    after: 'columns-broken.typr',
    message:
      'TypR knows the columns of a data frame, so a column that does not exist is an error where you wrote it, not a NULL three functions later.',
    extra: error('columns-error.text'),
  },
  {
    id: 'factor',
    tab: 'Factors',
    title: 'Type what the data means, not how it is stored.',
    before: 'factor.r',
    after: 'factor-broken.typr',
    message:
      'A factor is stored as integers but is not a number. Naming it as its own type keeps it out of numeric functions.',
    extra: error('factor-error.text'),
  },
  {
    id: 'status',
    tab: 'Missing cases',
    title: 'Never forget a case again.',
    before: 'status.r',
    after: 'status-broken.typr',
    message:
      'A union lists every value a variable can take, and match must handle all of them.',
    extra: error('status-error.text'),
  },
];

export default function Pitfalls(): ReactNode {
  return <UseCaseTabs cases={PITFALLS} idPrefix="pitfall" ariaLabel="Mistakes R lets through" />;
}
