import { createContext, useContext, useState, type ReactNode } from "react";

type Theme = "light" | "dark";
interface ThemeContextValue { theme: Theme; toggleTheme: () => void; }

const ThemeContext = createContext<ThemeContextValue>({ theme: "light", toggleTheme: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
	const [theme, setTheme] = useState<Theme>(
		() => (localStorage.getItem("color-theme") as Theme) ?? "light",
	);
	const toggleTheme = () =>
		setTheme((prev) => {
			const next = prev === "light" ? "dark" : "light";
			localStorage.setItem("color-theme", next);
			return next;
		});
	return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
	return useContext(ThemeContext);
}
