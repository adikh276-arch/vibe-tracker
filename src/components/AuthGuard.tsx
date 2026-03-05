import React, { useEffect, useState } from "react";

interface AuthGuardProps {
    children: React.ReactNode;
}

const NEON_API_KEY = import.meta.env.VITE_NEON_API_KEY;
const NEON_PROJECT_ID = import.meta.env.VITE_NEON_PROJECT_ID;
const NEON_BRANCH_ID = import.meta.env.VITE_NEON_BRANCH_ID;
const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || "https://api.mantracare.com/user/user-info";

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const handleHandshake = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const token = urlParams.get("token");
            const storedUserId = sessionStorage.getItem("user_id");

            console.log("AuthGuard: Starting handshake. Token in URL:", !!token, "Stored user_id:", storedUserId);

            if (storedUserId) {
                setIsAuthorized(true);
                setIsLoading(false);
                return;
            }

            if (token) {
                try {
                    console.log("AuthGuard: Validating token with API...");
                    const response = await fetch(AUTH_API_URL, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ token }),
                    });

                    if (response.ok) {
                        const data = await response.json();
                        const userId = data.user_id;

                        if (userId) {
                            console.log("AuthGuard: Validation successful. User ID:", userId);
                            sessionStorage.setItem("user_id", userId.toString());

                            // Clean URL
                            const newPath = window.location.pathname + window.location.search.replace(/[\?&]token=[^&]+/, "").replace(/^&/, "?");
                            window.history.replaceState({}, "", newPath || "/");

                            // Initial user initialization (upsert)
                            await initializeUser(userId);

                            setIsAuthorized(true);
                        } else {
                            console.error("AuthGuard: API returned success but no user_id");
                            window.location.href = "/token";
                        }
                    } else {
                        console.error("AuthGuard: Token validation failed with status:", response.status);
                        window.location.href = "/token";
                    }
                } catch (error) {
                    console.error("AuthGuard: Handshake fetch exception:", error);
                    window.location.href = "/token";
                } finally {
                    setIsLoading(false);
                }
            } else {
                console.warn("AuthGuard: No token and no session. Redirecting to /token");
                window.location.href = "/token";
            }
        };

        handleHandshake();
    }, []);

    const initializeUser = async (userId: number | string) => {
        try {
            console.log("AuthGuard: Initializing user in Neon...");
            const sql = `INSERT INTO users (id) VALUES (${userId}) ON CONFLICT (id) DO NOTHING;`;

            const response = await fetch(`https://console.neon.tech/api/v1/projects/${NEON_PROJECT_ID}/branches/${NEON_BRANCH_ID}/sql`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${NEON_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    sql: sql
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.warn("AuthGuard: User initialization failed in DB:", errorText);
            } else {
                console.log("AuthGuard: User initialization successful");
            }
        } catch (error) {
            console.error("AuthGuard: User initialization exception:", error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <p className="text-muted-foreground animate-pulse font-medium">Securing session...</p>
                </div>
            </div>
        );
    }

    if (!isAuthorized) {
        return null;
    }

    return <>{children}</>;
};
