import { Card } from 'antd'
import { SlidersHorizontal } from 'lucide-react'
import React from 'react'
import FilterSelect from './FilterSelect'

const FilterPanel = ({ filters, onFilterChange }) => {
    return (
        <div className='h-full justify-between'>
            <Card
                title={
                    <span className="flex items-center h-full">
                        <SlidersHorizontal size={18} className="mr-2" /> Filters
                    </span>
                }
                className="bg-slate-800 border-slate-700 text-white shadow-lg rounded-lg"
                headStyle={{ color: 'white', borderBottom: '1px solid #475569' }}
            >
                {filters.map(filter => (
                    <FilterSelect
                        key={filter.id}
                        label={filter.label}
                        options={filter.options}
                        icon={filter.icon}
                        defaultValue={filter.defaultValue}
                        onChange={(value) => onFilterChange(filter.id, value)} // Pass filter ID and value
                    />
                ))}
            </Card>
        </div>
    )
}

export default FilterPanel
