import axiosInstance from ".";

export const getmachinewisejobtarget = async () => {
    try {
        const getJobTarget = await axiosInstance.get(`/machineWiseJobTarget/listByOrg`)
        return getJobTarget.data
    } catch (error) {
        return error.message
    }
}


export const updatemachinewisejobtarget = async (payload) => {
    try {
        const updateJobTarget = await axiosInstance.patch(`/machineWiseJobTarget/update/` + payload.id, payload)
        return updateJobTarget.data
    } catch (error) {
        return error.message
    }
}


export const createmachinewisejobtarget = async (payload) => {
    try {
        const createJobTarget = await axiosInstance.post(`/machineWiseJobTarget/create`, payload)
        return createJobTarget.data
    } catch (error) {
        return error.message
    }
}


export const deletemachinewisejobtarget = async (payload) => {
    try {
        const deleteJobTarget = await axiosInstance.delete(`/machineWiseJobTarget/delete/${payload.id}`, payload)
        return deleteJobTarget.data
    } catch (error) {
        return error.message
    }
}