import type { Config } from "tailwindcss";

export default {
	content: ["./index.html", "./src/**/*.{ts,tsx}"],
	theme: {
		borderRadius: {
			none: "0px",
			sm: "4px",
			DEFAULT: "6px",
			md: "6px",
			lg: "8px",
			xl: "10px",
			"2xl": "16px",
			full: "9999px",
		},
		fontFamily: {
			sans: ['"Space Grotesk"', "monospace"],
			mono: ['"Space Grotesk"', "monospace"],
			barlow: ["Barlow", "sans-serif"],
			"barlow-condensed": ['"Barlow Condensed"', "sans-serif"],
			jetbrains: ['"JetBrains Mono"', "monospace"],
		},
		extend: {
			colors: {
				// ── Legacy dark-theme tokens (dashboard / scan pages) ──
				ink: "#000000",
				surface: "#131313",
				"surface-dim": "#0e0e0e",
				"surface-low": "#1b1b1b",
				"surface-mid": "#1f1f1f",
				"surface-high": "#2a2a2a",
				"surface-top": "#353535",
				"border-dim": "#222222",
				"border-mid": "#3b494b",
				"border-bright": "#849495",
				"cyan-bright": "#00F0FF",
				"cyan-dim": "#00DBE9",
				"cyan-dark": "#004F54",
				"cyan-ink": "#002022",
				"text-primary": "#E2E2E2",
				"text-secondary": "#B9CACB",
				"text-muted": "#849495",
				"text-inverse": "#131313",
				"status-ok": "#00F0FF",
				"status-warn": "#EAC324",
				"status-error": "#FFB4AB",
				"status-grey": "#849495",
			},
			spacing: {
				sidebar: "180px",
				"sidebar-collapsed": "64px",
			},
			fontSize: {
				label: [
					"11px",
					{ lineHeight: "1", letterSpacing: "0.1em", fontWeight: "500" },
				],
				nav: [
					"13px",
					{ lineHeight: "1", letterSpacing: "0.05em", fontWeight: "600" },
				],
				"nav-2": [
					"13px",
					{ lineHeight: "1", letterSpacing: "0em", fontWeight: "400" },
				],
				body: ["14px", { lineHeight: "1.6", letterSpacing: "0em" }],
				sm: ["12px", { lineHeight: "1.5", letterSpacing: "0.02em" }],
				md: [
					"24px",
					{ lineHeight: "1.2", letterSpacing: "-0.01em", fontWeight: "600" },
				],
				lg: [
					"32px",
					{ lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "700" },
				],
			},
			keyframes: {
				blink: {
					"0%, 100%": { opacity: "1" },
					"50%": { opacity: "0" },
				},
				indeterminate: {
					"0%": { transform: "translateX(-100%) scaleX(0.5)" },
					"50%": { transform: "translateX(0%) scaleX(0.7)" },
					"100%": { transform: "translateX(100%) scaleX(0.5)" },
				},
			},
			animation: {
				blink: "blink 1s step-end infinite",
				indeterminate: "indeterminate 1.5s ease-in-out infinite",
			},
		},
	},
	plugins: [],
} satisfies Config;
