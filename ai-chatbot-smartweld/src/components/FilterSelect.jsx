import { Select } from 'antd'
import React from 'react'

//Filter Select Component (Used by FilterPanel Component)
const FilterSelect = ({ label, options, icon, defaultValue = "All", onChange }) => {
    return (
        <div className="mb-4 h-full">
            <label className="text-sm font-medium text-slate-300 mb-1 flex items-center">
                {icon && React.createElement(icon, { size: 16, className: "mr-2" })}
                {label}
            </label>
            <Select
                defaultValue={defaultValue}
                className="w-full filter-select" // Custom class for specific styling if needed
                onChange={onChange} // Pass onChange handler
                options={options} // Use options prop directly
            >
                {/* Options are now passed directly via the options prop */}
            </Select>
            {/* Basic styles for Select component to blend with dark theme */}
            <style jsx global>{`
            .filter-select .ant-select-selector {
                background-color: #334155 !important; /* slate-700 */
                border-color: #475569 !important; /* slate-600 */
                color: white !important;
                border-radius: 0.375rem !important; /* rounded-md */
            }
            .filter-select .ant-select-arrow {
                color: #94a3b8 !important; /* slate-400 */
            }
            .ant-select-dropdown {
                 background-color: #334155 !important; /* slate-700 */
                 border-color: #475569 !important; /* slate-600 */
            }
             .ant-select-item-option-content {
                 color: white !important;
            }
            .ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
                background-color: #475569 !important; /* slate-600 */
            }
            .ant-select-item-option-active:not(.ant-select-item-option-disabled) {
                 background-color: #52525b !important; /* zinc-600 for hover */
            }
        `}</style>
        </div>
    )
}

export default FilterSelect
