import axiosInstance from ".";
import queryString from "query-string";

export const getMachineTypes = async () => {
  try {
    const getMacTypes = await axiosInstance.get(
      "/machineType/getMachineTypeByOrgId"
    );
    return getMacTypes.data;
  } catch (error) {
    return error.message;
  }
};

export const getMachineTypesByOrgAndRole = async () => {
  try {
    const getMacTypes = await axiosInstance.get(
      "/machineType/getMachineTypesByOrgAndRole"
    );
    return getMacTypes.data;
  } catch (error) {
    return error.message;
  }
};

export const getMachineTypesForOperator = async () => {
  try {
    const getMacTypes = await axiosInstance.get(
      "/machineType/getMachineTypeForOpt"
    );
    return getMacTypes.data;
  } catch (error) {
    return error.message;
  }
};

export const updateMachineTypes = async (payload) => {
  try {
    const updateMacTypes = await axiosInstance.patch(
      `/machineType/update/${payload.id}`,
      payload
    );
    return updateMacTypes.data;
  } catch (error) {
    return error.message;
  }
};

export const saveNewMachineType = async (payload) => {
  try {
    const saveMachineType = await axiosInstance.post(
      "/machineType/create",
      payload
    );
    return saveMachineType.data;
  } catch (error) {
    return error.message;
  }
};

export const deleteMachineType = async (payload) => {
  try {
    const saveMachineType = await axiosInstance.delete(
      `/machineType/delete/${payload.id}`,
      payload
    );
    return saveMachineType.data;
  } catch (error) {
    return error.message;
  }
};

export const getPreviousJobSerial = async () => {
  try {
    const getPrevJobSerial = await axiosInstance.get(
      "/machineType/getPreviousJobSerial"
    );
    return getPrevJobSerial.data;
  } catch (error) {
    return error.message;
  }
};

export const getPreviousJobSerialAndName = async (payload) => {
  try {
    const getPrevJobNameSerial = await axiosInstance.post(
      "/machineType/getPreviousJobData",
      payload
    );
    return getPrevJobNameSerial.data;
  } catch (error) {
    return error.message;
  }
};

export const getOperatorsNameByMachineType = async (payload) => {
  try {
    const getOptName = await axiosInstance.post(
      "/machineType/getOperatorByMachineType",
      payload
    );
    return getOptName.data;
  } catch (error) {
    return error.message;
  }
};

export const getMachineTypeThresholds = async (payload) => {
  try {
    const getOptName = await axiosInstance.post(
      "/machineType/getThreholdParams",
      payload
    );
    return getOptName.data;
  } catch (error) {
    return error.message;
  }
};

export const updateJobSerial = async (payload) => {
  try {
    const updateJobSl = await axiosInstance.post(
      "/machineType/updateJobSerial",
      payload
    );
    return updateJobSl.data;
  } catch (error) {
    return error.message;
  }
};

export const getOperatorsStations = async () => {
  try {
    const optStations = await axiosInstance.get(
      "/machineType/operatorSpecificStations"
    );
    return optStations.data;
  } catch (error) {
    return error.message;
  }
};

export const getHardwareMachWireDetails = async (businessDate, shifts) => {
  console.log("API caling for getting hadrdeware data", businessDate, shifts);
  try {
    const optStations = await axiosInstance.get(
      queryString.stringifyUrl({
        url: "/machineType/operatorSpecsAndWireSpool",
        query: {
          businessDate,
          shifts,
        },
      })
    );
    return optStations.data;
  } catch (error) {
    return error.message;
  }
};

export const getMachineLoginMetrics = async (payload) => {
  try {
    const getMachineLoginMetrics = await axiosInstance.get(
      queryString.stringifyUrl({
        url: "/machineType/machineLogMetrics",
        query: payload,
      })
    );
    return getMachineLoginMetrics.data;
  } catch (error) {
    return error.message;
  }
};

export const currentlyrunningShift = async (payload) => {
  try {
    const getShift = await axiosInstance.get(
      queryString.stringifyUrl({
        url: "/machineType/currentlyRunningShift",
        query: payload,
      })
    );
    return getShift.data;
  } catch (error) {
    return error.message;
  }
};

export const machineIdlenessStatus = async (payload) => {
  try {
    const getShift = await axiosInstance.get(
      queryString.stringifyUrl({
        url: "/machineType/machineIdleStatus",
        query: payload,
      })
    );
    return getShift.data;
  } catch (error) {
    return error.message;
  }
};

export const getMachineTimeline = async (payload) => {
  try {
    const getMachineTimeline = await axiosInstance.get(
      queryString.stringifyUrl({
        url: "/machineType/machineTimeline",
        query: payload,
      })
    );
    return getMachineTimeline.data;
  } catch (error) {
    return error.message;
  }
};
