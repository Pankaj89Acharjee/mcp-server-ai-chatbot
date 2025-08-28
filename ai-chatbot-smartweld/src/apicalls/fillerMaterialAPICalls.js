import axiosInstance from ".";

export const getFillerMaterials = async () => {
    try {
        const getFillerList = await axiosInstance.get("/fillerMaterial/listByOrg")
        return getFillerList.data
    } catch (error) {
        return error.message
    }
}



export const updateFillerMaterials = async (payload) => {
    try {
        const updateFiller = await axiosInstance.patch(`/fillerMaterial/update/${payload.id}`, payload)
        return updateFiller.data
    } catch (error) {
        return error.message
    }
}



export const createFillerMaterials = async (payload) => {
    try {
        const createFiller = await axiosInstance.post(`/fillerMaterial/create`, payload)
        return createFiller.data
    } catch (error) {
        return error.message
    }
}



export const deleteFillerMaterials = async (payload) => {
    try {
        const deleteFiller = await axiosInstance.delete(`/fillerMaterial/delete/${payload.id}`, payload)
        return deleteFiller.data
    } catch (error) {
        return error.message
    }
}