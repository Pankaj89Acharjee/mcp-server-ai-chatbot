import React from 'react'
import { CirclesWithBar } from 'react-loader-spinner'

const Loading = ({message}) => {
    return (
        <div className='flex flex-col justify-center items-center h-full'>
            <CirclesWithBar
                type="Square"
                color="#00BFFA"
                height={100}
                width={200}
                className="m-7"
            />
            <p className='text-lg text-center px-2'>{message}</p>
        </div>
    )
}

export default Loading