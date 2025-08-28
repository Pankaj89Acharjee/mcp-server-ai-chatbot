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


const userListColumn = [
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
        title: <div style={{ fontSize: '14px', color: '#CDD1D2', textAlign: 'center' }}>First Name</div>,
        dataIndex: 'user_first_name',
        key: 'user_first_name',
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
        title: <div style={{ fontSize: '14px', color: '#CDD1D2', textAlign: 'center' }}>Last Name</div>,
        dataIndex: 'user_last_name',
        key: 'user_last_name',
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
        title: <div style={{ fontSize: '14px', color: '#CDD1D2', textAlign: 'center' }}>User Email</div>,
        dataIndex: 'user_email',
        key: 'user_email',
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
        title: <div style={{ fontSize: '14px', color: '#CDD1D2', textAlign: 'center' }}>Role</div>,
        dataIndex: 'role_name',
        key: 'role_name',
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
        title: <div style={{ fontSize: '14px', color: '#CDD1D2', textAlign: 'center' }}>RFID</div>,
        dataIndex: 'rf_id',
        key: 'rf_id',
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
        title: <div style={{ fontSize: '14px', color: '#CDD1D2', textAlign: 'center' }}>Location</div>,
        dataIndex: 'location_name',
        key: 'location_name',
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
        title: <div style={{ fontSize: '14px', color: '#CDD1D2', textAlign: 'center' }}>Site</div>,
        dataIndex: 'site_name',
        key: 'site_name',
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
        title: <div style={{ fontSize: '14px', color: '#CDD1D2', textAlign: 'center' }}>Line</div>,
        dataIndex: 'line_type_name',
        key: 'line_type_name',
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

export default userListColumn