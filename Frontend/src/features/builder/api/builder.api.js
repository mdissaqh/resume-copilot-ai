import axiosInstance from "../../../lib/axiosInstance";

export const generateResumeApi = async (analysisId) => {
    const response = await axiosInstance.post(`/resume/${analysisId}/generate`);
    return response.data;
};