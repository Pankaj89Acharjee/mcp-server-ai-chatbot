import React, { createContext, useState, useMemo, useContext } from "react";
import dayjs from "dayjs";

export const DateSelectionContext = createContext();

export const DateSelectionProvider = ({ children }) => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [dateType, setDateType] = useState("single");
  const [selectedShifts, setSelectedShifts] = useState(["A", "B", "C"]);
  const [maxDateRange, setMaxDateRange] = useState(7); // Default to 7 days
  const earliestDate = useMemo(
    () => dayjs().subtract(3, "month").startOf("day"),
    []
  );

  const updateDateSelection = (date) => {
    setSelectedDate(date);
    setDateType(Array.isArray(date) ? "range" : "single");
  };

  const updateShiftSelection = (shifts) => {
    setSelectedShifts(shifts);
  };

  const resetDateSelection = () => {
    setSelectedDate(null);
    setDateType("single");
    setSelectedShifts(["A", "B", "C"]);
  };

  const getFormattedDate = () => {
    if (!selectedDate) return null;
    if (dateType === "range" && Array.isArray(selectedDate)) {
      const start = selectedDate[0].format("DD MMMM YYYY");
      const end = selectedDate[1].format("DD MMMM YYYY");
      return { displayText: `${start} - ${end}` };
    }
    return { displayText: selectedDate.format("DD MMMM YYYY") };
  };

  return (
    <DateSelectionContext.Provider
      value={{
        selectedDate,
        dateType,
        selectedShifts,
        updateDateSelection,
        updateShiftSelection,
        resetDateSelection,
        getFormattedDate,
        maxDateRange,
        setMaxDateRange,
        earliestDate,
      }}
    >
      {children}
    </DateSelectionContext.Provider>
  );
};

export const useDateSelectionContext = () => useContext(DateSelectionContext);
