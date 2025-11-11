import { Search, Upload, X } from "lucide-react";
import React, { useEffect, useState, useMemo } from "react";
import { RiFileList3Fill } from "react-icons/ri";
import { useListing } from "../../context/ListingContext";
import CustomTable from "../../components/ui/CustomTable";
import ThemeSelectField from "../../components/ui/ThemeSelectField";
import ThemeButton from "../../components/ui/ThemeButton";
import Tooltip from "@mui/material/Tooltip";
import { useNavigate } from "react-router-dom";
import { CountryOptions } from "../../utils";
import {
  FiAlertTriangle,
  FiClock,
  FiPackage,
  FiRefreshCw,
} from "react-icons/fi";
import ThemeChip from "../../components/ui/ThemeChip";
import AsinAddModal from "../../components/ui/AsinAddModel";
import AsinModal from "../../components/ui/AsinModal";
import RestrictedWordsModal from "../../components/ui/RestrictedWordModal";
import AddRestrictedWordModal from "../../components/ui/AddRestrictedWordModal";
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
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("all");
  //   const [syncing, setSyncing] = useState(false);
  const navigate = useNavigate();

  const [showAsinModal, setShowAsinModal] = useState(false);
  const [showRestrictedModal, setShowRestrictedWordModal] = useState(false);
  const [showAddRestrictedModal, setShowAddRestrictedWordModal] =
    useState(false);
  const [showAddAsinModal, setShowAddAsinModal] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    const countryCodes = selectedCountries
      .map((v) => CountryOptions.find((o) => o.value === v)?.code)
      .filter(Boolean);
    ListingService({
      page,
      limit: rowsPerPage,
      search: debouncedSearch,
      countryCodes: selectedCountries,
      status: selectedStatus === "all" ? null : selectedStatus,
      startDate: "2020-01-01 00:00:00",
      endDate: "2026-12-01 23:59:59",
    });
  }, [page, rowsPerPage, debouncedSearch, selectedCountries, selectedStatus]);

  const tableData = useMemo(() => {
    if (!listing?.data) return [];

    const getFirst = (arr) =>
      Array.isArray(arr) && arr.length ? arr[0] : null;
    const asNumber = (v) => (v === null || v === undefined ? null : Number(v));

    return listing.data.map((item) => {
      // ✅ Pull out Amazon product data from the nested `data` object
      const productData = item.data || {};

      const {
        attributes = {},
        identifiers = [],
        images = [],
        productTypes = [],
        salesRanks = [],
        summaries = [],
      } = productData;

      const summary = getFirst(summaries) || {};
      const attrsRaw = attributes || {};
      const raw = productData || {};

      // ✅ Image handling
      const image =
        summary.mainImage?.link ||
        getFirst(getFirst(images)?.images)?.link ||
        getFirst(images)?.link ||
        "https://via.placeholder.com/80x80?text=No+Image";

      // ✅ Title handling
      const title =
        summary.itemName ||
        attrsRaw.item_name?.[0]?.value ||
        "No title available";

      // ✅ Brand
      const brand =
        attrsRaw.brand?.[0]?.value || summary.brand || "Unknown Brand";

      // ✅ Price
      const price = attrsRaw.list_price?.[0]?.value || "N/A";

      // ✅ Identifiers (UPC / EAN)
      const externals = attrsRaw.externally_assigned_product_identifier || [];
      const upc = externals.find((p) => p.type === "upc")?.value || null;
      const ean = externals.find((p) => p.type === "ean")?.value || null;

      // ✅ Dimensions & Weight
      const pkgDims = attrsRaw.item_package_dimensions?.[0] || null;
      const pkgWeight = attrsRaw.item_package_weight?.[0] || null;

      // ✅ Color, Size, Items count
      const colors = (attrsRaw.color?.[0]?.value || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const size = attrsRaw.size?.[0]?.value || summary.size || null;

      const numberOfItems =
        attrsRaw.number_of_items?.[0]?.value ||
        attrsRaw.unit_count?.[0]?.value ||
        null;

      // ✅ Return clean flattened object for the table
      return {
        id: item._id,
        asin: item.asin,
        marketplaceId: item.marketplaceId,
        marketplaceCode: item.marketplaceCode || summary.marketplaceId || "N/A",
        marketplaceName:
          item.marketplaceName || summary.websiteDisplayGroupName || "N/A",

        image,
        title,
        brand,
        price,
        country: item.marketplaceCode || "N/A",
        status: item.status || "Unknown",
        notesMessage: item.notesMessage || null,
        createdAt: item.createdAt || item.storedAt || null,
        updatedAt: item.updatedAt || null,
        storedAt: item.storedAt || null,

        upc,
        ean,
        identifiers,
        size,
        color: colors,
        numberOfItems: asNumber(numberOfItems),
        itemPackageDimensions: pkgDims,
        itemPackageWeight: pkgWeight,
        itemDimensions: attrsRaw.item_dimensions?.[0] || null,
        productTypes,
        salesRanks,
        summary,
        rawResponse: raw,
        attributesRaw: attrsRaw,
        violations: item.violations || [],
      };
    });
  }, [listing]);

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
        <ThemeChip
          label={row.brand || "N/A"}
          size="sm"
          tone="neutral"
          variant="outlined"
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
        <ThemeChip
          label={row.country}
          tone="primary"
          variant="filled"
          size="sm"
        />
      ),
    },
    {
      id: "status",
      label: "Status",
      minWidth: 100,
      render: (row) => {
        const status = row.status?.toLowerCase();
        const tone =
          status === "fine"
            ? "success"
            : status === "danger"
              ? "danger"
              : "neutral";
        return (
          <ThemeChip
            label={row.status || "Unknown"}
            tone={tone}
            variant="filled"
            size="sm"
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
            size="sm"
            tone={row.status?.toLowerCase() === "danger" ? "danger" : "primary"}
            variant="contained"
            onClick={() => {
              if (row?.asin && row?.marketplaceId) {
                navigate(`/listing/${row.asin}?id=${row.marketplaceId}`);
              }
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
            <span style={{ marginLeft: "10px" }}> Restricted Word </span>
          </ThemeButton>
          <ThemeButton
            buttonType="button"
            onClick={() => setShowAsinModal(true)}
            tone="primary"
            size="md"
            aria-label="ASIN"
          >
            <Upload className="h-4 w-4" />
            <span style={{ marginLeft: "10px" }}> ASIN</span>
          </ThemeButton>
        </Box>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
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
                setSelectedCountries(values);

                const codes = payload.map((p) => p.code);
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
            onRowsPerPageChange={(value) => {
              setRowsPerPage(value);
            }}
            loading={listingLoading}
          />
        </div>
      </div>

      {showAsinModal && (
        <AsinModal
          open={showAsinModal}
          onClose={() => setShowAsinModal(false)}
          onAddClick={() => setShowAddAsinModal(true)}
        />
      )}

      {showAddAsinModal && (
        <AsinAddModal
          open={showAddAsinModal}
          onClose={() => setShowAddAsinModal(false)}
        />
      )}

      {showRestrictedModal && (
        <RestrictedWordsModal
          open={showRestrictedModal}
          onClose={() => setShowRestrictedWordModal(false)}
          onAddClick={() => setShowAddRestrictedWordModal(true)}
        />
      )}

      {showAddRestrictedModal && (
        <AddRestrictedWordModal
          open={showAddRestrictedModal}
          onClose={() => setShowAddRestrictedWordModal(false)}
        />
      )}
    </div>
  );
};

export default Listing;
