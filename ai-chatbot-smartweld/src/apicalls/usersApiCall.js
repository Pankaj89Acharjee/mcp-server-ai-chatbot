import axiosInstance from ".";

export const getAllUsersList = async () => {
    try {
        const getUsers = await axiosInstance.get("/user/getUserByOrg")
        return getUsers.data
    } catch (error) {
        return error.message
    }
}

export const getAllRoles = async () => {
    try {
        const getRoles = await axiosInstance.get("/role/get")
        return getRoles.data
    } catch (error) {
        return error.message
    }
}


export const updateUserData = async (payload) => {
    try {
        const updateUser = await axiosInstance.patch(`/user/update/` + payload.id, payload)
        return updateUser.data
    } catch (error) {
        return error.message
    }
}


export const createUserData = async (payload) => {
    try {
        const createUser = await axiosInstance.post(`/user/create`, payload)
        return createUser.data
    } catch (error) {
        return error.message
    }
}


export const deleteUserData = async (payload) => {
    try {
        const deleteUser = await axiosInstance.post(`/user/delete/${payload.id}`, payload)
        return deleteUser.data
    } catch (error) {
        return error.message
    }
}

export const getOperatorsByOrg = async () => {
    try {
        const getOperator = await axiosInstance.get(`/user/getUserOperatorByOrg`)
        return getOperator.data
    } catch (error) {
        return error.message        
    }
}