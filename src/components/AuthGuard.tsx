import React, { useEffect, useState } from "react";

interface AuthGuardProps {
    children: React.ReactNode;
}

// Fixed Constants (since they are constant for this project)
const NEON_API_KEY = import.meta.env.VITE_NEON_API_KEY || "napi_ewlzpqv336e41usn232duvfax8vu1g5g37ozlz8x53eic18pjsyg30vqqorexfav";
const NEON_PROJECT_ID = "flat-sun-26865495";
const NEON_BRANCH_ID = "br-empty-glitter-a195t3dz"; // Corrected branch ID matching the endpoint
const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || "https://api.mantracare.com/user/user-info";

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const handleHandshake = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const token = urlParams.get("token");
            const storedUserId = sessionStorage.getItem("user_id");

            if (storedUserId) {
                setIsAuthorized(true);
                setIsLoading(false);
                return;
            }

            if (token) {
                try {
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
                            sessionStorage.setItem("user_id", userId.toString());

                            // Clean URL
                            const newPath = window.location.pathname + window.location.search.replace(/[\?&]token=[^&]+/, "").replace(/^&/, "?");
                            window.history.replaceState({}, "", newPath || "/");

                            // Initial user initialization (upsert)
                            await initializeUser(userId);

                            setIsAuthorized(true);
                        } else {
                            window.location.href = "/token";
                        }
                    } else {
                        window.location.href = "/token";
                    }
                } catch (error) {
                    console.error("AuthGuard Exception:", error);
                    window.location.href = "/token";
                } finally {
                    setIsLoading(false);
                }
            } else {
                window.location.href = "/token";
            }
        };

        handleHandshake();
    }, []);

    const initializeUser = async (userId: number | string) => {
        try {
            // Use the direct SQL API which is more browser-friendly if used with correct database credentials
            // But since we have the Management API key, we ensure the URL is perfect.
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
                console.warn("AuthGuard: DB init failed", await response.text());
            }
        } catch (error) {
            console.error("AuthGuard: DB Exception", error);
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
