import React, { useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  Paper,
  ToggleButtonGroup,
  ToggleButton,
  Chip,
  Alert,
  Stack,
  Divider,
} from "@mui/material";
import {
  FaTimes,
  FaCloudUploadAlt,
  FaFileCsv,
  FaPencilAlt,
  FaPlusSquare,
  FaCube,
  FaTrashAlt,
} from "react-icons/fa";

import { useAsin } from "../../context/AsinContext";
import ThemeTextField from "./ThemeTextField";
import ThemeButton from "./ThemeButton";
import ThemeLoader from "./ThemeLoader";

const AsinAddModal = ({ open, onClose }) => {
  const [isUploadMode, setIsUploadMode] = useState(true);
  const [file, setFile] = useState(null);
  const [manualAsin, setManualAsin] = useState("");
  const [uploading, setUploading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [message, setMessage] = useState(null);

  const { uploadCsvService, createAsinService } = useAsin();

  const fileInputRef = useRef(null);
  const primary = "var(--color-primary)";
  const text = "var(--color-text)";
  const surface = "var(--color-surface)";
  const success = "var(--color-success)";
  const danger = "var(--color-danger)";

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (selected.name.toLowerCase().endsWith(".csv")) {
      setFile(selected);
      setMessage({ type: "info", text: `Selected ${selected.name}` });
    } else {
      setMessage({ type: "error", text: "Please upload a valid .csv file" });
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const selected = e.dataTransfer.files?.[0];
    if (selected && selected.name.toLowerCase().endsWith(".csv")) {
      setFile(selected);
      setMessage({ type: "info", text: `Selected ${selected.name}` });
    } else {
      setMessage({ type: "error", text: "Please upload a valid .csv file" });
    }
  };

  const humanFileSize = useMemo(() => {
    if (!file) return null;
    const i =
      file.size === 0 ? 0 : Math.floor(Math.log(file.size) / Math.log(1024));
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    return `${(file.size / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  }, [file]);

  const handleUpload = async () => {
    if (!file) {
      setMessage({ type: "error", text: "Please select a CSV file first." });
      return;
    }
    try {
      setUploading(true);
      setMessage(null);
      await uploadCsvService(file);
      setMessage({ type: "success", text: "CSV processed successfully." });
      setFile(null);
      onClose?.();
    } catch (e) {
      setMessage({
        type: "error",
        text: e?.data?.message || e?.message || "Failed to upload CSV",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleManualSubmit = async () => {
    const value = manualAsin.trim();
    if (!value) {
      setMessage({ type: "error", text: "Please enter an ASIN." });
      return;
    }
    try {
      setCreating(true);
      setMessage(null);
      await createAsinService(value);
      setMessage({ type: "success", text: "ASIN added." });
      setManualAsin("");
      onClose?.();
    } catch (e) {
      setMessage({
        type: "error",
        text: e?.data?.message || e?.message || "Failed to add ASIN",
      });
    } finally {
      setCreating(false);
    }
  };

  const toggleMode = (_e, newMode) => {
    if (newMode !== null) setIsUploadMode(newMode);
  };

  const isBusy = uploading || creating;

  return (
    <Dialog
      open={open}
      onClose={isBusy ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          backgroundColor: surface,
          borderRadius: 4,
          boxShadow: `0 16px 40px var(--color-shadow-heavy)`,
          overflow: "hidden",
          border: "1px solid var(--color-border, #e5e7eb)",
        },
      }}
    >
      {isBusy && <ThemeLoader type="bar" />}
      {isBusy && (
        <ThemeLoader
          type="overlay"
          message={uploading ? "Uploading CSV..." : "Creating ASIN..."}
        />
      )}

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: `linear-gradient(90deg, ${primary}, rgba(59,130,246,0.7))`,
          p: 2,
          borderBottom: "1px solid var(--color-border, #e5e7eb)",
        }}
      >
        <DialogTitle
          sx={{
            m: 0,
            p: 0,
            display: "flex",
            alignItems: "center",
            gap: 1,
            fontSize: "1.05rem",
            fontWeight: 800,
            color: "#fff",
            letterSpacing: 0.6,
          }}
        >
          <FaCube size={18} style={{ color: "#fff" }} /> ADD ASIN DATA
        </DialogTitle>

        <ThemeButton
          buttonType="icon"
          aria-label="Close"
          onClick={onClose}
          disabled={isBusy}
          variant="text"
          tone="neutral"
          sx={{
            color: "#ffffff",
            "&:hover": { backgroundColor: "rgba(255,255,255,0.15)" },
          }}
        >
          <FaTimes size={16} />
        </ThemeButton>
      </Box>

      <DialogContent dividers sx={{ backgroundColor: "var(--color-bg)", p: 0 }}>
        <Box sx={{ p: 2, pt: 1 }} aria-live="polite">
          {message?.text && (
            <Alert
              severity={message.type}
              onClose={() => setMessage(null)}
              sx={{
                mb: 1,
                borderRadius: 2,
                "& .MuiAlert-icon": {
                  color:
                    message.type === "success"
                      ? success
                      : message.type === "error"
                        ? danger
                        : primary,
                },
              }}
            >
              {message.text}
            </Alert>
          )}
        </Box>

        <Stack alignItems="center" sx={{ px: 2, pb: 1 }}>
          <Paper
            elevation={0}
            sx={{
              backgroundColor: "transparent",
              borderRadius: 2,
              border: "1px solid var(--color-border, #e5e7eb)",
              px: 0.75,
              py: 0.5,
            }}
            role="tablist"
            aria-label="Add ASIN input mode"
          >
            <ToggleButtonGroup
              value={isUploadMode}
              exclusive
              onChange={toggleMode}
              size="small"
              sx={{
                "& .MuiToggleButton-root": {
                  border: 0,
                  borderRadius: 1.5,
                  color: "var(--color-text-muted, #6b7280)",
                  fontWeight: 700,
                  textTransform: "none",
                  px: 2.25,
                  py: 0.75,
                  fontSize: "0.9rem",
                  transition: "all .2s ease",
                  "&:hover": {
                    backgroundColor: "var(--color-surface-2, #f3f4f6)",
                    color: text,
                  },
                },
                "& .Mui-selected": {
                  backgroundColor: `${primary} !important`,
                  color: `#fff !important`,
                  boxShadow: "0 8px 20px rgba(37,99,235,0.35)",
                },
                "& .MuiToggleButtonGroup-grouped:not(:last-of-type)": {
                  mr: 0.5,
                },
              }}
            >
              <ToggleButton value={true} aria-label="CSV Batch" role="tab">
                <FaFileCsv
                  size={16}
                  style={{ marginRight: 6, color: primary }}
                />{" "}
                CSV Batch
              </ToggleButton>
              <ToggleButton value={false} aria-label="Manual Entry" role="tab">
                <FaPencilAlt
                  size={15}
                  style={{
                    marginRight: 6,
                    color: "var(--color-accent, #8b5cf6)",
                  }}
                />{" "}
                Manual Entry
              </ToggleButton>
            </ToggleButtonGroup>
          </Paper>
        </Stack>

        <Divider />

        <Box sx={{ p: 2, pt: 2.5 }}>
          {isUploadMode ? (
            <Paper
              variant="outlined"
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                if (!dragActive) setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              sx={{
                mt: 1,
                border: `2px dashed ${primary}`,
                borderRadius: 2,
                p: { xs: 3, sm: 4 },
                textAlign: "center",
                backgroundColor: dragActive ? "rgba(59,130,246,0.06)" : surface,
                outline: dragActive ? `3px solid rgba(59,130,246,0.2)` : "none",
                transition: "all .15s ease",
              }}
              role="region"
              aria-label="Upload CSV dropzone"
              tabIndex={0}
            >
              <FaCloudUploadAlt
                size={46}
                style={{
                  color: primary,
                  marginBottom: 10,
                  display: "block",
                  margin: "0 auto 10px",
                }}
                aria-hidden
              />
              <Typography
                variant="h6"
                sx={{ fontWeight: 800, color: text, mb: 0.5 }}
              >
                Drop CSV File Here
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "var(--color-text-muted, #6b7280)",
                  mb: 2.5,
                  display: "block",
                }}
              >
                or select file (must be .csv format)
              </Typography>

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.25}
                justifyContent="center"
                alignItems="center"
                sx={{ mb: 2 }}
              >
                <ThemeButton
                  variant="outline"
                  size="lg"
                  tone="primary"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose File
                </ThemeButton>

                <ThemeButton
                  size="lg"
                  onClick={handleUpload}
                  loading={uploading}
                  disabled={!file}
                  tone="primary"
                >
                  <FaCloudUploadAlt size={16} className="mr-2" /> Upload File
                </ThemeButton>
              </Stack>

              {file && (
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.25}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Chip
                    color="success"
                    variant="outlined"
                    sx={{
                      borderColor: success,
                      color: success,
                      fontWeight: 700,
                    }}
                    label={`Selected: ${file.name}${humanFileSize ? ` • ${humanFileSize}` : ""}`}
                    role="status"
                  />
                  <ThemeButton
                    variant="text"
                    size="sm"
                    tone="danger"
                    onClick={() => setFile(null)}
                  >
                    <FaTrashAlt size={12} className="mr-2" /> Clear
                  </ThemeButton>
                </Stack>
              )}
            </Paper>
          ) : (
            <Paper
              elevation={0}
              sx={{
                mt: 1,
                backgroundColor: surface,
                border: "1px solid var(--color-border, #e5e7eb)",
                borderRadius: 2,
                p: 3,
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{ mb: 1.5, fontWeight: 800, color: text }}
              >
                Input Single ASIN
              </Typography>

              <ThemeTextField
                placeholder="e.g., B07ABC1234"
                variant="outlined"
                value={manualAsin}
                onChange={(e) => setManualAsin(e.target.value)}
                fullWidth
                className="mb-2"
                inputProps={{ "aria-label": "ASIN" }}
              />

              <Box display="flex" justifyContent="flex-end" sx={{ mt: 1 }}>
                <ThemeButton
                  onClick={handleManualSubmit}
                  loading={creating}
                  disabled={!manualAsin.trim()}
                  tone="success"
                >
                  <FaPlusSquare size={15} className="mr-2" /> Add ASIN
                </ThemeButton>
              </Box>
            </Paper>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AsinAddModal;
