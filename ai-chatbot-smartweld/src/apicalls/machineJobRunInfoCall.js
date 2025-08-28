import axiosInstance from ".";

export const getHardwareList = async () => {
    try {
        const hardwareList = await axiosInstance.get("/machineJobRunInfo/get-info-with-hardware")
        return hardwareList.data
    } catch (error) {
        return error.message
    }
}



