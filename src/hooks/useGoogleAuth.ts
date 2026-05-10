import { useCallback, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { GOOGLE_CLIENT_ID, GOOGLE_SCOPES } from "../env";

export function useGoogleAuth() {
	const {
		setAuth,
		clearAuth,
		markAuthResolved,
		isAuthenticated,
		isTokenExpired,
	} = useAuth();
	const tokenClientRef = useRef<google.accounts.oauth2.TokenClient | null>(
		null,
	);

	useEffect(() => {
		// Safety net: if GIS never loads or its callback never fires, unblock the UI.
		const timeout = setTimeout(markAuthResolved, 8000);

		const init = () => {
			clearTimeout(timeout);

			tokenClientRef.current = google.accounts.oauth2.initTokenClient({
				client_id: GOOGLE_CLIENT_ID,
				scope: GOOGLE_SCOPES,
				callback: (response) => {
					if (response.error) {
						console.error("Auth error:", response.error_description);
						markAuthResolved();
						return;
					}
					setAuth(response.access_token, response.expires_in);
				},
			});

			// Only attempt silent re-auth if user was previously signed in but
			// their stored token has expired. If the token is still valid, AuthContext
			// already restored it — no GIS round-trip needed.
			const userInfo = localStorage.getItem("userInfo");
			const accessToken = localStorage.getItem("accessToken");
			const expiresAt = Number(localStorage.getItem("expiresAt"));
			const tokenValid =
				accessToken && expiresAt && Date.now() < expiresAt - 60_000;

			if (userInfo && !tokenValid) {
				tokenClientRef.current.requestAccessToken({ prompt: "" });
			} else {
				// Token is valid (AuthContext handles it) or no prior session — nothing to do.
				markAuthResolved();
			}
		};

		if (typeof google !== "undefined" && google.accounts?.oauth2) {
			init();
		} else {
			const script = document.querySelector(
				'script[src*="accounts.google.com/gsi/client"]',
			);
			if (script) {
				script.addEventListener("load", init);
				return () => {
					script.removeEventListener("load", init);
					clearTimeout(timeout);
				};
			} else {
				// GIS script not present (blocked, removed, etc.) — unblock the UI.
				clearTimeout(timeout);
				markAuthResolved();
			}
		}

		return () => clearTimeout(timeout);
	}, [setAuth, markAuthResolved]);

	const signIn = useCallback(() => {
		tokenClientRef.current?.requestAccessToken({ prompt: "consent" });
	}, []);

	const signOut = useCallback(() => {
		clearAuth();
	}, [clearAuth]);

	const reAuth = useCallback(() => {
		tokenClientRef.current?.requestAccessToken({ prompt: "" });
	}, []);

	return { signIn, signOut, reAuth, isAuthenticated, isTokenExpired };
}
