// L'installation en une commande, sur la page d'accueil.
//
// Même idée que le playground : le lecteur ne doit pas quitter la page pour
// essayer TypR. La commande affichée est celle de son système, devinée côté
// client (au build, on ne sait pas qui lit) ; un onglet permet de corriger si
// la détection se trompe. Les deux commandes sont celles de
// docs/reference/installation.md — à garder identiques.

import React, {useEffect, useState, type ReactNode} from 'react';
import Link from '@docusaurus/Link';
import clsx from 'clsx';
import styles from './installCommand.module.css';

const BASE = 'https://we-data-ch.github.io/typr.github.io/install';

const TARGETS = {
  unix: {
    label: 'Linux / macOS',
    shell: 'sh',
    prompt: '$',
    command: `curl -fsSL ${BASE}/install.sh | sh`,
  },
  windows: {
    label: 'Windows',
    shell: 'PowerShell',
    prompt: '>',
    command: `irm ${BASE}/install.ps1 | iex`,
  },
} as const;

type TargetId = keyof typeof TARGETS;

function detectTarget(): TargetId {
  if (typeof navigator === 'undefined') {
    return 'unix';
  }
  return /win/i.test(navigator.platform || navigator.userAgent) ? 'windows' : 'unix';
}

export default function InstallCommand(): ReactNode {
  // `unix` au rendu statique, corrigé après l'hydratation : sinon le HTML
  // généré au build et celui du navigateur divergeraient.
  const [target, setTarget] = useState<TargetId>('unix');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setTarget(detectTarget());
  }, []);

  useEffect(() => {
    if (!copied) {
      return undefined;
    }
    const timer = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(timer);
  }, [copied]);

  const current = TARGETS[target];

  const copy = () => {
    navigator.clipboard?.writeText(current.command).then(
      () => setCopied(true),
      () => {},
    );
  };

  return (
    <div className={styles.install}>
      <div className={styles.tabs} role="tablist" aria-label="Operating system">
        {(Object.keys(TARGETS) as TargetId[]).map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={id === target}
            className={clsx(styles.tab, id === target && styles.tabActive)}
            onClick={() => {
              setTarget(id);
              setCopied(false);
            }}>
            {TARGETS[id].label}
          </button>
        ))}
      </div>

      <div className={styles.line}>
        <code className={styles.code} aria-label={`Install command for ${current.shell}`}>
          <span className={styles.prompt} aria-hidden="true">
            {current.prompt}
          </span>
          {current.command}
        </code>
        <button type="button" className={styles.copy} onClick={copy}>
          {copied ? 'Copied ✓' : 'Copy'}
        </button>
      </div>

      <p className={styles.note}>
        One command, no admin rights, checksum verified.{' '}
        <Link to="/docs/reference/installation">Other ways to install</Link>
      </p>
    </div>
  );
}
