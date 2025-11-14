import React, { createContext, useContext, useState } from "react";
import {
  jobConfigGetCallApi,
  jobConfigUpdateCallApi,
} from "../helpers/BackendHelper";
import { themeToast } from "../components/ui/ThemeToaster";
import { CountryOptions } from "../utils";

const JobConfigContext = createContext();
export const useJobConfig = () => useContext(JobConfigContext);

export const COUNTRIES_BY_REGION = CountryOptions.reduce((acc, country) => {
  if (!acc[country.regionType]) acc[country.regionType] = [];
  acc[country.regionType].push(country);
  return acc;
}, {});

export const JobConfigProvider = ({ children }) => {
  const [jobConfig, setJobConfig] = useState(null);
  const [jobConfigLoading, setJobConfigLoading] = useState(false);
  const [jobConfigUpdating, setJobConfigUpdating] = useState(false);

  const getJobConfigService = async () => {
    try {
      setJobConfigLoading(true);
      const { data } = await jobConfigGetCallApi();
      if (data === null) {
        await updateJobConfigService();
      }
      setJobConfig(data);
      return data;
    } catch (error) {
      themeToast.error(
        error?.response?.data?.message || "Failed to fetch job configuration.",
      );
      throw error;
    } finally {
      setJobConfigLoading(false);
    }
  };
  const updateJobConfigService = async (payload = {}) => {
    try {
      setJobConfigUpdating(true);

      const formattedPayload = {
        _id: jobConfig?._id,
        checkAvailability:
          payload?.checkAvailability ?? jobConfig?.checkAvailability ?? false,
        checkViolations:
          payload?.checkViolations ?? jobConfig?.checkViolations ?? false,
        sendErrorEmails:
          payload?.sendErrorEmails ?? jobConfig?.sendErrorEmails ?? false,
        searchRegionType:
          payload?.searchRegionType ?? jobConfig?.searchRegionType ?? [],
      };
      const { data } = await jobConfigUpdateCallApi(formattedPayload);
      setJobConfig(data);
      themeToast?.success("✅ Job configuration updated successfully!");
      return data;
    } catch (error) {
      themeToast.error(
        error?.response?.data?.message || "Failed to update job configuration.",
      );
      throw error;
    } finally {
      setJobConfigUpdating(false);
    }
  };

  return (
    <JobConfigContext.Provider
      value={{
        jobConfig,
        setJobConfig,
        jobConfigLoading,
        jobConfigUpdating,
        getJobConfigService,
        COUNTRIES_BY_REGION,
        updateJobConfigService,
      }}
    >
      {children}
    </JobConfigContext.Provider>
  );
};

export default JobConfigProvider;
