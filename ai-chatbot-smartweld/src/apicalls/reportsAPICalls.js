import axiosInstance from ".";

export const generateReportByStationName = async (payload) => {
    try {
        const generateReport = await axiosInstance.post("/reports/generateReport", payload)
        return generateReport.data
    } catch (error) {
        return error.message
    }
}




export const generateReportByJobName = async (payload) => {
    try {
        const generateReport = await axiosInstance.post("/reports/reportByJobName", payload)
        return generateReport.data
    } catch (error) {
        return error.message
    }
}