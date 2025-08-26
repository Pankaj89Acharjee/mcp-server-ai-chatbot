import React, { useEffect, useRef, useState } from 'react';
import { cn } from '../lib/utils';
import { motion } from "framer-motion";
import { FileUpload } from '../components/ui/file-upload'
import * as XLSX from "xlsx";
import { message } from 'antd';
import { getMachineTypes } from '../apicalls/machineType';
import { getJobs, getJobSerialByJobNames } from '../apicalls/jobs';
import { getAllShiftsList } from '../apicalls/shiftAPICall';
import { generateReportByJobName, generateReportByStationName } from '../apicalls/reportsAPICalls';
import { AiOutlineMore } from 'react-icons/ai';
import DownloadReportByStation from '../components/DownloadReportByStationModal';
import { useStateContext } from "../contexts/ContextProvider";
import dayjs from 'dayjs';

const ReportDownload = () => {

    const [uniqueMachineTypes, setUniqueMachineTypes] = useState([]);
    const [uniqueShiftNames, setUniqueShiftNames] = useState([]);
    const [isReportReadyForStation, setIsReportReadyForStation] = useState(false);
    const [isReportReadyForJob, setIsReportReadyForJob] = useState(false);
    const [reportDataParamsForStation, setReportDataParamsForStation] = useState(null);
    const [reportDataParamsForJob, setReportDataParamsForJob] = useState(null);

    const [machines, setMachines] = useState([]);
    const [allShifts, setAllShifts] = useState("");
    const [allMachineTypes, setAllMachineTypes] = useState("");



    const [customReportClone, setCustomReportClone] = useState([]);

    const [uniqueJobNames, setUniqueJobNames] = useState([]);
    const [jobSerialNames, setJobSerialNames] = useState([]);
    const [filteredSerial, setFilteredSerial] = useState([]);
    const [selectedJobName, setSelectedJobName] = useState("");
    const [selectedJobSerial, setSelectedJobSerial] = useState("");

    const [openModal, setOpenModal] = useState(false)
    const [openModalForJob, setOpenModalForJob] = useState(false)
    const [isRangePicker, setIsRangePicker] = useState(false);
    const [jobSerialCache, setJobSerialCache] = useState(new Map());

    const reportDataParamsRef = useRef(null)

    const { currentColor } = useStateContext();




    useEffect(() => {
        getMachTypes();
        getShiftNames();
        getAllJobs();

        return () => {
            resetForm();
        }
    }, []);




    // For Debugging purpose
    useEffect(() => {
        console.log("Report Data Params for Station:", reportDataParamsForStation);
        console.log("Is Report Ready for Station:", isReportReadyForStation);
    }, [reportDataParamsForStation, isReportReadyForStation]);

    useEffect(() => {
        console.log("Report Data Params for Job:", reportDataParamsForJob);
        console.log("Is Report Ready for Job:", isReportReadyForJob);
    }, [reportDataParamsForJob, isReportReadyForJob]);

    useEffect(() => {
        console.log("Open Modal for Station", openModal)
        console.log("Open Modal for Job", openModalForJob)

    }, [openModal, openModalForJob])

    // End of debugging purpose



    const getMachTypes = async () => {
        try {
            const response = await getMachineTypes();
            const machinesData = response.data;
            setMachines(machinesData);
            const machineTypes = machinesData.map((machine) => machine.mt_name);
            setUniqueMachineTypes([...machineTypes, "All-Stations"]);
            setAllMachineTypes(machineTypes.join(", "));
        } catch (error) {
            console.error("Error fetching machine types:", error);
        }
    };


    const getShiftNames = async () => {
        try {
            const response = await getAllShiftsList();
            const shiftsData = response.data;
            const shiftNames = shiftsData.map((shift) => shift.shift_name);

            //console.log("All shift names", shiftNames)
            setUniqueShiftNames([...shiftNames, "All"]);
            setAllShifts(shiftNames.join(", "));
        } catch (error) {
            console.error("Error fetching shifts:", error);
        }
    };


    const getAllJobs = async () => {
        try {
            const response = await getJobs();
            const jobNames = response.data;
            setUniqueJobNames([...new Set(jobNames.map((job) => job.job_name))]);
        } catch (error) {
            console.error("Error fetching jobs:", error);
        }
    };



    const getJobSerialOnJobNameChange = async (jobName) => {
        setSelectedJobName(jobName);
        // Checking if cached job serials exist for the selected job name
        if (jobSerialCache.has(jobName)) {
            setJobSerialNames(jobSerialCache.get(jobName));
            return;
        }

        try {
            //console.log("Fetching API job serials for:", jobName);
            const response = await getJobSerialByJobNames({ jobName });
            const jobSerials = response.data;

            // Update cache in state
            setJobSerialCache((prevCache) => {
                const newCache = new Map(prevCache);
                newCache.set(jobName, jobSerials.map((serial) => serial.job_serial));
                return newCache;
            });

            setJobSerialNames(jobSerials.map((serial) => serial.job_serial));
        } catch (error) {
            console.error("Error fetching job serials:", error);
        }
    };





    const reportOnChoosenDate = (payload) => {
        //console.log("Report payload", payload)
        resetForm()
        if (isRangePicker === false) {
            generateReport(dayjs(payload.target_date).hour(12).toISOString().split('T')[0], null, payload?.machineType, payload?.shift);
        } else if (isRangePicker === true) {
            generateReport(dayjs(payload.target_date[0]).hour(12).toISOString().split('T')[0], dayjs(payload.target_date[1]).hour(12).toISOString().split('T')[0], payload?.machineType, payload?.shift);
        }

        setOpenModal(false)
    };


    const reportOnChoosenDateForJobReport = (payload) => {
        resetForm()
        //console.log("Report payload", payload)
        generateReportClone(payload.jobName, payload.jobSerial);
        setOpenModalForJob(false)
    };



    const generateReport = async (startDate, endDate, machineTypeName, shift) => {
        const customPayload = {
            customDate: startDate,
            customEndDate: endDate,
            shiftName: shift,
            customMachineType: machineTypeName,
            allShifts,
            allMachineTypes,
        };

        console.log("Generate Report payloafd", customPayload)
        try {
            const response = await generateReportByStationName(customPayload);
            console.log("response is", response?.data)
            if (response?.data?.length === 0 || !response?.data) {
                message.error("No record found.");
            } else {
                reportDataParamsRef.current = {
                    customReport: response?.data,
                    selectedStartDate: startDate,
                    selectedEndDate: endDate,
                    selectedShift: shift,
                    selectedMachineType: machineTypeName
                }
                setReportDataParamsForStation(reportDataParamsRef.current)
                setIsReportReadyForStation(true) //For enabing download button                
            }
        } catch (error) {
            console.error("Error generating report:", error);
        }
    };

    const generateReportClone = async (jobName, jobSerial) => {
        const customPayload = {
            jobName,
            jobSerial,
        };

        try {
            const response = await generateReportByJobName(customPayload);
            if (response?.data?.length === 0) {
                message.error("No record found.");
            } else {
                const reportData = {
                    customReport: response.data,
                    selectedJobName: jobName,
                    selectedJobSerial: jobSerial,
                };
                setReportDataParamsForJob(reportData)
                setIsReportReadyForJob(true) //For enabing download button
            }
        } catch (error) {
            console.error("Error generating report clone:", error);
        }
    };



    const handlePickerType = (value) => {
        //console.log("Range Picker State:", value);
        setIsRangePicker(value)
    }


    const downloadInExcel = (customReport, selectedStartDate, selectedEndDate, selectedShift, selectedMachineType) => {

        const EXCEL_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
        const EXCEL_EXTENSION = ".xlsx";

        const newWorkSheet = XLSX.utils.json_to_sheet(customReport);
        const newWorkBook = {
            Sheets: { report: newWorkSheet },
            SheetNames: ["report"],
        };

        const excelBuffer = XLSX.write(newWorkBook, { bookType: "xlsx", type: "array" });
        const blobData = new Blob([excelBuffer], { type: EXCEL_TYPE });

        const fileName = selectedEndDate
            ? `${selectedMachineType.toUpperCase()} From-${selectedStartDate}-to-${selectedEndDate}-Shift ${selectedShift}`
            : `${selectedMachineType.toUpperCase()} Date-${selectedStartDate}-Shift ${selectedShift}`;

        saveAsExcelFile(blobData, fileName, EXCEL_EXTENSION);
    };

    const downloadJobReportInExcel = (customReport, selectedJobName, selectedJobSerial) => {
        const EXCEL_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
        const EXCEL_EXTENSION = ".xlsx";

        const newWorkSheet = XLSX.utils.json_to_sheet(customReport);
        const newWorkBook = {
            Sheets: { report: newWorkSheet },
            SheetNames: ["report"],
        };

        const excelBuffer = XLSX.write(newWorkBook, { bookType: "xlsx", type: "array" });
        const blobData = new Blob([excelBuffer], { type: EXCEL_TYPE });

        const fileName = selectedJobName
            ? `${selectedJobName.toUpperCase()} Serial-${selectedJobSerial}`
            : null;

        saveAsExcelFile(blobData, fileName, EXCEL_EXTENSION);
    };

    const saveAsExcelFile = (blob, fileName, ext) => {
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = `${fileName}${ext}`;
        link.click();
        resetForm();
    };

    const handleDownload = () => {
        if (reportDataParamsForStation) {
            const { customReport, selectedStartDate, selectedEndDate, selectedShift, selectedMachineType } = reportDataParamsForStation;
            downloadInExcel(customReport, selectedStartDate, selectedEndDate, selectedShift, selectedMachineType);
        } else {
            message.error("No report data available for download.");
        }
    };


    const handleDownloadForJobReport = () => {
        if (reportDataParamsForJob) {
            const { customReport, selectedJobName, selectedJobSerial } = reportDataParamsForJob;
            downloadJobReportInExcel(customReport, selectedJobName, selectedJobSerial);
        } else {
            message.error("No report data available for download.");
        }
    };




    const resetForm = () => {
        setReportDataParamsForStation(null);
        setReportDataParamsForJob(null);

        setIsReportReadyForStation(false);
        setIsReportReadyForJob(false);
    };




    return (
        <div className="p-6">
            <div className="relative flex flex-col items-center justify-center bg-white dark:bg-gray-600 rounded-lg shadow-lg p-8">
                <div
                    className={cn(
                        "absolute inset-0",
                        "[background-size:40px_40px]",
                        "[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]",
                        "dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]"
                    )}
                />
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black"></div>
                <p className="relative z-20 bg-gradient-to-b from-neutral-200 to-neutral-700 bg-clip-text py-4 text-3xl font-bold text-transparent sm:text-5xl">
                    Reports
                </p>

                {/* Section: Download by Station Name */}
                <div className="relative z-20 mt-8 w-full max-w-md">
                    <h2 className="text-lg text-center font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                        Download Report by Station Name and by Job

                        <span className='flex justify-between'>
                            <motion.div
                                className='absolute bottom-5 right-2 ml-2 text-2xl text-white/90 rounded-md p-0.5'
                                style={{ backgroundColor: currentColor }}
                                whileHover={{ x: 10, y: -5, scale: 1.05, borderStyle: "solid" }} // Move to upper right
                                transition={{ type: "spring", stiffness: 120, damping: 10 }}
                            >
                                <div className='relative flex items-center group rounded-full p-1.5 cursor-pointer'>
                                    {/* Icon */}
                                    <AiOutlineMore
                                        onClick={(() => setOpenModal(true))}
                                        className='cursor-pointer relative z-10'
                                    />

                                    {/* Tooltip */}
                                    <motion.div
                                        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-gray-700 text-white text-sm px-2 py-1 rounded-md"
                                        initial={{ opacity: 0, y: 5, scale: 0.9 }}
                                        whileHover={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        Report by Station
                                    </motion.div>
                                </div>

                            </motion.div>

                            <motion.div
                                className='absolute bottom-5 left-2 ml-2 text-2xl text-white/90 rounded-md p-0.5'
                                style={{ backgroundColor: currentColor }}
                                whileHover={{ x: -10, y: -10, scale: 1.05, borderStyle: "solid" }} // Move to upper right
                                transition={{ type: "spring", stiffness: 120, damping: 10 }}
                            >
                                <div className='relative flex items-center group rounded-full p-1.5 cursor-pointer'>


                                    <AiOutlineMore
                                        className='cursor-pointer relative z-10 '
                                        onClick={(() => setOpenModalForJob(true))}

                                    />                                     {/* Tooltip */}
                                    <motion.div
                                        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-gray-700 text-white text-sm px-2 py-1 rounded-md"
                                        initial={{ opacity: 0, y: -5, scale: 0.9 }}
                                        whileHover={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        Report by Job
                                    </motion.div>
                                </div>

                            </motion.div>
                        </span>
                    </h2>



                    <div className="w-full max-w-4xl mx-auto min-h-96 border border-dashed bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg">
                        <FileUpload
                            isReportReadForStation={isReportReadyForStation}
                            isReportReadyForJob={isReportReadyForJob}
                            onDownloadStation={handleDownload}
                            onDownloadJob={handleDownloadForJobReport}
                            selectedValueRefStation={reportDataParamsForStation}
                            selectedValueRefJob={reportDataParamsForJob}
                            mode={isReportReadyForStation ? "station" : setIsReportReadyForJob ? "job" : null}
                        />
                    </div>
                </div>


                {/* Modal for selecting by Station Names */}
                {openModal && (
                    <DownloadReportByStation
                        mode="station"
                        uniqueMacTypes={uniqueMachineTypes}
                        uniqueShiftName={uniqueShiftNames}
                        onSubmitHandler={reportOnChoosenDate}
                        setOpenModal={setOpenModal}
                        loading={''}
                        currentColor={currentColor}
                        openModal={openModal}
                        onDatePickerTypeChangeHandler={handlePickerType}
                    />
                )}


                {/* Modal for selecting by Job Names */}
                {openModalForJob && (
                    <DownloadReportByStation
                        mode="job"
                        uniqueJobNames={uniqueJobNames}
                        uniqueJobSerial={jobSerialNames}
                        onJobNameChange={getJobSerialOnJobNameChange}
                        onSubmitHandler={reportOnChoosenDateForJobReport}
                        setOpenModal={setOpenModalForJob}
                        loading={''}
                        currentColor={currentColor}
                        openModal={openModalForJob}
                    />
                )}


            </div>
        </div >
    );
};

export default ReportDownload;
