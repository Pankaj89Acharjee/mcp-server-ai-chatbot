import axiosInstance from ".";

export const getSites = async () => {
    try {
        const sitesByLoc = await axiosInstance.get(`/site/getSiteByOrg`)
        return sitesByLoc.data
    } catch (error) {
        return error.message
    }
}


export const updateSites = async (payload) => {
    try {
        const updateSiteData = await axiosInstance.patch(`/site/update/` + payload.id, payload)
        return updateSiteData.data
    } catch (error) {
        return error.message
    }
}


export const createSite = async (payload) => {
    try {
        const createSiteData = await axiosInstance.post(`/site/create`, payload)
        return createSiteData.data
    } catch (error) {
        return error.message
    }
}



export const deleteSite = async (payload) => {
    try {
        const deleteSiteData = await axiosInstance.delete(`/site/delete/${payload.id}`, payload)
        return deleteSiteData.data
    } catch (error) {
        return error.message
    }
}
