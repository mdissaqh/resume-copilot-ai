import { useState } from "react";
import { registerUserApi } from "../api/auth.api";
import { useAuth } from "./useAuth";
import { useNavigate } from "react-router-dom";

export const useRegister = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    const register = async (userData) => {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const data = await registerUserApi(userData);
            setSuccessMessage(data.message);
            login(data.user);
            navigate("/upload");
            return data;
        } catch (err) {
            console.log(err.response);
            const errorMessage = err.response?.data?.message || "An error occurred during registration.";
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }

    return { register, loading, error, successMessage };
}