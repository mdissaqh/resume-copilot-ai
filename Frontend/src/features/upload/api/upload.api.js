import axiosInstance from "../../../lib/axiosInstance";

export const analyzeResumeApi = async (file, jobDescription) => {
    const formData = new FormData();

    formData.append("resume", file);

    if (jobDescription) {
        formData.append("jobDescription", jobDescription);
    }

    const response = await axiosInstance.post("/analyze", formData);

    return response.data;
}

export const migrateGuestAnalysisApi = async (guestData) => {
    const response = await axiosInstance.post("/analyze/migrate-guest", guestData);
    return response.data;
};