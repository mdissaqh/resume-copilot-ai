import axiosInstance from "../../../lib/axiosInstance";

export const generateResumeApi = async (analysisId) => {
    const response = await axiosInstance.post(`/resume/${analysisId}/generate`);
    return response.data;
};

export const saveResumeApi = async (resumeId, content, templateId) => {
    const response = await axiosInstance.put(`/resume/${resumeId}`, { content, templateId });
    return response.data;
};