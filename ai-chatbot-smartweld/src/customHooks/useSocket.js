import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'

const useSocket = (webSocketURL, hardwareID) => {
    // Custom Hook for Socket connection creation
    const [socket, setSocket] = useState(null)

    useEffect(() => {
        const newSocket = io(webSocketURL, {
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000
        })

        newSocket.on('connect', () => {
            console.log('Connected to Socket', newSocket.id)            
        })

        newSocket.on('connect_error', (error) => {
            console.log('Connection Error', error)
        })

        newSocket.on('connect_timeout', (timeout) => {
            console.log('Connection Timeout', timeout)
        })

        newSocket.on('disconnet', (reason) => {
            console.log('WebSocket Disconnected for: -- ', reason)
        })
        
        setSocket(newSocket)

        return () => {
            newSocket.off(hardwareID)
            newSocket.disconnect()
        };
    }, [webSocketURL, hardwareID]);

    return socket
}

export default useSocket
