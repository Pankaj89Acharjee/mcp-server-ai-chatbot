import { createContext, useContext, useState } from 'react'


const UserLocationContext = createContext()

export const UserLocationProvider = ({ children }) => {
    const [userData, setUserData] = useState(null) //For storing API response
    const [isFetched, setIsFetched] = useState(false)

    return (
        <UserLocationContext.Provider value={{ userData, setUserData, isFetched, setIsFetched }}>{children}</UserLocationContext.Provider>
    )
}

export const useLocationContext = () => useContext(UserLocationContext) //Custom Hook to use the context
