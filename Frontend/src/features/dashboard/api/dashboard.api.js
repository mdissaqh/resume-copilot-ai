import axiosInstance from "../../../lib/axiosInstance";

export const getUserAnalysesApi = async () => {
    const response = await axiosInstance.get("/resume/analyses");
    return response.data;
};

export const getAnalysisByIdApi = async (id) => {
    const response = await axiosInstance.get(`/resume/analyses/${id}`);
    return response.data;
};