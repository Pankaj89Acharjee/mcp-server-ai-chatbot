// Dynamic Table Component used for displaying chat data response in the Page
const TableIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M5,4H19A2,2 0 0,1 21,6V18A2,2 0 0,1 19,20H5A2,2 0 0,1 3,18V6A2,2 0 0,1 5,4M5,8V12H11V8H5M13,8V12H19V8H13M5,14V18H11V14H5M13,14V18H19V14H13Z" />
  </svg>
);

export const DataTable = ({ data, title, config = {} }) => {
    if (!data || data.length === 0) return null;
  
    let columns = [];
    let processedData = [];
    
    if (Array.isArray(data[0]) && typeof data[0][0] !== 'object') {
      
        if (config.columns && Array.isArray(config.columns)) {
            columns = config.columns;
        } else {
            // Create column names based on data length
            columns = Array.from({ length: Math.max(...data.map(row => row.length)) }, (_, i) => `Column ${i + 1}`);
        }
        
        // Converting array of arrays to array of objects
        processedData = data.map((row, index) => {
            const obj = {};
            columns.forEach((col, colIndex) => {
                obj[col] = row[colIndex] || '';
            });
            return obj;
        });
    } else {
        columns = Object.keys(data[0]);
        processedData = data;
    }
  
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <TableIcon size={20} />
          {title}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-gray-300">
            <thead>
              <tr className="border-b border-gray-600">
                {columns.map((column, index) => (
                  <th key={index} className="text-left p-3 font-medium text-gray-200 capitalize">
                    {column.replace(/_/g, ' ')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {processedData.map((row, index) => (
                <tr key={index} className="border-b border-gray-700 hover:bg-gray-750">
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className="p-3">
                      {row[column]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  