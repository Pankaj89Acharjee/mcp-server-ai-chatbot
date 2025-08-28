import React, { useEffect, useCallback, useMemo } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Row,
  Col,
  Space,
  Button,
  Switch,
  InputNumber,
  DatePicker,
  TimePicker,
} from "antd";

const ReusableModal = ({
  title,
  isOpen,
  onClose,
  onSubmit,
  initialValues = {},
  fields = [],
  loading = false,
  currentColor = "#1890ff",
  customHandlers = {},
  className = "",
  width = 800,
  maskClosable = true,
  destroyOnClose = true,
}) => {
  const [form] = Form.useForm();

  // Reset and set form values when modal opens or initialValues change
  useEffect(() => {
    if (isOpen) {
      form.resetFields();
      form.setFieldsValue(initialValues);
    }
  }, [isOpen, initialValues, form]);

  // Handle form submission with error handling
  const handleSubmit = useCallback(
    async (values) => {
      try {
        await onSubmit?.(values);
        form.resetFields();
      } catch (error) {
        console.error("Form submission error:", error);
      }
    },
    [onSubmit, form]
  );

  // Handle modal close
  const handleClose = useCallback(() => {
    form.resetFields();
    onClose?.();
  }, [form, onClose]);

  // Handle form reset
  const handleReset = useCallback(() => {
    form.resetFields();
    form.setFieldsValue(initialValues);
  }, [form, initialValues]);

  // Memoized field renderer for better performance
  const renderField = useCallback(
    (field, colIndex) => {
      const commonProps = {
        key: colIndex,
        span: field.colSpan || 12,
      };

      const formItemProps = {
        name: field.name,
        label: field.label,
        rules: field.rules,
        className: "text-center text-white",
      };

      switch (field.type) {
        case "select":
          return (
            <Col {...commonProps}>
              <Form.Item {...formItemProps}>
                <Select
                  placeholder={field.placeholder}
                  className="border border-gray-500 rounded-md text-left"
                  onChange={field.onChange || customHandlers[field.name]}
                  disabled={field.disabled}
                  allowClear={field.allowClear}
                  mode={field.mode}
                  showSearch={field.showSearch}
                  filterOption={field.filterOption}
                >
                  {field.options?.map((option, optionIndex) => (
                    <Select.Option key={optionIndex} value={option.value}>
                      {option.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          );

        case "input":
          return (
            <Col {...commonProps}>
              <Form.Item {...formItemProps}>
                <Input
                  type={field.inputType || "text"}
                  placeholder={field.placeholder}
                  className="border-1 border-gray-600"
                  disabled={field.disabled}
                  maxLength={field.maxLength}
                  showCount={field.showCount}
                  addonBefore={field.addonBefore}
                  addonAfter={field.addonAfter}
                  prefix={field.prefix}
                  suffix={field.suffix}
                />
              </Form.Item>
            </Col>
          );

        case "textarea":
          return (
            <Col {...commonProps}>
              <Form.Item {...formItemProps}>
                <Input.TextArea
                  placeholder={field.placeholder}
                  className="border-1 border-gray-600"
                  disabled={field.disabled}
                  maxLength={field.maxLength}
                  showCount={field.showCount}
                  rows={field.rows || 4}
                  autoSize={field.autoSize}
                />
              </Form.Item>
            </Col>
          );

        case "number":
          return (
            <Col {...commonProps}>
              <Form.Item {...formItemProps}>
                <InputNumber
                  placeholder={field.placeholder}
                  className="border-1 border-gray-600 w-full"
                  min={field.min}
                  max={field.max}
                  precision={field.precision}
                  step={field.step}
                  disabled={field.disabled}
                  formatter={field.formatter}
                  parser={field.parser}
                  controls={field.controls}
                />
              </Form.Item>
            </Col>
          );

        case "date":
          return (
            <Col {...commonProps}>
              <Form.Item {...formItemProps}>
                <DatePicker
                  className="border-1 border-gray-600 w-full"
                  format={field.format || "DD MMMM YYYY"}
                  disabled={field.disabled}
                  showTime={field.showTime}
                  picker={field.picker}
                  disabledDate={field.disabledDate}
                  placeholder={field.placeholder}
                />
              </Form.Item>
            </Col>
          );

        case "time":
          return (
            <Col {...commonProps}>
              <Form.Item {...formItemProps}>
                <TimePicker
                  format={field.format || "h:mm A"}
                  use12Hours={field.use12Hours !== false}
                  className="border-1 border-gray-600 bg-slate-300 w-full"
                  placeholder={field.placeholder || "Select Time"}
                  disabled={field.disabled}
                  minuteStep={field.minuteStep}
                  hourStep={field.hourStep}
                  secondStep={field.secondStep}
                  disabledTime={field.disabledTime}
                />
              </Form.Item>
            </Col>
          );

        case "switch":
          return (
            <Col {...commonProps}>
              <Form.Item {...formItemProps} valuePropName="checked">
                <Switch
                  checkedChildren={field.checkedChildren || "Yes"}
                  unCheckedChildren={field.unCheckedChildren || "No"}
                  onChange={field.onChange || customHandlers[field.name]}
                  className="bg-gray-500 shadow-lg shadow-gray-300 hover:bg-gray-700 flex self-start"
                  disabled={field.disabled}
                  size={field.size}
                />
              </Form.Item>
            </Col>
          );

        case "password":
          return (
            <Col {...commonProps}>
              <Form.Item {...formItemProps}>
                <Input.Password
                  placeholder={field.placeholder}
                  className="border-1 border-gray-600"
                  disabled={field.disabled}
                  visibilityToggle={field.visibilityToggle !== false}
                />
              </Form.Item>
            </Col>
          );

        default:
          console.warn(`Unknown field type: ${field.type}`);
          return null;
      }
    },
    [customHandlers]
  );

  // Memoized fields rendering
  const renderedFields = useMemo(() => {
    return fields.map((row, rowIndex) => (
      <Row key={rowIndex} gutter={[12, 12]}>
        {row.map((field, colIndex) => renderField(field, colIndex))}
      </Row>
    ));
  }, [fields, renderField]);

  // Don't render modal if not open (optimization)
  if (!isOpen) return null;

  return (
    <Modal
      title={title}
      open={isOpen}
      onCancel={handleClose}
      footer={false}
      destroyOnClose={destroyOnClose}
      className={`text-center font-semibold ${className}`}
      width={width}
      maskClosable={maskClosable}
      centered
    >
      <hr className="mb-4" />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
        className="p-2 rounded-lg text-white dark:bg-secondary-dark-bg dark:text-gray-200 w-full h-full"
        // preserve={false}
      >
        {renderedFields}

        <Form.Item className="flex items-center justify-end mt-6 mb-2 flex-wrap">
          <Space size="middle" className="flex-wrap">
            <Button
              style={{ backgroundColor: currentColor, color: "white" }}
              htmlType="submit"
              loading={loading}
              disabled={loading}
            >
              Submit
            </Button>

            <Button
              style={{ backgroundColor: currentColor, color: "white" }}
              disabled={loading}
              onClick={handleReset}
            >
              Reset
            </Button>

            {/* <Button
              onClick={handleClose}
              disabled={loading}
              style={{ backgroundColor: "#6b7280", color: "white" }}
            >
              Cancel
            </Button> */}
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ReusableModal;
