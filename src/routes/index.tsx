import { createFileRoute, redirect } from "@tanstack/react-router";
import { Google as GoogleIcon } from "@thesvg/react";
import { Check, Github, Lock, Layers } from "lucide-react";

import { useGoogleAuth } from "../hooks/useGoogleAuth";
import "./sign-in-buttons-styles.css";
import {
  FAQS,
  FEATURES,
  GITHUB_URL,
  MARKETING_FEATURES,
  MARKETING_FEATURES_DETAILS,
  MARKETING_NAV_ITEMS,
  MOCK_UP_FILES,
  MOCKUP_GROUPS,
  NAV_ITEMS,
  PRIVACY_ITEMS,
  STEPS,
  W,
} from "../data/marketing-page-data";
import { cn } from "../lib/cn";

export const Route = createFileRoute("/")({
  beforeLoad: ({ context }) => {
    if (context.isAuthenticated) {
      console.log("User already authenticated, redirecting to dashboard");
      throw redirect({ to: "/dashboard" });
    }
  },
  component: MarketingPage,
});

function ResultsMockUp() {
  return (
    <div className="bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-[14px] shadow-[var(--theme-card-shadow)] overflow-hidden w-full">
      {/* browser chrome */}
      <div className="px-[14px] py-[10px] border-b border-[var(--theme-border)] flex items-center gap-2 bg-[var(--theme-surface-alt)]">
        <div className="flex gap-[5px]">
          {(["#ff5f57", "#febc2e", "#28c840"] as const).map((c) => (
            <div
              key={c}
              className="w-[9px] h-[9px] rounded-[5px] opacity-60"
              style={{ background: c }}
            />
          ))}
        </div>
        <div className="flex-1 text-center font-jetbrains text-[9px] text-[var(--theme-text-secondary)]">
          driveduplicatecleaner.com/results
        </div>
      </div>

      {/* topbar */}
      <div className="px-4 py-[10px] border-b border-[var(--theme-border)] flex items-center gap-3">
        <div className="text-[10px] font-bold text-[var(--theme-title-text)] tracking-[0.06em] uppercase">
          Duplicate Results
        </div>
        <div className="flex-1" />
        <div className="text-[9px] text-[var(--theme-text-secondary)]">
          <b className="text-[var(--theme-title-text)]">57</b> groups ·{" "}
          <b className="text-[var(--theme-accent)]">408 MB</b> recoverable
        </div>
        <div className="bg-[#e84040] text-white rounded px-[10px] py-1 text-[9px] font-bold tracking-[0.06em] uppercase">
          Delete 12
        </div>
      </div>

      {/* groups */}
      <div className="px-4 py-[10px] flex flex-col gap-[7px]">
        {MOCKUP_GROUPS.map((g) => (
          <div
            key={g.type}
            className="rounded-[6px] overflow-hidden"
            style={{
              border: `1px solid ${g.expanded ? "var(--theme-accent)" : "var(--theme-border)"}`,
              boxShadow: g.expanded
                ? "0 0 0 2px var(--theme-accent-bg)"
                : "none",
            }}
          >
            <div className="px-3 py-[9px] flex items-center gap-[10px] border-l-[3px] border-l-[var(--theme-accent)]">
              <span className="text-[8px] text-[var(--theme-accent)] font-extrabold tracking-[0.1em]">
                {g.type}
              </span>
              <span className="bg-[var(--theme-border-soft)] text-[var(--theme-text-secondary)] rounded-[2px] text-[8px] font-bold px-[5px] py-[1px]">
                {g.count}
              </span>
              <span className="flex-1 text-[11px] text-[var(--theme-body-text)] font-['JetBrains_Mono',monospace] overflow-hidden text-ellipsis whitespace-nowrap">
                {g.name}
              </span>
              <span className="text-[12px] font-extrabold text-[var(--theme-accent)] font-['Barlow_Condensed',sans-serif]">
                {g.size}
              </span>
            </div>
            {g.expanded && (
              <div className="bg-[var(--theme-surface-alt)] px-3 pt-[6px] pb-[6px] pl-[30px] flex flex-col gap-[3px] border-t border-t-[var(--theme-border-soft)]">
                {MOCK_UP_FILES.map((n, j) => (
                  <div key={n} className="flex items-center gap-2">
                    <div
                      className="w-[9px] h-[9px] rounded-[2px]"
                      style={{
                        border: `1.5px solid ${j < 2 ? "var(--theme-accent)" : "var(--theme-text-dim)"}`,
                        background:
                          j < 2 ? "var(--theme-accent)" : "transparent",
                      }}
                    />
                    <span className="flex-1 text-[9px] text-[var(--theme-text-secondary)] font-['JetBrains_Mono',monospace]">
                      {n}
                    </span>
                    <span className="text-[9px] text-[var(--theme-text-secondary)] font-['JetBrains_Mono',monospace]">
                      127 KB
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Sign-in button ─────────────────────────────────────────────────── */

function SignInBtn({
  onSignIn,
  label = "Sign in with Google",
  size = "default",
}: {
  onSignIn: () => void;
  label?: string;
  size?: "sm" | "default" | "lg";
}) {
  if (size === "sm") {
    return (
      <button
        type="button"
        onClick={onSignIn}
        className="font-barlow-condensed font-bold uppercase tracking-[0.06em] text-[11px] rounded-[6px] px-[14px] py-[7px] cursor-pointer border hover:opacity-90 transition-opacity bg-[var(--theme-btn-bg)] text-[var(--theme-btn-text)] border-[var(--theme-btn-bg)]"
      >
        {label}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onSignIn}
      className={cn(
        "btn font-barlow-condensed font-bold uppercase tracking-[0.06em] rounded-lg flex items-center gap-[9px] cursor-pointer hover:opacity-90 transition-opacity bg-[var(--theme-btn-bg)] text-[var(--theme-btn-text)] border-[var(--theme-btn-bg)]",
        size === "lg"
          ? "px-7 py-[15px] text-[14px]"
          : "px-[22px] py-[13px] text-[13px]",
      )}
    >
      <GoogleIcon className="w-[18px] h-[18px] shrink-0" />
      {label}
    </button>
  );
}

/* ── Marketing Page ─────────────────────────────────────────────────── */

function MarketingPage() {
  const { signIn } = useGoogleAuth();

  return (
    <div className="font-['Barlow',sans-serif]">
      {/* ── NAV ── */}
      <nav className="sticky top-0 z-10 bg-[var(--theme-nav-bg)] backdrop-blur-[8px] border-b border-[var(--theme-border)]">
        <div className={cn(W, "flex items-center gap-6 py-3")}>
          <a href="#top" className="flex items-center gap-[10px] no-underline">
            <div className="w-7 h-7 rounded-[7px] flex items-center justify-center bg-[var(--theme-accent)]">
              <Layers className="w-5 h-5" stroke="var(--theme-btn-text)" />
            </div>
            <div>
              <div className="font-barlow-condensed font-black uppercase text-[13px] leading-none tracking-[0.02em] text-[var(--theme-title-text)]">
                Drive Duplicate Cleaner
              </div>
              <div className="font-barlow-condensed font-bold uppercase text-[8px] tracking-[0.12em] mt-[2px] text-[var(--theme-text-secondary)]">
                FREE · OPEN SOURCE
              </div>
            </div>
          </a>
          <div className="flex-1" />
          <div className="flex gap-[22px]">
            {NAV_ITEMS.map(([label, href]) => (
              <a
                key={href}
                href={href}
                className="text-[11px] font-semibold uppercase tracking-[0.04em] no-underline hover:opacity-80 transition-opacity text-[var(--theme-text-secondary)]"
              >
                {label}
              </a>
            ))}
          </div>
          <a
            href={GITHUB_URL}
            className="flex items-center gap-[5px] text-[11px] font-semibold uppercase tracking-[0.04em] no-underline hover:opacity-80 transition-opacity text-[var(--theme-text-secondary)]"
          >
            <Github size={14} aria-hidden="true" /> GITHUB
          </a>
          <SignInBtn onSignIn={signIn} label="Sign in" size="sm" />
        </div>
      </nav>

      {/* ── HERO ── */}
      <header
        id="top"
        className="border-b border-[var(--theme-border)] relative overflow-hidden bg-[linear-gradient(180deg,var(--theme-page-bg)_0%,var(--theme-surface-alt)_100%)]"
      >
        <div className="absolute inset-0 opacity-60 pointer-events-none bg-[linear-gradient(var(--theme-grid-overlay)_1px,transparent_1px),linear-gradient(90deg,var(--theme-grid-overlay)_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div
          className={cn(
            W,
            "grid gap-[40px] items-center relative py-[60px] pb-[50px]",
          )}
          style={{ gridTemplateColumns: "1.1fr 1fr" }}
        >
          <div>
            {/* pill */}
            <div className="inline-flex items-center gap-[7px] rounded-full mb-[22px] px-[11px] py-[5px] border border-[var(--theme-accent-border)] bg-[var(--theme-accent-bg)]">
              <div className="w-[6px] h-[6px] rounded-full bg-[var(--theme-accent)]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--theme-accent)]">
                Free · Open Source · No Backend
              </span>
            </div>
            <h1 className="font-barlow-condensed font-black uppercase leading-[0.95] tracking-[-0.015em] mb-[18px] text-[64px] text-[var(--theme-title-text)]">
              Find &amp; Remove
              <br />
              <span className="text-[var(--theme-accent)]">
                Duplicate Files
              </span>
              <br />
              In Google Drive
            </h1>
            <p className="mb-7 leading-[1.55] font-barlow text-[17px] text-[var(--theme-body-text)] max-w-[460px]">
              The fastest way to free up Google Drive storage. Scans your Drive
              for duplicates, shows exactly what's recoverable, and lets you
              delete safely — all in your browser. No server. No data stored.
            </p>
            <div className="flex gap-[10px] mb-[22px]">
              <SignInBtn onSignIn={signIn} />
              <a
                href="#how-it-works"
                className="font-barlow-condensed font-bold uppercase tracking-[0.06em] text-[13px] rounded-lg px-[22px] py-[13px] cursor-pointer border no-underline flex items-center hover:opacity-80 transition-opacity bg-[var(--theme-btn-secondary-bg)] text-[var(--theme-btn-secondary-text)] border-[var(--theme-btn-secondary-border)]"
              >
                See how it works ↓
              </a>
            </div>
            <div className="flex gap-[18px] flex-wrap">
              {MARKETING_FEATURES.map((x) => (
                <div
                  key={x}
                  className="flex items-center gap-[6px] text-[11px] font-semibold text-[var(--theme-text-secondary)]"
                >
                  <span className="text-[var(--theme-accent)]">
                    <Check size={14} aria-hidden="true" />
                  </span>{" "}
                  {x}
                </div>
              ))}
            </div>
          </div>
          <div className="[transform:perspective(1400px)_rotateY(-7deg)_rotateX(3deg)] [transform-origin:left_center]">
            <ResultsMockUp />
          </div>
        </div>

        {/* stat strip */}
        <div className="border-t border-[var(--theme-border)] bg-[var(--theme-surface)]">
          <div
            className={cn(W, "grid py-[18px] gap-6")}
            style={{ gridTemplateColumns: "repeat(4, 1fr)" }}
          >
            {MARKETING_FEATURES_DETAILS.map(([v, l], i) => (
              <div
                key={l}
                className={cn(
                  i > 0 && "border-l border-l-[var(--theme-border-soft)] pl-6",
                )}
              >
                <div className="font-barlow-condensed font-black tracking-[-0.01em] leading-none text-[28px] text-[var(--theme-title-text)]">
                  {v}
                </div>
                <div className="font-bold uppercase tracking-[0.1em] mt-[5px] text-[10px] text-[var(--theme-text-secondary)]">
                  {l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ── FEATURES ── */}
      <section id="features" className={cn(W, "py-[80px]")}>
        <div className="text-center mb-[50px]">
          <div className="font-bold uppercase tracking-[0.18em] mb-[10px] text-[10px] text-[var(--theme-accent)]">
            What it does
          </div>
          <h2 className="font-barlow-condensed font-black uppercase leading-none tracking-[-0.01em] mb-[14px] text-[44px] text-[var(--theme-title-text)]">
            Everything you need to{" "}
            <span className="text-[var(--theme-accent)]">clean up Drive</span>
          </h2>
          <p className="text-[15px] text-[var(--theme-text-secondary)] max-w-[540px] mx-auto leading-[1.55]">
            Built for people who want their storage back without giving a
            third-party vendor unrestricted access to their files.
          </p>
        </div>
        <div
          className="grid gap-[14px]"
          style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
        >
          {FEATURES.map(({ Icon, title, body, tag }) => (
            <article
              key={tag}
              className="rounded-xl p-[22px_22px_24px] bg-[var(--theme-surface)] border border-[var(--theme-border)] shadow-[var(--theme-card-shadow)]"
            >
              <div className="flex items-center justify-between mb-[14px]">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[var(--theme-accent-dim)] border border-[var(--theme-accent-border)] text-[var(--theme-accent)]">
                  <Icon size={20} aria-hidden="true" />
                </div>
                <span className="font-jetbrains font-bold tracking-[0.14em] text-[9px] text-[var(--theme-text-secondary)]">
                  {tag}
                </span>
              </div>
              <h3 className="font-barlow-condensed font-extrabold uppercase tracking-[0.01em] leading-[1.1] mb-2 text-[18px] text-[var(--theme-title-text)]">
                {title}
              </h3>
              <p className="text-[13px] text-[var(--theme-body-text)] leading-[1.55]">
                {body}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section
        id="how-it-works"
        className="bg-[var(--theme-surface)] border-t border-[var(--theme-border)] border-b"
      >
        <div className={cn(W, "py-[80px]")}>
          <div
            className="grid gap-[60px] items-start"
            style={{ gridTemplateColumns: "1fr 1.4fr" }}
          >
            <div className="sticky top-[80px]">
              <div className="font-bold uppercase tracking-[0.18em] mb-[10px] text-[10px] text-[var(--theme-accent)]">
                How it works
              </div>
              <h2 className="font-barlow-condensed font-black uppercase leading-none tracking-[-0.01em] mb-[18px] text-[44px] text-[var(--theme-title-text)]">
                Four steps.{" "}
                <span className="text-[var(--theme-accent)]">Zero risk.</span>
              </h2>
              <p className="mb-[22px] leading-[1.6] font-barlow text-[14px] text-[var(--theme-body-text)]">
                From sign-in to recovered storage in under five minutes. The app
                reads metadata, finds matches, lets you pick what to delete, and
                moves selected files to Drive's Trash — where they're
                recoverable for 30 days.
              </p>
              <SignInBtn onSignIn={signIn} label="Try it now" />
            </div>
            <ol className="list-none flex flex-col gap-[14px]">
              {STEPS.map(({ n, title, body, time }) => (
                <li
                  key={n}
                  className="rounded-lg p-[20px_24px] grid gap-[18px] items-start bg-[var(--theme-surface-alt)] border border-[var(--theme-border)] border-l-4 border-l-[var(--theme-accent)]"
                  style={{ gridTemplateColumns: "60px 1fr auto" }}
                >
                  <div className="font-barlow-condensed font-black leading-none tracking-[-0.02em] text-[30px] text-[var(--theme-accent)]">
                    {n}
                  </div>
                  <div>
                    <h3 className="font-barlow-condensed font-extrabold uppercase tracking-[0.02em] leading-[1.15] mb-[6px] text-[17px] text-[var(--theme-title-text)]">
                      {title}
                    </h3>
                    <p className="text-[13px] text-[var(--theme-body-text)] leading-[1.55]">
                      {body}
                    </p>
                  </div>
                  <span className="font-jetbrains font-bold uppercase tracking-[0.1em] whitespace-nowrap rounded-sm px-2 py-[3px] text-[9px] text-[var(--theme-text-secondary)] border border-[var(--theme-border)]">
                    {time}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ── PRIVACY ── */}
      <section id="privacy" className={cn(W, "py-[80px]")}>
        <div
          className="rounded-[14px] overflow-hidden grid bg-[var(--theme-surface)] border border-[var(--theme-border)] shadow-[var(--theme-card-shadow)]"
          style={{ gridTemplateColumns: "1fr 1fr" }}
        >
          <div className="p-[44px_40px] border-r border-[var(--theme-border)]">
            <div className="inline-flex items-center gap-[7px] px-[10px] py-1 rounded mb-[18px] bg-[var(--theme-accent-dim)] border border-[var(--theme-accent-border)] text-[var(--theme-accent)]">
              <Lock size={20} aria-hidden="true" />
              <span className="font-extrabold uppercase tracking-[0.14em] text-[10px] text-[var(--theme-accent)]">
                Privacy
              </span>
            </div>
            <h2 className="font-barlow-condensed font-black uppercase leading-none tracking-[-0.01em] mb-4 text-[36px] text-[var(--theme-title-text)]">
              Your files{" "}
              <span className="text-[var(--theme-accent)]">never leave</span>{" "}
              your browser.
            </h2>
            <p className="leading-[1.6] font-barlow text-[14px] text-[var(--theme-body-text)]">
              Most cleanup tools route your Drive through their servers. We
              don't have servers. Open the network tab — every request goes to{" "}
              <code className="font-jetbrains rounded-sm px-[5px] py-[1px] text-[12px] bg-[var(--theme-border-soft)]">
                googleapis.com
              </code>{" "}
              or to load this page itself. Nothing else.
            </p>
          </div>
          <div className="p-[44px_40px] flex flex-col gap-[14px]">
            {PRIVACY_ITEMS.map(([title, body]) => (
              <div
                key={title}
                className="grid gap-[14px]"
                style={{ gridTemplateColumns: "auto 1fr" }}
              >
                <div className="w-[22px] h-[22px] rounded-full flex items-center justify-center shrink-0 mt-[2px] bg-[var(--theme-accent)] text-[var(--theme-btn-text)]">
                  <Check size={12} aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-bold mb-1 text-[14px] text-[var(--theme-title-text)]">
                    {title}
                  </h3>
                  <p className="text-[12.5px] text-[var(--theme-body-text)] leading-[1.5]">
                    {body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section
        id="faq"
        className="border-t border-[var(--theme-border)] bg-[var(--theme-surface-alt)]"
      >
        <div className="max-w-[820px] mx-auto px-[28px] py-[80px]">
          <div className="text-center mb-[44px]">
            <div className="font-bold uppercase tracking-[0.18em] mb-[10px] text-[10px] text-[var(--theme-accent)]">
              FAQ
            </div>
            <h2 className="font-barlow-condensed font-black uppercase leading-none tracking-[-0.01em] text-[40px] text-[var(--theme-title-text)]">
              Common questions
            </h2>
          </div>
          <div className="flex flex-col gap-2">
            {FAQS.map(([q, a]) => (
              <details
                key={q}
                className="rounded-lg px-[18px] py-[14px] bg-[var(--theme-surface)] border border-[var(--theme-border)]"
              >
                <summary className="cursor-pointer font-bold flex items-center justify-between gap-3 text-[15px] text-[var(--theme-title-text)]">
                  <span>{q}</span>
                  <span className="text-[18px] text-[var(--theme-accent)] font-normal">
                    +
                  </span>
                </summary>
                <p className="mt-[10px] leading-[1.6] text-[13px] text-[var(--theme-body-text)]">
                  {a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── OPEN SOURCE CTA ── */}
      <section className="border-t border-[var(--theme-border)]">
        <div className={cn(W, "py-[70px]")}>
          <div
            className="rounded-[14px] p-[44px_48px] grid gap-[30px] items-center relative overflow-hidden bg-[var(--theme-title-text)]"
            style={{ gridTemplateColumns: "1.2fr 1fr" }}
          >
            <div className="absolute font-barlow-condensed font-black leading-none pointer-events-none select-none top-[-20px] right-[-20px] text-[240px] text-[var(--theme-accent)] opacity-[0.08]">
              MIT
            </div>
            <div className="relative">
              <div className="font-bold uppercase tracking-[0.18em] mb-[10px] text-[10px] text-[var(--theme-accent)]">
                Open Source
              </div>
              <h2 className="font-barlow-condensed font-black uppercase leading-none tracking-[-0.01em] mb-[14px] text-[38px] text-[var(--theme-page-bg)]">
                Read the code.{" "}
                <span className="text-[var(--theme-accent)]">
                  Run it yourself.
                </span>
              </h2>
              <p className="leading-[1.6] text-[14px] text-[var(--theme-page-bg)] opacity-75">
                Star it, fork it, audit the OAuth scopes, host your own copy.
                Contributions are welcome — bug reports, scan optimizations, new
                file-type heuristics, additional languages.
              </p>
            </div>
            <div className="relative flex flex-col gap-[10px]">
              <a
                href={GITHUB_URL}
                className="font-barlow-condensed font-bold uppercase tracking-[0.06em] text-[13px] rounded-lg px-[22px] py-[14px] flex items-center justify-center gap-[9px] no-underline cursor-pointer hover:opacity-90 transition-opacity bg-[var(--theme-accent)] text-[var(--theme-btn-text)]"
              >
                <Github size={14} aria-hidden="true" /> View on GitHub
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="text-center border-t border-[var(--theme-border)] bg-[linear-gradient(180deg,var(--theme-surface-alt)_0%,var(--theme-page-bg)_100%)]">
        <div className={cn(W, "py-[80px]")}>
          <h2 className="font-barlow-condensed font-black uppercase leading-[0.95] tracking-[-0.015em] mb-4 text-[56px] text-[var(--theme-title-text)]">
            Get your{" "}
            <span className="text-[var(--theme-accent)]">storage back.</span>
          </h2>
          <p className="mb-[26px] leading-[1.5] mx-auto font-barlow text-[16px] text-[var(--theme-body-text)] max-w-[480px]">
            One click sign-in. Scan in 30 seconds. Delete duplicates. Done. No
            account, no email, no card.
          </p>
          <div className="flex justify-center mb-[14px]">
            <SignInBtn
              onSignIn={signIn}
              label="Sign in with Google · Free"
              size="lg"
            />
          </div>
          <div className="text-[11px] text-[var(--theme-text-secondary)]">
            You may see an &ldquo;unverified app&rdquo; warning. Click{" "}
            <b className="text-[var(--theme-body-text)]">Advanced → Continue</b>
            .
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-[var(--theme-border)] bg-[var(--theme-surface)]">
        <div className={cn(W, "pt-[40px] pb-[28px]")}>
          <div
            className="grid gap-8 mb-7"
            style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr" }}
          >
            <div>
              <div className="font-barlow-condensed font-black uppercase tracking-[0.02em] leading-[1.05] mb-2 text-[16px] text-[var(--theme-accent)]">
                Drive Duplicate
                <br />
                Cleaner
              </div>
              <p className="text-[12px] text-[var(--theme-text-secondary)] leading-[1.55] max-w-[280px]">
                Free, open-source, browser-based duplicate finder for Google
                Drive. MIT licensed.
              </p>
            </div>
            {MARKETING_NAV_ITEMS.map(([title, items]) => (
              <div key={title as string}>
                <div className="font-extrabold uppercase tracking-[0.14em] mb-[10px] text-[9px] text-[var(--theme-text-secondary)]">
                  {title}
                </div>
                <div className="flex flex-col gap-[7px]">
                  {items.map(([label, href]) => (
                    <a
                      key={label}
                      href={href}
                      className="no-underline hover:opacity-80 transition-opacity text-[12px] text-[var(--theme-body-text)]"
                    >
                      {label}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center flex-wrap gap-[10px] pt-[18px] border-t border-t-[var(--theme-border-soft)]">
            <span className="text-[11px] text-[var(--theme-text-secondary)]">
              © 2026 Drive Duplicate Cleaner · MIT License
            </span>
            <span className="font-jetbrains text-[10px] text-[var(--theme-text-dim)]">
              v0.1.0 · build 2026.05
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
