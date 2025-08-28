import React from "react";


export const enableEdit = (e, allJobData) => {
    e.preventDefault()
    // console.log("E", e?.target)
   //console.log("Boolean value of is current job", Boolean(allJobData.is_current_job))
    const sentDataToComponent = {
        eventTarget: e,
        jobDetails: allJobData ? { ...allJobData, is_current_job: Boolean(allJobData?.is_current_job) } : ''
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


const machineJobMapColumn = [
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
        title: <div style={{ fontSize: '14px', color: '#CDD1D2', textAlign: 'center' }}>Job Sequence</div>,
        dataIndex: 'job_seq',
        key: 'job_seq',
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
        title: <div style={{ fontSize: '14px', color: '#CDD1D2', textAlign: 'center' }}>Job Serial</div>,
        dataIndex: 'job_serial',
        key: 'job_serial',
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
        title: <div style={{ fontSize: '14px', color: '#CDD1D2', textAlign: 'center' }}>Is Current Job</div>,
        dataIndex: 'is_current_job',
        key: 'is_current_job',
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

export default machineJobMapColumn