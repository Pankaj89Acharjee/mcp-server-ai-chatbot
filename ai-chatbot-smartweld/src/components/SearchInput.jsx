import React from 'react'
import { Input } from 'antd'


const SearchInput = ({ onSearch, data, filterKey, placeholder, setSearch }) => {

    const handleSearch = (searchTerm) => {
        setSearch(searchTerm) //Update search term state

        if (!searchTerm) {
            onSearch(data) //If search term is empty, return all data
            return
        }

        const filteredData = data.filter((item) =>
            item[filterKey]?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        onSearch(filteredData) //Return filtered data based on search term
    }


    return (
        <div className='flex items-center justify-center mt-3 lg:mt-4 pl-2 pr-2 md:pl-3 md:pr-3 lg:pl-4 lg:pr-4'>
            <div className='items-center justify-center w-64 md:w-72 lg:w-96'>
                <Input.Search
                    placeholder={placeholder}
                    onChange={(e) => handleSearch(e.target.value)} //Handle search input change
                    style={{ textAlign: 'center' }}
                />
            </div>
        </div>
    )
}

export default SearchInput
