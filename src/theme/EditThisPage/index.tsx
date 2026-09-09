/**
 * Enveloppe de `@theme/EditThisPage` — le seul composant du thème par lequel
 * passent à la fois les pages de doc, les billets de blog et les pages MDX
 * (tous les trois via `@theme/EditMetaRow`). Y accrocher « Report an issue »
 * le pose donc partout où « Edit this page » apparaît, en une fois.
 *
 * C'est une enveloppe, pas une éjection : aucune ligne du thème n'est recopiée
 * ici, donc rien à resynchroniser à la prochaine montée de version.
 */
import React from 'react';
import EditThisPage from '@theme-original/EditThisPage';
import type EditThisPageType from '@theme/EditThisPage';
import type {WrapperProps} from '@docusaurus/types';
import ReportIssueLink from '@site/src/components/ReportIssueLink';

type Props = WrapperProps<typeof EditThisPageType>;

export default function EditThisPageWrapper(props: Props): React.ReactNode {
  return (
    <>
      <EditThisPage {...props} />
      <ReportIssueLink editUrl={props.editUrl} />
    </>
  );
}
