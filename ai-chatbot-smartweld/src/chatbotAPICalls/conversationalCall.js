import axiosInstance from ".";

export const chatWithConversationalAgent = async (userMessage) => {
    try {
        const chatWithAgent = await axiosInstance.post("/api/chat", userMessage)
        return chatWithAgent.data
    } catch (error) {
        return error.message
    }
}


export const checkChatServerStatus = async () => {
    try {
        const chatServerStatus = await axiosInstance.get("/health")
        return chatServerStatus.data
    } catch (error) {
        return error.message
    }
}
