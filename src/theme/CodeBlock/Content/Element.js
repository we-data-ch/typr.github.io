/**
 * Swizzle de `@theme/CodeBlock/Content/Element`.
 *
 * Pourquoi : la coloration vient maintenant de Shiki, appliqué au build par
 * `src/syntax/shiki.ts`. Un bloc arrive donc jusqu'à React déjà découpé en
 * <span>, et non plus sous forme de chaîne — ce qui fait passer Docusaurus par
 * ce composant-ci (`ElementContent`) au lieu de `StringContent`. Or la version
 * d'origine est un cul-de-sac volontaire : « we just return a styled block
 * without actually highlighting », donc sans bouton de copie ni retour à la
 * ligne. Ce fichier remet ces deux boutons, qui étaient là avec Prism.
 *
 * Ce qu'on ne restitue pas, faute d'être exprimable sur des jetons déjà rendus :
 * les numéros de ligne et les magic comments (`// highlight-next-line`). Aucun
 * bloc du site n'en utilise.
 *
 * Ce composant est aussi le dernier à voir la metastring de la fence (`autorun`,
 * `noplayground` — voir `src/playground/meta.tsx`) : `CodeBlockMetadata` ne la
 * transporte pas, et `@theme/CodeBlock/Buttons` ne reçoit qu'un `className`. Il
 * la republie donc dans un contexte, pour le bouton « playground ».
 */
import React from 'react';
import clsx from 'clsx';
import {useThemeConfig} from '@docusaurus/theme-common';
import {
  CodeBlockContextProvider,
  createCodeBlockMetadata,
  useCodeWordWrap,
} from '@docusaurus/theme-common/internal';
import Container from '@theme/CodeBlock/Container';
import Buttons from '@theme/CodeBlock/Buttons';
import {CodeBlockMetaProvider} from '@site/src/playground/meta';
import styles from './styles.module.css';

/**
 * Le texte que le bouton « copier » doit mettre dans le presse-papier. Shiki
 * rend un <span> par jeton et un simple "\n" entre les lignes, donc concaténer
 * les feuilles textuelles redonne exactement la source d'origine.
 */
function extractCode(children) {
  return React.Children.toArray(children)
    .map((child) => {
      if (typeof child === 'string') {
        return child;
      }
      if (React.isValidElement(child)) {
        return extractCode(child.props.children);
      }
      return '';
    })
    .join('');
}

export default function CodeBlockJSX({
  children,
  className,
  metastring,
  title,
  showLineNumbers,
  language,
}) {
  const {prism} = useThemeConfig();
  const metadata = createCodeBlockMetadata({
    code: extractCode(children),
    className,
    metastring,
    magicComments: prism.magicComments,
    defaultLanguage: prism.defaultLanguage,
    language,
    title,
    showLineNumbers,
  });
  const wordWrap = useCodeWordWrap();

  return (
    <CodeBlockContextProvider metadata={metadata} wordWrap={wordWrap}>
      <CodeBlockMetaProvider metastring={metastring}>
        <Container as="div" className={metadata.className}>
          <div className={styles.codeBlockContent}>
            <pre
              ref={wordWrap.codeBlockRef}
              /* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */
              tabIndex={0}
              className={clsx(styles.codeBlock, 'thin-scrollbar')}>
              <code className={styles.codeBlockLines}>{children}</code>
            </pre>
            <Buttons />
          </div>
        </Container>
      </CodeBlockMetaProvider>
    </CodeBlockContextProvider>
  );
}
