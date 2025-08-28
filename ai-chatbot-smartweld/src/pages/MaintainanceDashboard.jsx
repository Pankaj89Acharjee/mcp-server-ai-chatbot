import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Input, DatePicker, TimePicker, Table, Row, Col, Card, Typography, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const { Title } = Typography;
const { RangePicker } = DatePicker;

// Define colors for Pie chart segments
const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const MaintainanceDashboard = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [maintenanceData, setMaintenanceData] = useState([]);
    const [filteredDateRange, setFilteredDateRange] = useState(null);
    const [activeTheme, setActiveTheme] = useState(localStorage.getItem('themeMode') || 'light');

    // Listen to theme changes if your app has a theme context or similar mechanism
    useEffect(() => {
        const handleThemeChange = () => {
            setActiveTheme(localStorage.getItem('themeMode') || 'light');
        };
        window.addEventListener('themeChanged', handleThemeChange); // Assuming a custom event
        // Or use your theme context if available
        return () => {
            window.removeEventListener('themeChanged', handleThemeChange);
        };
    }, []);

    // Dummy data for table - as per your reverted structure
    useEffect(() => {
        setMaintenanceData([
            {
                key: '1',
                machineId: 'MC-001',
                task: 'Oil Change',
                scheduledDate: '2023-10-01',
                status: 'Completed',
                assignedTo: 'John Doe',
            },
            {
                key: '2',
                machineId: 'MC-002',
                task: 'Filter Replacement',
                scheduledDate: '2023-10-05',
                status: 'Pending',
                assignedTo: 'Jane Smith',
            },
            {
                key: '3',
                machineId: 'MC-001',
                task: 'Bearing Check',
                scheduledDate: '2023-11-15',
                status: 'In Progress',
                assignedTo: 'John Doe',
            },
             {
                key: '4',
                machineId: 'MC-003',
                task: 'Sensor Calibration',
                scheduledDate: '2023-10-01',
                status: 'Completed',
                assignedTo: 'Alex Ray',
            },
            {
                key: '5',
                machineId: 'MC-002',
                task: 'Coolant Flush',
                scheduledDate: '2023-11-15',
                status: 'Pending',
                assignedTo: 'Jane Smith',
            },
            {
                key: '6',
                machineId: 'MC-004',
                task: 'Belt Tensioning',
                scheduledDate: '2023-11-20',
                status: 'Completed',
                assignedTo: 'Sarah Connor',
            },
            {
                key: '7',
                machineId: 'MC-001',
                task: 'Software Update',
                scheduledDate: '2023-11-22',
                status: 'Pending',
                assignedTo: 'John Doe',
            },
        ]);
    }, []);

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = () => {
        form.validateFields()
            .then(values => {
                form.resetFields();
                setIsModalOpen(false);
                const newRecord = {
                    key: (maintenanceData.length + 1).toString(),
                    ...values,
                    scheduledDate: values.scheduledDate.format('YYYY-MM-DD'),
                    scheduledTime: values.scheduledTime ? values.scheduledTime.format('HH:mm:ss') : 'N/A',
                };
                setMaintenanceData(prevData => [newRecord, ...prevData]);
                console.log('New Record:', newRecord);
            })
            .catch(info => {
                console.log('Validate Failed:', info);
            });
    };

    const handleCancel = () => {
        form.resetFields();
        setIsModalOpen(false);
    };
    
    const onClear = () => {
        form.resetFields();
    };

    const tableColumns = [
        { title: 'Machine ID', dataIndex: 'machineId', key: 'machineId', sorter: (a, b) => a.machineId.localeCompare(b.machineId) },
        { title: 'Maintenance Task', dataIndex: 'task', key: 'task' },
        { title: 'Scheduled Date', dataIndex: 'scheduledDate', key: 'scheduledDate', sorter: (a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate) },
        { title: 'Assigned To', dataIndex: 'assignedTo', key: 'assignedTo' },
        { title: 'Status', dataIndex: 'status', key: 'status' },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button type="link" className="dark:text-blue-400">Edit</Button>
                    <Button type="link" danger className="dark:text-red-400">Delete</Button>
                </Space>
            ),
        },
    ];

    const formattedPieData = Object.entries(
        maintenanceData.reduce((acc, record) => {
            const status = record.status || 'Unknown';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {})
    ).map(([name, value]) => ({ name, value })); // Recharts expects 'name' for Pie dataKey

    let chartDataForBar = maintenanceData.reduce((acc, record) => {
        const date = record.scheduledDate || 'Unknown Date';
        acc[date] = (acc[date] || 0) + 1;
        return acc;
    }, {});

    if (filteredDateRange && filteredDateRange[0] && filteredDateRange[1]) {
        const startDate = new Date(filteredDateRange[0]);
        const endDate = new Date(filteredDateRange[1]);
        chartDataForBar = Object.entries(chartDataForBar)
            .filter(([date]) => {
                const currentDate = new Date(date);
                return currentDate >= startDate && currentDate <= endDate;
            })
            .reduce((obj, [key, value]) => { 
                obj[key] = value;
                return obj;
             }, {});
    }

    const formattedBarData = Object.entries(chartDataForBar)
        .map(([date, count]) => ({ date, count }))
        .sort((a,b) => new Date(a.date) - new Date(b.date));
    
    const chartTextColor = activeTheme === 'dark' ? '#A0AEC0' : '#4A5568'; // Gray for text
    const chartGridColor = activeTheme === 'dark' ? '#4A5568' : '#E2E8F0'; // Lighter gray for grid

    const PieChartComponent = () => (
        <Card title="Maintenance Status Distribution" className="h-full shadow-lg dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 flex flex-col">
            {formattedPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}> {/* Adjust height as needed */}
                    <PieChart>
                        <Pie
                            data={formattedPieData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                            {formattedPieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value, name) => [value, name]} wrapperClassName="dark:!bg-gray-700 dark:!border-gray-600 rounded" itemStyle={{color: chartTextColor}}/>
                        <Legend wrapperStyle={{color: chartTextColor}} />
                    </PieChart>
                </ResponsiveContainer>
            ) : (
                <div className="flex-grow flex items-center justify-center">
                    <p className="text-gray-500 dark:text-gray-400">No data for status distribution.</p>
                </div>
            )}
        </Card>
    );
    
    const BarChartComponent = () => (
        <Card title="Maintenance Tasks Over Time" className="h-full shadow-lg dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 flex flex-col">
            <div className="p-4 border-b dark:border-gray-700">
                <RangePicker 
                    onChange={(dates, dateStrings) => setFilteredDateRange(dateStrings)} 
                    className="w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 [&>input]:dark:text-gray-300 [&>.ant-picker-suffix]:dark:text-gray-400 [&>.ant-picker-clear]:dark:bg-gray-700 [&>.ant-picker-clear]:dark:text-gray-400"
                />
            </div>
            {formattedBarData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={formattedBarData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                        <XAxis dataKey="date" tick={{ fill: chartTextColor }} />
                        <YAxis tick={{ fill: chartTextColor }} />
                        <Tooltip wrapperClassName="dark:!bg-gray-700 dark:!border-gray-600 rounded" itemStyle={{color: chartTextColor}} contentStyle={{backgroundColor: activeTheme ==='dark' ? '#2D3748' : '#FFFFFF'}} />
                        <Legend wrapperStyle={{color: chartTextColor}}/>
                        <Bar dataKey="count" fill="#8884d8" name="Tasks" >
                           {formattedBarData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            ) : (
                 <div className="flex-grow flex items-center justify-center">
                    <p className="text-gray-500 dark:text-gray-400">No data for tasks over time{filteredDateRange ? " in selected range" : ""}.</p>
                </div>
            )}
        </Card>
    );

    return (
        <div className="p-4 md:p-6 lg:p-8 bg-gray-100 dark:bg-gray-900 min-h-screen transition-colors duration-300">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-center">
                <Title level={2} className="text-gray-800 dark:text-gray-100 !mb-4 sm:!mb-0">
                    Maintenance Dashboard
                </Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={showModal}
                    className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                    Add New Record
                </Button>
            </div>

            {/* Modal for Adding New Record */}
            <Modal
                title="Add New Maintenance Record"
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                destroyOnClose
                className="dark:bg-gray-800 rounded-lg" 
                footer={[
                    <Button key="back" onClick={onClear} className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">
                        Clear
                    </Button>,
                    <Button key="cancel" onClick={handleCancel} className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">
                        Cancel
                    </Button>,
                    <Button key="submit" type="primary" onClick={handleOk} className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
                        Save Record
                    </Button>,
                ]}
            >
                <Form form={form} layout="vertical" name="maintenance_form" className="dark:text-gray-300">
                    <Form.Item
                        name="machineId"
                        label={<span className="dark:text-gray-300">Machine ID</span>}
                        rules={[{ required: true, message: 'Please input the machine ID!' }]}
                    >
                        <Input placeholder="e.g., MC-001" className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:placeholder-gray-500" />
                    </Form.Item>
                    <Form.Item
                        name="task"
                        label={<span className="dark:text-gray-300">Maintenance Task</span>}
                        rules={[{ required: true, message: 'Please describe the task!' }]}
                    >
                        <Input.TextArea rows={3} placeholder="e.g., Perform oil change and inspection" className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:placeholder-gray-500" />
                    </Form.Item>
                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="scheduledDate"
                                label={<span className="dark:text-gray-300">Scheduled Date</span>}
                                rules={[{ required: true, message: 'Please select the date!' }]}
                            >
                                <DatePicker style={{ width: '100%' }} className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 [&>input]:dark:text-gray-300 [&>.ant-picker-suffix]:dark:text-gray-400" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="scheduledTime"
                                label={<span className="dark:text-gray-300">Scheduled Time</span>}
                                rules={[{ required: false }]}
                            >
                                <TimePicker style={{ width: '100%' }} use12Hours format="h:mm A" className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 [&>input]:dark:text-gray-300 [&>.ant-picker-suffix]:dark:text-gray-400" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item
                        name="assignedTo"
                        label={<span className="dark:text-gray-300">Assigned To</span>}
                        rules={[{ required: true, message: 'Please assign a person!' }]}
                    >
                        <Input placeholder="e.g., John Doe" className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:placeholder-gray-500" />
                    </Form.Item>
                     <Form.Item
                        name="status"
                        label={<span className="dark:text-gray-300">Status</span>}
                        initialValue="Pending"
                        rules={[{ required: true, message: 'Please select a status!' }]}
                    >
                        <Input placeholder="e.g., Pending, In Progress, Completed" className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:placeholder-gray-500" />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Table Section */}
            <div className="mb-8 bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-xl">
                <Title level={3} className="mb-4 text-gray-700 dark:text-gray-200">
                    Maintenance Records
                </Title>
                <Table 
                    columns={tableColumns} 
                    dataSource={maintenanceData} 
                    scroll={{ x: 'max-content' }}
                    className="dark-table"
                />
            </div>

            {/* Charts Section */}
            <div>
                <Title level={3} className="mb-6 text-gray-700 dark:text-gray-200">
                    Maintenance Analytics
                </Title>
                <Row gutter={[16, 16]}>
                    <Col xs={24} lg={7} xl={7}> 
                        <PieChartComponent />
                    </Col>
                    <Col xs={24} lg={17} xl={17}> 
                        <BarChartComponent />
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default MaintainanceDashboard;