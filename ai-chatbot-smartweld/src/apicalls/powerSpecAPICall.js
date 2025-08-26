import axiosInstance from ".";

export const getmachinePowerSpecification = async () => {
    try {
        const getMacSpecs = await axiosInstance.get(`/machinePowerSpecification/listByOrg`)
        return getMacSpecs.data
    } catch (error) {
        return error.message
    }
}


export const updatemachinePowerSpecification = async (payload) => {
    try {
        const updateMacSpecs = await axiosInstance.patch(`/machinePowerSpecification/update/` + payload.id, payload)
        return updateMacSpecs.data
    } catch (error) {
        return error.message
    }
}


export const createmachinePowerSpecification = async (payload) => {
    try {
        const createMacSpecs = await axiosInstance.post(`/machinePowerSpecification/create`, payload)
        return createMacSpecs.data
    } catch (error) {
        return error.message
    }
}


export const deletemachinePowerSpecification = async (payload) => {
    try {
        const deleteMacSpecs = await axiosInstance.delete(`/machinePowerSpecification/delete/${payload.id}`)
        return deleteMacSpecs.data
    } catch (error) {
        return error.message
    }
}







