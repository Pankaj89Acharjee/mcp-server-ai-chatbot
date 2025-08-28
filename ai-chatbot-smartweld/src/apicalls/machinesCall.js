import axiosInstance from ".";

export const getMachines = async () => {
    try {
        const getAllMachines = await axiosInstance.get("/machine/getMachinesByOrg")
        return getAllMachines.data
    } catch (error) {
        return error.message
    }
}



export const updateMachines = async (payload) => {
    try {
        const updateMachine = await axiosInstance.patch(`/machine/update/${payload.id}`, payload)
        return updateMachine.data
    } catch (error) {
        return error.message
    }
}



export const createMachines = async (payload) => {
    try {
        const createMachine = await axiosInstance.post(`/machine/create`, payload)
        return createMachine.data
    } catch (error) {
        return error.message
    }
}



export const deleteMachines = async (payload) => {
    try {
        const delMachine = await axiosInstance.delete(`/machine/delete/${payload.id}`, payload)
        return delMachine.data
    } catch (error) {
        return error.message
    }
}