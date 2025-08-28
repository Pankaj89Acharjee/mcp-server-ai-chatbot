import axiosInstance from '.'

export const getJobConfigList = async () => {  //Later Remove this fx to jobs.js
    try {
        const getConfigList = await axiosInstance.get('/machineJobRunInfo/listByOrg')
        return getConfigList.data
    } catch (error) {
        console.log("Error in getting job config list", error)
        return error.message
    }
}

export const saveNewJobConfig = async (payload) => { //Later Remove this fx to jobs.js
    try {
        const getJobConfig = await axiosInstance.post(`/machineJobRunInfo/create`, payload)
        return getJobConfig.data
    } catch (error) {
        console.log("Error in saving a new job", error)
        return error.message
    }
}
export const updateJobConfigList = async (payload) => {
    try {
        const updateListJobConfig = await axiosInstance.patch(`/machineJobRunInfo/update/${payload.id}`, payload)
        return updateListJobConfig.data
    } catch (error) {
        return error.message
    }
}
export const deleteJobConfig = async (payload) => {
    try {
        const deleteListMapping = await axiosInstance.delete(`/machineJobRunInfo/delete/${payload.id}`, payload)
        return deleteListMapping.data
    } catch (error) {
        return error.message
    }
}


export const getmachinejobmappings = async () => {
    try {
        const getMappingList = await axiosInstance.get("/machineJobInfo/listByOrg")
        return getMappingList.data
    } catch (error) {
        console.log("Error in getting job config list", error)
        return error.message
    }
}