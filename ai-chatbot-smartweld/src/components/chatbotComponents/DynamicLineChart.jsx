import { LineChart, Line,XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Dynamic Line Chart Component

const ChartIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M22,21H2V3H4V19H6V10H10V19H12V6H16V19H18V14H22V21Z" />
  </svg>
);


export const DynamicLineChart = ({ data, title, config = {} }) => {
    console.log('DynamicLineChart Debug:', { data, title, config });
    
    const xAxisKey = config.xKey || config.xAxis || 'name';
    const yAxisKeys = config.yKey || config.yAxis || 'value';
    
    // Handle multiple y-axis values (comma-separated)
    const yAxisArray = typeof yAxisKeys === 'string' ? yAxisKeys.split(',').map(key => key.trim()) : [yAxisKeys];
    
    console.log('Using keys:', { xAxisKey, yAxisArray });
    
    // Color palette for multiple lines
    const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16'];
    
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <ChartIcon size={20} />
          {title}
        </h3>
        <div className="w-full overflow-x-auto">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey={xAxisKey} stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '6px' }}
                labelStyle={{ color: '#F9FAFB' }}
              />
              <Legend />
              {yAxisArray.map((yKey, index) => (
                <Line 
                  key={yKey}
                  type="monotone" 
                  dataKey={yKey} 
                  stroke={colors[index % colors.length]} 
                  strokeWidth={2}
                  name={yKey}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };