import axiosInstance from "../../../lib/axiosInstance";

export const createScratchResumeApi = async ({ targetRole, jobDescription, persona }) => {
    const response = await axiosInstance.post(`/resume`, { targetRole, jobDescription, persona });
    return response.data;
};

export const getResumeByIdApi = async (resumeId) => {
    const response = await axiosInstance.get(`/resume/${resumeId}`);
    return response.data;
};

export const generateResumeApi = async (targetId) => {
    const response = await axiosInstance.post(`/resume/${targetId}/generate`);
    return response.data;
};

export const saveResumeApi = async (resumeId, content, templateId) => {
    const response = await axiosInstance.put(`/resume/${resumeId}`, { content, templateId });
    return response.data;
};

export const downloadResumePDFApi = async (resumeId) => {
    const response = await axiosInstance.get(`/resume/${resumeId}/pdf`, {
        responseType: 'blob'
    });
    return response.data;
};

export const migrateGuestResumeApi = async (payload) => {
    const response = await axiosInstance.post(`/resume/migrate-guest`, payload);
    return response.data;
};

export const refreshCopilotApi = async (resumeId, interactionHistory = [], jobDescription = "") => {
    const response = await axiosInstance.post(`/resume/${resumeId}/copilot/refresh`, {
        interactionHistory,
        jobDescription
    });
    return response.data;
};

export const refineContentApi = async (existingText, userInstruction, context) => {
    const response = await axiosInstance.post(`/resume/refine`, { existingText, userInstruction, context });
    return response.data;
};