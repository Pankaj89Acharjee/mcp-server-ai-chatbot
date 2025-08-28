import React, { useState } from 'react';
import { Input, Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useStateContext } from "../contexts/ContextProvider";

const CustomerFilterDropDown = ({ setSelectedKeys, selectedKeys, confirm, clearFilters, dataIndex, jobNames, machineNames }) => {
    const [searchText, setSearchText] = useState('');

    const { currentColor } = useStateContext()

    //  Remove duplicates and keep unique jobNames
    const uniqueJobNames = Array.from(new Set(jobNames?.map(job => job.text)))
        .map(text => jobNames.find(job => job.text === text));

    // Remove duplicates and keep unique machineNames
    const uniqueMachineNames = Array.from(new Set(machineNames?.map(machine => machine.text)))
        .map(text => machineNames.find(machine => machine.text === text));

    const filteredJobNames = uniqueJobNames.filter(job => job?.text?.toLowerCase().includes(searchText.toLowerCase()));
    const filteredMachineNames = uniqueMachineNames.filter(machine => machine?.text?.toLowerCase().includes(searchText.toLowerCase()));


    const handleSearch = (e) => {
        setSearchText(e.target.value);
        setSelectedKeys(e.target.value ? [e.target.value] : []);
    };

    const handleReset = () => {
        setSearchText('');
        setSelectedKeys([]); // clear selected filter
        clearFilters(''); //reset filters
        confirm();//confirm the update
    };

    const handleConfirm = () => {
        confirm()
    }
    return (
        <div className='p-2'>
            <Input
                placeholder={`Search ${dataIndex.toUpperCase()}`}
                value={searchText}
                onChange={handleSearch}
                onPressEnter={handleConfirm}
                className='mb-3'

            />
            <div className='flex justify-around items-center p-1'>
                <Button
                    style={{ backgroundColor: currentColor }}
                    onClick={handleConfirm}
                    icon={<SearchOutlined />}
                    size="small"
                    className='w-[90px] mr-4 text-white hover:text-white ant-btn-primary'
                >
                    Search
                </Button>
                <Button
                    onClick={handleReset}
                    size="small"
                    style={{ width: 90, backgroundColor: currentColor }}
                    className='text-white hover:text-white ant-btn-primary'
                >
                    Reset
                </Button>
            </div>

            <hr className='mt-2' />
            <div className='mt-4 h-60 overflow-x-auto' >

                {filteredJobNames.map((job) => (
                    <div key={job.value} style={{ padding: '2px 10px' }}>
                        <label style={{ display: 'block' }}>
                            <input
                                type="checkbox"
                                checked={selectedKeys.includes(job.value)}
                                onChange={(e) => {
                                    const nextSelectedKeys = e.target.checked
                                        ? [...selectedKeys, job.value]
                                        : selectedKeys.filter((key) => key !== job.value);
                                    setSelectedKeys(nextSelectedKeys);
                                }}
                            />{' '}
                            {job.text}
                        </label>
                    </div>
                ))}

                {filteredMachineNames.map((machine) => (
                    <div key={machine.value} style={{ padding: '2px 8px' }}>
                        <label style={{ display: 'block' }}>
                            <input
                                type="checkbox"
                                checked={selectedKeys.includes(machine.value)}
                                onChange={(e) => {
                                    const nextSelectedKeys = e.target.checked
                                        ? [...selectedKeys, machine.value]
                                        : selectedKeys.filter((key) => key !== machine.value);
                                    setSelectedKeys(nextSelectedKeys);
                                }}
                            />{' '}
                            {machine.text}
                        </label>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CustomerFilterDropDown;
