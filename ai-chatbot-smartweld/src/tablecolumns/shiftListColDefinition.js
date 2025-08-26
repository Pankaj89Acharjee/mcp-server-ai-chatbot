import React from "react";


export const enableEdit = (e, allJobData) => {
    // console.log("E", e?.target)
    // console.log("Job Id", allJobData)
    const sentDataToComponent = {
        eventTarget: e,
        jobDetails: allJobData ? allJobData : ''
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


const shiftListColumn = [
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
        title: <div style={{ fontSize: '14px', color: '#CDD1D2', textAlign: 'center' }}>Shift Name</div>,
        dataIndex: 'shift_name',
        key: 'shift_name',
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
        title: <div style={{ fontSize: '14px', color: '#CDD1D2', textAlign: 'center' }}>Start Time</div>,
        dataIndex: 'shift_start_time',
        key: 'shift_start_time',
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
        title: <div style={{ fontSize: '14px', color: '#CDD1D2', textAlign: 'center' }}>End Time</div>,
        dataIndex: 'shift_end_time',
        key: 'shift_end_time',
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
        title: <div style={{ fontSize: '14px', color: '#CDD1D2', textAlign: 'center' }}>Mid Shift Break in Mins </div>,
        dataIndex: 'break_duration',
        key: 'break_duration',
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
        }
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

export default shiftListColumn