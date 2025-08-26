import React, { useEffect, useState } from 'react'
import { earningData } from '../data/sidenavItems'
import { enableEdit, enableDelete } from '../tablecolumns/jobListColumnDefinition';
import { Table, message, Popconfirm, Space, Modal, Form, Input, Button, Select, Row, Col } from 'antd'
import { useStateContext } from "../contexts/ContextProvider";
import Loading from '../components/Loading'
import CustomerFilterDropDown from '../components/CustomerFilterDropDown';
import { createUserData, deleteUserData, getAllRoles, getAllUsersList, updateUserData } from '../apicalls/usersApiCall';
import userListColumn from '../tablecolumns/userListColDefinition';
import { getLineBySite, getLocation, getSiteByLocation } from '../apicalls/locationAPICall';
import useAuth from "../customHooks/useAuth";



const Users = () => {
  const { currentColor } = useStateContext()
  const { auth } = useAuth()

  const [form] = Form.useForm()

  const [userList, setUserList] = useState(null)
  const [isEditing, setIsEditing] = useState(false);
  const [activateBtn, setActivatebtn] = useState(false);
  const [activateEditing, setActivateEditing] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null);
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [filtereddata, setFiltereddata] = useState([])
  const [roles, setRoles] = useState([])
  const [location, setLocation] = useState([])
  const [sites, setSites] = useState([])
  const [lines, setLines] = useState([])
  const [isOperatorRole, setIsOperatorRole] = useState(false)
  const [isPlantHeadRole, setPlantHeadRole] = useState(false)
  const [isSupervisorRole, setIsSupervisorRole] = useState(false)
  const [isSiteAdminRole, setSiteAdminRole] = useState(false)
  const [isExecutiveRole, setIsExecutiveRole] = useState(false)
  const [isAdminRole, setIsAdminRole] = useState(false)


  const fetchUserList = async () => {
    try {
      setLoading(true)
      const getAllUsers = await getAllUsersList()
      if (getAllUsers.success === true) {
        setUserList(getAllUsers.data)
        setLoading(false)
      } else {
        setLoading(false)
        console.log("Users list not found")
        message.error("Users list not found")
      }
    } catch (error) {
      setLoading(false)
      console.log("Error occured", error)
      message.error(error.message)
    }
  }


  // Callback Function to handle edit click from the Children (jobListColumnDefinition)
  const handleEditClick = async (e, jobId) => {
    const eventData = enableEdit(e, jobId);
    getSites(eventData?.jobDetails?.location_id)
    getLines(eventData?.jobDetails?.site_id)

    //console.log('Data from enableEdit:', eventData);
    setIsEditing(true);
    setActivateEditing(true)
    setSelectedUser(eventData)
  };


  //For closing modal of editing 
  const closeEditModal = () => {
    form.resetFields()
    setIsEditing(false)
    setActivateEditing(false)
    setSelectedUser(null)
    setSites([])
    setLines([])
    getLocationByOrg()
    setIsOperatorRole(false)
    setSiteAdminRole(false)
    setIsSupervisorRole(false)
    setPlantHeadRole(false)
    setIsExecutiveRole(false)
  }

  //console.log("Get all roles", userRole)
  //For Closing the Modal
  const closeModal = () => {
    form.resetFields()
    setActivatebtn(false)
    setIsEditing(false)
    setActivateEditing(false)
    setSelectedUser(null)
    setSites([])
    setLines([])
    getLocationByOrg()
    setIsOperatorRole(false)
    setSiteAdminRole(false)
    setIsSupervisorRole(false)
    setPlantHeadRole(false)
    setIsExecutiveRole(false)
  }

  //Enable insertion
  const enableInsertion = () => {
    setActivatebtn(true)
  }

  //For saving a new job in database
  const saveNewUserHandler = async (values) => {
    try {
      // If SUPERVISOR wants to add a new OPERATOR
      if (auth.role === 'SUPERVISOR') {
        const payloadSentBySupervisorForOptRole = {
          first_name: values.user_first_name,
          last_name: values.user_last_name,
          email: values.user_email,
          role_id: values.role_name,
          rf_id: values.rf_id,
          login_id: values.user_email,
          login_pwd: values.password,
          location_id: auth.locationId,
          site_id: auth.siteId,
          line_type_id: values.line_type_name
        }

        console.log("Raw Payload for new opt role creating by Supervisor", values)

        console.log("Payload for new operator sent by Supervisor", payloadSentBySupervisorForOptRole)
        await saveNewUser(payloadSentBySupervisorForOptRole)


      } else if (isSupervisorRole) {  //If Selected Role is Supervisor Role
        const payloadForSupervisorCreation = {
          first_name: values.user_first_name,
          last_name: values.user_last_name,
          email: values.user_email,
          role_id: values.role_name,
          rf_id: values.rf_id,
          login_id: values.user_email,
          login_pwd: values.password,
          location_id: values.location_name,
          site_id: values.site_name,
        }
        console.log("Raw Payload for new Supervisor role", values)

        console.log("Payload for new Supervisor role is to create", payloadForSupervisorCreation)
        await saveNewUser(payloadForSupervisorCreation)

      } else {
        const payload = {
          first_name: values.user_first_name,
          last_name: values.user_last_name,
          email: values.user_email,
          role_id: values.role_name,
          rf_id: values.rf_id,
          login_id: values.user_email,
          login_pwd: values.password,
          location_id: values.location_name,
          site_id: values.site_name,
          line_type_id: values.line_type_name
        }
        console.log("Raw Payload for new user creation", values)

        console.log("Payload for new user creation", payload)
        await saveNewUser(payload)
      }



    } catch (error) {
      setLoading(false)
      setSaved(false)
      message.error(error.message)
      console.log("Error in job creation", error)
    }
  }

  const saveNewUser = async (destructuringValues) => {
    setLoading(true)
    const saveUserDetails = await createUserData(destructuringValues)
    if (saveUserDetails.success === true) {
      closeModal()
      message.success("User created successfully")
      setLoading(false)
      setActivatebtn(false)
      fetchUserList()
    } else {
      message.info("Data not saved")
      setLoading(false)
    }
  }


  const updateUserHandler = async (payload) => {
    try {
      if (isAdminRole) {
        const userData = {
          id: payload.id,
          user_first_name: payload.user_first_name,
          user_last_name: payload.user_last_name,
          user_email: payload.user_email,
          role_id: payload.role_id,
        }
        await update(userData)
      }

      const payloadDestructure = {
        id: selectedUser?.jobDetails?.id,
        user_first_name: payload.user_first_name,
        user_last_name: payload.user_last_name,
        user_email: payload.user_email,
        role_id: payload.role_name ? payload.role_name : selectedUser?.jobDetails?.role_id,
        rf_id: payload.rf_id ? payload.rf_id : selectedUser?.jobDetails?.rf_id,
        login_id: payload.user_email,
        location_id: payload.location_name ? payload.location_name : selectedUser?.jobDetails?.location_id,
        site_id: payload?.site_name ? payload?.site_name : selectedUser?.jobDetails?.site_id,
        line_type_id: payload.line_type_name ? payload.line_type_name : selectedUser?.jobDetails?.line_type_id ?? null
      }

      await update(payloadDestructure)



      // console.log("selectedUser.jobDetails values", selectedUser?.jobDetails)

      // console.log("Changed Payload for FORM", payload)

      // console.log("Payload for FORM", payloadDestructure)

    } catch (error) {
      message.error(error.message)
      console.log("Error in updating job", error)
    }
  }

  const update = async (payloadDestructure) => {
    const response = await updateUserData(payloadDestructure)
    if (response.success === true) {
      message.success("User Updated Successfully")
      closeEditModal()
      fetchUserList()
    }
  }


  const deleteJobHandler = async (payload) => {
    try {
      const deleteUser = await deleteUserData(payload)
      // console.log("JOB delete", deleteJobData)
      if (deleteUser.success === true) {
        message.success("User deleted successfully")
        fetchUserList()
      }
    } catch (error) {
      message.error(error.message)
      console.log("Error in deleting user", error)
    }
  }

  const cancel = (e) => {
    //Write logic here
    message.error('Oh O! You were accidentally deleting data');
  }



  console.log("Auth details in User Component", auth)


  useEffect(() => {
    fetchUserList()
    getRoles()
    getLocationByOrg()
    linesForOperatorCreatedBySupervisor()
  }, [])

  // Fetching all roles from DB
  const getRoles = async () => {
    const fetchRoles = await getAllRoles()
    setRoles(fetchRoles.data)
  }

  const getLocationByOrg = async () => {
    const fetchLocation = await getLocation()
    setLocation(fetchLocation.data)
    //console.log("Location are", fetchLocation.data)
  }

  const getSites = async (locId) => {
    const getSiteNames = await getSiteByLocation(locId)
    setSites(getSiteNames.data)
  }


  // Fetching Lines from Sites
  const getLines = async (siteId) => {
    const getLineNames = await getLineBySite(siteId)
    setLines(getLineNames.data)
    //console.log("Line names", getLineNames.data)
  }


  const linesForOperatorCreatedBySupervisor = () => { //Used for Supervisor to create new Operators role whose Location and Site Id are as same as the Supervisor. Only need to give Line Type Id
    console.log("Lines for Opt fx")
    const payloadForSupervisor = auth.siteId
    getLines(payloadForSupervisor)
  }


  const handleRoleChange = (roleId) => {
    const selectedRole = roles.find(role => role.id === roleId)

    setIsOperatorRole(selectedRole?.role_name === 'Operator')
    setIsSupervisorRole(selectedRole?.role_name === 'Supervisor')
    setSiteAdminRole(selectedRole?.role_name === 'Siteadmin')
    setPlantHeadRole(selectedRole?.role_name === 'Planthead')
    setIsExecutiveRole(selectedRole?.role_name === 'Executive')
  }

  const userCreationAccess = ["ADMINISTRATOR", "SUPERVISOR", "PLANTHEAD"].includes(auth.role)


  useEffect(() => {
    //To reset and pre-populating the form to the initial values when the modal is re-opened.
    if (activateEditing && selectedUser) {
      form.setFieldsValue({
        user_first_name: selectedUser.jobDetails.user_first_name,
        user_last_name: selectedUser.jobDetails.user_last_name,
        user_email: selectedUser.jobDetails.user_email,
        role_name: selectedUser.jobDetails.role_id,
        location_name: selectedUser.jobDetails.location_id,
        site_name: selectedUser.jobDetails.site_id,
        line_type_name: selectedUser.jobDetails.line_type_id,
        rf_id: selectedUser.jobDetails.rf_id,
      });
    }

    //For loading with initial values in Modal during first time opening of modal
    if (selectedUser?.jobDetails?.role_name) {
      setIsOperatorRole(selectedUser?.jobDetails?.role_name === 'Operator')
      setIsSupervisorRole(selectedUser?.jobDetails?.role_name === 'Supervisor')
      setSiteAdminRole(selectedUser?.jobDetails?.role_name === 'Siteadmin')
      setPlantHeadRole(selectedUser?.jobDetails?.role_name === 'Planthead')
      setIsExecutiveRole(selectedUser?.jobDetails?.role_name === 'Executive')
    }


  }, [form, activateEditing, selectedUser]);



  const handleLocationChange = async (newLocationId) => {
    //Checking if Location Id differs from the initial state value for location
    if (newLocationId !== selectedUser?.jobDetails?.location_id) {

      //Value reset for Site and Line
      form.setFieldsValue({
        site_name: null,
        line_type_name: null
      })

      try {
        const response = await getSiteByLocation(newLocationId)
        // console.log("Sites names fetched are", response.data)
        setSites(response.data || [])

        //Clearing Previous Lines value as Sites changes 
        setLines([]);
      } catch (error) {
        setSites([]);
        console.error("Error fetching sites:", error);
      }
    } else if (selectedUser?.jobDetails?.location_id) { //If re-selected the initial value again

      //Value reset for Site and Line
      form.setFieldsValue({
        site_name: null,
        line_type_name: null
      })

      try {
        const response = await getSiteByLocation(newLocationId)
        // console.log("Sites names fetched in else condition", response.data)
        setSites(response.data || [])

        //Clearing Previous Lines value as Sites changes 
        setLines([]);
      } catch (error) {
        setSites([]);
        console.error("Error fetching sites:", error);
      }
    }
  }

  const tableColumns = userListColumn

  console.log("Table columns are", tableColumns)

  const data = userList?.length > 0 ? userList?.map((data, index) => ({
    key: index.toString(),
    serial: (index + 1).toString(),
    id: data.id,
    userId: data.id,
    user_first_name: data.user_first_name,
    user_last_name: data.user_last_name,
    user_email: data.user_email,
    role_id: data.role_id,
    role_name: data.role_name,
    rf_id: data.rf_id,
    location_id: data.location_id,
    location_name: data.location_name,
    site_id: data.site_id,
    site_name: data.site_name,
    line_type_id: data.line_type_id,
    line_type_name: data.line_type_name,
  })) : [];



  //Filtering user-names dynamically for drop-down search items
  const userNameFilters = userList ? userList.map((users) => (
    {
      text: users.user_first_name,
      value: users.user_first_name
    }
  )) : [];



  return (
    <div className='mt-12'>
      <h1 className='text-left ml-8 font-semibold dark:text-gray-300'>Users List</h1>
      <div className='flex flex-wrap lg:flex-nowrap justify-center'>

        {/* Top Hoarding section */}
        <div className='bg-white dark:text-gray-200 dark:bg-secondary-dark-bg h-44 rounded-xl w-full lg:w-80 p-8 pt-9 m-3 bg-center'>
          <div className="flex justify-between items-center">
            <div>
              <p className='font-bold text-gray-400'>Total Users</p>
              <p className='text-2xl'>250</p>
            </div>
          </div>

          <div className='mt-6'>
            {/* <Button
              color="white"
              bgColor={currentColor}
              text="Add New Job"
              borderRadius="10px"
              size="md"
              onClick = {isClicked.enableEditing}
            /> */}
            <button
              type='button'
              style={{ backgroundColor: currentColor, color: 'white', borderRadius: '10px' }}
              className={`text-md p-3 hover:drop-shadow-xl`}
              onClick={enableInsertion}
            >Add New User</button>
          </div>
        </div>

        {/* Card Icons Section */}
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
            placeholder='Search Users'
            style={{ textAlign: 'center' }}
            onChange={(e) => {
              const searchTerm = e.target.value
              setSearch(searchTerm)
              const filter = userList.filter((item) => {
                return item.user_first_name.toLowerCase().includes(searchTerm.toLowerCase())
              })
              //console.log("Filtered data in searching", filter)
              setFiltereddata(filter)
            }}
          />
        </div>
      </div>



      {/* Modal for creating a new User */}
      {!activateBtn ? '' : (
        <Modal title='Add New User' open={activateBtn} onCancel={closeModal} footer={false}
          className='text-center font-semibold'
        >
          <hr />
          <Form
            layout='vertical'
            className='p-2 rounded-lg text-white dark:bg-secondary-dark-bg dark:text-gray-200'
            onFinish={saveNewUserHandler}
            autoComplete='off'
          >

            {/* Creating two rows */}
            <Row gutter={[10, 10]}>
              <Col span={12}>
                <Form.Item
                  name='user_first_name'
                  label="First Name"
                  rules={[
                    { required: true, message: "First Name required" }
                  ]}
                  className='text-center text-white'
                >
                  <Input type='text' className='border-1 border-gray-600' placeholder='Ex. Mircro Tasks' rules={[{ required: true }]} />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  name='user_last_name'
                  label="Last Name"
                  rules={[
                    { required: true, message: "Last Name required" }
                  ]}
                  className='text-center text-white'
                >
                  <Input type='text' className='border-1 border-gray-600' placeholder='Ex. Mircro Tasks Sub Job' />
                </Form.Item>
              </Col>
            </Row>


            <Form.Item
              name='user_email'
              label="Email"
              className='text-center text-white'
              rules={[
                { required: true, message: "Email is required" },
                { type: 'email', message: 'Please enter a valid email address' }
              ]}
            >
              <Input type='email' className='border-1 border-gray-600' placeholder='Ex. Description about the job if any' autoComplete='new-email' />
            </Form.Item>

            {/* Third Row */}
            <Row gutter={[10, 10]}>
              {/* If ADMINISTRATOR wants to add new user like Supervisor, Planthead, SiteAdmin except an ADMINISTRATOR*/}
              {auth.role === 'ADMINISTRATOR' && (
                <Col span={12}>
                  <Form.Item
                    name='role_name'
                    label="User Role"
                    rules={[
                      { required: true, message: "Role is required" }
                    ]}
                    className='text-center text-white'
                  >
                    <Select
                      placeholder="Select Role"
                      className='border border-gray-500 rounded-md text-left uppercase'
                      onChange={handleRoleChange}
                    >

                      {roles?.filter((role) => role.role_name !== 'Administrator').map((role) => (
                        <Select.Option
                          key={role.role_name}
                          value={role.id}
                          className="uppercase"
                        >
                          {role.role_name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              )}


              {/* If Supervisor wants to add a new Operator or SiteAdmin */}
              {auth.role === 'SUPERVISOR' && (
                <Col span={12}>
                  <Form.Item
                    name='role_name'
                    label="User Role"
                    rules={[
                      { required: true, message: "Role is required" }
                    ]}
                    className='text-center text-white'
                  >
                    <Select
                      placeholder="Select Role"
                      className='border border-gray-500 rounded-md text-left uppercase'
                      onChange={handleRoleChange}
                    >

                      {roles?.filter((role) => role.role_name !== 'Administrator' &&
                        role.role_name !== 'Supervisor' && role.role_name !== 'Planthead' && role.role_name !== 'Executive'
                      ).map((role) => (
                        <Select.Option
                          key={role.role_name}
                          value={role.id}
                          className="uppercase"
                        >
                          {role.role_name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              )}



              {auth.role !== "SUPERVISOR" && (
                <Col span={12}>
                  <Form.Item
                    name='location_name'
                    label="Location"
                    rules={[
                      { required: true, message: "Location is required" }
                    ]}
                    className='text-center text-white'
                  >
                    <Select
                      placeholder="Select Location"
                      className='border border-gray-500 rounded-md text-left uppercase'
                      onChange={(newLocationId) => {
                        handleLocationChange(newLocationId)
                      }}
                    >


                      {location?.map((loc) => (
                        <Select.Option
                          key={loc.id}
                          value={loc.id}
                          className="uppercase"
                        >
                          {loc.loc_name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              )}

              {/* If Supervisor wants to add operator, Line names will be same of his (Supervisor's) line. Another Line Type is below of this code */}
              {auth.role === "SUPERVISOR" && (
                <Col span={12}>
                  <Form.Item
                    name='line_type_name'
                    label="Select Line Type"
                    rules={[
                      { required: true, message: "Line Type is required" }
                    ]}
                    className='text-center text-white'
                  >
                    <Select placeholder="Select Line" className='border border-gray-500 rounded-md text-left uppercase' >

                      {lines?.map((line) => (
                        <Select.Option
                          key={line.lt_name}
                          value={line.id}
                          className="uppercase"
                        >
                          {line.lt_name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              )}
            </Row>


            {/* Fourth Row */}
            <Row gutter={[10, 10]}>
              {!isExecutiveRole && auth.role !== "SUPERVISOR" && (
                <Col span={12}>
                  <Form.Item
                    name='site_name'
                    label="Site"
                    rules={[
                      { required: true, message: "Site is required" }
                    ]}
                    className='text-center text-white'
                  >
                    <Select
                      placeholder="Select Site"
                      className='border border-gray-500 rounded-md text-left uppercase'
                      onChange={(siteId) => {
                        form.setFieldsValue({ line_type_name: null });
                        setLines([])
                        getLines(siteId)
                      }}
                    >

                      {sites?.map((site) => (
                        <Select.Option
                          key={site.site_name}
                          value={site.id}
                          className="uppercase"
                        >
                          {site.site_name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              )}

              {!(isSupervisorRole || isPlantHeadRole || isSiteAdminRole || isExecutiveRole) && auth.role !== "SUPERVISOR" && (
                <Col span={12}>
                  <Form.Item
                    name='line_type_name'
                    label="Line Type"
                    rules={[
                      { required: true, message: "Line Type is required" }
                    ]}
                    className='text-center text-white'
                  >
                    <Select placeholder="Select Line" className='border border-gray-500 rounded-md text-left uppercase'>

                      {lines?.map((line) => (
                        <Select.Option
                          key={line.lt_name}
                          value={line.id}
                          className="uppercase"
                        >
                          {line.lt_name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              )}
            </Row>



            {isOperatorRole && (
              <Form.Item
                name='rf_id'
                label="RFID"
                className='text-center text-white'
                rules={[
                  { required: false, message: "RFID is optional" }
                ]}
              >
                <Input type='text' className='border-1 border-gray-600' placeholder='RFID' />
              </Form.Item>
            )
            }

            <Form.Item
              name='password'
              label="Password"
              className='text-center text-white'
              rules={[
                { required: true, message: "Password is required" },
                {
                  min: 8,
                  message: "Password must be at least 8 characters long",
                },
                {
                  pattern: /[A-Z]/,
                  message: "Password must include at least one uppercase letter",
                },
                {
                  pattern: /[a-z]/,
                  message: "Password must include at least one lowercase letter",
                },
                {
                  pattern: /[0-9]/,
                  message: "Password must include at least one number",
                },
                {
                  pattern: /[!@#$%^&*(),.?":{}|<>]/,
                  message: "Password must include at least one special character",
                },
              ]}
            >
              <Input.Password className='border-1 border-gray-600' placeholder='Password' type="password" autoComplete='new-password' />
            </Form.Item>

            <Form.Item className='flex items-center justify-end'>
              <Space>
                <>
                  <Button style={{ backgroundColor: currentColor, color: 'white' }} htmlType='submit' disabled={loading}
                  >Submit</Button>
                  <Button style={{ backgroundColor: currentColor, color: 'white' }}
                    htmlType='reset' disabled={loading}>Reset</Button>
                </>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      )}


      {/* Modal for editing an existing job */}
      {!activateEditing && !isEditing ? '' : (
        <Modal title='Edit Existing User' open={activateEditing} onCancel={closeEditModal} footer={false} className='text-center font-semibold'>
          <hr style={{ height: '14px' }} />
          {selectedUser && userCreationAccess && (
            <Form
              form={form}
              key={selectedUser?.id}
              layout='vertical'
              initialValues={{
                user_first_name: selectedUser?.jobDetails?.user_first_name,
                user_last_name: selectedUser?.jobDetails?.user_last_name,
                user_email: selectedUser?.jobDetails?.user_email,
                role_name: selectedUser?.jobDetails?.role_id,
                location_name: selectedUser?.jobDetails?.location_id,
                site_name: selectedUser?.jobDetails?.site_id,
                line_type_name: selectedUser?.jobDetails?.line_type_id,
                rf_id: selectedUser?.jobDetails?.rf_id
              }}
              className='p-2 rounded-lg text-white dark:bg-secondary-dark-bg dark:text-gray-200'
              onFinish={updateUserHandler}
            >

              {/* Creating two rows */}
              <Row gutter={[10, 10]}>
                <Col span={12}>
                  <Form.Item
                    name='user_first_name'
                    label="First Name"
                    rules={[
                      { required: true }
                    ]}
                    className='text-center text-white'
                  >
                    <Input type='text' className='border-1 border-gray-600' placeholder='Ex. Mircro Tasks' rules={[{ required: true }]} />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    name='user_last_name'
                    label="Last Name"
                    rules={[
                      { required: true }
                    ]}
                    className='text-center text-white'
                  >
                    <Input type='text' className='border-1 border-gray-600' placeholder='Ex. Mircro Tasks Sub Job' />
                  </Form.Item>
                </Col>
              </Row>


              <Form.Item
                name='user_email'
                label="Email"
                className='text-center text-white'
                rules={[
                  { required: true, message: "Email is required" }
                ]}
              >
                <Input type='text' className='border-1 border-gray-600' placeholder='Ex. Description about the job if any' />
              </Form.Item>

              {/* Third Row */}
              <Row gutter={[10, 10]}>
                <Col span={12}>
                  <Form.Item
                    name='role_name'
                    label="User Role"
                    rules={[
                      { required: true, message: "Role is required" }
                    ]}
                    className='text-center text-white'
                  >
                    <Select
                      placeholder="Select Role"
                      className='border border-gray-500 rounded-md text-left uppercase'
                      onChange={handleRoleChange}
                    >

                      {roles?.map((role) => (
                        <Select.Option
                          key={role.role_name}
                          value={role.id}
                          className="uppercase"
                        >
                          {role.role_name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    name='location_name'
                    label="Location"
                    rules={[
                      { required: true, message: "Role is required" }
                    ]}
                    className='text-center text-white'
                  >
                    <Select
                      placeholder="Select Location"
                      className='border border-gray-500 rounded-md text-left uppercase'
                      onChange={(newLocationId) => {
                        handleLocationChange(newLocationId)
                      }}
                    >


                      {location?.map((loc) => (
                        <Select.Option
                          key={loc.id}
                          value={loc.id}
                          className="uppercase"
                        >
                          {loc.loc_name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>


              {/* Fourth Row */}
              {!isExecutiveRole && (
                <Row gutter={[10, 10]}>
                  <Col span={12}>
                    <Form.Item
                      name='site_name'
                      label="Site"
                      rules={[
                        { required: true, message: "Site is required" }
                      ]}
                      className='text-center text-white'
                    >
                      <Select
                        placeholder="Select Site"
                        className='border border-gray-500 rounded-md text-left uppercase'
                        onChange={(siteId) => {
                          form.setFieldsValue({ line_type_name: null });
                          setLines([])
                          getLines(siteId)
                        }}
                      >

                        {sites?.map((site) => (
                          <Select.Option
                            key={site.site_name}
                            value={site.id}
                            className="uppercase"
                          >
                            {site.site_name}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>

                  {!(isSupervisorRole || isPlantHeadRole || isSiteAdminRole || isExecutiveRole) && (
                    <Col span={12}>
                      <Form.Item
                        name='line_type_name'
                        label="Line Type"
                        rules={[
                          { required: true, message: "Line Type is required" }
                        ]}
                        className='text-center text-white'
                      >
                        <Select placeholder="Select Line" className='border border-gray-500 rounded-md text-left uppercase'>

                          {lines?.map((line) => (
                            <Select.Option
                              key={line.lt_name}
                              value={line.id}
                              className="uppercase"
                            >
                              {line.lt_name}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                  )}
                </Row>
              )}



              {isOperatorRole && (
                <Form.Item
                  name='rf_id'
                  label="RFID"
                  className='text-center text-white'
                  rules={[
                    { required: false, message: "RFID is optional" }
                  ]}
                >
                  <Input type='text' className='border-1 border-gray-600' placeholder='RFID' />
                </Form.Item>
              )
              }



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
            <div className='items-center justify-center text-center w-80 md:w-[500px] lg:w-[1200px] mb-3 rounded-xl'>
              <div className='w-full text-sm'>
                <Table
                  style={{ backgroundColor: currentColor, padding: '5px', borderRadius: '10px', }}
                  columns={tableColumns.map((col) => {
                    if (col.key === 'user_first_name') {
                      return {
                        ...col,
                        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                          <CustomerFilterDropDown
                            setSelectedKeys={setSelectedKeys}
                            selectedKeys={selectedKeys}
                            confirm={confirm}
                            clearFilters={clearFilters}
                            dataIndex={col.dataIndex}
                            jobNames={userNameFilters}
                          />
                        ),
                        //filters: userNameFilters,
                        onFilter: (value, record) => record.user_first_name.includes(value),
                        render: (_, record) => {
                          return {
                            props: {
                              style: { background: "#737B7C" }
                            },
                            children: <div className='flex gap-3 cursor-pointer justify-center items-center'>
                              <div className='text-center justify-center items-center'>
                                <h1 style={{ fontSize: '13px', textAlign: 'center', color: '#CDD1D2' }}>{record.user_first_name}</h1>
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
                    if (col.key === 'delete') {
                      return {
                        ...col,
                        render: (_, record) => {
                          return {
                            props: {
                              style: { background: "#737B7C" }
                            },
                            children: <div className='flex gap-3 cursor-pointer justify-center items-center'>
                              <Popconfirm title="Are you sure to delete?"

                                onConfirm={() => deleteJobHandler(record)}
                                onCancel={cancel}
                                okText="Sure"
                                cancelText="Cancel"
                                overlayClassName='custom-popconfirm'
                              >
                                <i className="delete"><span className="material-symbols-outlined text-xl font-bold" style={{ color: currentColor }}>
                                  delete
                                </span></i>
                              </Popconfirm>
                            </div>
                          }

                        }
                      }
                    }
                    return col;
                  })}
                  dataSource={search ? filtereddata : data} //For live search. 
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
                      // {console.log("Value of target on clicking", target)}
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

export default Users