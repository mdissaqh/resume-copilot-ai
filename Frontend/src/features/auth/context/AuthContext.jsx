import { createContext, useState, useEffect } from "react";
import { getCurrentUserApi, logoutUserApi } from "../api/auth.api";
import { migrateGuestAnalysisApi } from "../../upload/api/upload.api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // Initial Hydration
    useEffect(() => {
        const initAuth = async () => {
            try {
                const data = await getCurrentUserApi();
                if (data.success && data.user) {
                    setUser(data.user);
                    setIsAuthenticated(true);
                }
            } catch (error) {
                setUser(null);
                setIsAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };
        initAuth();
    }, []);


    useEffect(() => {
        const handleMigration = async () => {
            if (isAuthenticated) {
                const guestDataString = localStorage.getItem("guest_analysis");
                if (guestDataString) {
                    try {
                        const guestData = JSON.parse(guestDataString);
                        await migrateGuestAnalysisApi(guestData);
                        localStorage.removeItem("guest_analysis");
                        console.log("Guest data successfully migrated to account.");
                    } catch (error) {
                        console.error("Failed to migrate guest data:", error);
                    }
                }
            }
        };

        handleMigration();
    }, [isAuthenticated]);

    const login = (userData) => {
        setUser(userData);
        setIsAuthenticated(true);
    };

    const logout = async () => {
        try {
            await logoutUserApi();
            setUser(null);
            setIsAuthenticated(false);
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const value = { user, isAuthenticated, loading, login, logout };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};