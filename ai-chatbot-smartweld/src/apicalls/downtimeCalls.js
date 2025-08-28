import axiosInstance from ".";

export const getDowntime = async () => {
  try {
    const getDownList = await axiosInstance.get("/downtime/getDowntime");
    return getDownList.data;
  } catch (error) {
    return error.message;
  }
};

export const getDowntimeReasons = async () => {
  try {
    const downtimeReasons = await axiosInstance.get(
      "/downtime/downtimeReasons"
    );
    return downtimeReasons.data;
  } catch (error) {
    return error.message;
  }
};

export const getDowntimeByDate = async (payload) => {
  try {
    const getCustomData = await axiosInstance.post(
      "/downtime/getCustomeDowntime",
      payload
    );
    return getCustomData.data;
  } catch (error) {
    return error.message;
  }
};

export const updateDowntimeReason = async (payload) => {
  try {
    const updateReason = await axiosInstance.post(
      "/downtime/updateDowntimeReason",
      payload
    );
    return updateReason.data;
  } catch (error) {
    return error.message;
  }
};

export const getDowntimeCounts = async () => {
  try {
    const response = await axiosInstance.get("/downtime/downtime_counts");
    return { data: response.data };
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return { error: error.response?.data?.error || error.message };
  }
};
