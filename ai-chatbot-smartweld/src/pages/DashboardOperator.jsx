import React, { useState, useEffect, useMemo } from 'react';
import { HiOutlineUser } from "react-icons/hi";
import useWebSocket from '../customHooks/useWebSocket';
import { CardBody, CardContainer, CardItem } from "../components/ui/3d-card";
import { motion } from "framer-motion";
import { Select } from 'antd';
import 'antd/dist/reset.css';
import { getOperatorsNameByMachineType, getOperatorsStations, getPreviousJobSerialAndName } from '../apicalls/machineType';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
  RadialBarChart, RadialBar, PolarAngleAxis
} from 'recharts'; // Added Recharts components
import WireSpoolProgressBar from '../components/Charts/ProgressBarChart';


const { Option } = Select;

// --- Helper Component for Parameter Display ---
const ParameterRow = ({ label, lowerLimitValue, upperLimitValue, actualValue, color }) => (
  <div className="flex justify-between items-center text-sm mb-1">
    <span className="font-semibold text-neutral-400 dark:text-neutral-300 w-1/3">{label}:</span>
    <div className="flex justify-between w-2/3">
      {/* Use min-w-0 to prevent text overflow issues in flex containers */}
      <span className="text-neutral-500 dark:text-neutral-400 w-1/2 text-center truncate min-w-0">{lowerLimitValue ?? 'N/A'}</span>
      <span className="text-neutral-500 dark:text-neutral-400 w-1/2 text-center truncate min-w-0">{upperLimitValue ?? 'N/A'}</span>
      <span className="font-bold w-1/2 text-center truncate min-w-0" style={{ color: color }}>{actualValue ?? 'N/A'}</span>
    </div>
  </div>
);




const DashboardOperator = () => {

  const [operatorDetails, setOperatorDetails] = useState({});
  const [jobSerial, setJobSerial] = useState({});
  const [hardwareInfo, setHardwareInfo] = useState([]);
  const [liveMachineData, setLiveMachineData] = useState({});
  const [uniqueMachineTypes, setUniqueMachineTypes] = useState([]);
  const [selectedMachineType, setSelectedMachineType] = useState('All');


  // --- WebSocket Connection ---
  const webSocketURL = process.env.REACT_APP_SOCKET_SERVER_URL;
  const { socketRef, isSocketConnected } = useWebSocket(webSocketURL);



  // --- Fetch Initial Hardware Data ---
  useEffect(() => {
    const fetchHardwareInfo = async () => {
      try {
        const response = await getOperatorsStations();
        const hardware = response.data || [];
        setHardwareInfo(hardware);

        console.log("Hardware fetching result in Dashboard:", hardware);

        // Initialize live data state
        const initialLiveData = {};
        hardware.forEach(element => {
          initialLiveData[element.hardware_code] = {
            status: "NO STATUS",
            current: 0,
            voltage: 0,
            gasFr: 0,
            rfid: "0",
            wire_thickness: "0",
          };
        });
        setLiveMachineData(initialLiveData);

      } catch (error) {
        console.error("Error fetching hardware info:", error);
        setHardwareInfo([]);
        setLiveMachineData({});
      }
    };

    fetchHardwareInfo();
  }, []);


  // --- Group Machines and Extract Machine Types ---
  const { groupedMachines, machineTypeNames } = useMemo(() => {
    const uniqueMachineNamesSet = new Set(['All']);
    const grouped = {};

    hardwareInfo.forEach(hardware => {
      const machineType = hardware.machine_type || 'Uncategorized';
      uniqueMachineNamesSet.add(machineType);


      if (!grouped[machineType]) {
        grouped[machineType] = [];
      }
      grouped[machineType].push({
        ...hardware,
        weld_curr: hardware.weld_curr ?? 0,
        weld_volt: hardware.weld_volt ?? 0,
        weld_gas: hardware.weld_gas ?? 0,
        wire_thickness: hardware.wire_thickness ?? 0,
        high_weld_cur_threshold: hardware.high_weld_cur_threshold ?? Infinity,
        high_weld_gas_threshold: hardware.high_weld_gas_threshold ?? Infinity,
        high_weld_volt_threshold: hardware.high_weld_volt_threshold ?? Infinity,
        low_weld_cur_threshold: hardware.low_weld_cur_threshold ?? 0,
        low_weld_gas_threshold: hardware.low_weld_gas_threshold ?? 0,
        low_weld_volt_threshold: hardware.low_weld_volt_threshold ?? 0,
        wire_spool: hardware.wire_spool
          || null,
      });
    });

    return {
      groupedMachines: grouped,
      machineTypeNames: Array.from(uniqueMachineNamesSet),
    };
  }, [hardwareInfo]);



  useEffect(() => {
    setUniqueMachineTypes(machineTypeNames);
    if (!machineTypeNames.includes(selectedMachineType)) {
      setSelectedMachineType('All');
    }


    //Getting Operator Details with Previous Job Name
    const fetchOperatorDetails = async () => {
      try {
        const [optName, jobSerialResponse] = await Promise.all([
          getOperatorsNameByMachineType({ machineType: selectedMachineType }),
          getPreviousJobSerialAndName({ machineTypeName: selectedMachineType })
        ])
        setOperatorDetails(optName.data[0]);
        setJobSerial(jobSerialResponse.data);
      } catch (error) {
        console.error("Error fetching operator details:", error);
        setOperatorDetails({});
        setJobSerial({});
      }
    };

    if (selectedMachineType !== 'All') {
      fetchOperatorDetails();
    }
  }, [machineTypeNames, selectedMachineType]);


  // --- Setup WebSocket Listeners ---
  useEffect(() => {
    if (!socketRef.current || !isSocketConnected || hardwareInfo.length === 0) {
      return;
    }

    console.log("Setting up WebSocket listeners for Operator Dashboard...");
    const listeners = {};

    hardwareInfo.forEach((element) => {
      const hardwareCode = element.hardware_code;
      const listener = (data) => {
        setLiveMachineData((prevData) => ({
          ...prevData,
          [hardwareCode]: {
            ...prevData[hardwareCode],
            status: data.mstatus || "NO STATUS",
            current: data.cur ?? 0,
            voltage: data.volt ?? 0,
            gasFr: data.gasFR ?? 0,
            rfid: data.oid ?? "0",
          },
        }));
      };

      socketRef.current.on(hardwareCode, listener);
      listeners[hardwareCode] = listener;
    });

    return () => {
      if (socketRef.current) {
        console.log("Cleaning up WebSocket listeners for Dashboard...");
        Object.entries(listeners).forEach(([code, listener]) => {
          socketRef.current.off(code, listener);
        });
      }
    };
  }, [isSocketConnected, hardwareInfo, socketRef]);


  // --- Filter Machines Based on Selection ---
  const filteredMachines = useMemo(() => {
    if (selectedMachineType === 'All') {
      return Object.values(groupedMachines).flat();
    }
    return groupedMachines[selectedMachineType] || [];
  }, [selectedMachineType, groupedMachines]);

  // console.log("Filtered Machine names:", filteredMachines.map(machine => machine.wire_spool).join(", "));


  // --- Helper to Get Live Data and Colors ---
  const getLiveParamsAndColor = (hardwareCode, machinePresets) => {
    const liveData = liveMachineData[hardwareCode] || {
      status: "NO STATUS", current: 0, voltage: 0, gasFr: 0, rfid: "0",
    };

    const actual = {
      // Apply thresholds for actual values
      current: liveData.current > 5 ? liveData.current : 0,
      voltage: liveData.voltage > 5 ? liveData.voltage : 0,
      gasFr: liveData.gasFr > 1 ? liveData.gasFr : 0,
      rfid: liveData.rfid || "NA",
      runningStatus: liveData.status.toUpperCase() || "NO STATUS",
    };


    const colors = {
      red: "#f71e1e",
      green: "#5ae31b",
      yellow: "#fbe70a",
      default: "#FFFFFF"
    };

    // --- Calculate individual parameter colors ---
    const currentColor = actual.current > machinePresets.high_weld_cur_threshold
      ? colors.red // Exceeded upper limit
      : actual.current >= machinePresets.low_weld_cur_threshold // Check against lower limit (optional, could just be > 0)
        ? colors.green // Within limits (and active)
        : colors.red; // Below lower limit or inactive

    const voltageColor = actual.voltage > machinePresets.high_weld_volt_threshold
      ? colors.red
      : actual.voltage >= machinePresets.low_weld_volt_threshold
        ? colors.green
        : colors.red;

    const gasColor = actual.gasFr > machinePresets.high_weld_gas_threshold
      ? colors.red
      : actual.gasFr >= machinePresets.low_weld_gas_threshold
        ? colors.green
        : colors.red;

    // Wire thickness color might be static or based on different logic
    const wireThicknessColor = colors.green; // Example: always green or default

    // Determine overall status color based on runningStatus
    const statusColor =
      actual.runningStatus === "STOP" ? colors.yellow :
        actual.runningStatus === "RUNNING" ? colors.green :
          actual.runningStatus === "NO STATUS" ? colors.red :
            colors.default;

    return {
      actual,
      statusColor,
      paramColors: { // Return an object with individual colors
        current: currentColor,
        voltage: voltageColor,
        gas: gasColor,
        wire: wireThicknessColor,
      }
    };
  };


 

  return (
    <div className='mt-8 flex flex-col items-center gap-6 px-4'>

      {/* Operator Details - Centered */}
      <div className='flex-col lg:flex-row lg:flex w-full justify-center items-stretch lg:gap-4'>

        {/* Left Side Card - Operator Details */}
        <motion.div
          initial={{ opacity: 0.7, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          whileHover={{ scale: 1.04, opacity: 0.6 }}
          // Gradient border effect (Outer div)
          className="w-full lg:w-1/3 p-0.5 bg-gradient-to-br from-blue-400 via-blue-500 to-purple-500 dark:from-blue-700 dark:via-blue-800 dark:to-purple-800 rounded-lg shadow-lg"
        >
          {/* Inner div with background color */}
          <div className="h-full w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-[5px] flex items-center">
            {/* Left Part: Icon */}
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="flex-shrink-0 p-2 mr-2 rounded-full bg-gradient-to-tl from-blue-100 to-purple-100 dark:from-blue-900/70 dark:to-purple-900/70"
            >
              <HiOutlineUser className="text-5xl text-blue-600 dark:text-blue-300" />
            </motion.div>

            {/* Right Part: Text Details */}
            <div className="flex-grow p-1 flex flex-col gap-0.5 text-left ml-2">
              {/* Text colors should still provide good contrast */}
              <p className="text-sm font-medium text-gray-800 dark:text-gray-100"><strong>Operator:</strong> {operatorDetails?.user_first_name || "N/A"} {operatorDetails?.user_last_name || "N/A"}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400"><strong>Machine:</strong> {operatorDetails?.machine_name || "N/A"}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400"><strong>IN:</strong> {operatorDetails?.login || "N/A"}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400"><strong>OUT:</strong> {operatorDetails?.latest || "N/A"}</p>
            </div>
          </div>
        </motion.div>


        {/* Right Side Card - Job Details */}
        <motion.div
          initial={{ opacity: 0.7, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          whileHover={{ scale: 1.04, opacity: 0.6 }}
          // Different gradient border (Outer div)
          className="w-full lg:w-1/3 p-0.5 bg-gradient-to-br from-teal-400 via-emerald-500 to-green-500 dark:from-teal-700 dark:via-emerald-800 dark:to-green-800 rounded-lg shadow-lg"
        >
          {/* Inner div with background color */}
          <div className="h-full w-full p-3 bg-emerald-50 dark:bg-emerald-900/80 rounded-[5px] flex flex-col justify-center items-start">
            {/* Content for the second card */}
            <div className="flex flex-col gap-1 text-left w-full px-2">
              {/* Adjusted text colors for contrast */}
              <p className="text-sm font-medium text-gray-800 dark:text-gray-100"><strong>Previous Job:</strong> {jobSerial[0]?.job_name || "N/A"}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400"><strong>Station:</strong> {jobSerial[0]?.mt_name || "N/A"}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400"><strong>Prev Job Serial:</strong> {jobSerial[0]?.job_serial || "N/A"}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400"><strong>Serial No Stamp:</strong> {"N/A"}</p>
            </div>
          </div>
        </motion.div>
      </div>





      {/* Machine Type Filter Dropdown */}
      <div className="w-full max-w-xs">
        <label htmlFor="machine-type-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 text-center">
          Station Name:
        </label>
        <Select
          id="machine-type-select"
          value={selectedMachineType}
          onChange={(value) => setSelectedMachineType(value)}
          style={{ width: '100%' }}
        >
          {uniqueMachineTypes.map(type => (
            <Option key={type} value={type}>{type}</Option>
          ))}
        </Select>
      </div>



      {/* Machine Cards Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className='relative w-full flex flex-wrap justify-center items-start gap-4'
      >
        {filteredMachines.length === 0 ? (
          <div className="text-center text-neutral-500 dark:text-neutral-400 col-span-full mt-4">
            No machines found {selectedMachineType !== 'All' ? `for type "${selectedMachineType}"` : ''} or data is loading.
            {!isSocketConnected && <p className="text-red-500 text-sm mt-2">WebSocket not connected.</p>}
          </div>
        ) : (
          filteredMachines.map((hardware) => {
            // Pass the full hardware object (containing thresholds) to the helper
            const { actual, statusColor, paramColors } = getLiveParamsAndColor(hardware.hardware_code, hardware);

            if (!hardware.hardware_code) {
              console.error("Attempting to render card for hardware without hardware_code:", hardware);
              return null;
            }

            return (
              <CardContainer
                key={hardware.hardware_code}
                className="inter-var min-w-[100px] lg:w-[369px] group mb-4"
              >
                <CardBody
                  className="bg-gray-50 relative group/card dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-full h-auto rounded-xl p-4 border"
                >
                  {/* Machine Name and Status */}
                  <div className='flex justify-between items-center mb-3 gap-2'>
                    <CardItem
                      translateZ="50"
                      className="text-lg font-bold text-neutral-600 dark:text-white truncate min-w-0"
                    >
                      {hardware.machine_name || 'Unnamed Machine'}
                    </CardItem>
                    <CardItem
                      translateZ="60"
                      className="text-xs sm:text-sm font-semibold px-2 py-0.5 rounded whitespace-nowrap flex-shrink-0"
                      style={{ backgroundColor: statusColor, color: ['#fbe70a'].includes(statusColor) ? '#333' : '#fff' }} // Adjust text color for yellow
                    >
                      {actual.runningStatus}
                    </CardItem>
                  </div>

                  {/* Job Name and RFID */}
                  <div className='flex justify-between items-center text-xs mb-3 text-neutral-500 dark:text-neutral-400 gap-2'>
                    <span className='truncate pr-1 min-w-0'>Job: {hardware.job_name || 'No Job'}</span>
                    <span className="whitespace-nowrap flex-shrink-0">RFID: {actual.rfid}</span>
                  </div>


                  {/* Parameters Table */}
                  <CardItem translateZ="40" className="w-full mt-4 overflow-scroll">
                    {/* Header */}
                    <div className="flex justify-between items-center text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                      <span className="w-[30%]">Parameter</span>
                      <span className="w-[20%] text-center">Lower</span>
                      <span className="w-[20%] text-center">Upper</span>
                      <span className="w-[20%] text-center">Actual</span>
                    </div>
                    <div className="border-t border-neutral-200 dark:border-neutral-700 items-center pt-2 justify-between">
                      {/* Pass individual colors to each row */}
                      <ParameterRow label="Current" lowerLimitValue={hardware.low_weld_cur_threshold} upperLimitValue={hardware.high_weld_cur_threshold} actualValue={actual.current} color={paramColors.current} />
                      <ParameterRow label="Voltage" lowerLimitValue={hardware.low_weld_volt_threshold} upperLimitValue={hardware.high_weld_volt_threshold} actualValue={actual.voltage} color={paramColors.voltage} />
                      <ParameterRow label="Gas FR" lowerLimitValue={hardware.low_weld_gas_threshold} upperLimitValue={hardware.high_weld_gas_threshold} actualValue={actual.gasFr} color={paramColors.gas} />
                      {/* Wire thickness might not have limits, adjust as needed */}
                      <ParameterRow label="Wire Thick" lowerLimitValue={"N/A"} upperLimitValue={"N/A"} actualValue={hardware.wire_thickness} color={paramColors.wire} />
                    </div>
                  </CardItem>

                </CardBody>
              </CardContainer>
            );
          })
        )}
      </motion.div>



     


    </div>
  )
}

export default DashboardOperator;
