import React, { useState, useEffect } from "react";
import { MdOutlineCancel } from "react-icons/md";
import { Button } from ".";
import { useStateContext } from "../contexts/ContextProvider";
import { DatePicker, Switch, Tag, Checkbox, message } from "antd";
import { useDateSelectionContext } from "../contexts/DateSelectionContext";
import { BsCalendar3, BsCalendarRange } from "react-icons/bs";

const { RangePicker } = DatePicker;

const ShiftOption = ({ value, label, checked, onChange, disabled }) => {
  return (
    <div
      className={`px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-2 ${disabled ? "opacity-50" : ""
        }`}
      onClick={(e) => e.preventDefault()}
    >
      <Checkbox
        checked={checked}
        disabled={disabled}
        onChange={(e) => {
          e.stopPropagation();
          onChange(value, e.target.checked);
        }}
      />
      <span
        className={`text-gray-700 dark:text-gray-200 ${disabled ? "text-gray-400" : ""
          }`}
      >
        {label}
      </span>
    </div>
  );
};

const CalendarIcon = () => {
  const { currentColor } = useStateContext();
  const { selectedDate, updateDateSelection, resetDateSelection, dateType: contextDateType, selectedShifts, updateShiftSelection, maxDateRange, earliestDate } = useDateSelectionContext();

  const [isRangePicker, setIsRangePicker] = useState(contextDateType === "range");
  const [value, setValue] = useState(selectedDate); // Final selected date or range
  const [dates, setDates] = useState(null); // Temporary range while selecting
  const [localShifts, setLocalShifts] = useState(selectedShifts);

  const shiftOptions = [
    { value: "A", label: "Shift (A)" },
    { value: "B", label: "Shift (B)" },
    { value: "C", label: "Shift (C)" },
  ];

  useEffect(() => {
    setIsRangePicker(contextDateType === "range");
    setValue(selectedDate);
    setLocalShifts(selectedShifts);
  }, [contextDateType, selectedDate, selectedShifts]);

  const handleDateChange = (date) => {
    setValue(date);
  };

  const handleRangeChange = (dates) => {
    setValue(dates);
  };

  const handleLocalShiftChange = (value, checked) => {
    if (checked) {
      setLocalShifts((prev) => [...prev, value]);
    } else {
      if (localShifts.length > 1) {
        setLocalShifts((prev) => prev.filter((shift) => shift !== value));
      }
    }
  };

  const handleLocalShiftRemove = (shiftToRemove) => {
    if (localShifts.length > 1) {
      setLocalShifts((prev) => prev.filter((shift) => shift !== shiftToRemove));
    }
  };

  useEffect(() => {
    if (localShifts.length === 0) {
      setLocalShifts(["A"]);
    }
  }, [localShifts]);

  const disabledDate = (current) => {
    if (!current) return false;
    const currentDay = current.startOf("day");
    if (!isRangePicker) {
      // For single date picker, disable dates before earliestDate
      return currentDay < earliestDate.startOf("day");
    }
    if (!dates || !dates[0]) {
      // When selecting start date, disable dates before earliestDate
      return currentDay < earliestDate.startOf("day");
    } else {
      // When selecting end date, disable dates before start and after start + maxDateRange
      const start = dates[0].startOf("day");
      const maxEnd = start.clone().add(maxDateRange, "days").endOf("day");
      return currentDay < start || currentDay > maxEnd;
    }
  };

  const handleOpenChange = (open) => {
    if (open) {
      setDates(value); // Initialize with current value
    } else {
      setDates(null); // Clear temporary state
    }
  };

  const handleApply = () => {
    if (!value) {
      message.info("Please select a date or date range.");
      return;
    }

    if (isRangePicker && Array.isArray(value) && value[0] && value[1]) {
      const start = value[0].startOf("day");
      const end = value[1].startOf("day");
      if (end < start) {
        message.info("End date cannot be before start date.");
        return;
      }
      const daysDiff = end.diff(start, "day");
      if (daysDiff > maxDateRange) {
        message.info(
          `Selected range exceeds the maximum allowed range of ${maxDateRange} days.`
        );
        return;
      }
      updateDateSelection(value);
    } else if (!isRangePicker && value) {
      updateDateSelection(value);
    } else {
      message.info("Please select a date or date range.");
      return;
    }

    updateShiftSelection(localShifts);
  };

  const handleReset = () => {
    setValue(null);
    setDates(null);
    setLocalShifts(["A"]);
    resetDateSelection();
  };

  return (
    <div
      className="nav-item absolute right-1 top-16 bg-white dark:bg-[#42464D] p-8 rounded-xl shadow-2xl z-[1000]"
      style={{ minWidth: "380px" }}
    >
      <div className="flex justify-between items-center">
        <p className="font-semibold text-lg dark:text-gray-200">Calendar</p>
        <Button
          icon={<MdOutlineCancel />}
          color="rgb(153, 171, 180)"
          bgHoverColor="light-gray"
          size="2xl"
          borderRadius="50%"
        />
      </div>

      <div className="mt-6 border-color border-b-1 pb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              style={{ color: currentColor, backgroundColor: "#E5E7EB" }}
              className="text-xl rounded-lg p-3 hover:bg-light-gray"
            >
              {isRangePicker ? <BsCalendarRange /> : <BsCalendar3 />}
            </button>
            <div>
              <p className="font-semibold dark:text-gray-200">Date Selection</p>
              <p className="text-gray-500 text-sm dark:text-gray-400">
                {isRangePicker ? "Range Picker" : "Single Date"}
              </p>
            </div>
          </div>
          <Switch
            checked={isRangePicker}
            onChange={(checked) => {
              setIsRangePicker(checked);
              setValue(null);
              setDates(null);
            }}
            checkedChildren="Range"
            unCheckedChildren="Single"
            style={{
              backgroundColor: isRangePicker ? currentColor : "#64748B",
            }}
          />
        </div>

        <div className="mb-4 relative">
          {isRangePicker ? (
            <RangePicker
              className="w-full border-1 border-gray-300 rounded-md p-2"
              format="DD MMMM YYYY"
              onChange={handleRangeChange}
              value={value}
              placeholder={["Start date", "End date"]}
              disabledDate={disabledDate}
              onCalendarChange={(val) => setDates(val)}
              onOpenChange={handleOpenChange}
              popupStyle={{ zIndex: 1001 }}
              getPopupContainer={(trigger) => trigger.parentElement}
              style={{ width: "100%" }}
            />
          ) : (
            <DatePicker
              className="w-full border-1 border-gray-300 rounded-md p-2"
              format="DD MMMM YYYY"
              onChange={handleDateChange}
              value={value}
              placeholder="Select date"
              disabledDate={disabledDate}
              popupStyle={{ zIndex: 1001 }}
              getPopupContainer={(trigger) => trigger.parentElement}
              style={{ width: "100%" }}
            />
          )}
        </div>

        <div className="mb-4">
          <p className="font-semibold dark:text-gray-200 mb-2">Shifts</p>
          <div className="border rounded-md border-gray-300 dark:border-gray-600 divide-y divide-gray-200 dark:divide-gray-600">
            {shiftOptions.map((option) => (
              <ShiftOption
                key={option.value}
                value={option.value}
                label={option.label}
                checked={localShifts.includes(option.value)}
                onChange={handleLocalShiftChange}
                disabled={
                  localShifts.length === 1 && localShifts.includes(option.value)
                }
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-2 justify-center mt-3">
            {localShifts.map((shift) => {
              const shiftOption = shiftOptions.find(
                (opt) => opt.value === shift
              );
              return (
                <Tag
                  key={shift}
                  closable={localShifts.length > 1}
                  onClose={() => handleLocalShiftRemove(shift)}
                  style={{
                    backgroundColor: currentColor,
                    width: "fit-content",
                    fontSize: "14px",
                    color: "white",
                    borderRadius: "16px",
                    padding: "3px 9px",
                    cursor:
                      localShifts.length === 1 ? "not-allowed" : "pointer",
                  }}
                >
                  {shiftOption
                    ? `Shift ${shiftOption.label.split(" ")[1]}`
                    : `Shift ${shift}`}
                </Tag>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        <Button
          color="white"
          bgColor={currentColor}
          text="Apply"
          borderRadius="10px"
          width="full"
          customFx={handleApply}
        />
        <Button
          color="gray"
          bgColor="transparent"
          text="Reset"
          borderRadius="10px"
          width="full"
          customFx={handleReset}
        />
      </div>
    </div>
  );
};

export default CalendarIcon;
