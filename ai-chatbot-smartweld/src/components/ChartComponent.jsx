import React from 'react'
import Chart from 'react-apexcharts'

const ChartComponent = ({ title, chartRef, options, series, hardwareCode, thresholds }) => {
    //console.log('ChartComponent live data', series.data)
    return (
        <div className='relative w-[29%] bg-gradient-to-r from-cyan-500 from-10% via-30% to-gray-700 to-90% px-4 mr-2 rounded-xl'>
            <h1 className='text-center p-2 font-bold'>{title}</h1>
            <div className="h-[300px] w-full mt-2 pr-6 pb-2 rounded-xl">
                <Chart ref={chartRef} options={options} series={series} type='line' height={250} annotations={options.annotations} />
            </div>
            <div className='flex flex-wrap items-center justify-around mb-3'>
                {thresholds.map(({ label, value }) => (
                    <div key={label} className='flex flex-wrap items-center justify-center'>
                        <h1 className='text-xs rounded-md p-1 opacity-80'>{label}</h1>
                        <button
                            style={{ backgroundColor: "blanchedalmond" }}
                            className='w-12 h-12 flex items-center justify-center text-xs text-gray-950 opacity-90 rounded-full border-2 border-gray-200 hover:drop-shadow-xl ml-1'
                        >
                            {value ? value : 'NA'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default ChartComponent
