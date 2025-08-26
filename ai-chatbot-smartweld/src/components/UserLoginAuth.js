import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import Cookies from 'js-cookie'
import useSessionStorage from "../customHooks/useSessionStorage"

const UserLoginAuth = () => {

    const location = useLocation()
    const [redirectWarning, setRedirectWarning] = useState(false)
   
    //Using custom hook for getting session values
    const { getExpirationValue, getCookie } = useSessionStorage()
    useEffect(() => {
        let timeOutId
        const sessionExpiryTime = getExpirationValue
        if (!sessionExpiryTime) return //If no expiry time is saved.

        const checkSession = () => {
            const expiryTime = sessionExpiryTime ? new Date(sessionExpiryTime) : null;
            const currentTime = new Date()
            const remainingTime = expiryTime - currentTime
            console.log("Remaining Time is", remainingTime)

            if (remainingTime < 0 || remainingTime < 1000 * 60) { // Redirect when there's one minute remaining
                setRedirectWarning(true);
            } else {
                //console.log("Last Else condition is true")
                const nextCheckTime = remainingTime - 1000 * 60 //Checking 1 minutes before session expiration
                timeOutId = setTimeout(checkSession, nextCheckTime)
            }
        }

        //Intial checkup for session
        checkSession()



        //Auto deleting and logging out if user remains inactive for 30 minutes
        let idleTime;

        const handleInactivity = () => {
            clearTimeout(idleTime)
            idleTime = setTimeout(() => {
                Cookies.remove('_smartweld_Cookie')
                sessionStorage.removeItem('_smartWeldUser')
                sessionStorage.removeItem('sessionExpire')
            }, 1000 * 60 * 30) // Idle time to 30 minutes
        }

        //Attaching Event listeners with functions
        window.addEventListener('mousemove', handleInactivity)
        window.addEventListener('keydown', handleInactivity)

        return () => {
           // Cleanup process while component unmounts
            document.removeEventListener('mousemove', handleInactivity)
            document.removeEventListener('keydown', handleInactivity)
            clearTimeout(idleTime)
            clearTimeout(timeOutId)
        }
    }, [getExpirationValue, getCookie])





    //console.log("Auth hook", isAuthenticatedUser)
    return (
        <>
            {redirectWarning ? (
                <Navigate to='/sessionwarning' state={{ from: location }} replace />
            ) : (
                getCookie ? <Outlet /> : <Navigate to='/login' state={{ from: location }} replace />
            )}
        </>
    );
}

export default UserLoginAuth