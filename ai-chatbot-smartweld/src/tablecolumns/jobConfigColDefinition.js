import React from "react";


export const enableEdit = (e, allJobConfigData) => {
    // console.log("Job Id", allJobData)
    
    const sentDataToComponent = {
        eventTarget: e,
        jobDetails: allJobConfigData ? allJobConfigData : ''
    }
    return sentDataToComponent
};

export const enableDelete = (e, allJobData) => {
    // console.log("E", e?.target)
    // console.log("Job Id", allJobData)
    const sentDataToComponent = {
        eventTarget: e,
        jobDetails: allJobData ? allJobData : ''
    }
    return sentDataToComponent
};


const jobConfigColumn = [
    {
        title: <div style={{ fontSize: '14px', color: '#CDD1D2', textAlign: 'center' }}>Sl No</div>,
        dataIndex: 'serial',
        key: 'serial',
        render: (text) => {
            return {
                props: {
                    style: { background: "#737B7C" }
                },
                children: <div style={{ textAlign: 'center', justifyContent: 'center', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', textAlign: 'center', color: '#CDD1D2' }}>
                        {text}
                    </span>
                </div>
            }

        },
    },


    {
        title: <div style={{ fontSize: '14px', color: '#CDD1D2', textAlign: 'center' }}>Machine Name</div>,
        dataIndex: 'mc_name',
        key: 'mc_name',
        render: (text) => {
            return {
                props: {
                    style: { background: "#737B7C" }
                },
                children: <div style={{ textAlign: 'center', justifyContent: 'center', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', textAlign: 'center', color: '#CDD1D2' }}>
                        {text}
                    </span>
                </div>
            }

        },
    },

    {
        title: <div style={{ fontSize: '14px', color: '#CDD1D2', textAlign: 'center' }}>Job Name</div>,
        dataIndex: 'job_name',
        key: 'job_name',
        render: (text) => {
            return {
                props: {
                    style: { background: "#737B7C" }
                },
                children: <div style={{ textAlign: 'center', justifyContent: 'center', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', textAlign: 'center', color: '#CDD1D2' }}>
                        {text}
                    </span>
                </div>
            }

        },
    },

    {
        title: <div style={{ fontSize: '14px', color: '#CDD1D2', textAlign: 'center' }}>Wire Name</div>,
        dataIndex: 'fm_name',
        key: 'fm_name',
        render: (text) => {
            return {
                props: {
                    style: { background: "#737B7C" }
                },
                children: <div style={{ textAlign: 'center', justifyContent: 'center', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', textAlign: 'center', color: '#CDD1D2' }}>
                        {text}
                    </span>
                </div>
            }

        },
    },

    {
        title: <div style={{ fontSize: '14px', color: '#CDD1D2', textAlign: 'center' }}>High Current</div>,
        dataIndex: 'high_weld_cur_threshold',
        key: 'high_weld_cur_threshold',
        render: (text) => {
            return {
                props: {
                    style: { background: "#737B7C" }
                },
                children: <div style={{ textAlign: 'center', justifyContent: 'center', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', textAlign: 'center', color: '#CDD1D2' }}>
                        {text}
                    </span>
                </div>
            }

        },
    },

    {
        title: <div style={{ fontSize: '14px', color: '#CDD1D2', textAlign: 'center' }}>Low Current</div>,
        dataIndex: 'low_weld_cur_threshold',
        key: 'low_weld_cur_threshold',
        render: (text) => {
            return {
                props: {
                    style: { background: "#737B7C" }
                },
                children: <div style={{ textAlign: 'center', justifyContent: 'center', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', textAlign: 'center', color: '#CDD1D2' }}>
                        {text}
                    </span>
                </div>
            }

        },
    },

    {
        title: <div style={{ fontSize: '14px', color: '#CDD1D2', textAlign: 'center' }}>High Voltage</div>,
        dataIndex: 'high_weld_volt_threshold',
        key: 'high_weld_volt_threshold',
        render: (text) => {
            return {
                props: {
                    style: { background: "#737B7C" }
                },
                children: <div style={{ textAlign: 'center', justifyContent: 'center', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', textAlign: 'center', color: '#CDD1D2' }}>
                        {text}
                    </span>
                </div>
            }

        },
    },

    {
        title: <div style={{ fontSize: '14px', color: '#CDD1D2', textAlign: 'center' }}>Low Voltage</div>,
        dataIndex: 'low_weld_volt_threshold',
        key: 'low_weld_volt_threshold',
        render: (text) => {
            return {
                props: {
                    style: { background: "#737B7C" }
                },
                children: <div style={{ textAlign: 'center', justifyContent: 'center', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', textAlign: 'center', color: '#CDD1D2' }}>
                        {text}
                    </span>
                </div>
            }

        },
    },

    {
        title: <div style={{ fontSize: '14px', color: '#CDD1D2', textAlign: 'center' }}>High Gas</div>,
        dataIndex: 'high_weld_gas_threshold',
        key: 'high_weld_gas_threshold',
        render: (text) => {
            return {
                props: {
                    style: { background: "#737B7C" }
                },
                children: <div style={{ textAlign: 'center', justifyContent: 'center', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', textAlign: 'center', color: '#CDD1D2' }}>
                        {text}
                    </span>
                </div>
            }

        },
    },

    {
        title: <div style={{ fontSize: '14px', color: '#CDD1D2', textAlign: 'center' }}>Low Gas</div>,
        dataIndex: 'low_weld_gas_threshold',
        key: 'low_weld_gas_threshold',
        render: (text) => {
            return {
                props: {
                    style: { background: "#737B7C" }
                },
                children: <div style={{ textAlign: 'center', justifyContent: 'center', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', textAlign: 'center', color: '#CDD1D2' }}>
                        {text}
                    </span>
                </div>
            }

        },
    },

    {
        title: <div style={{ fontSize: '14px', color: '#CDD1D2', textAlign: 'center' }}>Job Duration</div>,
        dataIndex: 'event_threshold_dur',
        key: 'event_threshold_dur',
        render: (text) => {
            return {
                props: {
                    style: { background: "#737B7C" }
                },
                children: <div style={{ textAlign: 'center', justifyContent: 'center', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', textAlign: 'center', color: '#CDD1D2' }}>
                        {text}
                    </span>
                </div>
            }

        },
    },
    
    {
        title: <div style={{ fontSize: '14px', color: '#CDD1D2', textAlign: 'center' }}>Wire Consumption</div>,
        dataIndex: 'wire_consumption',
        key: 'wire_consumption',
        render: (text) => {
            return {
                props: {
                    style: { background: "#737B7C" }
                },
                children: <div style={{ textAlign: 'center', justifyContent: 'center', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', textAlign: 'center', color: '#CDD1D2' }}>
                        {text}
                    </span>
                </div>
            }

        },
    },

    {
        title: <div style={{ fontSize: '14px', color: '#CDD1D2', textAlign: 'center' }}>Gas Consumption</div>,
        dataIndex: 'gas_consumption',
        key: 'gas_consumption',
        render: (text) => {
            return {
                props: {
                    style: { background: "#737B7C" }
                },
                children: <div style={{ textAlign: 'center', justifyContent: 'center', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', textAlign: 'center', color: '#CDD1D2' }}>
                        {text}
                    </span>
                </div>
            }

        },
    },

    {
        title: <div style={{ fontSize: '14px', color: '#CDD1D2', textAlign: 'center' }}>Edit</div>,
        dataIndex: 'edit',
        key: 'edit',
        render: (_, record) => {
            <div style={{ textAlign: 'center', justifyContent: 'center', alignItems: 'center' }}>
                <i onClick={(e) => enableEdit(e, record)}
                    className="edit"
                ><span className="material-symbols-outlined">
                        edit
                    </span></i>
            </div>
        },
    },
    


    {
        title: <div style={{ fontSize: '14px', color: '#CDD1D2', textAlign: 'center' }}>Delete</div>,
        dataIndex: 'delete',
        key: 'delete',
        render: (_, record) => (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <i onClick={(e) => enableDelete(e, record)} className="delete">
                    <span className="material-symbols-outlined">delete</span>
                </i>
            </div>
        )
    }


]

export default jobConfigColumn