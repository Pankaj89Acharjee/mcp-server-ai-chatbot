import axiosInstance from ".";

export const getShieldingList = async () => {
    try {
        const shieldingList = await axiosInstance.get("/shieldingGas/listByOrg")
        return shieldingList.data
    } catch (error) {
        return error.message
    }
}


export const getShieldingGroup = async () => {
    try {
        const shieldingGroup = await axiosInstance.get("/shieldingGas/getShieldingGasGrpId")
        return shieldingGroup.data
    } catch (error) {
        return error.message
    }
}


export const updateShieldingGas = async (payload) => {
    try {
        const updateGas = await axiosInstance.patch(`/shieldingGas/update/${payload.id}`, payload)
        return updateGas.data
    } catch (error) {
        return error.message
    }
}



export const createShieldingGas = async (payload) => {
    try {
        const createGas = await axiosInstance.post(`/shieldingGas/create`, payload)
        return createGas.data
    } catch (error) {
        return error.message
    }
}



export const deleteShieldingGas = async (payload) => {
    try {
        const deleteGas = await axiosInstance.delete(`shieldingGas/delete/${payload.id}`, payload)
        return deleteGas.data
    } catch (error) {
        return error.message
    }
}