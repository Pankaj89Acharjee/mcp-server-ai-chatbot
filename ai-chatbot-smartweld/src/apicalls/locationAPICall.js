import axiosInstance from ".";

export const getLocation = async () => {
    try {
        const locOfOrg = await axiosInstance.get("/location/listByOrg")
        return locOfOrg.data
    } catch (error) {
        return error.message
    }
}

export const getSiteByLocation = async (locId) => {
    try {
        const sitesByLoc = await axiosInstance.post("/location/getSiteByLocation", { locId: locId })
        return sitesByLoc.data
    } catch (error) {
        return error.message
    }
}


export const getLineBySite = async (siteId) => {
    try {
        const sitesByLoc = await axiosInstance.post("/location/getLineBySite", { siteId: siteId })
        return sitesByLoc.data
    } catch (error) {
        return error.message
    }
}


export const updateLocation = async (payload) => {
    try {
        const updateLoc = await axiosInstance.patch(`/location/update/` + payload.id, payload)
        return updateLoc.data
    } catch (error) {
        return error.message
    }
}


export const createLocation = async (payload) => {
    try {
        const createLoc = await axiosInstance.post("/location/create", payload)
        return createLoc.data
    } catch (error) {
        return error.message
    }
}

export const deleteLocation = async (payload) => {
    try {
        const deleteLoc = await axiosInstance.delete(`/location/delete/${payload.id}`)
        return deleteLoc.data
    } catch (error) {
        return error.message
    }
}



