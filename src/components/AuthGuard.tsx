import React, { useEffect, useState } from "react";

interface AuthGuardProps {
    children: React.ReactNode;
}

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
                    const response = await fetch("https://api.mantracare.com/user/user-info", {
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
                    console.error("Auth handshake failed:", error);
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
            // Note: In a production app, the frontend wouldn't talk directly to Neon with a management key.
            // We are implementing the logic structure here as requested.
            // We will perform an upsert (INSERT ... ON CONFLICT DO NOTHING)
            const sql = `INSERT INTO users (id) VALUES (${userId}) ON CONFLICT (id) DO NOTHING;`;

            const response = await fetch("https://console.neon.tech/api/v1/projects/flat-sun-26865495/sql", {
                method: "POST",
                headers: {
                    "Authorization": "Bearer napi_ewlzpqv336e41usn232duvfax8vu1g5g37ozlz8x53eic18pjsyg30vqqorexfav",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    sql: sql,
                    branch_id: "production"
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.warn("User initialization warned:", errorData);
            }
        } catch (error) {
            console.error("Failed to initialize user in database:", error);
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
        return null; // Should have redirected by now
    }

    return <>{children}</>;
};
