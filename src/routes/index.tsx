import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useGoogleAuth } from "../hooks/useGoogleAuth";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Google as GoogleIcon } from "@thesvg/react";
import "./sign-in-buttons-styles.css";
import { cn } from "../lib/cn";

export const Route = createFileRoute("/")({
	component: LoginPage,
});

function LoginPage() {
	const { signIn } = useGoogleAuth();
	const { isAuthenticated } = useAuth();
	const { theme, toggleTheme } = useTheme();
	const navigate = useNavigate();

	useEffect(() => {
		if (isAuthenticated) {
			navigate({ to: "/dashboard" });
		}
	}, [isAuthenticated, navigate]);

	return (
		<div className="min-h-screen flex items-center justify-center relative">
			{/* Theme toggle */}
			<button
				type="button"
				onClick={toggleTheme}
				className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-[0.1em] font-barlow-condensed border border-[var(--theme-border)] px-3 py-[6px] rounded cursor-pointer transition-colors bg-[var(--theme-surface)]"
				style={{ color: "var(--theme-body-text)" }}
			>
				{theme === "light" ? "◑ DARK" : "◐ LIGHT"}
			</button>

			{/* Login card */}
			<div
				className="border rounded-xl p-10 w-full max-w-sm"
				style={{
					background: "var(--theme-surface)",
					borderColor: "var(--theme-border)",
					boxShadow: "var(--theme-card-shadow)",
				}}
			>
				{/* Logo */}
				<div className="mb-7">
					<div
						className="text-[22px] font-black leading-[1.1] uppercase font-barlow-condensed"
						style={{ color: "var(--theme-accent)" }}
					>
						Drive
						<br />
						Duplicate
						<br />
						Cleaner
					</div>
					<div
						className="text-[9px] font-bold tracking-[0.12em] mt-2 uppercase font-barlow-condensed"
						style={{ color: "var(--theme-text-secondary)" }}
					>
						DRIVE SCANNER V1
					</div>
				</div>

				{/* Divider */}
				<div className="border-t mb-7" style={{ borderColor: "var(--theme-border)" }} />

				{/* Description */}
				<p
					className="text-[13px] mb-7 leading-relaxed font-barlow"
					style={{ color: "var(--theme-body-text)" }}
				>
					Find and remove duplicate files from your Google Drive. No backend required.
				</p>

				{/* Sign in button */}
				<button
					type="button"
					onClick={signIn}
					className={cn(
						"w-full py-[11px] font-barlow-condensed text-[13px] font-bold tracking-[0.1em] rounded-[7px] flex items-center justify-center gap-2 hover:opacity-90 transition-opacity cursor-pointer",
						"relative overflow-hidden isolate", // ← these three
						"btn",
					)}
					style={{
						background: "var(--theme-page-bg)",
						color: "var(--theme-accent)",
					}}
				>
					<GoogleIcon className="w-5 h-5" />
					Sign In With Google
				</button>

				{/* Unverified app note */}
				<p
					className="text-[11px] mt-5 leading-relaxed font-barlow"
					style={{ color: "var(--theme-size-text)" }}
				>
					You may see an &ldquo;unverified app&rdquo; warning from Google. Click{" "}
					<strong style={{ color: "var(--theme-body-text)" }}>Advanced → Continue</strong>{" "}
					to proceed.
				</p>
			</div>
		</div>
	);
}
