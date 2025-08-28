import React, { useEffect, useMemo, useState } from 'react'
import { earningData } from '../data/sidenavItems'
import downtimeColumn, { enableEdit, enableDelete } from '../tablecolumns/downtimeColDefinition';
import { Table, message, Space, Modal, Form, Input, Button, Select, Col, Row } from 'antd'
import { useStateContext } from "../contexts/ContextProvider";
import Loading from '../components/Loading'
import CustomerFilterDropDown from '../components/CustomerFilterDropDown';
import { getDowntime, getDowntimeReasons, updateDowntimeReason } from '../apicalls/downtimeCalls';
import CustomDatePicker from '../components/CustomDatePicker';



const DowntimeReason = () => {

    const { currentColor } = useStateContext()

    const [mappedMacHard, setMappedMacHard] = useState([])
    const [downtimeReason, setDowntimeReason] = useState([]);
    const [activateEditing, setActivateEditing] = useState(false)
    const [saved, setSaved] = useState(false)
    const [selectedData, setSelectedData] = useState(null);
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState('')
    const [filtereddata, setFiltereddata] = useState(null)
    const [machineTypeFilters, setMachineTypeFilters] = useState([]);


    const getDownTimeList = async () => {
        try {
            setLoading(true)
            const downTime = await getDowntime()
            // console.log("Get all downtimes", downTime.data)
            if (downTime.success === true) {
                setMappedMacHard(downTime.data)
            } else {
                message.error(downTime.message)
            }
        } catch (error) {
            console.log("Error occured", error)
            message.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    const getDownReasons = async () => {
        try {
            const reasonsDowntime = await getDowntimeReasons()
            // console.log("Downtime reasons", reasonsDowntime.data)
            if (reasonsDowntime.success === true) {
                setDowntimeReason(reasonsDowntime.data)
            } else {
                message.error(reasonsDowntime.message)
            }
        } catch (error) {
            console.log("Error occured", error)
            message.error(error.message)
        }
    }



    const handleEditClick = (e, jobId) => {
        const eventData = enableEdit(e, jobId);
        setActivateEditing(true)
        setSelectedData(eventData)
    };


    //For closing modal of editing 
    const closeEditModal = () => {
        setActivateEditing(false)
        setSelectedData(null)
    }





    const updateReasons = async (payload) => {
        try {
            setLoading(true)
            const payloadDestructure = {
                station_id: selectedData?.jobDetails?.station_id,
                ...payload
            }
            //console.log("Update payload", payloadDestructure)

            const update = await updateDowntimeReason(payloadDestructure)
            if (update.success === true) {
                message.success("Updated Successfully!")
                setSelectedData('')
                closeEditModal()
                setFiltereddata(null)
            } else {
                console.log(update.message)
                message.error(update.message)
            }
        }
        catch (error) {
            message.error(error.message)
            console.log("Error in updating", error)
        } finally {
            setLoading(false)
        }
    }


    useEffect(() => {
        getDownTimeList()
        getDownReasons()
    }, [])


    useEffect(() => {
        if (mappedMacHard.length > 0) {
            const uniqueStationNames = Array.from(new Set(mappedMacHard.map(mcType => mcType.station_name))).map(station_name => ({
                text: station_name,
                value: station_name
            }))
            setMachineTypeFilters(uniqueStationNames)
        }
    }, [mappedMacHard])


    const tableColumns = [...downtimeColumn]

    const data = useMemo(() => {
        return mappedMacHard?.length > 0 ? mappedMacHard?.map((data, index) => ({
            key: index.toString(),
            serial: (index + 1).toString(),
            id: data.id,
            shift_name: data.shift_name,
            station_name: data.station_name,
            stop_duration: (data.stop_duration / 60)?.toFixed(2),
            arc_end_time: data.arc_end_time,
            next_arc_time: data.next_arc_time,
            station_id: data.station_id
        })) : [];
    }, [mappedMacHard])



    return (
        <div className='mt-12'>
            <h1 className='text-left ml-8 font-semibold dark:text-gray-300'>Downtime</h1>
            <div className='flex flex-wrap lg:flex-nowrap justify-center'>

                {/* Top Hoarding section */}
                <div className='bg-white dark:text-gray-200 dark:bg-secondary-dark-bg h-44 rounded-xl w-full lg:w-80 p-8 pt-9 m-3 bg-center'>
                    <div className="flex justify-between items-center">
                        <div>
                            <p className='font-bold text-gray-400'>Downtime Records</p>
                            <p className='text-2xl'>250</p>
                        </div>
                    </div>

                    <div className='mt-6'>
                        <button
                            type='button'
                            style={{ backgroundColor: currentColor, color: 'white', borderRadius: '10px' }}
                            className={`text-md p-3 hover:drop-shadow-xl`}
                        >Download Reports</button>
                    </div>
                </div>

                {/* Card Icons Section */}

{/*Need to show last updated downtime in cards. Show details like reason, total time it was down */}

                <div className='flex flex-wrap mt-3 justify-center gap-1 items-center'>
                    {earningData.map((item) => (
                        <div
                            key={item.title}
                            className='bg-white dark:text-gray-200 dark:bg-secondary-dark-bg md:w-56 p-4 pt-9 rounded-2xl'>
                            <button
                                style={{ backgroundColor: item.iconColor }}
                                className='text-2xl opacity-0.9 rounded-full p-4 hover:drop-shadow-xl'
                            />
                            <p className='mt-3'>
                                <span className='text-lg font-semibold'>{item.amount}</span>
                            </p>
                            <p className='text-sm text-gray-400 mt-1'>{item.title}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* For search button */}
            <div className='flex items-center justify-center mt-3 lg:mt-4 pl-2 pr-2 md:pl-3 md:pr-3 lg:pl-4 lg:pr-4'>
                <div className='items-center justify-center w-64 md:w-72 lg:w-96'>
                    <Input.Search
                        placeholder='Search Station Name'
                        style={{ textAlign: 'center' }}
                        onChange={(e) => {
                            const searchTerm = e.target.value
                            setSearch(searchTerm)
                            const filter = mappedMacHard.filter((item) => {
                                return item.station_name.toLowerCase().includes(searchTerm.toLowerCase())
                            })
                            //console.log("Filtered data in searching", filter)
                            setFiltereddata(filter)
                        }}
                    />
                </div>
            </div>


            {/* Modal for editing */}
            {!activateEditing ? '' : (
                <Modal title='Update Downtime Reason' open={activateEditing} onCancel={closeEditModal} footer={false} className='text-center font-semibold'>
                    <hr style={{ height: '14px' }} />
                    {selectedData && (
                        <Form
                            layout='vertical'
                            initialValues={{
                                arc_end_time: selectedData?.jobDetails?.arc_end_time,
                                shift_name: selectedData?.jobDetails?.shift_name,
                                station_name: selectedData?.jobDetails?.station_name,
                                stop_duration: selectedData?.jobDetails?.stop_duration
                            }}
                            className='p-2 rounded-lg text-white dark:bg-secondary-dark-bg dark:text-gray-200'
                            onFinish={updateReasons}
                        >
                            <Row gutter={[10, 10]}>
                                <Col span={12}>
                                    <Form.Item
                                        name='arc_end_time'
                                        label="Business Date"
                                        rules={[
                                            { required: false, message: "Machine name is required" }
                                        ]}
                                        className='text-center text-white'
                                    >
                                        <Input disabled type='text' className='border-1 border-gray-600' placeholder='Ex. Serial 1122' />
                                    </Form.Item>
                                </Col>

                                <Col span={12}>
                                    <Form.Item
                                        name='shift_name'
                                        label="Shift"
                                        rules={[
                                            { required: false, message: "Machine name is required" }
                                        ]}
                                        className='text-center text-white'
                                    >
                                        <Input disabled type='text' className='border-1 border-gray-600' placeholder='Ex. Serial 1122' />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={[10, 10]}>
                                <Col span={12}>
                                    <Form.Item
                                        name='station_name'
                                        label="Station Name"
                                        rules={[
                                            { required: false, message: "Machine name is required" }
                                        ]}
                                        className='text-center text-white'
                                    >
                                        <Input disabled type='text' className='border-1 border-gray-600' placeholder='Ex. Serial 1122' />
                                    </Form.Item>
                                </Col>

                                <Col span={12}>
                                    <Form.Item
                                        name='stop_duration'
                                        label="Downtime Duration"
                                        rules={[
                                            { required: false, message: "Machine name is required" }
                                        ]}
                                        className='text-center text-white'
                                    >
                                        <Input disabled type='text' className='border-1 border-gray-600' placeholder='Ex. Serial 1122' />
                                    </Form.Item>
                                </Col>
                            </Row>


                            <Form.Item
                                name='reason'
                                label="Downtime Reasons"
                                rules={[
                                    { required: true, message: "Please provide a reason" }
                                ]}
                                className='text-center text-white'
                            >
                                <Select placeholder="Select machine type" className='border border-gray-500 rounded-md text-left'>

                                    {downtimeReason.length < 0 ? '' : downtimeReason?.map((downTimes) => (
                                        <Select.Option key={downTimes.ms_name} value={downTimes.ms_name}>{downTimes.ms_name}</Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>




                            <Form.Item className='flex items-center justify-end'>
                                <Space>
                                    <>
                                        <Button style={{ backgroundColor: currentColor, color: 'white' }} htmlType='submit' disabled={saved}
                                        >Submit</Button>
                                        <Button style={{ backgroundColor: currentColor, color: 'white' }}
                                            htmlType='reset' disabled={saved}
                                            onClick={closeEditModal}
                                        >Cancel</Button>
                                    </>
                                </Space>
                            </Form.Item>

                        </Form>
                    )}
                </Modal>
            )}




            {/* For Table section */}
            {loading ?
                <>
                    <Loading message="Loading!">Loader</Loading>
                </> : (
                    <div className='bg-white dark:text-gray-200 dark:bg-main-dark-bg rounded-xl mt-3 lg:mt-6 flex md:flex-col items-center justify-center pt-3 pl-2 pr-2'>
                        <div className='items-center justify-center text-center w-72 md:w-[500px] lg:w-[950px] mb-3 rounded-xl'>
                            <div className='w-full text-sm'>
                                <Table
                                    style={{ backgroundColor: currentColor, padding: '5px', borderRadius: '10px', }}
                                    columns={tableColumns.map((col) => {
                                        if (col.key === 'station_name') {
                                            return {
                                                ...col,
                                                filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                                                    <CustomerFilterDropDown
                                                        setSelectedKeys={setSelectedKeys}
                                                        selectedKeys={selectedKeys}
                                                        confirm={confirm}
                                                        clearFilters={clearFilters}
                                                        dataIndex={col.dataIndex}
                                                        jobNames={machineTypeFilters}
                                                    />
                                                ),
                                                //filters: machineTypeFilters,
                                                onFilter: (value, record) => record.station_name.includes(value),
                                                render: (_, record) => {
                                                    return {
                                                        props: {
                                                            style: { background: "#737B7C" }
                                                        },
                                                        children: <div key={record.id} className='flex gap-3 cursor-pointer justify-center items-center'>
                                                            <div className='text-center justify-center items-center'>
                                                                <h1 style={{ fontSize: '13px', textAlign: 'center', color: '#CDD1D2' }}>{record.station_name}</h1>
                                                            </div>
                                                        </div>
                                                    }
                                                },
                                            };
                                        }

                                        // For dymanic calender
                                        if (col.key === 'arc_end_time') {
                                            return {
                                                ...col,
                                                filterDropdown: () => (
                                                    <CustomDatePicker
                                                        setFiltereddata={setFiltereddata}
                                                    />
                                                ),
                                                onFilter: (value, record) => record.arc_end_time.includes(value),
                                                render: (_, record) => {
                                                    return {
                                                        props: {
                                                            style: { background: "#737B7C" }
                                                        },
                                                        children: <div key={record.id} className='flex gap-3 cursor-pointer justify-center items-center'>
                                                            <div className='text-center justify-center items-center'>
                                                                <h1 style={{ fontSize: '13px', textAlign: 'center', color: '#CDD1D2' }}>{record.arc_end_time}</h1>
                                                            </div>
                                                        </div>
                                                    }
                                                },
                                            };
                                        }
                                        if (col.key === 'edit') {
                                            return {
                                                ...col,
                                                render: (_, record) => {
                                                    return {
                                                        props: {
                                                            style: { background: "#737B7C" }
                                                        },
                                                        children: <div className='flex gap-3 cursor-pointer justify-center items-center'>
                                                            <i onClick={(e) => handleEditClick(e, record)} className='edit text-md' style={{ color: currentColor }}>
                                                                <span className='material-symbols-outlined'>edit</span>
                                                            </i>
                                                        </div>
                                                    }
                                                },
                                            };
                                        }

                                        return col;
                                    })}
                                    dataSource={search || filtereddata ? filtereddata : data} //For live search. 
                                    className='uppercase text-center items-center justify-center mr-6'
                                    scroll={{ x: true }}
                                    bordered
                                    size='small'
                                    pagination={{ className: "pagination", defaultPageSize: 10, showSizeChanger: true, pageSizeOptions: ['5', '10', '20', '50'] }}
                                    responsive
                                    tableLayout='primary'
                                    onRow={(record) => ({
                                        onClick: (e) => {
                                            const target = e.target
                                            if (target.tagName.toLowerCase() === 'span') {
                                                if (target.classList.contains('edit')) {
                                                    enableEdit(e, record)
                                                } else if (target.classList.contains('delete')) {
                                                    enableDelete(e, record)
                                                }
                                            }
                                        }
                                    })}
                                />
                            </div>
                        </div>
                    </div>
                )}
            {/* End of table section */}
        </div>
    )
}

export default DowntimeReason