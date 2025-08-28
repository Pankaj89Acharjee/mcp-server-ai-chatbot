import axiosInstance from ".";

export const getAllShiftsList = async () => {
    try {
        const getShifts = await axiosInstance.get("/shift/listByOrg")
        return getShifts.data
    } catch (error) {
        return error.message
    }
}


export const updateShiftData = async (payload) => {
    try {
        const updateShift = await axiosInstance.patch(`/shift/update/` + payload.id, payload)
        return updateShift.data
    } catch (error) {
        return error.message
    }
}     



export const createNewShiftData = async (payload) => {
    try {
        const createShift = await axiosInstance.post(`/shift/create`, payload)
        return createShift.data
    } catch (error) {
        return error.message
    }
}


export const DeleteShiftData = async (payload) => {
    try {
        const deleteShift = await axiosInstance.delete(`/shift/delete/${payload.id}`, payload)
        return deleteShift.data
    } catch (error) {
        return error.message
    }
}
