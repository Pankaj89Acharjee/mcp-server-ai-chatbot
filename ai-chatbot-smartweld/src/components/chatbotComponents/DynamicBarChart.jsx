// DYNAMIC BAR CHART COMPONENT
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';


const ChartIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M22,21H2V3H4V19H6V10H10V19H12V6H16V19H18V14H22V21Z" />
  </svg>
);


export const DynamicBarChart = ({ data, title, config = {} }) => {
    console.log('DynamicBarChart Debug:', { data, title, config });
    const xAxisKey = config.xKey || config.xAxis || 'name';
    const yAxisKey = config.yKey || config.yAxis || 'value';
    console.log('Using keys:', { xAxisKey, yAxisKey });
    
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <ChartIcon size={20} />
          {title}
        </h3>
        <div className="w-full overflow-x-auto">
          <BarChart width={600} height={300} data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey={xAxisKey} stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '6px' }}
              labelStyle={{ color: '#F9FAFB' }}
            />
            <Legend />
            <Bar dataKey={yAxisKey} fill="#3B82F6" />
          </BarChart>
        </div>
      </div>
    );
  };