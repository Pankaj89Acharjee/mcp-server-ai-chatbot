// Helper Component for Wire Spool Progress Bar
const WireSpoolProgressBar = ({ label, value, maxValue = 15 }) => { // Default max value set to 15KG
    // Ensure value is a number, default to 0 if not
    const numericValue = typeof value === 'number' ? value : 0;
    const percentage = Math.min(100, Math.max(0, (numericValue / maxValue) * 100));
    const isHigh = numericValue > 13; // Condition for red color

    // Define gradient colors based on the condition
    const barColorClass = isHigh
        ? 'bg-gradient-to-r from-red-500 to-red-700 dark:from-red-600 dark:to-red-800' // Red gradient
        : 'bg-gradient-to-r from-green-400 to-green-600 dark:from-green-500 dark:to-green-700'; // Green gradient

    const textColorClass = isHigh
        ? 'text-red-600 dark:text-red-400'
        : 'text-green-700 dark:text-green-400';

    return (
        <div className="mb-4"> {/* Increased margin-bottom */}
            <div className="flex justify-between items-baseline text-xs mb-1"> {/* Use baseline alignment */}
                <span className="font-medium text-neutral-600 dark:text-neutral-300 truncate pr-2">{label}</span>
                <span className={`font-bold text-sm ${textColorClass}`}> {/* Slightly larger font for value */}
                    {numericValue} KG
                </span>
            </div>
            {/* Track for the progress bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 overflow-hidden shadow-inner"> {/* Slightly thicker bar, added shadow */}
                {/* The actual progress bar */}
                <div
                    className={`h-3 rounded-full transition-all duration-500 ease-out ${barColorClass}`}
                    style={{ width: `${percentage}%` }}
                    title={`${numericValue} KG / ${maxValue} KG (${percentage.toFixed(0)}%)`} // Tooltip on hover
                ></div>
            </div>
        </div>
    );
};

export default WireSpoolProgressBar;