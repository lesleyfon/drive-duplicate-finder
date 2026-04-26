import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { getStorageQuota } from "../lib/driveApi";

export function useStorageQuota() {
	const { accessToken } = useAuth();

	if (!accessToken) {
		throw new Error("useStorageQuota must be used within an AuthProvider");
	}

	return useQuery({
		queryKey: ["storageQuota"],
		queryFn: () => getStorageQuota(accessToken),
		enabled: !!accessToken,
		staleTime: 5 * 60 * 1000,
	});
}
