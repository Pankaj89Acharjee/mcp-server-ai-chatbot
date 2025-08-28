import axiosInstance from ".";

export const getHardwaresByOrg = async () => {
    try {
        const getHardwareList = await axiosInstance.get("/hardware/listByOrg")
        return getHardwareList.data
    } catch (error) {
        return error.message
    }
}

export const getMachines = async () => {
    try {
        const getMachinesList = await axiosInstance.get("/machine/getMachinesByOrg")
        return getMachinesList.data
    } catch (error) {
        return error.message
    }
}


export const getHardwareMachinesMappedData = async () => {
    try {
        const getMappedList = await axiosInstance.get("/hardwareMachineMapping/listByOrg")
        return getMappedList.data
    } catch (error) {
        return error.message
    }
}



export const updateHardwareMachinesMapping = async (payload) => {
    try {
        const updateMacHardware = await axiosInstance.patch(`/hardwareMachineMapping/update/${payload.id}`, payload)
        return updateMacHardware.data
    } catch (error) {
        return error.message
    }
}



export const createHardwareMachinesMapping = async (payload) => {
    try {
        const createMacHardware = await axiosInstance.post(`/hardwareMachineMapping/create`, payload)
        return createMacHardware.data
    } catch (error) {
        return error.message
    }
}



export const deleteHardwareMachinesMapping = async (payload) => {
    try {
        const deleteMacHardware = await axiosInstance.delete(`/hardwareMachineMapping/delete/${payload.id}`, payload)
        return deleteMacHardware.data
    } catch (error) {
        return error.message
    }
}
