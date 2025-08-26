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


const jobListColumn = [
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
        title: <div style={{ fontSize: '14px', color: '#CDD1D2', textAlign: 'center' }}>Job Code</div>,
        dataIndex: 'job_code',
        key: 'job_code',
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
        title: <div style={{ fontSize: '14px', color: '#CDD1D2', textAlign: 'center' }}>Job Description</div>,
        dataIndex: 'job_description',
        key: 'job_description',
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

export default jobListColumn