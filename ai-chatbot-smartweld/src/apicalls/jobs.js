import axiosInstance from ".";

export const getJobs = async () => {
    try {
        const getJobsList = await axiosInstance.get("/job/listByOrg")
        return getJobsList.data
    } catch (error) {
        return error.message
    }
}


export const saveMachineJobMapping = async (payload) => {
    try {
        const saveListMapping = await axiosInstance.post(`/machineJobInfo/create`, payload)
        return saveListMapping.data
    } catch (error) {
        return error.message
    }
}


export const updateMachineJobMapping = async (payload) => {
    try {
        const id = payload.id
        const updateListMapping = await axiosInstance.patch(`/machineJobInfo/update/${id}`, payload)
        return updateListMapping.data
    } catch (error) {
        return error.message
    }
}


export const deleteMachineJobMapping = async (payload) => {
    try {
        const deleteListMapping = await axiosInstance.delete(`/machineJobInfo/delete/${payload.id}`, payload)
        return deleteListMapping.data
    } catch (error) {
        return error.message
    }
}


export const getJobSerialByJobNames = async (payload) => {
    try {
        const jobSerialByJob = await axiosInstance.post(`/reports/getJobSerial`, payload)
        return jobSerialByJob.data
    } catch (error) {
        return error.message
    }
}