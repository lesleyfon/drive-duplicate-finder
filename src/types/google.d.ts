// Minimal ambient declarations for Google Identity Services (GIS)
// The GIS library does not ship TypeScript types.

declare namespace google {
	namespace accounts {
		namespace oauth2 {
			interface TokenClientConfig {
				client_id: string;
				scope: string;
				callback: (response: TokenResponse) => void;
				error_callback?: (error: ErrorResponse) => void;
			}

			interface TokenResponse {
				access_token: string;
				expires_in: number;
				token_type: string;
				scope: string;
				error?: string;
				error_description?: string;
			}

			interface ErrorResponse {
				type: string;
				message?: string;
			}

			interface TokenClient {
				requestAccessToken(overrideConfig?: { prompt?: string }): void;
			}

			function initTokenClient(config: TokenClientConfig): TokenClient;
			function revoke(token: string, callback?: () => void): void;
		}
	}
}
