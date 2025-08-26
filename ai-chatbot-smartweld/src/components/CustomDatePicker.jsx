import React, { useState } from 'react'
import { DatePicker, Button, message } from 'antd'
import moment from 'moment'
import axios from 'axios'
import { getDowntimeByDate } from '../apicalls/downtimeCalls'


const CustomDatePicker = ({ setFiltereddata }) => {

  const [chooseDate, setChooseDate] = useState(null)



  const handleDateChange = async (date) => {
    setChooseDate(date)

    if (date) {
      try {
        const customDate = date.format('YYYY-MM-DD')
        const response = await getDowntimeByDate({ customDate })

        if (response.success) {
          setFiltereddata(response.data);
        } else {
          message.error("Something went wrong")
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
  }

  const resetHandler = () => {
    setFiltereddata(null)
  }

  return (
    <div className='p-2'>
      <DatePicker
        onChange={handleDateChange}
        className='mb-2 block'
      />
      <button
        onClick={resetHandler}
        className='flex bg-gray-700 p-1 rounded-lg'>Reload</button>
    </div>
  )
}

export default CustomDatePicker