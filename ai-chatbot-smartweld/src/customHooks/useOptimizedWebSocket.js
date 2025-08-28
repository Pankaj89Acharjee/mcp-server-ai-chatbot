import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { io } from 'socket.io-client';

/**
 * Optimized WebSocket hook for real-time data with performance enhancements
 * Features:
 * - Single connection management
 * - Throttled updates
 * - Memory efficient data handling
 * - Automatic reconnection
 * - Data normalization
 */
const useOptimizedWebSocket = (webSocketURL, hardwareList = []) => {
    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState(null);
    const [realtimeData, setRealtimeData] = useState({});
    
    const socketRef = useRef(null);
    const dataBufferRef = useRef({});
    const updateTimerRef = useRef(null);
    const lastUpdateRef = useRef({});
    
    // Throttle config - adjustable based on needs
    const UPDATE_THROTTLE_MS = 100; // Update UI every 100ms
    const DATA_RETENTION_LIMIT = 250; // Keep last 250 data points for charts
    
    // Memoized hardware codes for listener setup
    const hardwareCodes = useMemo(() => 
        hardwareList.map(hw => hw.hardware_code).filter(Boolean),
        [hardwareList]
    );
    
    // Optimized data processing function
    const processDataBatch = useCallback(() => {
        const currentBuffer = { ...dataBufferRef.current };
        dataBufferRef.current = {};
        
        if (Object.keys(currentBuffer).length === 0) return;
        
        setRealtimeData(prevData => {
            const newData = { ...prevData };
            
            Object.entries(currentBuffer).forEach(([hardwareCode, latestValue]) => {
                const timestamp = new Date(latestValue.tm).getTime();
                
                // Only update if data actually changed
                const lastData = lastUpdateRef.current[hardwareCode];
                const hasChanged = !lastData || 
                    lastData.cur !== latestValue.cur ||
                    lastData.volt !== latestValue.volt ||
                    lastData.gasFR !== latestValue.gasFR ||
                    lastData.mstatus !== latestValue.mstatus;
                
                if (hasChanged) {
                    newData[hardwareCode] = {
                        // Current values
                        current: latestValue.cur ?? 0,
                        voltage: latestValue.volt ?? 0,
                        gasFR: latestValue.gasFR ?? 0,
                        machineTemp: latestValue.hstemp ?? 0,
                        ambienceTemp: latestValue.ambtemp ?? 0,
                        status: latestValue.mstatus || 'NO STATUS',
                        operatorId: latestValue.oid || '',
                        timestamp,
                        
                        // Chart data with memory management
                        currentSeries: (prevData[hardwareCode]?.currentSeries || [])
                            .slice(-DATA_RETENTION_LIMIT + 1)
                            .concat([[timestamp, latestValue.cur ?? 0]]),
                        voltageSeries: (prevData[hardwareCode]?.voltageSeries || [])
                            .slice(-DATA_RETENTION_LIMIT + 1)
                            .concat([[timestamp, latestValue.volt ?? 0]]),
                        gasFRSeries: (prevData[hardwareCode]?.gasFRSeries || [])
                            .slice(-DATA_RETENTION_LIMIT + 1)
                            .concat([[timestamp, latestValue.gasFR ?? 0]]),
                    };
                    
                    lastUpdateRef.current[hardwareCode] = latestValue;
                }
            });
            
            return newData;
        });
    }, []);
    
    // Setup throttled batch processing
    useEffect(() => {
        const processData = () => {
            processDataBatch();
            updateTimerRef.current = setTimeout(processData, UPDATE_THROTTLE_MS);
        };
        
        updateTimerRef.current = setTimeout(processData, UPDATE_THROTTLE_MS);
        
        return () => {
            if (updateTimerRef.current) {
                clearTimeout(updateTimerRef.current);
            }
        };
    }, [processDataBatch]);
    
    // Initialize socket connection
    useEffect(() => {
        if (!webSocketURL) return;
        
        const socket = io(webSocketURL, {
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000,
            forceNew: true
        });
        
        socket.on('connect', () => {
            console.log('WebSocket connected:', socket.id);
            setIsConnected(true);
            setConnectionError(null);
        });
        
        socket.on('connect_error', (error) => {
            console.error('WebSocket connection error:', error);
            setConnectionError(error.message);
            setIsConnected(false);
        });
        
        socket.on('disconnect', (reason) => {
            console.warn('WebSocket disconnected:', reason);
            setIsConnected(false);
        });
        
        socket.on('reconnect', () => {
            console.log('WebSocket reconnected');
            setIsConnected(true);
            setConnectionError(null);
        });
        
        socketRef.current = socket;
        
        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [webSocketURL]);
    
    // Setup hardware listeners
    useEffect(() => {
        if (!socketRef.current || !isConnected || hardwareCodes.length === 0) {
            return;
        }
        
        const listeners = {};
        
        hardwareCodes.forEach(hardwareCode => {
            const listener = (data) => {
                // Buffer the data instead of immediately processing
                dataBufferRef.current[hardwareCode] = data;
            };
            
            socketRef.current.on(hardwareCode, listener);
            listeners[hardwareCode] = listener;
        });
        
        return () => {
            if (socketRef.current) {
                Object.entries(listeners).forEach(([code, listener]) => {
                    socketRef.current.off(code, listener);
                });
            }
        };
    }, [hardwareCodes, isConnected]);
    
    // Get data for specific hardware
    const getHardwareData = useCallback((hardwareCode) => {
        return realtimeData[hardwareCode] || {
            current: 0,
            voltage: 0,
            gasFR: 0,
            machineTemp: 0,
            ambienceTemp: 0,
            status: 'NO STATUS',
            operatorId: '',
            timestamp: Date.now(),
            currentSeries: [[Date.now(), 0]],
            voltageSeries: [[Date.now(), 0]],
            gasFRSeries: [[Date.now(), 0]]
        };
    }, [realtimeData]);
    
    // Get aggregated status across all machines
    const getOverallStatus = useCallback(() => {
        const statuses = Object.values(realtimeData).map(data => data.status);
        const running = statuses.filter(s => s === 'running').length;
        const stopped = statuses.filter(s => s === 'stop').length;
        const noStatus = statuses.length - running - stopped;
        
        return {
            total: statuses.length,
            running,
            stopped,
            noStatus,
            activeConnections: hardwareCodes.length
        };
    }, [realtimeData, hardwareCodes.length]);
    
    return {
        isConnected,
        connectionError,
        realtimeData,
        getHardwareData,
        getOverallStatus,
        socket: socketRef.current
    };
};

export default useOptimizedWebSocket;