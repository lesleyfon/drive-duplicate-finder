import { useEffect, useRef, useCallback } from "react";
import { GOOGLE_CLIENT_ID, GOOGLE_SCOPES } from "../env";
import { useAuth } from "../context/AuthContext";

export function useGoogleAuth() {
	const { setAuth, clearAuth, isAuthenticated, isTokenExpired } = useAuth();
	const tokenClientRef = useRef<google.accounts.oauth2.TokenClient | null>(
		null,
	);

	useEffect(() => {
		// Wait for GIS script to be ready
		const init = () => {
			tokenClientRef.current = google.accounts.oauth2.initTokenClient({
				client_id: GOOGLE_CLIENT_ID,
				scope: GOOGLE_SCOPES,
				callback: (response) => {
					if (response.error) {
						console.error("Auth error:", response.error_description);
						return;
					}
					setAuth(response.access_token, response.expires_in);
				},
			});

			if (sessionStorage.getItem("userInfo")) {
				tokenClientRef.current.requestAccessToken({ prompt: "" });
			}
		};

		console.log("Initsializing Google Auth. GIS script loaded:");
		if (typeof google !== "undefined" && google.accounts?.oauth2) {
			init();
		} else {
			// GIS script may still be loading
			const script = document.querySelector(
				'script[src*="accounts.google.com/gsi/client"]',
			);
			if (script) {
				script.addEventListener("load", init);
				return () => script.removeEventListener("load", init);
			}
		}
	}, [setAuth]);

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
