import axiosInstance from ".";

export const getAllLines = async () => {
    try {
        const getLines = await axiosInstance.get("/lineType/getLineTypeByOrg")
        return getLines.data
    } catch (error) {
        return error.message
    }
}


export const updateLineType = async (payload) => {
    try {
        const updateLines = await axiosInstance.patch(`/lineType/update/` + payload.id, payload)
        return updateLines.data
    } catch (error) {
        return error.message
    }
}


export const createLineType = async (payload) => {
    try {
        const createLines = await axiosInstance.post(`/lineType/create`, payload)
        return createLines.data
    } catch (error) {
        return error.message
    }
}


export const deleteLineType = async (payload) => {
    try {
        const deleteLines = await axiosInstance.delete(`/lineType/delete/${payload.id}`)
        return deleteLines.data
    } catch (error) {
        return error.message
    }
}








