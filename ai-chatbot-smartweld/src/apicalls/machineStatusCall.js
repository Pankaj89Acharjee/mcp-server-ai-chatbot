import axiosInstance from ".";

export const getMachineStatus = async () => {
    try {
        const getMachStatus = await axiosInstance.get("/machineStatus/listByOrg")
        return getMachStatus.data
    } catch (error) {
        return error.message
    }
}


export const updateMachineStatus = async (payload) => {
    try {
        const updateMachStatus = await axiosInstance.patch(`/machineStatus/update/${payload.id}`, payload)
        return updateMachStatus.data
    } catch (error) {
        return error.message
    }
}


export const createMachineStatus = async (payload) => {
    try {
        const createMachStatus = await axiosInstance.post(`/machineStatus/create`, payload)
        return createMachStatus.data
    } catch (error) {
        return error.message
    }
}


export const deleteMachineStatus = async (payload) => {
    try {
        const deleteMachStatus = await axiosInstance.delete(`/machineStatus/delete/${payload.id}`, payload)
        return deleteMachStatus.data
    } catch (error) {
        return error.message
    }
}