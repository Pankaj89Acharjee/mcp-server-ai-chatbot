import React, { useState, useEffect, useMemo, useRef } from "react";
import { Form, Input, Select, Button, Spin, notification, message, Space } from "antd";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { getMachineTypesForOperator, getMachineTypeThresholds, getOperatorsNameByMachineType, getPreviousJobSerial, getPreviousJobSerialAndName, updateJobSerial } from "../apicalls/machineType";
import { motion } from 'framer-motion'
import { cn } from '../lib/utils';
import { HiOutlineUser } from "react-icons/hi";
import { useStateContext } from "../contexts/ContextProvider";


const { Option } = Select;

const MachineJobSerialMapping = () => {
    const { currentColor } = useStateContext()

    const [form] = Form.useForm();
    const [machineTypes, setMachineTypes] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [originalJobs, setOriginalJobs] = useState([]);
    const [selectedMachineType, setSelectedMachineType] = useState(null);
    const [selectedJobName, setSelectedJobName] = useState("");
    const [jobSerial, setJobSerial] = useState("");
    const [prevJobSerialAndName, setPrevJobSerialAndName] = useState("");
    const [prevJobSerial, setPrevJobSerial] = useState([]);
    const [operatorDetails, setOperatorDetails] = useState({}); // ✅ Now using operator details
    const [thresholdValues, setThresholdValues] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const formRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [fetchMachineTypes, fetchPreviousJobSerials] = await Promise.all([
                    getMachineTypesForOperator(),
                    getPreviousJobSerial(),
                ]);
                setMachineTypes(fetchMachineTypes.data);
                setPrevJobSerialAndName(fetchPreviousJobSerials.data)

                console.log("Machine types for operator are", fetchMachineTypes.data)
            } catch (error) {
                message.error("Error fetching data!");
                console.error(error);
            }
        }

        fetchData();
    }, []);

    useEffect(() => {
        // Fetch jobs and set both originalJobs and jobs
        const fetchJobs = async () => {
            const relatedJobs = machineTypes?.filter((machine) => machine.mt_name === selectedMachineType)?.map((machine) => machine.job_name);
            setOriginalJobs(relatedJobs);
            setJobs(relatedJobs);
        };

        fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedMachineType])





    const memoizedUniqueMachineTypes = useMemo(() => {
        return [...new Set(machineTypes?.map((machine) => machine.mt_name))];
    }, [machineTypes]);






    const handleMachineTypeChange = async (machineType) => {
        setSelectedMachineType(machineType);

        form.setFieldsValue({ jobName: "" });
        form.setFieldsValue({ jobSerial: "" });
        setJobSerial("");

        const relatedJobs = machineTypes?.filter((machine) => machine.mt_name === machineType)?.map((machine) => machine.job_name);
        setJobs(relatedJobs);
        setSelectedJobName("");

        try {

            const [optName, jobSerialResponse] = await Promise.all([
                getOperatorsNameByMachineType({ machineType: machineType }),
                getPreviousJobSerialAndName({ machineTypeName: machineType })
            ])
            setOperatorDetails(optName.data[0]);
            setPrevJobSerial(jobSerialResponse.data)

        } catch (error) {
            console.error("Error fetching job/operator details:", error);
        }

        console.log("Related Jobs after chosing Machine Type is", relatedJobs)
    };



    const handleJobNameChange = async (e) => {
        //console.log("Selected Machine type when job Name is changed is", selectedMachineType)
        setSelectedJobName(e);
        //console.log("Selected Job Name is", e)        
        fetchMachineThresholdValues(e, selectedMachineType);
    };





    const fetchMachineThresholdValues = async (jobName, selectedMachineType) => {
        if (!selectedMachineType || !jobName) {
            message.error("Please select a machine type and job name!");
            return;
        }

        try {
            const response = await getMachineTypeThresholds({
                machineType: selectedMachineType,
                jobName,
            });
            const data = response.data[0];
            //console.log("Machine Threshold Values are", data)

            if (data) {
                setThresholdValues({
                    currentJobName: data.job_name,
                    currentHigh: data.high_weld_cur_threshold,
                    currentLow: data.low_weld_cur_threshold,
                    voltHigh: data.high_weld_volt_threshold,
                    voltLow: data.low_weld_volt_threshold,
                    gasHigh: data.high_weld_gas_threshold,
                    gasLow: data.low_weld_gas_threshold,
                });
            } else {
                notification.error({ message: "No threshold data found!" });
            }
        } catch (error) {
            console.error("Error fetching machine threshold values:", error);
        }
    };

    const handleSaveSerial = async () => {
        try {
            await form.validateFields();
            setIsLoading(true);

            const payload = {
                job_name: selectedJobName,
                machine_type_name: selectedMachineType,
                job_serial: jobSerial,
            };

            const response = await updateJobSerial(payload);
            if (response.data.success) {
                notification.success({ message: "Updated Successfully!" });
            } else {
                notification.error({ message: "Error in updating!" });
            }
        } catch (error) {
            console.error("Error updating job serial:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const thresholdData = [
        { name: "Current", High: thresholdValues.currentHigh, Low: thresholdValues.currentLow },
        { name: "Voltage", High: thresholdValues.voltHigh, Low: thresholdValues.voltLow },
        { name: "Gas", High: thresholdValues.gasHigh, Low: thresholdValues.gasLow },
    ];

    return (
        <div className="mt-12">
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
                className="flex flex-wrap lg:flex-nowrap justify-between items-center p-2 mr-6 ml-6 rounded-lg">
                <div className='relative flex h-[10rem] w-full items-center justify-center bg-white dark:bg-gray-600 rounded-lg'>
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
                        Machine Job Serial Mapping
                    </p>
                </div>
            </motion.div>

            <div className="flex justify-center items-center mt-4 mb-4">
                {isLoading && <Spin />}
            </div>

            <div className="flex flex-wrap lg:flex-nowrap flex-col lg:flex-row justify-center m-3">
                <div className="flex w-[90%] lg:w-[1100px] m-3 overflow-x-scroll lg:overflow-auto h-[400px] p-4 bg-white dark:bg-gray-600 rounded-lg shadow-md">

                    {/* Left side form */}
                    <div className="w-80 mr-4">
                        <Form form={form}
                            onFinish={handleSaveSerial}
                            layout="vertical" ref={formRef}>
                            <Form.Item label="Machine Type" name="machineType" rules={[{ required: true, message: "Please select a machine type!" }]}>
                                <Select placeholder="Select Machine Type" onChange={handleMachineTypeChange} value={selectedMachineType}>
                                    {memoizedUniqueMachineTypes?.map((type, index) => (
                                        <Option key={index} value={type}>{type}</Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item label="Job Name" name="jobName" rules={[{ required: true, message: "Please enter a job name!" }]}>
                                <Select
                                    showSearch
                                    placeholder="Select Job Name"
                                    value={selectedJobName}
                                    onSearch={(value) => {
                                        if (value.trim() === "") {
                                            setJobs(originalJobs);
                                        } else {
                                            const filtered = originalJobs.filter((job) =>
                                                job.toLowerCase().includes(value.toLowerCase())
                                            );
                                            setJobs(filtered);
                                        }
                                    }}
                                    onChange={(value) => handleJobNameChange(value)}
                                    // onBlur={(e) => handleJobNameChange(e)}
                                    filterOption={false}
                                >
                                    {jobs?.map((job, index) => (
                                        <Option key={index} value={job}>
                                            {job}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item label="Job Serial" name="jobSerial" rules={[
                                { required: true, message: "Please enter a valid job serial!" },
                                { pattern: /^[a-zA-Z0-9_-]+$/, message: "Invalid characters in job serial!" },
                                { min: 3, message: "Job serial must be at least 3 characters long!" },
                                { max: 25, message: "Job serial must be at most 25 characters long!" },
                            ]}>
                                <Input placeholder="Enter job serial" value={jobSerial} onChange={(e) => setJobSerial(e.target.value)} autoComplete="off" />
                            </Form.Item>

                            <Form.Item className="flex items-center justify-end">
                                <Space>
                                    <>
                                        <Button htmlType="submit" style={{ backgroundColor: currentColor, color: 'white', borderRadius: '10px' }}>Save</Button>
                                    </>
                                </Space>
                            </Form.Item>

                        </Form>

                        {prevJobSerial?.length > 0 && (
                            <div className="mt-2 p-2 justify-center items-center flex flex-wrap gap-2">
                                {prevJobSerial?.map((job) => (
                                    <div key={job?.id}>
                                        <p className="p-0.5 text-wrap text-xs text-gray-500"><strong>Machine: </strong>{job?.mt_name}</p>
                                        <p className="p-0.5 text-wrap text-xs text-gray-500"><strong>Previous Job: </strong>{job?.job_name}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Operator Details */}
                    <div className="w-80 p-2 ml-4 bg-white dark:bg-gray-600 rounded-lg shadow-md justify-center items-center">
                        <div className="mt-3 p-2 justify-center items-center flex flex-col flex-wrap gap-2">
                            <HiOutlineUser className="text-8xl text-gray-500 mb-2 rounded-full bg-slate-100 p-2" />
                            <p className="text-md"><strong>Operator:</strong> {operatorDetails?.user_first_name || "N/A"} {' '} {operatorDetails?.user_last_name || "N/A"}</p>
                            <p className="text-md"><strong>Machine:</strong> {operatorDetails?.machine_name || "N/A"}</p>
                            <p className="text-md"><strong>IN:</strong> {operatorDetails?.login || "N/A"}</p>
                            <p className="text-md"><strong>OUT:</strong> {operatorDetails?.latest || "N/A"}</p>
                        </div>
                    </div>


                    {/* Right Side Table */}
                    <div>
                        <div className="ml-2 bg-gradient-to-r dark:from-gray-800 via-gray-700 to-gray-800 rounded-lg shadow-lg overflow-y-auto h-72 md:h-[350px] w-[400px]">
                            <h3 className="text-lg font-semibold text-gray-700 bg-gray-400 uppercase tracking-wide text-center">
                                Previous Job Serial and Name
                            </h3>
                            <div className="overflow-x-auto h-[300px]">
                                <table className="min-w-full table-auto border-collapse border dark:border-gray-700 border-white">
                                    <thead className="dark:bg-gray-900 bg-gray-400">
                                        <tr>
                                            <th className="sticky top-0 z-10 px-4 py-2 text-center text-gray-200 font-semibold border dark:border-gray-700 bg-gray-400 dark:bg-gray-700">
                                                Machine Name
                                            </th>
                                            <th className="sticky top-0 z-10 px-4 py-2 text-center text-gray-200 font-semibold border dark:border-gray-700 bg-gray-400 dark:bg-gray-700">
                                                Job Name
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {prevJobSerialAndName?.length > 0 ? (
                                            prevJobSerialAndName?.map((item, index) => (
                                                <tr
                                                    key={index}
                                                    className={`${index % 2 === 0 ? "dark:bg-gray-800 bg-white" : "dark:bg-gray-700 bg-white"
                                                        } dark:hover:bg-gray-600 hover:bg-gray-100 transition duration-200`}
                                                >
                                                    <td className="text-md px-4 py-2 dark:text-gray-300 text-gray-500 border dark:border-gray-700">
                                                        {item.mt_name || "N/A"}
                                                    </td>
                                                    <td className="text-md px-4 py-2 dark:text-gray-300 text-gray-500 border dark:border-gray-700">
                                                        {item.job_name || "N/A"}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan="2"
                                                    className="px-4 py-2 text-center text-gray-400 border border-gray-700"
                                                >
                                                    No data available
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>



            {/* Chart for Threshold Values */}
            <div className="flex flex-col items-center justify-center mt-8 p-4 mb-5 bg-gray-800 shadow-xl rounded-lg">
                <h4 className="text-lg font-bold text-gray-200 mb-4 uppercase tracking-wide">Threshold Values {thresholdValues?.currentJobName ? "For Job: " + thresholdValues?.currentJobName : "N/A"}</h4>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={thresholdData} barSize={40}>
                        {/* Grid with subtle industrial look */}
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.2)" />

                        {/* X & Y Axis Styling */}
                        <XAxis dataKey="name" tick={{ fill: '#cbd5e1', fontSize: 14 }} />
                        <YAxis tick={{ fill: '#cbd5e1', fontSize: 14 }} />

                        {/* Tooltip Styling */}
                        <Tooltip
                            contentStyle={{ backgroundColor: "rgba(31, 41, 55, 0.9)", borderRadius: "6px", color: "#fff", border: "1px solid rgba(255, 255, 255, 0.2)" }}
                            cursor={{ fill: "rgba(255, 255, 255, 0.1)" }}
                        />

                        {/* Legend Styling */}
                        <Legend wrapperStyle={{ color: "#d1d5db" }} />

                        {/* Industrial Styled Bars */}
                        <Bar dataKey="High" fill="url(#highGradient)" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="Low" fill="url(#lowGradient)" radius={[6, 6, 0, 0]} />

                        {/* Gradient Definitions for Bars */}
                        <defs>
                            <linearGradient id="highGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#4f46e5" />
                                <stop offset="100%" stopColor="#1e3a8a" />
                            </linearGradient>
                            <linearGradient id="lowGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#10b981" />
                                <stop offset="100%" stopColor="#064e3b" />
                            </linearGradient>
                        </defs>
                    </BarChart>
                </ResponsiveContainer>
            </div>

        </div>
    );
};

export default MachineJobSerialMapping;
