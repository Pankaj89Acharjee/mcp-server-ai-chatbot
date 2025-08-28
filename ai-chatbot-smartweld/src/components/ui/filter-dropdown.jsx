import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Input, Button, Checkbox } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useStateContext } from "../../contexts/ContextProvider";

const FilterDropDown = ({
  setSelectedKeys,
  selectedKeys,
  confirm,
  clearFilters,
  dataIndex,
  options,
}) => {
  const [searchText, setSearchText] = useState("");
  const { currentColor } = useStateContext();

  useEffect(() => {
    if (selectedKeys.length === 1 && selectedKeys[0].startsWith("__search__")) {
      const text = selectedKeys[0].slice(10);
      setSearchText(text);
      setSelectedKeys([]);
    }
  }, [selectedKeys, setSelectedKeys]);

  const filteredOptions = useMemo(() => {
    return options.filter((option) =>
      option?.text?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [options, searchText]);

  const handleSearch = useCallback((e) => {
    setSearchText(e.target.value);
  }, []);

  const handleReset = useCallback(() => {
    setSearchText("");
    clearFilters();
  }, [clearFilters]);

  const handleConfirm = useCallback(() => {
    if (selectedKeys.length > 0) {
      confirm();
    } else if (searchText) {
      setSelectedKeys(["__search__" + searchText]);
      confirm();
    } else {
      confirm();
    }
  }, [confirm, selectedKeys, searchText, setSelectedKeys]);

  return (
    <div className="p-2">
      <Input
        placeholder={`Search ${dataIndex.toUpperCase()}`}
        value={searchText}
        onChange={handleSearch}
        onPressEnter={handleConfirm}
        className="mb-2"
      />
      <div className="flex justify-around items-center p-1">
        <Button
          style={{ backgroundColor: currentColor }}
          onClick={handleConfirm}
          icon={<SearchOutlined />}
          size="small"
          className="w-[90px] mr-4 text-white hover:text-white ant-btn-primary"
        >
          Search
        </Button>
        <Button
          onClick={handleReset}
          size="small"
          style={{ backgroundColor: currentColor }}
          className="text-white hover:text-white ant-btn-primary"
        >
          Reset
        </Button>
      </div>
      <hr className="mt-2" />
      <div className="mt-4 h-60 overflow-y-auto">
        {filteredOptions.map((option) => (
          <div key={option.value} style={{ padding: "2px 10px" }}>
            <Checkbox
              checked={selectedKeys.includes(option.value)}
              onChange={(e) => {
                const nextSelectedKeys = e.target.checked
                  ? [...selectedKeys, option.value]
                  : selectedKeys.filter((key) => key !== option.value);
                setSelectedKeys(nextSelectedKeys);
              }}
              className="!text-white"
            >
              {option.text}
            </Checkbox>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilterDropDown;
