import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Switch,
  Paper,
  Checkbox,
  Alert,
  Button,
} from "@mui/material";
import {
  useJobConfig,
  COUNTRIES_BY_REGION,
  REGION_TYPES,
} from "../context/jobConfigContext";
import ThemeSelectField from "../components/Ui/ThemeSelectField";
import { PiUserSwitch } from "react-icons/pi";

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
          checked: isActive,
          selectedMarketplaces,
          active: isActive,
          marketplaces: availableMarketplaces,
          backendMarketplaceIds: backendRegion?.marketPlaceIds || [],
        };
      });

      setRegionData(regionSetup);
    } catch (error) {
      console.error("Failed to load job config:", error);
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
        checked: false,
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
          if (field === "checked" || field === "selectedMarketplaces") {
            updatedItem.active =
              updatedItem.checked &&
              updatedItem.selectedMarketplaces.length > 0;
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
        .filter((r) => r.checked && r.selectedMarketplaces.length > 0)
        .map((r) => ({
          regionType: r.regionType,
          marketPlaceIds: r.selectedMarketplaces,
        }));

      if (formattedSearchRegionType.length === 0) {
        return;
      }

      await updateJobConfigService({
        searchRegionType: formattedSearchRegionType,
      });

      setTimeout(() => loadJobConfig(), 1000);
    } catch {}
  };

  const getActiveRegionsCount = () =>
    regionData.filter((region) => region.active).length;

  if (jobConfigLoading && !jobConfig && !apiError) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "400px",
          gap: 2,
          backgroundColor: "var(--color-bg)",
        }}
      >
        <CircularProgress size={40} sx={{ color: "var(--color-primary)" }} />
        <Typography variant="h6" color="var(--color-text-muted)">
          Loading Job Configuration...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: 4,
        minHeight: "100vh",
        backgroundColor: "var(--color-bg)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography
          variant="h4"
          fontWeight="bold"
          display="flex"
          gap={1}
          color="var(--color-text)"
        >
          <PiUserSwitch
            style={{
              fontSize: "1.25em",
              marginRight: 6,
              marginTop: 4,
              color: "var(--color-primary)",
            }}
          />
          Job Configuration
          {jobConfigUpdating && (
            <CircularProgress
              size={20}
              sx={{ ml: 2, color: "var(--color-primary)" }}
            />
          )}
        </Typography>
      </Box>

      {apiError && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
            backgroundColor: "var(--color-danger-200)",
            color: "var(--color-text)",
            border: "1px solid var(--color-danger-200)",
            "& .MuiAlert-icon": {
              color: "var(--color-danger)",
            },
          }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={loadJobConfig}
              sx={{ color: "var(--color-danger)" }}
            >
              RETRY
            </Button>
          }
        >
          <Typography variant="h6" color="var(--color-text)">
            API Connection Error
          </Typography>
          <Typography variant="body2" color="var(--color-text-muted)">
            {apiError}
          </Typography>
        </Alert>
      )}

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
            label="Primary Country Selection"
            name="allCountry"
            value={allCountry}
            onChange={handleAllCountryChange}
            options={[
              { label: "United States", value: "US" },
              { label: "Canada", value: "CA" },
              { label: "United Kingdom", value: "UK" },
              { label: "Australia", value: "AU" },
              { label: "Japan", value: "JP" },
              { label: "Germany", value: "DE" },
              { label: "Brazil", value: "BR" },
              { label: "Singapore", value: "SG" },
            ]}
            placeholder="Select Primary Country"
            fullWidth
          />

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
              color: "warning",
              key: "violations",
              value: violations,
            },
            {
              label: "Send Error Emails",
              description: "Receive notifications for errors",
              color: "error",
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
              <Switch
                checked={sw.value}
                onChange={(e) => handleSwitchChange(sw.key, e.target.checked)}
                color={sw.color}
                disabled={jobConfigUpdating}
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": {
                    color:
                      sw.color === "success"
                        ? "var(--color-success)"
                        : sw.color === "error"
                          ? "var(--color-danger)"
                          : "var(--color-primary)",
                  },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                    backgroundColor:
                      sw.color === "success"
                        ? "var(--color-success)"
                        : sw.color === "error"
                          ? "var(--color-danger)"
                          : "var(--color-primary)",
                  },
                }}
              />
            </Box>
          ))}
        </Box>
      </Paper>

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
                <Checkbox
                  checked={region.checked}
                  onChange={(e) =>
                    handleRegionChange(index, "checked", e.target.checked)
                  }
                  color="primary"
                  sx={{
                    color: "var(--color-primary)",
                    "&.Mui-checked": {
                      color: "var(--color-primary)",
                    },
                  }}
                />
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
                    disabled={!region.checked}
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
                <Box
                  sx={{
                    px: 2,
                    py: 0.5,
                    borderRadius: 2,
                    backgroundColor: region.active
                      ? "var(--color-success-200)"
                      : "var(--color-danger-200)",
                    color: region.active
                      ? "var(--color-success)"
                      : "var(--color-danger)",
                    fontSize: "0.75rem",
                    fontWeight: "bold",
                    textAlign: "center",
                    minWidth: "80px",
                    border: region.active
                      ? "1px solid var(--color-success-200)"
                      : "1px solid var(--color-danger-200)",
                  }}
                >
                  {region.active ? "ACTIVE" : "INACTIVE"}
                </Box>
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
          <Button
            onClick={handleSubmit}
            disabled={jobConfigUpdating}
            variant="contained"
            startIcon={
              jobConfigUpdating ? (
                <CircularProgress
                  size={16}
                  sx={{ color: "var(--color-primary-contrast)" }}
                />
              ) : null
            }
            sx={{
              backgroundColor: "var(--color-primary)",
              color: "var(--color-primary-contrast)",
              "&:hover": {
                backgroundColor: "var(--color-primary-600)",
              },
              "&:disabled": {
                backgroundColor: "var(--color-text-muted)",
              },
            }}
          >
            {jobConfigUpdating ? "Submitting..." : "Submit"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default JobConfig;
