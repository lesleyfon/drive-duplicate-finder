import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { useScanStore } from "../store/scanStore";

interface UserInfo {
	email: string;
	name: string;
	picture: string;
}

interface AuthState {
	accessToken: string | null;
	expiresAt: number | null;
	userInfo: UserInfo | null;
}

interface AuthContextValue extends AuthState {
	setAuth: (token: string, expiresIn: number) => void;
	clearAuth: () => void;
	markAuthResolved: () => void;
	isAuthenticated: boolean;
	isTokenExpired: () => boolean;
	isAuthLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [auth, setAuthState] = useState<AuthState>({
		accessToken: null,
		expiresAt: null,
		userInfo: null,
	});
	const [isAuthLoading, setIsAuthLoading] = useState(true);

	useEffect(() => {
		try {
			const userInfo = localStorage.getItem("userInfo");
			const accessToken = localStorage.getItem("accessToken");
			const expiresAt = Number(localStorage.getItem("expiresAt"));

			const tokenValid = accessToken && expiresAt && Date.now() < expiresAt - 60_000;

			setAuthState({
				accessToken: tokenValid ? accessToken : null,
				expiresAt: tokenValid ? expiresAt : null,
				userInfo: userInfo ? JSON.parse(userInfo) : null,
			});

			if (!tokenValid) {
				localStorage.removeItem("accessToken");
				localStorage.removeItem("expiresAt");
			}

			// Only stay loading if we're expecting a silent re-auth from GIS.
			// That happens when userInfo exists but the token is expired/missing.
			const needsSilentAuth = !!userInfo && !tokenValid;
			if (!needsSilentAuth) {
				setIsAuthLoading(false);
			}
		} catch {
			localStorage.removeItem("userInfo");
			localStorage.removeItem("accessToken");
			localStorage.removeItem("expiresAt");
			setIsAuthLoading(false);
		}
	}, []);

	const setAuth = useCallback((token: string, expiresIn: number) => {
		const expiresAt = Date.now() + expiresIn * 1000;
		localStorage.setItem("accessToken", token);
		localStorage.setItem("expiresAt", String(expiresAt));
		fetchUserInfo(token).then((userInfo) => {
			setAuthState({ accessToken: token, expiresAt, userInfo });
			if (userInfo) localStorage.setItem("userInfo", JSON.stringify(userInfo));
			setIsAuthLoading(false);
		});
	}, []);

	const clearAuth = useCallback(() => {
		localStorage.removeItem("userInfo");
		localStorage.removeItem("accessToken");
		localStorage.removeItem("expiresAt");
		if (auth.accessToken) {
			google.accounts.oauth2.revoke(auth.accessToken);
		}
		// Clear scan state on logout to prevent showing stale results if a different user logs in.
		useScanStore.getState().resetScan();
		setAuthState({ accessToken: null, expiresAt: null, userInfo: null });
		setIsAuthLoading(false);
	}, [auth.accessToken]);

	const markAuthResolved = useCallback(() => {
		setIsAuthLoading(false);
	}, []);

	const isTokenExpired = useCallback(() => {
		if (!auth.expiresAt) return true;
		return Date.now() > auth.expiresAt - 60_000;
	}, [auth.expiresAt]);

	return (
		<AuthContext.Provider
			value={{
				...auth,
				setAuth,
				clearAuth,
				markAuthResolved,
				isAuthenticated: !!auth.accessToken && !isTokenExpired(),
				isTokenExpired,
				isAuthLoading,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

async function fetchUserInfo(token: string): Promise<UserInfo | null> {
	try {
		const res = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		if (!res.ok) return null;
		const data = await res.json();
		return {
			email: data.email ?? "",
			name: data.name ?? data.email ?? "",
			picture: data.picture ?? "",
		};
	} catch {
		return null;
	}
}

export function useAuth() {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
	return ctx;
}
