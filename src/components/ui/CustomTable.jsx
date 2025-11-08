import React, { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Box,
  IconButton,
  Select,
  MenuItem,
  Typography,
  TextField,
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useEffect } from "react";

const CustomPagination = ({
  page = 1,
  totalPages = 1,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  loading = false,
  totalCount = 0,
  position = "top",
}) => {
  const [inputPage, setInputPage] = useState(String(page));

  useEffect(() => {
    setInputPage(String(page));
  }, [page]);

  const handlePageInput = (e) => {
    const value = String(e.target.value ?? "").replace(/\D/g, "");
    setInputPage(value);
  };

  const submitToPage = (oneBased) => {
    const numeric = Number(oneBased || 1);
    const clamped = Math.min(Math.max(numeric, 1), totalPages);
    onPageChange(clamped);
  };

  const handlePageSubmit = () => submitToPage(inputPage);

  const themeStyles = useMemo(
    () => ({
      colorPrimary: "var(--color-primary)",
      colorText: "var(--color-text)",
      colorSurface: "var(--color-surface)",
      colorShadow: "var(--color-shadow-light)",
    }),
    [],
  );

  const visible = useMemo(() => {
    const start = Math.max(1, page - 1);
    const end = Math.min(totalPages + 1, page + 2);
    return Array.from(
      { length: Math.max(0, end - start) },
      (_, i) => start + i,
    );
  }, [page, totalPages]);

  const isFirst = page <= 1;
  const isLast = page >= totalPages;

  return (
    <Box
      sx={{
        mb: position === "top" ? 2 : 0,
        mt: position === "bottom" ? 2 : 0,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 1.5,
        backgroundColor: themeStyles.colorSurface,
        p: 1.5,
        borderRadius: "8px",
        boxShadow: `0 2px 6px ${themeStyles.colorShadow}`,
      }}
    >
      <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
        <Typography variant="body2" sx={{ color: themeStyles.colorText }}>
          Rows per page:
        </Typography>

        <Select
          size="small"
          value={rowsPerPage}
          onChange={(e) => {
            if (loading) return;
            const next = Number(e.target.value);
            if (!Number.isNaN(next)) onRowsPerPageChange(next);
          }}
          sx={{
            height: 32,
            minWidth: 75,
            color: themeStyles.colorText,
            border: `1px solid ${themeStyles.colorPrimary}`,
            borderRadius: "6px",
            "& .MuiOutlinedInput-notchedOutline": { border: "none" },
          }}
          inputProps={{ "aria-label": "Rows per page" }}
        >
          {[10, 20, 25, 50, 100].map((val) => (
            <MenuItem key={val} value={val}>
              {val}
            </MenuItem>
          ))}
        </Select>

        <Typography variant="body2" sx={{ color: themeStyles.colorText }}>
          Page <strong>{page}</strong> of <strong>{totalPages}</strong> (
          {totalCount} total)
        </Typography>

        <Box display="flex" alignItems="center" gap={1}>
          <TextField
            size="small"
            value={inputPage}
            onChange={handlePageInput}
            onKeyDown={(e) => e.key === "Enter" && handlePageSubmit()}
            sx={{
              width: 64,
              "& input": { textAlign: "center", color: themeStyles.colorText },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: themeStyles.colorPrimary },
                "&:hover fieldset": { borderColor: themeStyles.colorPrimary },
              },
            }}
            inputProps={{
              inputMode: "numeric",
              pattern: "[0-9]*",
              "aria-label": "Go to page",
            }}
          />
          <Typography
            role="button"
            tabIndex={0}
            variant="body2"
            sx={{
              color: themeStyles.colorPrimary,
              cursor: "pointer",
              userSelect: "none",
              "&:hover": { textDecoration: "underline" },
              outline: "none",
            }}
            onClick={handlePageSubmit}
            onKeyDown={(e) =>
              (e.key === "Enter" || e.key === " ") && handlePageSubmit()
            }
            aria-label="Submit page"
          >
            Go
          </Typography>
        </Box>
      </Box>

      <Box display="flex" alignItems="center" gap={1}>
        <IconButton
          size="small"
          onClick={() => !loading && onPageChange(1)}
          disabled={isFirst || loading}
          aria-label="First page"
          sx={{
            color: themeStyles.colorPrimary,
            border: `1px solid ${themeStyles.colorPrimary}`,
            borderRadius: "8px",
            "&.Mui-disabled": { opacity: 0.4 },
            "&:hover": {
              backgroundColor: "rgba(59,130,246,0.1)",
              transform: "translateY(-1px)",
            },
          }}
        >
          <ChevronsLeft size={18} />
        </IconButton>

        <IconButton
          size="small"
          onClick={() => !loading && onPageChange(Math.max(page - 1, 1))}
          disabled={isFirst || loading}
          aria-label="Previous page"
          sx={{
            color: themeStyles.colorPrimary,
            border: `1px solid ${themeStyles.colorPrimary}`,
            borderRadius: "8px",
            "&.Mui-disabled": { opacity: 0.4 },
            "&:hover": {
              backgroundColor: "rgba(59,130,246,0.1)",
              transform: "translateY(-1px)",
            },
          }}
        >
          <ChevronLeft size={18} />
        </IconButton>

        {visible.map((pageIdx) => (
          <IconButton
            key={pageIdx}
            size="small"
            onClick={() => !loading && onPageChange(pageIdx)}
            aria-label={`Go to page ${pageIdx}`}
            sx={{
              color:
                page === pageIdx
                  ? themeStyles.colorSurface
                  : themeStyles.colorPrimary,
              backgroundColor:
                page === pageIdx ? themeStyles.colorPrimary : "transparent",
              border: `1px solid ${themeStyles.colorPrimary}`,
              borderRadius: "50px",
              padding: "2px 10px",
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor:
                  page === pageIdx
                    ? themeStyles.colorPrimary
                    : "rgba(59,130,246,0.12)",
                transform: "translateY(-1px)",
              },
            }}
          >
            {pageIdx}
          </IconButton>
        ))}

        <IconButton
          size="small"
          onClick={() =>
            !loading && onPageChange(Math.min(page + 1, totalPages))
          }
          disabled={isLast || loading}
          aria-label="Next page"
          sx={{
            color: themeStyles.colorPrimary,
            border: `1px solid ${themeStyles.colorPrimary}`,
            borderRadius: "8px",
            "&.Mui-disabled": { opacity: 0.4 },
            "&:hover": {
              backgroundColor: "rgba(59,130,246,0.1)",
              transform: "translateY(-1px)",
            },
          }}
        >
          <ChevronRight size={18} />
        </IconButton>

        <IconButton
          size="small"
          onClick={() => !loading && onPageChange(totalPages)}
          disabled={isLast || loading}
          aria-label="Last page"
          sx={{
            color: themeStyles.colorPrimary,
            border: `1px solid ${themeStyles.colorPrimary}`,
            borderRadius: "8px",
            "&.Mui-disabled": { opacity: 0.4 },
            "&:hover": {
              backgroundColor: "rgba(59,130,246,0.1)",
              transform: "translateY(-1px)",
            },
          }}
        >
          <ChevronsRight size={18} />
        </IconButton>
      </Box>
    </Box>
  );
};

const CustomTable = ({
  columns = [],
  data = [],
  totalCount = 0,
  page = 0,
  rowsPerPage = 10,
  onPageChange = () => {},
  onRowsPerPageChange = () => {},
  loading = false,
  pagination = true,
}) => {
  const totalPages = Math.ceil(totalCount / rowsPerPage) || 1;

  return (
    <Box sx={{ position: "relative", width: "100%" }}>
      {pagination && (
        <CustomPagination
          position="top"
          page={page}
          totalPages={totalPages}
          rowsPerPage={rowsPerPage}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
          loading={loading}
          totalCount={totalCount}
        />
      )}

      <Paper
        sx={{
          width: "100%",
          boxShadow: "0 2px 8px var(--color-shadow-light)",
          backgroundColor: "var(--color-surface)",
          overflow: "hidden",
        }}
      >
        <TableContainer>
          <Table stickyHeader>
            <TableHead
              sx={{
                backgroundColor: "var(--color-bg)",
                "& .MuiTableCell-root": {
                  color: "var(--color-text)",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  backgroundColor: "var(--color-bg)",
                  borderBottom: "2px solid var(--color-shadow-light)",
                },
              }}
            >
              <TableRow>
                {columns.map((col) => (
                  <TableCell
                    key={col.id}
                    sx={{ minWidth: col.minWidth || 100 }}
                  >
                    {col.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {!loading && data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    align="center"
                    sx={{
                      py: 5,
                      color: "var(--color-text)",
                      fontSize: "0.95rem",
                    }}
                  >
                    No data available
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row, index) => (
                  <TableRow
                    hover
                    key={index}
                    sx={{
                      backgroundColor: "var(--color-surface)",
                      transition: "background 0.2s ease",
                      "&:hover": { backgroundColor: "rgba(59,130,246,0.06)" },
                      "& .MuiTableCell-root": {
                        borderBottom: "1px solid var(--color-shadow-light)",
                        color: "var(--color-text)",
                        fontSize: "0.9rem",
                      },
                    }}
                  >
                    {columns?.map((col) => (
                      <TableCell key={col.id}>
                        {col?.render ? col.render(row) : row[col?.id] || "-"}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {pagination && (
        <CustomPagination
          position="bottom"
          page={page}
          totalPages={totalPages}
          rowsPerPage={rowsPerPage}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
          loading={loading}
          totalCount={totalCount}
        />
      )}

      {loading && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backdropFilter: "blur(3px)",
            backgroundColor: "rgba(0,0,0,0.05)",
            zIndex: 5,
            borderRadius: "12px",
          }}
        >
          <CircularProgress size={44} sx={{ color: "var(--color-primary)" }} />
        </Box>
      )}
    </Box>
  );
};

export default CustomTable;
