import axiosInstance from '.'

export const getJobList = async () => {  //Later Remove this fx to jobs.js
    try {
        const getJob = await axiosInstance.get("/job/listByOrg")
        return getJob.data
    } catch (error) {
        console.log("Error in getting job list", error)
        return error.message
    }
}


export const saveNewJob = async (payload) => { //Later Remove this fx to jobs.js
    try {
        const getJob = await axiosInstance.post(`/job/create`, payload)
        return getJob.data
    } catch (error) {
        console.log("Error in saving a new job", error)
        return error.message
    }
}

export const updateJobList = async (payload) => { 
    try {
        const id = payload.id
        const getJob = await axiosInstance.patch(`/job/update/${id}`, payload)
        return getJob.data
    } catch (error) {
        console.log("Error in getting job list", error)
        return error.message
    }
}


export const deleteJob = async (payload) => {
    try {
        const id = payload.id
        const getJob = await axiosInstance.delete(`/job/delete/${id}`, payload)
        return getJob.data
    } catch (error) {
        console.log("Error in getting job list", error)
        return error.message
    }
}

export const getUserSites = async (payload) => {
    try {
        const getSite = await axiosInstance.post("/user/getUserSite", payload)
        return getSite.data
    } catch (error) {
        console.log("Error in getting user sites", error)
        return error.message
    }
}

export const getMachineJobInfo = async () => {
    try {
        const getMacJobList = await axiosInstance.get("/machineJobInfo/listByOrg")
        return getMacJobList.data
    } catch (error) {
        console.log("Error in getting machine job info list", error)
        return error.message
    }
}

export const getMachines = async () => {
    try {
        const getMachineList = await axiosInstance.get("/machine/getMachinesByOrg")
        return getMachineList.data
    } catch (error) {
        console.log("Error in getting machine list", error)
        return error.message
    }
}