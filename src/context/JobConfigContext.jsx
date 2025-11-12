import React, { createContext, useContext, useState } from "react";
import {
  jobConfigGetCallApi,
  jobConfigUpdateCallApi,
} from "../helpers/BackendHelper";
import { themeToast } from "../components/ui/ThemeToaster";

const JobConfigContext = createContext();
export const useJobConfig = () => useContext(JobConfigContext);

export const JobConfigCountryOptions = [
  {
    value: "A39IBJ37TRP1C6",
    label: "Australia",
    code: "AU",
    regionType: "AUSTRALIA",
  },
  {
    value: "A2EUQ1WTGCTBG2",
    label: "Canada",
    code: "CA",
    regionType: "NORTH_AMERICA",
  },
  {
    value: "ATVPDKIKX0DER",
    label: "United States",
    code: "US",
    regionType: "NORTH_AMERICA",
  },
  {
    value: "A1AM78C64UM0Y8",
    label: "Mexico",
    code: "MX",
    regionType: "NORTH_AMERICA",
  },
  {
    value: "A2Q3Y263D00KWC",
    label: "Brazil",
    code: "BR",
    regionType: "NORTH_AMERICA",
  },
  {
    value: "A28R8C7NBKEWEA",
    label: "Ireland",
    code: "IE",
    regionType: "EUROPE",
  },
  { value: "A1RKKUPIHCS9HS", label: "Spain", code: "ES", regionType: "EUROPE" },
  {
    value: "A1F83G8C2ARO7P",
    label: "United Kingdom",
    code: "UK",
    regionType: "EUROPE",
  },
  {
    value: "A13V1IB3VIYZZH",
    label: "France",
    code: "FR",
    regionType: "EUROPE",
  },
  {
    value: "AMEN7PMS3EDWL",
    label: "Belgium",
    code: "BE",
    regionType: "EUROPE",
  },
  {
    value: "A1805IZSGTT6HS",
    label: "Netherlands",
    code: "NL",
    regionType: "EUROPE",
  },
  {
    value: "A1PA6795UKMFR9",
    label: "Germany",
    code: "DE",
    regionType: "EUROPE",
  },
  { value: "APJ6JRA9NG5V4", label: "Italy", code: "IT", regionType: "EUROPE" },
  {
    value: "A2NODRKZP88ZB9",
    label: "Sweden",
    code: "SE",
    regionType: "EUROPE",
  },
  {
    value: "A1C3SOZRARQ6R3",
    label: "Poland",
    code: "PL",
    regionType: "EUROPE",
  },
  {
    value: "A33AVAJ2PDY3EV",
    label: "Turkey",
    code: "TR",
    regionType: "EUROPE",
  },
  { value: "A1VC38T7YXB528", label: "Japan", code: "JP", regionType: "JAPAN" },
  {
    value: "A2VIGQ35RCS4UG",
    label: "United Arab Emirates",
    code: "AE",
    regionType: "UAE",
  },
  {
    value: "A19VAU5U5O7RUS",
    label: "Singapore",
    code: "SG",
    regionType: "SINGAPORE",
  },
];

export const REGION_TYPES = [
  "AUSTRALIA",
  "NORTH_AMERICA",
  "EUROPE",
  "JAPAN",
  "UAE",
  "SINGAPORE",
];

export const COUNTRIES_BY_REGION = JobConfigCountryOptions.reduce(
  (acc, country) => {
    if (!acc[country.regionType]) acc[country.regionType] = [];
    acc[country.regionType].push(country);
    return acc;
  },
  {},
);

export const JobConfigProvider = ({ children }) => {
  const [jobConfig, setJobConfig] = useState(null);
  const [jobConfigLoading, setJobConfigLoading] = useState(false);
  const [jobConfigUpdating, setJobConfigUpdating] = useState(false);

  const getJobConfigService = async () => {
    try {
      setJobConfigLoading(true);
      const { data } = await jobConfigGetCallApi();
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
        _id: "690fde426093e34cb2cfd4a1",
        checkAvailability:
          payload?.checkAvailability ?? jobConfig?.checkAvailability ?? false,
        checkViolations:
          payload?.checkViolations ?? jobConfig?.checkViolations ?? false,
        sendErrorEmails:
          payload?.sendErrorEmails ?? jobConfig?.sendErrorEmails ?? false,
        searchRegionType:
          payload?.searchRegionType ?? jobConfig?.searchRegionType ?? [],
      };
      console.log(formattedPayload);
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
        updateJobConfigService,
      }}
    >
      {children}
    </JobConfigContext.Provider>
  );
};

export default JobConfigProvider;
