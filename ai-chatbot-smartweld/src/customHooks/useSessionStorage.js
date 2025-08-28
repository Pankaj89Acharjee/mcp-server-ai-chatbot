import { useEffect, useState } from "react";
import Cookies from 'js-cookie';

const useSessionStorage = () => {
    const [getSession, setGetSession] = useState(() => {
        const sessionData = sessionStorage.getItem('_smartWeldUser');
        return sessionData ? JSON.parse(sessionData) : null;
    });
    const [getExpirationValue, setGetExpirationValue] = useState(() => sessionStorage.getItem('sessionExpire'));
    const [getCookie, setGetCookie] = useState(() => Cookies.get('_smartweld_Cookie'));

    useEffect(() => {
        const handleStorageForSession = () => {
            const sessionData = sessionStorage.getItem('_smartWeldUser');
            setGetSession(sessionData ? JSON.parse(sessionData) : null);
            setGetExpirationValue(sessionStorage.getItem('sessionExpire'));
            setGetCookie(Cookies.get('_smartweld_Cookie'));
        };

        window.addEventListener('storage', handleStorageForSession);

        return () => {
            window.removeEventListener('storage', handleStorageForSession);
        };
    }, []);

    return { getSession, getExpirationValue, getCookie };
};

export default useSessionStorage;
