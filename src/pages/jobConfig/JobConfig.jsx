import React, { useEffect, useState } from "react";
import { Box, Typography, CircularProgress, Paper, Alert } from "@mui/material";
import {
  useJobConfig,
  COUNTRIES_BY_REGION,
  REGION_TYPES,
} from "../../context/JobConfigContext";
import ThemeSelectField from "../../components/ui/ThemeSelectField";
import ThemeButton from "../../components/ui/ThemeButton";
import ThemeChip from "../../components/ui/ThemeChip";
import { PiUserSwitch } from "react-icons/pi";
import { FiAlertTriangle, FiCheckCircle, FiSettings } from "react-icons/fi";
import Tooltip from "@mui/material/Tooltip";

const JobConfig = () => {
  const {
    jobConfig,
    jobConfigLoading,
    jobConfigUpdating,
    getJobConfigService,
    updateJobConfigService,
  } = useJobConfig();

  const [selectedCountry, setSelectedCountry] = useState("");
  const [allCountry, setAllCountry] = useState("");
  const [availability, setAvailability] = useState(false);
  const [violations, setViolations] = useState(false);
  const [errors, setErrors] = useState(false);
  const [regionData, setRegionData] = useState([]);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    loadJobConfig();
  }, []);

  const loadJobConfig = async () => {
    try {
      setApiError(null);
      const config = await getJobConfigService();

      if (!config) {
        setApiError("No configuration data received from server");
        return;
      }

      setAvailability(config?.checkAvailability ?? false);
      setViolations(config?.checkViolations ?? false);
      setErrors(config?.sendErrorEmails ?? false);
      setSelectedCountry(config?.marketPlaceId || "");
      setAllCountry(config?.allCountry || "");

      const regionSetup = REGION_TYPES.map((regionType) => {
        const backendRegion = config?.searchRegionType?.find(
          (r) => r.regionType === regionType,
        );
        const availableMarketplaces = COUNTRIES_BY_REGION[regionType] || [];
        const selectedMarketplaces = backendRegion?.marketPlaceIds || [];
        const isActive = !!backendRegion?.marketPlaceIds?.length;

        return {
          regionType,
          selectedMarketplaces,
          active: isActive,
          marketplaces: availableMarketplaces,
          backendMarketplaceIds: backendRegion?.marketPlaceIds || [],
        };
      });

      setRegionData(regionSetup);
    } catch (error) {
      setApiError(error.message || "Failed to load configuration");
      initializeWithDefaults();
    }
  };

  const initializeWithDefaults = () => {
    setAvailability(false);
    setViolations(true);
    setErrors(false);
    setSelectedCountry("");
    setAllCountry("");

    const defaultRegionSetup = REGION_TYPES.map((regionType) => {
      const availableMarketplaces = COUNTRIES_BY_REGION[regionType] || [];
      return {
        regionType,
        selectedMarketplaces: [],
        active: false,
        marketplaces: availableMarketplaces,
        backendMarketplaceIds: [],
      };
    });

    setRegionData(defaultRegionSetup);
  };

  const handleAllCountryChange = async (value) => {
    try {
      setAllCountry(value);
      await updateJobConfigService({ allCountry: value });
    } catch {}
  };

  const handleCountryChange = async (value) => {
    try {
      setSelectedCountry(value);
      await updateJobConfigService({ marketPlaceId: value });
    } catch {}
  };

  const handleSwitchChange = async (key, value) => {
    try {
      const updatedStates = {
        checkAvailability: key === "availability" ? value : availability,
        checkViolations: key === "violations" ? value : violations,
        sendErrorEmails: key === "errors" ? value : errors,
      };

      if (key === "availability") setAvailability(value);
      if (key === "violations") setViolations(value);
      if (key === "errors") setErrors(value);

      await updateJobConfigService(updatedStates);
    } catch {}
  };

  const handleRegionChange = (index, field, value) => {
    setRegionData((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          const updatedItem = { ...item, [field]: value };
          // Update active status based on selected marketplaces
          if (field === "selectedMarketplaces") {
            updatedItem.active = updatedItem.selectedMarketplaces.length > 0;
          }
          return updatedItem;
        }
        return item;
      }),
    );
  };

  const handleMarketplaceSelect = (index, selectedValues) => {
    handleRegionChange(index, "selectedMarketplaces", selectedValues);
  };

  const handleSubmit = async () => {
    try {
      const formattedSearchRegionType = regionData
        .filter((r) => r.selectedMarketplaces.length > 0)
        .map((r) => ({
          regionType: r.regionType,
          marketPlaceIds: r.selectedMarketplaces,
        }));

      if (formattedSearchRegionType.length === 0) {
        return;
      }
      console.log(formattedSearchRegionType);
      await updateJobConfigService({
        searchRegionType: formattedSearchRegionType,
      });

      setTimeout(() => loadJobConfig(), 1000);
    } catch {}
  };

  const getActiveRegionsCount = () =>
    regionData.filter((region) => region.active).length;

  // Custom Switch Component
  const CustomSwitch = ({
    checked,
    onChange,
    disabled = false,
    color = "primary",
  }) => {
    const getColors = () => {
      switch (color) {
        case "success":
          return {
            track: checked ? "var(--color-success)" : "var(--color-border)",
            thumb: "white",
          };
        case "warning":
          return {
            track: checked ? "var(--color-warning)" : "var(--color-border)",
            thumb: "white",
          };
        case "error":
          return {
            track: checked ? "var(--color-danger)" : "var(--color-border)",
            thumb: "white",
          };
        default:
          return {
            track: checked ? "var(--color-primary)" : "var(--color-border)",
            thumb: "white",
          };
      }
    };

    const colors = getColors();

    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 ease-in-out
          ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        `}
        style={{
          backgroundColor: colors.track,
          border: `1px solid ${checked ? colors.track : "var(--color-border)"}`,
        }}
      >
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white transition-all duration-200 ease-in-out
            ${checked ? "translate-x-6" : "translate-x-1"}
            shadow-sm
          `}
          style={{
            backgroundColor: colors.thumb,
          }}
        />
      </button>
    );
  };

  if (jobConfigLoading && !jobConfig && !apiError) {
    return (
      <div className="mx-auto mb-12 mt-8 min-h-screen max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-96 flex-col items-center justify-center gap-4">
          <CircularProgress size={40} sx={{ color: "var(--color-primary)" }} />
          <Typography variant="h6" style={{ color: "var(--color-text)" }}>
            Loading Job Configuration...
          </Typography>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto mb-12 mt-8 min-h-screen max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between pt-4">
        <h1
          className="flex items-center gap-4 text-3xl font-bold"
          style={{ color: "var(--color-text)" }}
        >
          <PiUserSwitch size={30} style={{ color: "var(--color-primary)" }} />
          Job Configuration
        </h1>

        {jobConfigUpdating && (
          <div className="flex items-center gap-2">
            <CircularProgress
              size={20}
              sx={{ color: "var(--color-primary)" }}
            />
            <span style={{ color: "var(--color-text-muted)" }}>
              Updating...
            </span>
          </div>
        )}
      </div>

      {apiError && (
        <div
          className="mb-6 rounded-lg p-4"
          style={{
            backgroundColor: "var(--color-danger-200)",
            border: "1px solid var(--color-danger-200)",
            color: "var(--color-text)",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <Typography variant="h6" style={{ color: "var(--color-text)" }}>
                <FiAlertTriangle className="mr-2 inline" />
                API Connection Error
              </Typography>
              <Typography
                variant="body2"
                style={{ color: "var(--color-text-muted)", marginTop: 4 }}
              >
                {apiError}
              </Typography>
            </div>
            <ThemeButton
              size="sm"
              tone="danger"
              variant="outlined"
              onClick={loadJobConfig}
            >
              RETRY
            </ThemeButton>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div
          className="flex items-center gap-4 rounded-lg p-5 shadow-sm transition hover:shadow-md"
          style={{ backgroundColor: "var(--color-surface)" }}
        >
          <div
            className="flex h-12 w-12 items-center justify-center rounded-lg"
            style={{ backgroundColor: "rgba(59,130,246,0.15)" }}
          >
            <FiSettings size={22} style={{ color: "var(--color-primary)" }} />
          </div>
          <div>
            <p className="text-sm text-gray-400">Active Regions</p>
            <h2
              className="text-2xl font-bold"
              style={{ color: "var(--color-text)" }}
            >
              {getActiveRegionsCount()}
            </h2>
          </div>
        </div>

        <div
          className="flex items-center gap-4 rounded-lg p-5 shadow-sm transition hover:shadow-md"
          style={{ backgroundColor: "var(--color-surface)" }}
        >
          <div
            className="flex h-12 w-12 items-center justify-center rounded-lg"
            style={{ backgroundColor: "rgba(34,197,94,0.15)" }}
          >
            <FiCheckCircle
              size={22}
              style={{ color: "var(--color-success)" }}
            />
          </div>
          <div>
            <p className="text-sm text-gray-400">Enabled Features</p>
            <h2
              className="text-2xl font-bold"
              style={{ color: "var(--color-text)" }}
            >
              {[availability, violations, errors].filter(Boolean).length}
            </h2>
          </div>
        </div>

        <div
          className="flex items-center gap-4 rounded-lg p-5 shadow-sm transition hover:shadow-md"
          style={{ backgroundColor: "var(--color-surface)" }}
        >
          <div
            className="flex h-12 w-12 items-center justify-center rounded-lg"
            style={{ backgroundColor: "rgba(239,68,68,0.15)" }}
          >
            <FiAlertTriangle
              size={22}
              style={{ color: "var(--color-error)" }}
            />
          </div>
          <div>
            <p className="text-sm text-gray-400">Configuration Issues</p>
            <h2
              className="text-2xl font-bold"
              style={{ color: "var(--color-text)" }}
            >
              {apiError ? 1 : 0}
            </h2>
          </div>
        </div>
      </div>

      {/* Country Configuration Card - ORIGINAL STYLE */}
      <Paper
        elevation={1}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 2,
          backgroundColor: "var(--color-surface)",
          border: "1px solid #e5e7eb",
          boxShadow: "0 1px 3px 0 var(--color-shadow-light)",
        }}
      >
        <Typography
          variant="h6"
          fontWeight="bold"
          mb={2}
          color="var(--color-text)"
        >
          Country Configuration
        </Typography>

        <Box sx={{ display: "grid", gap: 2 }}>
          <ThemeSelectField
            countriesFlags
            label="Marketplace Selection"
            name="countrySelector"
            value={selectedCountry}
            onChange={handleCountryChange}
            options={Object.values(COUNTRIES_BY_REGION)
              .flat()
              .map((c) => ({
                label: `${c.label} (${c.code})`,
                value: c.value,
              }))}
            placeholder="Select Marketplace"
            fullWidth
          />
        </Box>
      </Paper>

      {/* Feature Toggles Card - UPDATED SWITCHES */}
      <Paper
        elevation={1}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 2,
          backgroundColor: "var(--color-surface)",
          border: "1px solid #e5e7eb",
          boxShadow: "0 1px 3px 0 var(--color-shadow-light)",
        }}
      >
        <Typography
          variant="h6"
          fontWeight="bold"
          mb={2}
          color="var(--color-text)"
        >
          Feature Configuration
        </Typography>

        <Box display="flex" flexDirection="column" gap={2}>
          {[
            {
              label: "Availability Check",
              description: "Monitor product availability",
              color: "success",
              key: "availability",
              value: availability,
            },
            {
              label: "Violations Check",
              description: "Detect compliance issues",
              color: "success",
              key: "violations",
              value: violations,
            },
            {
              label: "Send Error Emails",
              description: "Receive notifications for errors",
              color: "success",
              key: "errors",
              value: errors,
            },
          ].map((sw) => (
            <Box
              key={sw.key}
              sx={{
                p: 2,
                borderRadius: 1,
                border: "1px solid #e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "var(--color-surface)",
                "&:hover": {
                  backgroundColor: "var(--color-hover)",
                },
              }}
            >
              <Box>
                <Typography
                  variant="body1"
                  fontWeight="medium"
                  color="var(--color-text)"
                >
                  {sw.label}
                </Typography>
                <Typography variant="body2" color="var(--color-text-muted)">
                  {sw.description}
                </Typography>
              </Box>
              <CustomSwitch
                checked={sw.value}
                onChange={(value) => handleSwitchChange(sw.key, value)}
                disabled={jobConfigUpdating}
                color={sw.color}
              />
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Region Configuration Card - UPDATED WITHOUT CHECKBOXES */}
      <Paper
        elevation={1}
        sx={{
          p: 3,
          borderRadius: 2,
          backgroundColor: "var(--color-surface)",
          border: "1px solid #e5e7eb",
          boxShadow: "0 1px 3px 0 var(--color-shadow-light)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h6" fontWeight="bold" color="var(--color-text)">
            Region Configuration
          </Typography>
          <Typography variant="body2" color="var(--color-text-muted)">
            {getActiveRegionsCount()} of {REGION_TYPES.length} regions active
          </Typography>
        </Box>

        <Box
          sx={{
            display: { xs: "none", sm: "grid" },
            gridTemplateColumns: "220px 1fr 120px",
            gap: 2,
            px: 1,
            mb: 1,
            color: "var(--color-text-muted)",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          <div>Region</div>
          <div style={{ textAlign: "center" }}>Marketplaces</div>
          <div style={{ textAlign: "center" }}>Status</div>
        </Box>

        <Box display="flex" flexDirection="column" gap={2}>
          {regionData.map((region, index) => (
            <Box
              key={region.regionType}
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "220px 1fr 120px",
                },
                gap: { xs: 2, sm: 8 },
                alignItems: "center",
                border: "1px solid #e5e7eb",
                borderRadius: 1,
                p: 2,
                backgroundColor: "var(--color-surface)",
                "&:hover": {
                  backgroundColor: "var(--color-hover)",
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  height: "100%",
                }}
              >
                <Box>
                  <Typography
                    variant="body1"
                    fontWeight="medium"
                    color="var(--color-text)"
                  >
                    {region.regionType.replace(/_/g, " ")}
                  </Typography>
                  <Typography variant="caption" color="var(--color-text-muted)">
                    {region.marketplaces.length} marketplaces available
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  textAlign: "center",
                }}
              >
                <Box sx={{ width: "100%", maxWidth: "400px" }}>
                  <ThemeSelectField
                    countriesFlags
                    placeholder="Select marketplace region IDs"
                    value={region.selectedMarketplaces}
                    onChange={(value) => handleMarketplaceSelect(index, value)}
                    options={region.marketplaces.map((m) => ({
                      label: `${m.label} (${m.code})`,
                      value: m.value,
                    }))}
                    fullWidth
                    multiple
                  />
                </Box>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <ThemeChip
                  label={region.active ? "ACTIVE" : "INACTIVE"}
                  tone={region.active ? "success" : "danger"}
                  variant="filled"
                  size="sm"
                />
              </Box>
            </Box>
          ))}
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            mt: 3,
          }}
        >
          <Tooltip
            title={
              regionData.some((r) => r.selectedMarketplaces.length > 0)
                ? "Save region configuration"
                : "Select at least one region with marketplaces to enable"
            }
            arrow
          >
            <span>
              <ThemeButton
                onClick={handleSubmit}
                disabled={
                  jobConfigUpdating ||
                  !regionData.some((r) => r.selectedMarketplaces.length > 0)
                }
                tone="primary"
                variant="contained"
                size="md"
              >
                {jobConfigUpdating ? (
                  <>
                    <CircularProgress
                      size={16}
                      sx={{ color: "var(--color-primary-contrast)", mr: 1 }}
                    />
                    Submitting...
                  </>
                ) : (
                  "Submit"
                )}
              </ThemeButton>
            </span>
          </Tooltip>
        </Box>
      </Paper>
    </div>
  );
};

export default JobConfig;
