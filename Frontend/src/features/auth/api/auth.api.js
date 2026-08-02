import axiosInstance from "../../../lib/axiosInstance";

export const registerUserApi = async (userData) => {
    const response = await axiosInstance.post("/auth/register", userData);
    return response.data;
};

export const loginUserApi = async (credentials) => {
    const response = await axiosInstance.post("/auth/login", credentials);
    return response.data;
};