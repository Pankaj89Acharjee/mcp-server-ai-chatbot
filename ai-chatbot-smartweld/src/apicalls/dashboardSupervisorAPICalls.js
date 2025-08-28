import axiosInstance from ".";
import queryString from "query-string";

export const getTotalJobsProduced = async () => {
  try {
    const getDownList = await axiosInstance.get("/dashboard/totalJobsProduced");
    return { data: getDownList.data };
  } catch (error) {
    return { error: error.response?.data?.error || error.message };
  }
};

export const getCardsValueForDashboard = async (businessDate, shifts) => {
  try {
    const response = await axiosInstance.post(
      "/dashboard/cardsValueForDashboard",
      {
        businessDate,
        shifts,
      }
    );
    return { data: response.data };
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return { error: error.response?.data?.error || error.message };
  }
};

export const getMachinesByType = async (machineIds, businessDate, shifts) => {
  try {
    const response = await axiosInstance.post("/dashboard/machines_by_type", {
      machineIds,
      businessDate,
      shifts,
    });
    return { data: response.data };
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return { error: error.response?.data?.error || error.message };
  }
};

export const getAvailabilitiesCards = async (businessDate, shifts) => {
  try {
    const response = await axiosInstance.get(
      queryString.stringifyUrl({
        url: "/dashboard/availabilities_cards",
        query: { businessDate, shifts },
      })
    );
    return { data: response.data };
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return { error: error.response?.data?.error || error.message };
  }
};

export const getAvailabilitiesChart = async (businessDate, shifts) => {
  try {
    const response = await axiosInstance.get(
      queryString.stringifyUrl({
        url: "/dashboard/availabilities_chart",
        query: { businessDate, shifts },
      })
    );
    return { data: response.data };
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return { error: error.response?.data?.error || error.message };
  }
};

export const getAvailabilitiesRecords = async (
  businessDate,
  shifts,
  page = 1,
  pageSize = 10
) => {
  try {
    const response = await axiosInstance.get(
      queryString.stringifyUrl({
        url: "/dashboard/availabilities_records",
        query: { businessDate, shifts, page, pageSize },
      })
    );
    return { data: response.data };
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return { error: error.response?.data?.error || error.message };
  }
};

export const getProductivityCards = async (businessDate, shifts) => {
  try {
    const response = await axiosInstance.get(
      queryString.stringifyUrl({
        url: "/dashboard/productivity/cards",
        query: { businessDate, shifts },
      })
    );
    return { data: response.data };
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return { error: error.response?.data?.error || error.message };
  }
};

export const getProductivityRecords = async (
  businessDate,
  shifts,
  page = 1,
  pageSize = 10
) => {
  try {
    const response = await axiosInstance.get(
      queryString.stringifyUrl({
        url: "/dashboard/productivity/records",
        query: { businessDate, shifts, page, pageSize },
      })
    );
    return { data: response.data };
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return { error: error.response?.data?.error || error.message };
  }
};

export const getProductivityProductionChart = async (
  businessDate,
  shifts,
  timeRange,
  dataType
) => {
  try {
    const response = await axiosInstance.get(
      queryString.stringifyUrl({
        url: "/dashboard/productivity/production/chart",
        query: {
          businessDate,
          shifts,
          timeRange: timeRange.toLowerCase().trim(),
          dataType: dataType.toLowerCase().trim(),
        },
      })
    );
    return { data: response.data };
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return { error: error.response?.data?.error || error.message };
  }
};

export const getAllDeviationRecords = async (
  businessDate,
  shifts,
  page = 1,
  pageSize = 10
) => {
  try {
    const response = await axiosInstance.get(
      queryString.stringifyUrl({
        url: "/dashboard/quality/deviationRecords",
        query: { businessDate, shifts, page, pageSize },
      })
    );
    return { data: response.data };
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return { error: error.response?.data?.error || error.message };
  }
};
