import React, { useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { CardBody, CardContainer, CardItem } from "../components/ui/3d-card";
import { getHardwareList } from '../apicalls/machineJobRunInfoCall';
import { Button } from '../components/ui/moving-border';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion'


const MachineLive = () => {


    const [hardwareInfo, setHardwareInfo] = useState([]);
    const [eventListeners, setEventListeners] = useState([]);
    const [groupedMachineTypesContainer, setGroupedMachineTypesContainer] = useState({});
    const [uniqueMachineTypesName, setUniqueMachineTypesName] = useState([]);
    const [isSocketConnected, setIsSocketConnected] = useState(false);
    const [isStopped, setIsStopped] = useState(false);

    const socketRef = useRef(null);

    const webSocketURL = process.env.REACT_APP_SOCKET_SERVER_URL;

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

    useEffect(() => {
        const fetchHardwareInfo = async () => {
            try {
                const response = await getHardwareList();
                console.log("Hardware fetching result in Machine Live:", response.data);
                setHardwareInfo(response.data);

            } catch (error) {
                console.error("Error fetching hardware info:", error);
            }
        };

        fetchHardwareInfo();
    }, []);





    const initializeSocketListeners = () => {
        if (!socketRef.current) return;

        setIsStopped(prev => !prev);
        hardwareInfo.forEach((element) => {
            const listener = (data) => {
                setEventListeners((prevListeners) => {
                    const updatedListeners = [...prevListeners];
                    const foundIndex = updatedListeners.findIndex(
                        (item) => item.hardwareCode === element.hardware_code
                    );
                    if (foundIndex !== -1) {
                        updatedListeners[foundIndex] = {
                            ...updatedListeners[foundIndex],
                            status: data.mstatus,
                            current: data.cur,
                            voltage: data.volt,
                            gasFr: data.gasFR,
                            rfid: data.oid,
                            dis: data.dis,
                        };
                    }
                    return updatedListeners;
                });
            };

            socketRef.current.on(element.hardware_code, listener);

            setEventListeners((prevListeners) => [
                ...prevListeners,
                {
                    hardwareCode: element.hardware_code,
                    status: "NO STATUS",
                    current: 0,
                    dis: 0,
                    gasFr: 5,
                    voltage: 0,
                    rfid: "0",
                    listener,
                },
            ]);
        });
    };

    const stopReceivingStatus = () => {
        eventListeners.forEach((item) => {
            socketRef.current.off(item.hardwareCode, item.listener);
        });
        setEventListeners([]);
        setIsStopped(true);
    };


    // Grouping the machines based on their machine type and 
    const { grouped, uniqueMachineTypeNames } = useMemo(() => {
        const uniqueMachineNamesSet = new Set();
        const groupedMacTypes = hardwareInfo.reduce((accumulator, hardware) => {
            const machineType = hardware.machine_type;
            if (!uniqueMachineNamesSet.has(machineType)) {
                uniqueMachineNamesSet.add(machineType);
            }
            // Checking the Keys of the Object "accumulator"
            if (!accumulator[machineType]) {
                accumulator[machineType] = [];
            }
            accumulator[machineType].push({
                ...hardware,
                weld_curr: hardware.weld_curr || 0,
                weld_gas: hardware.weld_gas || 0,
                weld_volt: hardware.weld_volt || 0,
            });


            return accumulator;

        }, {});

        return {
            grouped: groupedMacTypes,
            uniqueMachineTypeNames: Array.from(uniqueMachineNamesSet),
        }

    }, [hardwareInfo]);

    useEffect(() => {
        if (isSocketConnected && hardwareInfo?.length > 0) {
            setGroupedMachineTypesContainer(grouped);
            setUniqueMachineTypesName(uniqueMachineTypeNames);
            initializeSocketListeners();
        }
    }, [isSocketConnected, hardwareInfo, grouped, uniqueMachineTypeNames]);




    const getStatusColorByHardwareCode = (hardwareCode) => {
        const foundItem = eventListeners.find((item) => item.hardwareCode === hardwareCode);
        if (foundItem) { }
        return foundItem ? foundItem.status.toUpperCase() : "NO STATUS";
    };

    const getLiveParamsAndColor = (hardwareCode) => {
        const foundItem = eventListeners.find((item) => item.hardwareCode === hardwareCode);
        if (!foundItem) {
            return { params: null, color: "#f71e1e", statusColor: "#f71e1e" };
        }

        const params = {
            current: foundItem.current > 20 ? foundItem.current : 0,
            dis: foundItem.dis,
            voltage: foundItem.voltage > 5 ? foundItem.voltage : 0,
            gasFr: foundItem.gasFr > 5 ? foundItem.gasFr : 0,
            rfid: foundItem.rfid || "NA",
            runningStatus: foundItem.status.toUpperCase() || "NO STATUS",
        };

        const isRed = params.current === 0 || params.voltage === 0 || params.gasFr === 0 || params.dis === 0;

        const color = isRed ? "#f71e1e" : "#5ae31b"; // Red if any parameter is below threshold, otherwise Green

        const statusColor =
            params?.runningStatus === "STOP" ? "#fbe70a" :
                params?.runningStatus === "RUNNING" ? "#5ae31b" :
                    params?.runningStatus === "NO STATUS" ? "#f71e1e" : "#ffffff";


        return { params, color, statusColor };
    };



    return (
        <div>
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
                className="flex justify-between items-center p-2 mr-6 ml-6 rounded-lg">
                <div className='relative flex h-[10rem] w-full items-center justify-center bg-white dark:bg-black rounded-lg'>
                    <div
                        className={cn(
                            "absolute inset-0",
                            "[background-size:40px_40px]",
                            "[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]",
                            "dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]",
                        )}
                    />
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black"></div>
                    <p className="relative z-20 bg-gradient-to-b from-neutral-200 to-neutral-500 bg-clip-text py-8 text-3xl font-bold text-transparent sm:text-7xl">
                        Machine Live Status
                    </p>

                    {isStopped && (
                        <div className='justify-end items-center ml-4'>
                            <Button
                                borderRadius='1.75rem'
                                className="flex flex-row  bg-green-500/90 text-white dark:bg-slate-900 border-neutral-200 dark:border-slate-800 mb-2 hover:bg-green-500/90"
                                onClick={initializeSocketListeners}
                            >Start</Button>
                        </div>
                    )}

                    {!isStopped && (
                        <div className='justify-end items-center ml-4'>
                            <Button
                                borderRadius='1.75rem'
                                className="flex flex-row  bg-pink-500/90 text-white dark:bg-slate-900 border-neutral-200 dark:border-slate-800 mb-2 hover:bg-red-500/90"
                                onClick={stopReceivingStatus}
                            >Stop</Button>
                        </div>
                    )}
                </div>
            </motion.div>




            {/* Machine Cards Begin */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.9 }}
                className='relative flex h-full w-full items-center justify-center bg-white dark:bg-black rounded-lg m-1'>
                <div
                    className={cn(
                        "absolute inset-0",
                        "[background-size:40px_40px]",
                        "[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]",
                        "dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]",
                    )}
                />
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black"></div>

                <div className='flex flex-wrap justify-center items-center'>
                    {uniqueMachineTypesName?.length === 0 ? (
                        <div className="text-center text-neutral-500">No machines available to display.</div>
                    ) : (
                        uniqueMachineTypesName?.map((machineType, index) => (
                            <div key={index} className='flex flex-col justify-center items-center rounded-lg border border-neutral-400 pl-1 pr-1 pb-1 m-1'>

                                {/* Machine Type Name */}
                                <h1 className="text-md font-light text-neutral-800 dark:text-neutral-300 mt-1 mb-1">
                                    {machineType}
                                </h1>

                                {/* Machines under the Machine Type */}
                                <div className='flex flex-wrap justify-center items-center'>
                                    {groupedMachineTypesContainer[machineType]?.map((hardware) => {
                                        const { params, color, statusColor } = getLiveParamsAndColor(hardware.hardware_code);

                                        return (
                                            <CardContainer
                                                key={hardware.hardware_code}
                                                className="inter-var max-w-[290px] m-0.5 group hover:shadow-2xl hover:shadow-emerald-500/[0.3] transition-shadow duration-300">
                                                <CardBody
                                                    className="bg-gradient relative dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-auto sm:w-[30rem] h-56 rounded-xl p-6 border overflow-hidden"
                                                >
                                                    {/* Background effect */}
                                                    <div className="absolute inset-0 bg-effect opacity-0 group-hover:opacity-100"></div>

                                                    {/* Machine Details */}
                                                    <div className='flex justify-between items-center'>
                                                        <CardItem
                                                            translateZ="40"
                                                            className="font-bold text-neutral-200 dark:text-neutral-300 group-hover:text-white">
                                                            Gas {" "} <span className="text-sm font-semibold" style={{ color: color }}>{params?.gasFr} /</span> <span className="text-sm font-semibold">{hardware?.weld_gas}</span>
                                                        </CardItem>

                                                        <CardItem
                                                            translateZ="50"
                                                            className="font-bold text-neutral-200 dark:text-neutral-300 group-hover:text-white">
                                                            RFID <span className="text-sm font-semibold">{params?.rfid}</span>
                                                        </CardItem>
                                                    </div>


                                                    {/* Machine Name - Center Portion */}
                                                    <div className='flex justify-center flex-1 flex-col items-center'>
                                                        <CardItem
                                                            as="p"
                                                            translateZ="60"
                                                            className="text-neutral-500 text-sm max-w-sm mt-2 dark:text-neutral-300 group-hover:text-white">
                                                            <span className="text-neutral-200 text-xs font-light dark:text-neutral-300 group-hover:text-white">{hardware?.machine_name}</span>
                                                        </CardItem>

                                                        {/* Getting Running status of machines */}
                                                        <CardItem
                                                            translateZ="60"
                                                            rotateX={10}
                                                            rotateZ={-5}
                                                            className="text-xl font-light text-amber-500 dark:text-white group-hover:text-amber-500"
                                                            style={{ color: statusColor }}>
                                                            {getStatusColorByHardwareCode(hardware?.hardware_code)}
                                                        </CardItem>

                                                        {/* Job Name */}
                                                        <CardItem
                                                            as="p"
                                                            translateZ="60"
                                                            className="text-neutral-200 text-sm max-w-sm mt-2 dark:text-neutral-300 group-hover:text-white">
                                                            <span className="text-neutral-200 text-xs font-semibold dark:text-neutral-300 group-hover:text-white">{hardware?.job_name || "No Job"}</span>
                                                        </CardItem>

                                                        <CardItem
                                                            as="p"
                                                            translateZ="60"
                                                            className="text-neutral-200 text-xs max-w-sm mt-2 dark:text-neutral-300 group-hover:text-white">
                                                            Inp: <span className="text-neutral-200 font-semibold dark:text-neutral-300 group-hover:text-white" style={{ color: color }}>{params?.dis}</span>
                                                        </CardItem>
                                                    </div>

                                                    {/* Lower Portion of Card */}
                                                    <div className='flex justify-between items-center'>
                                                        <CardItem
                                                            translateZ="40"
                                                            className="font-bold text-neutral-200 dark:text-neutral-300 group-hover:text-white">
                                                            Amp {" "} <span className="text-sm font-semibold" style={{ color: color }}>{params?.current || 0} /</span> <span className="text-sm font-semibold">{hardware?.weld_curr || 0}</span>
                                                        </CardItem>

                                                        <CardItem
                                                            translateZ="50"
                                                            className="font-bold text-neutral-200 dark:text-neutral-300 group-hover:text-white">
                                                            Volt {" "} <span className="text-sm font-semibold" style={{ color: color }}>{params?.voltage || 0} /</span> <span className="text-sm font-semibold">{hardware?.weld_volt || 0}</span>
                                                        </CardItem>
                                                    </div>
                                                </CardBody>
                                            </CardContainer >
                                        )
                                    })}
                                </div>
                            </div >
                        ))
                    )}
                </div >

            </motion.div>
        </div>

    );
};

export default MachineLive;