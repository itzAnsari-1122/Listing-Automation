import { useEffect, useMemo, useState } from "react";
import { useListing } from "../../context/ListingContext";
import CustomTable from "../../components/ui/CustomTable";
import { FiBarChart2 } from "react-icons/fi";
import { Tooltip, Chip } from "@mui/material";
import ThemeButton from "../../components/ui/ThemeButton";
import { useNavigate } from "react-router-dom";
import ThemeChip from "../../components/ui/ThemeChip";
import ThemeLoader from "../../components/ui/ThemeLoader"; // Add this import

function ListingReport() {
  const { ListingFlaggedService, listingFlaggedLoading, listingFlagged } =
    useListing();
  const navigate = useNavigate();

  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 20,
    totalItems: 0,
  });

  const [busy, setBusy] = useState(false); // Add busy state like Users.jsx

  useEffect(() => {
    const fetchData = async () => {
      setBusy(true);
      try {
        const payload = {
          page: pagination.currentPage,
          limit: pagination.pageSize,
          search: "",
        };
        await ListingFlaggedService(payload);
      } finally {
        setBusy(false);
      }
    };

    fetchData();
  }, [pagination.currentPage, pagination.pageSize]);

  useEffect(() => {
    const p = listingFlagged?.pagination;
    if (!p) return;

    setPagination((prev) => {
      const next = {
        currentPage: p.currentPage ?? prev.currentPage,
        pageSize: p.pageSize ?? prev.pageSize,
        totalItems: p.totalItems ?? prev.totalItems,
      };
      const changed =
        next.currentPage !== prev.currentPage ||
        next.pageSize !== prev.pageSize ||
        next.totalItems !== prev.totalItems;

      return changed ? next : prev;
    });
  }, [listingFlagged]);

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
  };

  const handleRowsPerPageChange = (arg) => {
    const next =
      typeof arg === "number"
        ? arg
        : Number(arg?.target?.value ?? arg?.value ?? NaN);
    if (!Number.isFinite(next) || next <= 0) return;
    setPagination((prev) => ({
      ...prev,
      pageSize: next,
      currentPage: 1,
    }));
  };

  const listingReportColumns = useMemo(
    () => [
      {
        id: "asin",
        label: "ASIN",
        minWidth: 120,
        render: (row) => (
          <Tooltip title={row.asin} arrow>
            <div className="truncate font-medium">{row.asin || "N/A"}</div>
          </Tooltip>
        ),
      },
      {
        id: "marketplaceName",
        label: "Marketplace",
        minWidth: 150,
        render: (row) => (
          <ThemeChip
            label={row.marketplaceName || row.marketplaceCode || "N/A"}
            size="sm"
            variant="outline"
            tone="primary"
            sx={{ fontWeight: 600 }}
          />
        ),
      },
      {
        id: "errorKey",
        label: "Error Key",
        minWidth: 200,
        render: (row) => (
          <Tooltip title={row.errorKey} arrow>
            <div
              className="truncate text-sm"
              style={{
                maxWidth: "200px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {row.errorKey || "N/A"}
            </div>
          </Tooltip>
        ),
      },
      {
        id: "errorValue",
        label: "Error Value",
        minWidth: 300,
        render: (row) => (
          <Tooltip title={row.errorValue} arrow>
            <div
              className="truncate text-sm"
              style={{
                maxWidth: "280px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {row.errorValue || "N/A"}
            </div>
          </Tooltip>
        ),
      },
      {
        id: "status",
        label: "Status",
        minWidth: 100,
        render: (row) => {
          const raw = row.status || "N/A";
          const status = raw.toLowerCase();

          if (status === "fine") {
            return (
              <ThemeChip
                label={raw}
                size="sm"
                tone="success"
                variant="filled"
                sx={{ fontWeight: 600, textTransform: "capitalize" }}
              />
            );
          }
          if (status === "danger") {
            return (
              <ThemeChip
                label={raw}
                size="sm"
                tone="danger"
                variant="filled"
                sx={{ fontWeight: 600, textTransform: "capitalize" }}
              />
            );
          }
          if (status === "pending") {
            return (
              <ThemeChip
                label={raw}
                size="sm"
                variant="outline"
                tone="neutral"
                sx={{
                  fontWeight: 600,
                  textTransform: "capitalize",
                  "&&": {
                    backgroundColor: "rgba(255, 193, 7, 0.15)",
                    color: "#FBC02D",
                    border: "1px solid rgba(255, 193, 7, 0.35)",
                  },
                }}
              />
            );
          }
          return (
            <ThemeChip
              label={raw}
              size="sm"
              variant="outline"
              tone="neutral"
              sx={{
                fontWeight: 600,
                textTransform: "capitalize",
                "&&": {
                  backgroundColor: "rgba(158, 158, 158, 0.15)",
                  color: "#757575",
                  border: "1px solid rgba(158, 158, 158, 0.35)",
                },
              }}
            />
          );
        },
      },
      {
        id: "updatedAt",
        label: "Last Updated",
        minWidth: 160,
        render: (row) =>
          row?.updatedAt ? new Date(row.updatedAt).toLocaleString() : "N/A",
      },
      {
        id: "actions",
        label: "Actions",
        minWidth: 120,
        render: (row) => (
          <div className="flex items-center justify-center gap-2">
            <ThemeButton
              variant="contained"
              textColor="#fff"
              size="sm"
              onClick={() => {
                if (row?.asin && row?.marketplaceId) {
                  const asin = encodeURIComponent(row.asin);
                  const mk = encodeURIComponent(row.marketplaceId);
                  navigate(`/listing/${asin}?id=${mk}`);
                }
              }}
              sx={{
                minWidth: 90,
                fontSize: "0.8rem",
                backgroundColor:
                  row.status?.toLowerCase() === "danger"
                    ? "var(--color-error)"
                    : "var(--color-primary)",
                "&:hover": { opacity: 0.9 },
              }}
            >
              View
            </ThemeButton>
          </div>
        ),
      },
    ],
    [navigate],
  );

  return (
    <div className="mx-auto mb-12 mt-8 min-h-screen max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Add ThemeLoader like in Users.jsx */}
      {busy && <ThemeLoader type="bar" />}

      <div className="mx-auto max-w-7xl">
        <h1
          className="mb-6 flex items-center gap-6 text-3xl font-bold"
          style={{ color: "var(--color-text)" }}
        >
          <FiBarChart2 size={32} style={{ color: "var(--color-primary)" }} />
          Listing Report
        </h1>

        <div className="overflow-hidden rounded-lg border shadow-sm">
          <div className="border-b p-4">
            <h2 className="text-lg font-semibold">Flagged Listings</h2>
          </div>

          <CustomTable
            columns={listingReportColumns}
            data={listingFlagged?.data || []}
            totalCount={
              listingFlagged?.pagination?.totalItems ?? pagination.totalItems
            }
            page={
              listingFlagged?.pagination?.currentPage ?? pagination.currentPage
            }
            rowsPerPage={
              listingFlagged?.pagination?.pageSize ?? pagination.pageSize
            }
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            loading={listingFlaggedLoading || busy} // Combine both loading states
          />
        </div>
      </div>
    </div>
  );
}

export default ListingReport;
