import { useState } from "react";
import { registerUserApi } from "../api/auth.api";

export const useRegister = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const register = async (userData) => {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const data = await registerUserApi(userData);
            setSuccessMessage(data.message);
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