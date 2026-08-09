import { useState } from "react";
import { loginUserApi } from "../api/auth.api";
import { useAuth } from "./useAuth";
import { useNavigate } from "react-router-dom" 

export const useLogin = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    const loginUser = async (credentials) => {
        setLoading(true);
        setError(null);
        try {
            const data = await loginUserApi(credentials);
            login(data.user);
            navigate("/upload");
            return data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Login failed. Please try again.";
            setError(errorMessage);
            throw err;
        }
        finally {
            setLoading(false);
        }
    }

    return { loginUser, loading, error };
}