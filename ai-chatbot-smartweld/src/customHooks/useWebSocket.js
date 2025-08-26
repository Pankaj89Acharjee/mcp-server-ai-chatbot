import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client';

const useWebSocket = (webSocketURL) => {
    const [isSocketConnected, setIsSocketConnected] = useState(false);
    const socketRef = useRef(null);


    useEffect(() => {
        // Establish WebSocket connection only once
        if (!socketRef.current) {
            const newSocket = io(webSocketURL, {
                transports: ['websocket'],
                reconnection: true,
                reconnectionAttempts: Infinity,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                timeout: 20000,
            });
            newSocket.on('connect', () => {
                console.log("WebSocket connected:", newSocket.id);
                setIsSocketConnected(true);
            });

            newSocket.on('connect_error', (error) => {
                console.error("WebSocket connection error:", error);
            });

            newSocket.on('disconnect', (reason) => {
                console.warn("WebSocket disconnected:", reason);
            });

            socketRef.current = newSocket;
        }

        return () => {
            if (socketRef.current) {
                console.log("Cleaning up WebSocket connection");
                socketRef.current.disconnect();
                socketRef.current = null;
            }

        };
    }, [webSocketURL]);


    return { socketRef, isSocketConnected }
}

export default useWebSocket
