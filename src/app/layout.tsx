import type { Metadata } from "next";
import type { ReactNode } from "react";

const maintenanceStyles = `
  :root {
    color-scheme: light dark;
    --bg-start: #0f172a;
    --bg-end: #1e293b;
    --card-bg: rgba(15, 23, 42, 0.78);
    --text-primary: #f8fafc;
    --text-secondary: #cbd5f5;
    --accent: #38bdf8;
    --blur: 22px;
  }
  body {
    margin: 0;
    min-height: 100vh;
    font-family: "Inter", "Segoe UI", system-ui, sans-serif;
    display: grid;
    place-items: center;
    background: radial-gradient(circle at top, var(--bg-start), var(--bg-end));
    color: var(--text-primary);
    padding: 24px;
  }
  .card {
    max-width: 480px;
    width: 100%;
    background: var(--card-bg);
    border: 1px solid rgba(148, 163, 184, 0.2);
    border-radius: 20px;
    padding: 40px;
    backdrop-filter: blur(var(--blur));
    text-align: center;
    box-shadow: 0 20px 40px rgba(15, 23, 42, 0.45);
  }
  .card h1 {
    font-size: clamp(1.75rem, 4vw, 2.5rem);
    margin-bottom: 16px;
    letter-spacing: 0.02em;
  }
  .card p {
    margin: 0;
    font-size: 1rem;
    line-height: 1.6;
    color: var(--text-secondary);
  }
  .cta {
    margin-top: 32px;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 14px 22px;
    border-radius: 999px;
    background: rgba(56, 189, 248, 0.12);
    color: var(--accent);
    text-decoration: none;
    font-weight: 600;
    transition: background 0.25s ease, transform 0.25s ease;
  }
  .cta:hover {
    background: rgba(56, 189, 248, 0.2);
    transform: translateY(-2px);
  }
  .cta span {
    font-size: 0.95rem;
    letter-spacing: 0.01em;
  }
  .cta svg {
    width: 18px;
    height: 18px;
    fill: currentColor;
  }
  @media (max-width: 480px) {
    .card {
      padding: 32px 24px;
    }
  }
`;

export const metadata: Metadata = {
  title: "Shopo Admin",
  description: "Maintenance notice",
};

export default function RootLayout({
  children: _children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <style dangerouslySetInnerHTML={{ __html: maintenanceStyles }} />
      </head>
      <body>
        <main className="card" role="alert">
          <h1>Oops! We Hit a Snag</h1>
          <p>
            There’s a technical issue with the project at the moment. Our team is on it,
            but if you need immediate assistance, please reach out to Usama directly.
          </p>
          <p style={{ marginTop: 16, fontSize: "0.95rem", color: "var(--text-secondary)" }}>
            Portfolio:{" "}
            <a
              href="https://awesomaa1.webflow.io"
              style={{ color: "var(--accent)", textDecoration: "none" }}
              target="_blank"
              rel="noopener noreferrer"
            >
              awesomaa1.webflow.io
            </a>
          </p>
          <a className="cta" href="tel:+923044478088">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 3c-5.523 0-10 4.477-10 10 0 5.06 3.767 9.246 8.642 9.878v-6.986H8.28v-2.892h2.362V9.63c0-2.332 1.471-3.602 3.54-3.602 1.005 0 1.869.075 2.121.108v2.46h-1.46c-1.147 0-1.366.545-1.366 1.343v1.763h2.731l-.356 2.892h-2.375v6.986C18.233 22.246 22 18.06 22 13c0-5.523-4.477-10-10-10Z" />
            </svg>
            <span>Call Usama · +92 304-4478088</span>
          </a>
        </main>
      </body>
    </html>
  );
}
