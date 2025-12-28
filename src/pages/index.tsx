import React, { CSSProperties } from "react";
import useBaseUrl from '@docusaurus/useBaseUrl';

interface Styles {
  [key: string]: CSSProperties;
}

const styles: Styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#1b1b1d",
    color: "#f3f4f6",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem",
  },
  container: {
    maxWidth: "960px",
    width: "100%",
    textAlign: "center",
  },
  logo: {
    width: "220px",
    height: "220px",
    borderRadius: "24px",
    marginBottom: "2rem",
    boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
  },
  title: {
    fontSize: "3rem",
    fontWeight: 700,
    marginBottom: "1.5rem",
    lineHeight: 1.1,
  },
  subtitle: {
    display: "block",
    color: "#c7c7cc",
  },
  tagline: {
    fontSize: "1.3rem",
    color: "#9ca3af",
    marginBottom: "3rem",
    lineHeight: 1.6,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "1.5rem",
    marginBottom: "3rem",
  },
  card: {
    backgroundColor: "#232326",
    borderRadius: "20px",
    padding: "1.5rem",
    boxShadow: "0 10px 20px rgba(0,0,0,0.3)",
  },
  cardTitle: {
    fontSize: "1.1rem",
    fontWeight: 600,
    marginBottom: "0.5rem",
  },
  cardText: {
    fontSize: "0.95rem",
    color: "#9ca3af",
    lineHeight: 1.5,
  },
  ctaRow: {
    display: "flex",
    gap: "1rem",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  primaryButton: {
    padding: "0.75rem 1.5rem",
    borderRadius: "14px",
    backgroundColor: "#f3f4f6",
    color: "#1b1b1d",
    fontWeight: 600,
    textDecoration: "none",
    display: "inline-block",
  },
  secondaryButton: {
    padding: "0.75rem 1.5rem",
    borderRadius: "14px",
    border: "1px solid #6b7280",
    color: "#e5e7eb",
    textDecoration: "none",
    display: "inline-block",
  },
  footer: {
    marginTop: "4rem",
    fontSize: "0.9rem",
    color: "#6b7280",
  },
};

const Home: React.FC = () => {
	const logoUrl = useBaseUrl('/img/typr_carre.png');
	const docsUrl = useBaseUrl('/docs/intro');
	const philosophyUrl = useBaseUrl('/docs/philosophy');
  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <img src={logoUrl} alt="Typed R logo" style={styles.logo} />

        <h1 style={styles.title}>
          R's types for data sciences
        </h1>

        <p style={styles.tagline}>
          A modern type system for R, designed to improve safety, ease package
          maintenance, and encourage explicit, long-lasting data modeling.
        </p>

        <div style={styles.grid}>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Build faster. Maintain longer.</h3>
            <p style={styles.cardText}>
              Evolve your packages with confidence thanks to powerful tools 
			  that support code reuse and long-term evolution.
            </p>
          </div>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Data modeling</h3>
            <p style={styles.cardText}>
              Clearly express data structures, invariants, and contracts for R
              code that is easier to read, reason about, and trust.
            </p>
          </div>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Safety by default</h3>
            <p style={styles.cardText}>
              Catch errors earlier. Types document intent and prevent silent bugs
              in analyses and R packages.
            </p>
          </div>
        </div>

        <div style={styles.ctaRow}>
          <a href={docsUrl} style={styles.primaryButton}>
            Read the documentation
          </a>
          <a href={philosophyUrl} style={styles.secondaryButton}>
            Explore the philosophy
          </a>
        </div>

        <footer style={styles.footer}>
          Built for R developers who care about reliable, maintainable, and
          evolvable systems.
        </footer>
      </div>
    </main>
  );
};

export default Home;
