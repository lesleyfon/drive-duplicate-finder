import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from "react";

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
	isAuthenticated: boolean;
	isTokenExpired: () => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [auth, setAuthState] = useState<AuthState>({
		accessToken: null,
		expiresAt: null,
		userInfo: null,
	});

	useEffect(() => {
		try {
			const userInfo = sessionStorage.getItem("userInfo");
			const accessToken = sessionStorage.getItem("accessToken");
			const expiresAt = Number(sessionStorage.getItem("expiresAt"));

			const tokenValid = accessToken && expiresAt && Date.now() < expiresAt - 60_000;

			setAuthState({
				accessToken: tokenValid ? accessToken : null,
				expiresAt: tokenValid ? expiresAt : null,
				userInfo: userInfo ? JSON.parse(userInfo) : null,
			});

			if (!tokenValid) {
				sessionStorage.removeItem("accessToken");
				sessionStorage.removeItem("expiresAt");
			}
		} catch {
			sessionStorage.removeItem("userInfo");
			sessionStorage.removeItem("accessToken");
			sessionStorage.removeItem("expiresAt");
		}
	}, []);

	const setAuth = useCallback((token: string, expiresIn: number) => {
		const expiresAt = Date.now() + expiresIn * 1000;
		sessionStorage.setItem("accessToken", token);
		sessionStorage.setItem("expiresAt", String(expiresAt));
		fetchUserInfo(token).then((userInfo) => {
			console.log("Fetched user info:", { userInfo }); // Debugging line
			setAuthState({ accessToken: token, expiresAt, userInfo });
			if (userInfo) sessionStorage.setItem("userInfo", JSON.stringify(userInfo));
		});
	}, []);

	const clearAuth = useCallback(() => {
		sessionStorage.removeItem("userInfo");
		sessionStorage.removeItem("accessToken");
		sessionStorage.removeItem("expiresAt");
		if (auth.accessToken) {
			google.accounts.oauth2.revoke(auth.accessToken);
		}
		setAuthState({ accessToken: null, expiresAt: null, userInfo: null });
	}, [auth.accessToken]);

	const isTokenExpired = useCallback(() => {
		if (!auth.expiresAt) return true;
		// Treat as expired 60s before actual expiry for safety
		return Date.now() > auth.expiresAt - 60_000;
	}, [auth.expiresAt]);

	return (
		<AuthContext.Provider
			value={{
				...auth,
				setAuth,
				clearAuth,
				isAuthenticated: !!auth.accessToken && !isTokenExpired(),
				isTokenExpired,
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
		console.log("User info response status:", res.status); // Debugging line
		const data = await res.json();
		console.log("User info response data:", data); // Debugging line
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
