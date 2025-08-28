import React from 'react'
import { Modal } from 'antd'
import Chart from 'react-apexcharts'


const EnlargedChartModal = ({ visible, onClose, chartOptions, chartSeries, chartTitle, thresholds }) => {

    console.log("Chart options", chartOptions)

    const adjustedChartOptions = {
        ...chartOptions,
        xaxis: {
          ...chartOptions.xaxis,
          labels: {
            ...chartOptions?.xaxis?.labels,
            rotate: -45, // Prevent labels from being rotated
            offsetX: 0,
            offsetY: 0,
            style: {
              fontSize: '12px',
              colors: '#ffffff',
            },
          },
        },
      };

    console.log("NEW Chart options", adjustedChartOptions)

    return (
        <Modal
            title={chartTitle}
            visible={visible}
            onCancel={onClose}
            footer={null}
            width='100%'
            centered
            style={{ top: 20, opacity: 0.9 }}

        >
            <div className='w-full bg-gradient-to-r from-cyan-500 from-10% via-30% to-gray-700 to-90% px-2 rounded-xl'>
                <h1 className='text-center p-2 font-bold'>{chartTitle}</h1>
                <div className="h-[275px] w-full mt-2 pr-4 pl-2 rounded-xl mr-8">
                    <Chart options={adjustedChartOptions} series={chartSeries} type='line' height={250} annotations={chartOptions.annotations} />
                </div>
                <div className='flex flex-wrap items-center justify-around mb-3'>
                    {thresholds.map(({ label, value }) => (
                        <div key={label} className='flex flex-wrap items-center justify-center mb-4'>
                            <h1 className='text-xs text-white rounded-md p-1 opacity-80'>{label}</h1>
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
        </Modal>
    )
}

export default EnlargedChartModal
