import { createContext, useState, useEffect } from "react";
import { getCurrentUserApi, logoutUserApi } from "../api/auth.api";
import { migrateGuestAnalysisApi } from "../../upload/api/upload.api";
import axiosInstance from "../../../lib/axiosInstance";

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

    // Automatic Migration of Guest Data Upon Authentication
    useEffect(() => {
        const handleMigration = async () => {
            if (isAuthenticated) {
                // 1. Migrate guest resume data
                const guestResumeString = localStorage.getItem("guest_resume_data");
                const guestAnalysisString = localStorage.getItem("guest_analysis");

                if (guestResumeString || guestAnalysisString) {
                    try {
                        const guestResume = guestResumeString ? JSON.parse(guestResumeString) : null;
                        const guestAnalysis = guestAnalysisString ? JSON.parse(guestAnalysisString) : null;

                        const response = await axiosInstance.post("/resume/migrate-guest", {
                            guestResume: guestResume?.resumeData || guestAnalysis?.analysisResult,
                            guestAnalysis: guestAnalysis,
                            interactionHistory: []
                        });

                        if (response.data.success) {
                            localStorage.removeItem("guest_resume_data");
                            localStorage.removeItem("guest_analysis");
                            console.log("Guest data successfully migrated to MongoDB account.");

                            if (response.data.resumeId) {
                                window.location.href = `/build/${response.data.resumeId}`;
                            }
                        }
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