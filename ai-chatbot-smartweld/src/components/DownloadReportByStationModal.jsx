import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Button,
  Select,
  Space,
  Row,
  Col,
  DatePicker,
  Switch,
} from "antd";

const { RangePicker } = DatePicker;

const DownloadReportByStation = ({
  openModal,
  setOpenModal,
  onSubmitHandler,
  uniqueMacTypes,
  uniqueShiftName,
  uniqueJobNames,
  uniqueJobSerial,
  onJobNameChange,
  currentColor,
  loading,
  onDatePickerTypeChangeHandler,
  mode, //Prop to determine the mode of the modal (station or job)
}) => {
  const [isRangePicker, setIsRangePicker] = useState(false); // State to toggle between single date and range picker

  useEffect(() => {
    if (mode === "station") {
      onDatePickerTypeChangeHandler(isRangePicker);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onDatePickerTypeChangeHandler]);

  const handleDatePickerChange = (checked) => {
    setIsRangePicker(checked);
    onDatePickerTypeChangeHandler(checked);
  };

  return (
    <Modal
      title={
        mode === "station"
          ? "Download Report by Station"
          : "Download Report by Job"
      }
      open={openModal}
      onCancel={() => setOpenModal(false)}
      footer={false}
      className="text-center font-semibold"
    >
      <hr />
      <Form
        layout="vertical"
        className="p-2 rounded-lg text-white dark:bg-secondary-dark-bg dark:text-gray-200"
        onFinish={onSubmitHandler}
      >
        {mode === "station" && (
          <>
            <Row gutter={[10, 10]}>
              <Col span={12}>
                <Form.Item
                  name="machineType"
                  label="Select Machine Name"
                  rules={[
                    { required: true, message: "Station Name is required" },
                  ]}
                  className="text-center text-white"
                >
                  <Select
                    placeholder="Select station name"
                    className="border border-gray-500 rounded-md text-left"
                  >
                    {uniqueMacTypes?.map((machine) => (
                      <Select.Option key={machine} value={machine}>
                        {machine}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  name="shift"
                  label="Select Shift"
                  rules={[{ required: true, message: "Shift is required" }]}
                  className="text-center text-white"
                >
                  <Select
                    placeholder="Select shift"
                    className="border border-gray-500 rounded-md text-left"
                  >
                    {uniqueShiftName?.map((shift) => (
                      <Select.Option key={shift} value={shift}>
                        {shift}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            {/* Toggle between Single Date and Date Range */}
            <Row gutter={[10, 10]}>
              <Col span={12}>
                <Form.Item
                  label="Select Date Type"
                  className="flex text-center text-white"
                >
                  <Switch
                    checked={isRangePicker}
                    onChange={handleDatePickerChange}
                    checkedChildren="Range"
                    unCheckedChildren="Single"
                    className="bg-gray-400 justify-center items-center text-center"
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                {/* Date Picker or Range Picker */}
                <Form.Item
                  name="target_date"
                  label={isRangePicker ? "Target Date Range" : "Target Date"}
                  rules={[
                    {
                      required: true,
                      message: isRangePicker
                        ? "Date range is required"
                        : "Target date is required",
                    },
                  ]}
                  className="text-center text-white"
                >
                  {isRangePicker ? (
                    <RangePicker
                      className="border-1 border-gray-600 w-full"
                      format="DD MMMM YYYY"
                      autoComplete="off"
                      placeholder={["Start date", "End date"]}
                    />
                  ) : (
                    <DatePicker
                      className="border-1 border-gray-600 w-full"
                      format="DD MMMM YYYY"
                      autoComplete="off"
                      placeholder="Select target date"
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
          </>
        )}

        {mode === "job" && (
          <>
            <Row gutter={[10, 10]}>
              <Col span={12}>
                <Form.Item
                  name="jobName"
                  label="Select Job Name"
                  rules={[{ required: true, message: "Job Name is required" }]}
                  className="text-center text-white"
                >
                  <Select
                    placeholder="Select job name"
                    className="border border-gray-500 rounded-md text-left"
                    onChange={(e) => onJobNameChange(e)}
                    allowClear
                  >
                    {uniqueJobNames?.map((jobName) => (
                      <Select.Option key={jobName} value={jobName}>
                        {jobName}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  name="jobSerial"
                  label="Select Job Serial"
                  rules={[
                    { required: true, message: "Job serial is required" },
                  ]}
                  className="text-center text-white"
                >
                  <Select
                    placeholder="Select job serial"
                    className="border border-gray-500 rounded-md text-left"
                  >
                    {uniqueJobSerial?.map((jobSerial) => (
                      <Select.Option key={jobSerial} value={jobSerial}>
                        {jobSerial}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </>
        )}

        <Form.Item className="flex items-center justify-end">
          <Space>
            <Button
              style={{ backgroundColor: currentColor, color: "white" }}
              htmlType="submit"
              disabled={loading}
            >
              Submit
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default DownloadReportByStation;
