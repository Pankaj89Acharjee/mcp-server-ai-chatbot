/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from 'react'
import useSocket from '../../customHooks/useSocket'
import ChartComponent from '../ChartComponent'
//import EnlargedChartModal from './EnlargedChartModal'



const CurrentChart = ({ hardwareCode, updateStatus }) => {

    const webSocketURL = process.env.REACT_APP_SOCKET_SERVER_URL
    const socket = useSocket(webSocketURL, hardwareCode.hardware_code)

    const [currentSeries, setCurrentSeries] = useState([[Date.now(), 0]])
    const [voltageSeries, setVoltageSeries] = useState([[Date.now(), 0]])
    const [gasFRSeries, setGasFRSeries] = useState([[Date.now(), 0]])


    // const [isModalVisible, setIsModalVisible] = useState(false);
    // const [modalChartTitle, setModalChartTitle] = useState('');
    // const [modalChartOptions, setModalChartOptions] = useState({});
    // const [modalChartSeries, setModalChartSeries] = useState([]);

    // const showModal = (title, options, series) => {
    //     setModalChartTitle(title);
    //     setModalChartOptions(options);
    //     setModalChartSeries(series);
    //     setIsModalVisible(true);
    // };

    // const handleCloseModal = () => {
    //     setIsModalVisible(false);
    // };

    const currentChartRef = useRef(null)
    const voltageChartRef = useRef(null)
    const gasFRChartRef = useRef(null)

    let hardwareID = hardwareCode.hardware_code


    // Get live data from mqtt
    useEffect(() => {
        if (!socket) return

        const listener = (value) => {
            const istTime = new Date(value.tm).getTime();
            console.log("Live data mqtt", value)
            setCurrentSeries((prev) => [...prev.slice(-250), [value.tm, value.cur]])
            setVoltageSeries((prev) => [...prev.slice(-250), [istTime, value.volt]])
            setGasFRSeries((prev) => [...prev.slice(-250), [istTime, value.gasFR]])

            // updating parent component's call back fx to send data to parent (Realtime Comp)
            updateStatus({
                mstatus: value.mstatus,
                machineTemp: value.hstemp,
                ambienceTemp: value.ambtemp,
                gasFRValue: value.gasFR,
                oid: value.oid
            })
        };


        socket.on(`${hardwareID}`, listener)

        return (() => {
            socket.off(hardwareID, listener)
        })
    }, [hardwareID, socket])



    //For updating the time of x-axis as we are memoizing
    useEffect(() => {

    }, [])



    // Memoizing chart properties to prevent un-necessary re-rendering and calculating
    const commonOptions = {
        chart: {
            height: 250,
            width: "100%",
            animations: {
                enabled: true,
                easing: 'linear',
                dynamicAnimation: { speed: 1000 },
            },
            borderColor: "rgba(75, 192, 192, 1)",
        },
        pan: { enabled: false },
        zoom: { enabled: false },
        dropShadow: { enabled: true, opacity: 0.3, blur: 5, left: -7, top: 22 },
        xaxis: {
            type: 'datetime',
            range: 600000,
            min: currentSeries.length > 0 ? currentSeries[0][0] : undefined,
            max: Date.now(),
            labels: {
                dateTimeUTC: false,
                formatter: (value) => {
                    let date = new Date(value)
                    return date.toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
                },
                style: { fontSize: "12px", colors: "#ffffff" },
                offsetX: 0,
                offsetY: 0,
            },
            tickPlacement: "on",
            tickAmount: 3,
            axisTicks: { color: "#ffffff" },
            axisBorder: { color: "#ffffff" },
        },
        yaxis: {
            floating: false,
            axisTicks: { color: "#ffffff" },
            axisBorder: { color: "#ffffff" },
            labels: { style: { fontSize: "12px", colors: "#ffffff" } },
        },
        grid: { borderColor: "#ffffff", strokeDashArray: 2 },
        stroke: { curve: 'smooth', width: 3.5, colors: ["#ffffff"] },
        markers: { size: 0 },
        legend: {
            show: true,
            floating: true,
            horizontalAlign: 'left',
            position: 'top',
            onItemClick: { toggleDataSeries: false },
            offsetY: -28,
            offsetX: 60,
        },
        tooltip: {
            theme: "dark",
            style: { fontSize: "12px", fontFamily: "Arial, sans-serif" },
            x: { format: "HH:mm:ss" },
            y: { formatter: (val) => `${val}` },
        },
    };

    const currentOptions = {
        ...commonOptions,
        chart: { ...commonOptions.chart, id: "current-realtime" },
        yaxis: { ...commonOptions.yaxis, title: { text: "Ampere", style: { color: "#ffffff" } } },
        annotations: {
            yaxis: [
                {
                    y: hardwareCode?.high_weld_cur_threshold || "100",
                    borderColor: "#ff0e0e",
                    label: { borderColor: "#ff0e0e", style: { color: "#fff", background: "#ff0e0e" }, text: "UCL SET @" + hardwareCode?.high_weld_cur_threshold },
                },
                {
                    y: hardwareCode?.weld_curr || "80",
                    borderColor: "#ff0e0e",
                    label: { text: "SET @" + hardwareCode?.weld_curr, borderColor: "#ff0e0e", style: { color: "#fff", background: "#ff0e0e" } },
                },
                {
                    y: hardwareCode?.low_weld_cur_threshold || "60",
                    borderColor: "#00008b",
                    label: { text: "LCL SET @" + hardwareCode?.low_weld_cur_threshold, borderColor: "#00008b", style: { color: "#fff", background: "#00008b" } },
                },
            ],
        },
    };

    const voltageOptions = {
        ...commonOptions,
        chart: { ...commonOptions.chart, id: "voltage-realtime" },
        yaxis: { ...commonOptions.yaxis, title: { text: "Volt", style: { color: "#ffffff" } } },
        annotations: {
            yaxis: [
                {
                    y: hardwareCode?.high_weld_volt_threshold || "100",
                    borderColor: "#00008b",
                    label: { borderColor: "#00E396", style: { color: "#fff", background: "#00E396" }, text: "UCL SET @" + hardwareCode?.high_weld_volt_threshold },
                },
                {
                    y: hardwareCode?.weld_volt || "80",
                    borderColor: "#ff0e0e",
                    label: { text: "SET @" + hardwareCode?.weld_volt, borderColor: "#ff0e0e", style: { color: "#fff", background: "#ff0e0e" } },
                },
                {
                    y: hardwareCode?.low_weld_volt_threshold || "60",
                    borderColor: "#00008b",
                    label: { text: "LCL SET @" + hardwareCode?.low_weld_volt_threshold, borderColor: "#00008b", style: { color: "#fff", background: "#00008b" } },
                },
            ],
        },
    };

    const gasFROptions = {
        ...commonOptions,
        chart: { ...commonOptions.chart, id: "gas-realtime" },
        yaxis: { ...commonOptions.yaxis, title: { text: "Cubic Capacity", style: { color: "#ffffff" } } },
        annotations: {
            yaxis: [
                {
                    y: hardwareCode?.high_weld_gas_threshold || "100",
                    borderColor: "#00008b",
                    label: { borderColor: "#00E396", style: { color: "#fff", background: "#00E396" }, text: "UCL SET @" + hardwareCode?.high_weld_gas_threshold },
                },
                {
                    y: hardwareCode?.weld_gas || "80",
                    borderColor: "#ff0e0e",
                    label: { text: "SET @" + hardwareCode?.weld_gas, borderColor: "#ff0e0e", style: { color: "#fff", background: "#ff0e0e" } },
                },
                {
                    y: hardwareCode?.low_weld_gas_threshold || "60",
                    borderColor: "#00008b",
                    label: { text: "LCL SET @" + hardwareCode?.low_weld_gas_threshold, borderColor: "#00008b", style: { color: "#fff", background: "#00008b" } },
                },
            ],
        },
    };


    console.log("Live data", currentSeries)


    return (
        <div className='flex flex-wrap overflow-hidden justify-around w-full mt-2 text-white mb-8'>


            <ChartComponent
                title={"Current Monitoring"}
                chartRef={currentChartRef}
                options={currentOptions}
                series={[{ name: "current", data: currentSeries }]}
                hardwareCode={hardwareCode}
                thresholds={[
                    { label: "UCL", value: hardwareCode?.high_weld_cur_threshold },
                    { label: "SET", value: hardwareCode?.weld_curr },
                    { label: "LCL", value: hardwareCode?.low_weld_cur_threshold },
                    { label: 'AMP', value: currentSeries.length > 0 ? currentSeries[currentSeries.length - 1][1] : "N/A" },
                ]}
            />


            <ChartComponent
                title="Realtime Voltage Chart"
                chartRef={voltageChartRef}
                options={voltageOptions}
                series={[{ name: "voltage", data: voltageSeries }]}
                hardwareCode={hardwareCode}
                thresholds={[
                    { label: 'UCL', value: hardwareCode?.high_weld_volt_threshold },
                    { label: 'SET', value: hardwareCode?.weld_volt },
                    { label: 'LCL', value: hardwareCode?.low_weld_volt_threshold },
                    { label: 'Volt', value: voltageSeries.length > 0 ? voltageSeries[voltageSeries.length - 1][1] : "N/A" },
                ]}
            />


            <ChartComponent
                title="Gas Flow Rate Monitoring"
                chartRef={gasFRChartRef}
                options={gasFROptions}
                series={[{ name: "gasFR", data: gasFRSeries }]}
                hardwareCode={hardwareCode}
                thresholds={[
                    { label: 'UCL', value: hardwareCode?.high_weld_gas_threshold },
                    { label: 'SET', value: hardwareCode?.weld_gas },
                    { label: 'LCL', value: hardwareCode?.low_weld_gas_threshold },
                    { label: 'CC', value: gasFRSeries.length > 0 ? gasFRSeries[gasFRSeries.length - 1][1] : "N/A" },
                ]}
            />


            {/* Will Implement it later if required */}

            {/* <div className='w-full flex justify-center mt-4'>
                <button
                    className='bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700'
                    onClick={() => showModal('Current Monitoring', currentOptions, currentSeries)}
                >
                    View Enlarged Current Chart
                </button>
                <button
                    className='bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700 ml-4'
                    onClick={() => showModal('Realtime Voltage Chart', voltageOptions, voltageSeries)}
                >
                    View Enlarged Voltage Chart
                </button>
                <button
                    className='bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700 ml-4'
                    onClick={() => showModal('Gas Flow Rate Monitoring', gasFROptions, gasFRSeries)}
                >
                    View Enlarged Gas Flow Rate Chart
                </button>
            </div> */}


            {/* <EnlargedChartModal
                visible={isModalVisible}
                onClose={handleCloseModal}
                chartOptions={modalChartOptions}
                chartSeries={modalChartSeries}
                chartTitle={modalChartTitle}
                thresholds={[
                    { label: 'UCL', value: hardwareCode?.high_weld_gas_threshold },
                    { label: 'SET', value: hardwareCode?.weld_gas },
                    { label: 'LCL', value: hardwareCode?.low_weld_gas_threshold },
                    { label: 'CC', value: gasFRSeries.length > 0 ? gasFRSeries[gasFRSeries.length - 1][1] : "N/A" },
                ]}
            /> */}
        </div>
    )
}

export default CurrentChart
