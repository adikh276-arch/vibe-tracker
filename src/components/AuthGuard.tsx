import React, { useEffect, useState } from "react";
import { neon, neonConfig } from "@neondatabase/serverless";

// Disable the browser warning
neonConfig.disableWarningInBrowsers = true;

interface AuthGuardProps {
    children: React.ReactNode;
}

const DATABASE_URL = "postgresql://neondb_owner:npg_QO0gWNunLw2t@ep-lingering-breeze-a195t3dz.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
const AUTH_API_URL = "https://api.mantracare.com/user/user-info";

// Create client with warning suppressed
const sql = neon(DATABASE_URL);

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const handleHandshake = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const token = urlParams.get("token");
            const storedUserId = sessionStorage.getItem("user_id");

            if (storedUserId) {
                // Even if stored, we ensure the user exists in DB
                await initializeUser(storedUserId);
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
            // Use the neon driver to avoid CORS issues and management API limits
            await sql`INSERT INTO users (id) VALUES (${parseInt(userId.toString())}) ON CONFLICT (id) DO NOTHING;`;
            console.log("AuthGuard: User verified/initialized in database");
        } catch (error) {
            console.error("AuthGuard: Database initialization failed", error);
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
