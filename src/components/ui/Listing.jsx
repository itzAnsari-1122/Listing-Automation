import { DollarSign, Package, Star, Upload, Search, X } from "lucide-react";
import React, { useEffect, useState, useMemo } from "react";
import { RiFileList3Fill } from "react-icons/ri";
import { useListing } from "../../context/ListingContext";
import CustomTable from "../../components/ui/CustomTable";
import ThemeSelectField from "../../components/ui/ThemeSelectField";
import ThemeButton from "../../components/ui/ThemeButton";
import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import { useNavigate } from "react-router-dom";
import AsinModal from "../../components/ui/AsinModal";
import AddAsinModal from "../../components/ui/AsinAddModel";
import RestrictedWordModal from "../../components/ui/RestrictedWordModal";
import AddRestrictedWordModal from "../../components/ui/AddRestrictedWordModal";
import { CountryOptions } from "../../utils";
import {
  FiAlertTriangle,
  FiClock,
  FiPackage,
  FiRefreshCw,
} from "react-icons/fi";
import { Box } from "@mui/material";

const Listing = () => {
  const {
    ListingService,
    listing,
    listingLoading,
    ListingSyncService,
    listingSyncLoading,
  } = useListing();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(listing?.currentPage || 1);
  const [rowsPerPage, setRowsPerPage] = useState(listing?.count || 10);
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const navigate = useNavigate();

  const [showAsinModal, setShowAsinModal] = useState(false);
  const [showRestrictedModal, setShowRestrictedWordModal] = useState(false);
  const [showAddRestrictedModal, setShowAddRestrictedWordModal] =
    useState(false);
  const [showAddAsinModal, setShowAddAsinModal] = useState(false);

  // 🔸 Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // 🔸 Fetch listing
  useEffect(() => {
    const countryCodes = selectedCountries
      .map((v) => CountryOptions.find((o) => o.value === v)?.code)
      .filter(Boolean);
    ListingService({
      page,
      limit: rowsPerPage,
      search: debouncedSearch,
      countryCodes,
      status: selectedStatus === "all" ? null : selectedStatus,
      startDate: "2020-01-01 00:00:00",
      endDate: "2026-12-01 23:59:59",
    });
  }, [page, rowsPerPage, debouncedSearch, selectedCountries, selectedStatus]);

  // 🔸 Format listing data
  const tableData = useMemo(() => {
    if (!listing?.data) return [];

    const getFirst = (arr) =>
      Array.isArray(arr) && arr.length ? arr[0] : null;
    const asNumber = (v) => (v === null || v === undefined ? null : Number(v));

    return listing.data.map((item) => {
      const product = getFirst(item.items) || {};
      const summary = getFirst(item.summaries) || {};
      const attributes = getFirst(item.attributes) || {};
      const attrsRaw = item.attributesRaw || {};
      const normalized = item.normalized || {};

      // Image prioritization: images -> imagesByMarketplace -> summary image -> placeholder
      const imageFromImages = getFirst(item.images)?.link;
      const imageFromByMarketplace = getFirst(
        getFirst(item.imagesByMarketplace || [])?.images,
      )?.link;
      const imageFromSummary =
        summary.mainImage?.link || getFirst(summary.images || [])?.link;
      const image =
        imageFromImages ||
        imageFromByMarketplace ||
        imageFromSummary ||
        normalized.mainImage ||
        "https://via.placeholder.com/80x80?text=No+Image";

      // Title/brand/price fallback chain
      const title =
        summary.itemName ||
        normalized.itemName ||
        attrsRaw.item_name?.[0]?.value ||
        attributes.item_name?.[0]?.value ||
        attrsRaw.itemName ||
        "No title available";

      const brand =
        attributes.brand?.[0]?.value ||
        attrsRaw.brand?.[0]?.value ||
        summary.brand ||
        normalized.brand ||
        "Unknown Brand";

      const price =
        // product offers
        product?.offers?.[0]?.price?.amount ||
        // normalized listPrice
        (normalized.listPrice && normalized.listPrice.value) ||
        // attributes/list_price
        attrsRaw.list_price?.[0]?.value ||
        attributes.list_price?.[0]?.value ||
        "N/A";

      // identifiers
      const upc =
        normalized.upc ||
        attrsRaw.externally_assigned_product_identifier?.find(
          (p) => p.type === "upc",
        )?.value ||
        attrsRaw.externally_assigned_product_identifier?.[0]?.value ||
        null;
      const ean =
        normalized.ean ||
        attrsRaw.externally_assigned_product_identifier?.find(
          (p) => p.type === "ean",
        )?.value ||
        attrsRaw.externally_assigned_product_identifier?.[0]?.value ||
        null;

      // dims & weights
      const pkgDims =
        normalized.itemPackageDimensions ||
        attrsRaw.item_package_dimensions?.[0] ||
        null;
      const pkgWeight =
        normalized.itemPackageWeight ||
        attrsRaw.item_package_weight?.[0] ||
        null;

      // simple arrays for color, scent, etc.
      const colors =
        (normalized.color && typeof normalized.color === "string"
          ? normalized.color.split(",").map((s) => s.trim())
          : normalized.color) ||
        (attrsRaw.color?.[0]?.value || attributes.color?.[0]?.value || "")
          .split?.(",")
          .map((s) => s.trim())
          .filter(Boolean) ||
        [];

      const scents =
        normalized.scent ||
        attrsRaw.scent?.map((s) => s.value) ||
        attributes.scent?.map((s) => s.value) ||
        [];

      const size =
        normalized.size ||
        attrsRaw.size?.[0]?.value ||
        attributes.size?.[0]?.value ||
        summary.size ||
        null;

      const numberOfItems =
        normalized.numberOfItems ||
        attrsRaw.number_of_items?.[0]?.value ||
        attributes.number_of_items?.[0]?.value ||
        attrsRaw.unit_count?.[0]?.value ||
        attributes.unit_count?.[0]?.value ||
        null;

      const productTypes =
        item.productTypes || item.rawResponse?.productTypes || [];
      const salesRanks = item.salesRanks || item.rawResponse?.salesRanks || [];

      return {
        // minimal fields used by table + richer extras
        id: item._id,
        asin: item.asin,
        marketplaceId: item.marketplaceId,
        marketplaceCode: item.marketplaceCode || item.marketplaceCode,
        marketplaceName:
          item.marketplaceName || summary.websiteDisplayGroupName || null,
        image,
        title,
        brand,
        price,
        country: item.marketplaceCode || "N/A",
        status: item.status || "Unknown",
        notesMessage: item.notesMessage || null,
        // metadata
        createdAt: item.createdAt || item.storedAt || null,
        updatedAt: item.updatedAt || null,
        storedAt: item.storedAt || null,
        // identifiers
        upc,
        ean,
        identifiers: item.identifiers || item.identifiersByMarketplace || [],
        // package & size
        size,
        color: colors,
        scents,
        numberOfItems: asNumber(numberOfItems),
        itemPackageDimensions: pkgDims,
        itemPackageWeight: pkgWeight,
        itemDimensions:
          attrsRaw.item_dimensions?.[0] ||
          attributes.item_dimensions?.[0] ||
          normalized.itemDimensions ||
          null,
        // product info
        productTypes,
        salesRanks,
        summary,
        normalized,
        rawResponse: item.rawResponse || {},
        attributesRaw: attrsRaw,
        violations: item.violations || [],
        product: product, // raw product object if needed for deep-dive
      };
    });
  }, [listing]);

  // 🔸 Table columns
  const columns = [
    {
      id: "image",
      label: "Image",
      minWidth: 80,
      render: (row) => (
        <img
          src={row.image}
          alt={row.title}
          className="h-12 w-12 rounded border object-cover"
        />
      ),
    },
    { id: "asin", label: "ASIN", minWidth: 120 },
    {
      id: "title",
      label: "Title",
      minWidth: 240,
      render: (row) => (
        <Tooltip title={row.title} arrow>
          <div
            className="truncate font-medium"
            style={{
              maxWidth: "230px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {row.title}
          </div>
        </Tooltip>
      ),
    },
    {
      id: "brand",
      label: "Brand",
      minWidth: 120,
      render: (row) => (
        <Chip
          label={row.brand || "N/A"}
          size="small"
          sx={{
            fontWeight: 500,
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text)",
          }}
        />
      ),
    },
    {
      id: "price",
      label: "Price",
      minWidth: 80,
      render: (row) => (
        <span style={{ fontWeight: 600 }}>
          {row.price !== "N/A" ? `$${row.price}` : "N/A"}
        </span>
      ),
    },
    {
      id: "country",
      label: "Country",
      minWidth: 100,
      render: (row) => (
        <Chip
          label={row.country}
          size="small"
          sx={{
            fontWeight: 600,
            backgroundColor: "rgba(33, 150, 243, 0.15)",
            color: "#1976d2",
          }}
        />
      ),
    },
    {
      id: "status",
      label: "Status",
      minWidth: 100,
      render: (row) => {
        const status = row.status?.toLowerCase();
        return (
          <Chip
            label={row.status}
            size="small"
            sx={{
              fontWeight: 600,
              textTransform: "capitalize",
              backgroundColor:
                status === "fine"
                  ? "rgba(76, 175, 80, 0.15)"
                  : status === "danger"
                    ? "rgba(244, 67, 54, 0.15)"
                    : "rgba(158, 158, 158, 0.15)",
              color:
                status === "fine"
                  ? "#4CAF50"
                  : status === "danger"
                    ? "#F44336"
                    : "#757575",
            }}
          />
        );
      },
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
                navigate(`/listing/${row.asin}?id=${row.marketplaceId}`);
              }
            }}
            sx={{
              minWidth: 90,
              fontSize: "0.8rem",
              backgroundColor:
                row.status?.toLowerCase() === "danger"
                  ? "var(--color-error)"
                  : "var(--color-primary)",
              "&:hover": {
                opacity: 0.9,
              },
            }}
          >
            Action
          </ThemeButton>
        </div>
      ),
    },
  ];

  const totalCount = listing?.total || 0;
  const formattedDate = listing?.lastSync
    ? new Date(listing.lastSync).toLocaleString(undefined, {
        dateStyle: "medium",
      })
    : "Not Synced";
  return (
    <div className="mx-auto mb-12 mt-8 min-h-screen max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between pt-4">
        <h1
          className="flex items-center gap-4 text-3xl font-bold"
          style={{ color: "var(--color-text)" }}
        >
          <RiFileList3Fill
            size={30}
            style={{ color: "var(--color-primary)" }}
          />
          Listing
        </h1>
        <Box sx={{ display: "flex", gap: 2 }}>
          <ThemeButton
            buttonType="button"
            onClick={() => setShowRestrictedWordModal(true)}
            tone="primary"
            size="md"
            aria-label="Restricted Word"
          >
            <Upload className="h-4 w-4" />
            <span style={{ marginLeft: "10px" }}> ASIN Upload</span>
          </ThemeButton>
          <ThemeButton
            buttonType="button"
            onClick={() => setShowAsinModal(true)}
            tone="primary"
            size="md"
            aria-label="ASIN"
          >
            <Upload className="h-4 w-4" />
            <span style={{ marginLeft: "10px" }}> ASIN Upload</span>
          </ThemeButton>
        </Box>
      </div>

      {/* Summary Cards */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Total Products */}
        <div
          className="flex items-center gap-4 rounded-lg p-5 shadow-sm transition hover:shadow-md"
          style={{ backgroundColor: "var(--color-surface)" }}
        >
          <div
            className="flex h-12 w-12 items-center justify-center rounded-lg"
            style={{ backgroundColor: "rgba(59,130,246,0.15)" }}
          >
            <FiPackage size={22} style={{ color: "var(--color-primary)" }} />
          </div>
          <div>
            <p className="text-sm text-gray-400">Total Products</p>
            <h2
              className="text-2xl font-bold"
              style={{ color: "var(--color-text)" }}
            >
              {listing?.total ?? 0}
            </h2>
          </div>
        </div>

        {/* Corrupted Products */}
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
            <p className="text-sm text-gray-400">Corrupted Products</p>
            <h2
              className="text-2xl font-bold"
              style={{ color: "var(--color-text)" }}
            >
              {listing?.corruptedCount ?? 0}
            </h2>
          </div>
        </div>

        {/* Last Sync */}
        <div
          className="flex items-center justify-between rounded-lg p-5 shadow-sm transition hover:shadow-md"
          style={{ backgroundColor: "var(--color-surface)" }}
        >
          <div className="flex items-center gap-4">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-lg"
              style={{ backgroundColor: "rgba(217,119,6,0.15)" }}
            >
              <FiClock size={22} style={{ color: "var(--color-warning)" }} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Last Sync</p>
              <h2
                className="text-lg font-semibold"
                style={{ color: "var(--color-text)" }}
              >
                {formattedDate}
              </h2>
            </div>
          </div>

          <ThemeButton
            onClick={() => ListingSyncService()}
            buttonType="icon"
            disabled={listingSyncLoading}
            aria-label="Sync Listings"
            sx={{
              backgroundColor: "var(--color-surface)",
              color: "var(--color-primary)",
              border: "1px solid var(--color-border)",
              transition: "all 0.25s ease-in-out",
              "&:hover": {
                backgroundColor:
                  "color-mix(in oklab, var(--color-primary) 8%, transparent)",
                transform: "rotate(5deg) scale(1.05)",
              },
              "&:active": { transform: "scale(0.95)" },
            }}
          >
            <Tooltip
              title={listingSyncLoading ? "Syncing..." : "Sync now"}
              placement="bottom"
            >
              <span>
                <FiRefreshCw
                  size={18}
                  className={listingSyncLoading ? "animate-spin" : ""}
                  style={{
                    color: listingSyncLoading
                      ? "var(--color-info)"
                      : "var(--color-primary)",
                    transition: "color 0.3s ease",
                  }}
                />
              </span>
            </Tooltip>
          </ThemeButton>
        </div>
      </div>

      {/* Search + Filters */}
      <div
        className="overflow-hidden rounded-lg shadow"
        style={{ backgroundColor: "var(--color-surface)" }}
      >
        <div className="flex flex-col gap-4 border-b px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:w-96">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
              style={{ color: "gray" }}
            />
            <input
              type="text"
              placeholder="Search products, brands, ASIN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border py-2 pl-10 pr-10 text-sm outline-none focus:ring-2"
              style={{
                borderColor: "#e2e8f0",
                color: "var(--color-text)",
                backgroundColor: "var(--color-surface)",
              }}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
            <ThemeSelectField
              label="Country"
              name="countryFilter"
              multiple
              value={selectedCountries}
              onChange={(values, payload) => {
                setSelectedCountries(values); // ← updates selected marketplaces (array of `value`s)

                const codes = payload.map((p) => p.code);
                // if you need ISO country codes for something else:
              }}
              options={CountryOptions}
              placeholder="Select countries"
              width="200px"
            />

            <ThemeSelectField
              label="Status"
              name="statusFilter"
              value={selectedStatus}
              onChange={(value) => setSelectedStatus(value)}
              options={[
                { value: "all", label: "All" },
                { value: "fine", label: "Fine" },
                { value: "danger", label: "Danger" },
              ]}
              placeholder="Select status"
              width="150px"
            />
          </div>
        </div>

        {/* Table */}
        <div
          className="overflow-x-auto"
          style={{
            maxWidth: "100%",
            overflowY: "hidden",
            borderRadius: "8px",
          }}
        >
          <CustomTable
            columns={columns}
            data={tableData}
            totalCount={totalCount}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={setPage}
            onRowsPerPageChange={(e) =>
              setRowsPerPage(parseInt(e.target.value))
            }
            loading={listingLoading}
          />
        </div>
      </div>

      {/* 🔸 Independent Modals */}
      {showAsinModal && (
        <AsinModal
          open={showAsinModal}
          onClose={() => setShowAsinModal(false)}
          onAddClick={() => setShowAddAsinModal(true)}
        />
      )}

      {showAddAsinModal && (
        <AddAsinModal
          open={showAddAsinModal}
          onClose={() => setShowAddAsinModal(false)}
        />
      )}
      {showAsinModal && (
        <RestrictedWordModal
          open={showRestrictedModal}
          onClose={() => setShowAsinModal(false)}
          onAddClick={() => setShowAddRestrictedWordModal(true)}
        />
      )}

      {showAddAsinModal && (
        <AddRestrictedWordModal
          open={showAddRestrictedModal}
          onClose={() => setShowAddAsinModal(false)}
        />
      )}
    </div>
  );
};

export default Listing;
