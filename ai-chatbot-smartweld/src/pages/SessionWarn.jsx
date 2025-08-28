import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import useAuth from '../customHooks/useAuth'

const SessionWarn = () => {
    const { logout } = useAuth()

    useEffect(() => {
        logout()
    }, [])


    return (
        <div className='flex flex-col justify-center items-center'>
            <div className='py-10'>
                <div className='p-3'>
                    <h1 className='font-semibold'>Your session has been expired. You need to login again to continue. This is intended for security purpose.</h1>
                </div>

                <h1 className='font-bold justify-center text-center mt-4'>You need to login again</h1>

                <div className='justify-center flex'>
                    <div className='justify-center items-center'>
                        <div className='justify-center items-center w-44'>
                            <Link
                                to={'/login'}
                                className="mt-6 block w-full select-none rounded-lg bg-gradient-to-tr from-gray-900 to-gray-800 py-3 px-6 text-center align-middle font-sans text-xs font-bold uppercase text-white shadow-md shadow-gray-900/10 transition-all hover:shadow-lg hover:shadow-gray-900/40 active:opacity-[0.65] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                            >LOGIN</Link>
                        </div>

                    </div>
                </div>


            </div>




        </div>
    )
}

export default SessionWarn