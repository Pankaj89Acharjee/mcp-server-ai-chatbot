/**
 * Utility functions for safe number operations and formatting
 */

/**
 * Safely formats a number to a fixed decimal places
 * @param {any} value - The value to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @param {string} fallback - Fallback value if not a valid number (default: '0')
 * @returns {string} Formatted number string
 */
export const safeToFixed = (value, decimals = 2, fallback = '0') => {
  // If value is already a number
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value.toFixed(decimals);
  }
  
  // Try to convert to number
  const numValue = Number(value);
  if (Number.isFinite(numValue)) {
    return numValue.toFixed(decimals);
  }
  
  // Return fallback if not a valid number
  return fallback;
};

/**
 * Safely converts a value to a number
 * @param {any} value - The value to convert
 * @param {number} fallback - Fallback value if not a valid number (default: 0)
 * @returns {number} Converted number or fallback
 */
export const safeToNumber = (value, fallback = 0) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  
  const numValue = Number(value);
  if (Number.isFinite(numValue)) {
    return numValue;
  }
  
  return fallback;
};

/**
 * Formats a number with units
 * @param {any} value - The value to format
 * @param {string} unit - The unit to append
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} Formatted string with units
 */
export const formatWithUnit = (value, unit = '', decimals = 1) => {
  const formattedValue = safeToFixed(value, decimals);
  return unit ? `${formattedValue}${unit}` : formattedValue;
};

/**
 * Checks if a value is a valid number
 * @param {any} value - The value to check
 * @returns {boolean} True if valid number, false otherwise
 */
export const isValidNumber = (value) => {
  return typeof value === 'number' && Number.isFinite(value);
};

/**
 * Formats percentage values
 * @param {any} value - The value to format as percentage
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value, decimals = 1) => {
  return formatWithUnit(value, '%', decimals);
};

/**
 * Formats temperature values
 * @param {any} value - The temperature value
 * @param {string} unit - Temperature unit ('C' or 'F', default: 'C')
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} Formatted temperature string
 */
export const formatTemperature = (value, unit = 'C', decimals = 1) => {
  return formatWithUnit(value, `°${unit}`, decimals);
};

/**
 * Formats electrical current values
 * @param {any} value - The current value
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} Formatted current string
 */
export const formatCurrent = (value, decimals = 1) => {
  return formatWithUnit(value, 'A', decimals);
};

/**
 * Formats voltage values
 * @param {any} value - The voltage value
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} Formatted voltage string
 */
export const formatVoltage = (value, decimals = 1) => {
  return formatWithUnit(value, 'V', decimals);
};

/**
 * Formats gas flow rate values
 * @param {any} value - The gas flow rate value
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted gas flow rate string
 */
export const formatGasFlowRate = (value, decimals = 2) => {
  return formatWithUnit(value, 'L/min', decimals);
};

/**
 * Safe chart data formatter for ApexCharts
 * @param {any} val - The value to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted value for charts
 */
export const chartValueFormatter = (val, decimals = 2) => {
  return safeToFixed(val, decimals, '0');
};

/**
 * Format tooltip values for charts with units
 * @param {any} val - The value to format
 * @param {string} seriesName - The series name to determine unit
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted tooltip string
 */
export const formatChartTooltip = (val, seriesName = '', decimals = 2) => {
  const numVal = safeToNumber(val, 0);
  let unit = '';
  
  const lowerSeriesName = seriesName.toLowerCase();
  if (lowerSeriesName.includes('current')) unit = 'A';
  else if (lowerSeriesName.includes('voltage')) unit = 'V';
  else if (lowerSeriesName.includes('gas')) unit = 'L/min';
  else if (lowerSeriesName.includes('temp')) unit = '°C';
  else if (lowerSeriesName.includes('percentage') || lowerSeriesName.includes('%')) unit = '%';
  
  return `${numVal.toFixed(decimals)} ${unit}`;
};