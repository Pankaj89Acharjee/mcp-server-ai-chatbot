import axios from "axios"

export const login = async (payload) => {
    try {
        const getLoginUser = await axios.get("http://localhost:5000/user/login", {
        //const getLoginUser = await axios.get("http://123.63.252.138:5000/user/login", {
            headers: {
                Authorization: `Basic ${payload}`
            },
        })
        return getLoginUser.data
    } catch (error) {
        console.log("Error in login", error)
        return error
    }
}