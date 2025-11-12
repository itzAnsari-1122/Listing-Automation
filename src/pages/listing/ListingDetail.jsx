// ListingDetail.jsx
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import {
  Card,
  CardContent,
  Divider,
  Typography,
  Box,
  Chip,
  Stack,
  Paper,
  Alert,
  IconButton,
  Tooltip,
  Badge,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Snackbar,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  Tag,
  DollarSign,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Maximize,
  Copy,
  Globe2,
  Save,
  X,
} from "lucide-react";

import ThemeLoader from "../../components/ui/ThemeLoader";
import ThemeButton from "../../components/ui/ThemeButton";
import ThemeTextField from "../../components/ui/ThemeTextField";
import ThemeSelectField from "../../components/ui/ThemeSelectField";
import CustomTable from "../../components/ui/CustomTable";

import { useListing } from "../../context/ListingContext";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { CountryOptions } from "../../utils";
import { useAuth } from "../../context/AuthContext";

const normalizeListing = (res) => {
  if (!res) return null;

  console.log("🔍 Raw API response structure:", {
    hasData: !!res.data,
    hasNestedData: !!(res.data && res.data.data),
    keys: Object.keys(res),
  });

  // If response has success property and data nested inside
  if (res.success && res.data) {
    console.log("✅ Success response with nested data");

    // Handle the double-nested data structure
    if (res.data.data) {
      return {
        ...res.data.data, // This is where all the product data lives
        _id: res.data._id,
        marketplaceId: res.data.marketplaceId,
        marketplaceCode: res.data.marketplaceCode,
        marketplaceName: res.data.marketplaceName,
        notesMessage: res.data.notesMessage,
        status: res.data.status,
        violations: res.data.violations || [],
        createdAt: res.data.createdAt,
        updatedAt: res.data.updatedAt,
        storedAt: res.data.storedAt,
        __v: res.data.__v,
      };
    } else {
      // Single level nesting
      return {
        ...res.data,
        _id: res._id,
        marketplaceId: res.marketplaceId,
        marketplaceCode: res.marketplaceCode,
        marketplaceName: res.marketplaceName,
        notesMessage: res.notesMessage,
        status: res.status,
        violations: res.violations || [],
        createdAt: res.createdAt,
        updatedAt: res.updatedAt,
        storedAt: res.storedAt,
        __v: res.__v,
      };
    }
  }

  // If it's already normalized
  if (res && res.asin) {
    return res;
  }

  console.log("❓ Unknown structure, returning as-is");
  return res;
};

const sameKey = (obj, asin, marketplaceId) =>
  !!obj && obj.asin === asin && obj.marketplaceId === marketplaceId;

const money = (amount, currency = "USD") =>
  amount == null
    ? "—"
    : new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
        Number(amount),
      );

const statusColor = (s) => {
  if (!s) return "default";
  if (s === "BUYABLE") return "success";
  if (s === "DISCOVERABLE") return "info";
  if (String(s).toLowerCase() === "danger") return "error";
  return "default";
};

const SectionCard = ({
  title,
  action,
  subtitle,
  icon,
  children,
  dense = false,
}) => (
  <Paper
    elevation={0}
    sx={{
      p: dense ? 2 : 3,
      mb: 3,
      border: "none",
      background: "var(--color-surface)",
      boxShadow: "0 10px 24px var(--color-shadow-light)",
      borderRadius: 2,
    }}
  >
    {(title || action || subtitle) && (
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {icon}
          <Box>
            {title && (
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: "var(--color-primary)",
                  lineHeight: 1,
                }}
              >
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography
                variant="caption"
                sx={{ color: "var(--color-text-secondary)" }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
        <Box sx={{ ml: "auto" }}>{action}</Box>
      </Box>
    )}
    {children}
  </Paper>
);

const isPlainObj = (v) => v && typeof v === "object" && !Array.isArray(v);
const pickFirst = (arr) =>
  Array.isArray(arr) && arr.length ? arr[0] : undefined;

const formatDims = (obj) => {
  const u =
    obj?.length?.unit || obj?.width?.unit || obj?.height?.unit || undefined;
  const L = obj?.length?.value;
  const W = obj?.width?.value;
  const H = obj?.height?.value;
  if (L == null && W == null && H == null) return "";
  const parts = [L, W, H].filter((x) => x != null);
  return parts.length ? `${parts.join(" × ")} ${u || ""}`.trim() : "";
};

const politeList = (arr) => arr.map(humanizeValue).filter(Boolean).join(", ");

function humanizeValue(v) {
  if (Array.isArray(v)) return politeList(v);
  if (isPlainObj(v)) {
    if ("value" in v && typeof v.value !== "object") return String(v.value);
    if ("currency" in v && "value" in v && typeof v.value !== "object")
      return money(v.value, v.currency);
    if ("height" in v || "length" in v || "width" in v) return formatDims(v);
    if ("name" in v && typeof v.name === "string") return v.name;
    return "";
  }
  if (v == null) return "";
  return String(v);
}

const getAttr = (container, key) => {
  if (!container) return "";

  const node = container[key];
  const first = pickFirst(node);

  if (!first && !node && container.data?.attributes?.[key]) {
    const dataFirst = pickFirst(container.data.attributes[key]);
    return humanizeValue(dataFirst ?? container.data.attributes[key]);
  }

  return humanizeValue(first ?? node);
};

const attrObjectToRows = (attrs = {}) => {
  const rows = [];
  Object.entries(attrs).forEach(([key, val]) => {
    if (/^other_product_image_locator_\d+$/.test(key)) return;
    if (key === "main_product_image_locator") return;

    const candidate = Array.isArray(val)
      ? val.map(humanizeValue)
      : [humanizeValue(val)];
    const cleaned = candidate.filter(Boolean);
    if (cleaned.length) rows.push({ key, value: cleaned.join("; ") });
  });
  return rows;
};

const attrsToSimpleMap = (attrs = {}) => {
  const map = {};
  attrObjectToRows(attrs).forEach(({ key, value }) => {
    map[key] = value;
  });
  return map;
};

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function extractRestrictedWords(violations = []) {
  const words = new Set();
  violations.forEach((v) => {
    const m = /restricted word\(s\):\s*(.+)$/i.exec(v?.errorMessage || "");
    if (m && m[1]) {
      m[1]
        .split(/[,&]/)
        .map((w) => w.trim())
        .filter(Boolean)
        .forEach((w) => words.add(w.toLowerCase()));
    }
  });
  return Array.from(words);
}

function containsRestricted(text, words) {
  if (!text || !words?.length) return false;
  const rx = new RegExp(`\\b(${words.map(escapeRegExp).join("|")})\\b`, "i");
  return rx.test(String(text));
}

function Highlighted({ text, words }) {
  if (!text) return <>—</>;
  if (!words?.length) return <>{text}</>;

  const rx = new RegExp(`(${words.map(escapeRegExp).join("|")})`, "ig");
  return String(text)
    .split(rx)
    .map((part, i) =>
      words.some((w) => w.toLowerCase() === part.toLowerCase()) ? (
        <Tooltip key={i} title="Restricted word">
          <mark
            tabIndex={0}
            aria-label="Restricted word"
            style={{
              background: "rgba(255, 0, 0, 0.47)",
              color: "var(--color-text)",
              padding: "2px",
              borderRadius: 3,
            }}
          >
            {part}
          </mark>
        </Tooltip>
      ) : (
        <span key={i}>{part}</span>
      ),
    );
}

export default function ListingDetail() {
  const { asin } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const marketplaceId = searchParams.get("id");
  const { user } = useAuth();

  const {
    ListingDetailService,
    listingLoading,
    listingDetail,
    EditListingService,
  } = useListing();

  const [selectedCountry, setSelectedCountry] = useState("");
  const [productData, setProductData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [imgIndex, setImgIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const goPrev = (n) => setImgIndex((i) => (n > 0 ? (i - 1 + n) % n : 0));
  const goNext = (n) => setImgIndex((i) => (n > 0 ? (i + 1) % n : 0));

  const [retryTick, setRetryTick] = useState(0);
  const abortRef = useRef(null);
  const lastKeyRef = useRef(null);
  const reqIdRef = useRef(0);

  const latestFormValuesRef = useRef(null);
  const initialDataLoadedRef = useRef(false); // NEW: Track if initial data is loaded

  const retry = () => {
    if (abortRef.current) abortRef.current.abort();
    lastKeyRef.current = null;
    setProductData(null);
    setImgIndex(0);
    setErrMsg("");
    setLoading(true);
    initialDataLoadedRef.current = false; // RESET: Reset the flag on retry
    setRetryTick((x) => x + 1);
  };

  useEffect(() => setSelectedCountry(marketplaceId || ""), [marketplaceId]);

  const onMarketplaceChange = (val) => {
    if ((val || "") === (marketplaceId || "")) return;
    setSelectedCountry(val || "");
    const next = new URLSearchParams(searchParams);
    if (val) next.set("id", val);
    else next.delete("id");
    setSearchParams(next, { replace: true });
    setProductData(null);
    setImgIndex(0);
    setIsEditing(false);
    setLoading(true);
    initialDataLoadedRef.current = false; // RESET: Reset the flag on marketplace change
  };

  const fetchKey = useMemo(
    () => (asin && marketplaceId ? `${asin}::${marketplaceId}` : null),
    [asin, marketplaceId],
  );

  useEffect(() => {
    if (!fetchKey) return;

    if (sameKey(productData, asin, marketplaceId)) {
      setLoading(false);
      return;
    }
    if (lastKeyRef.current === fetchKey) {
      setLoading(false);
      return;
    }
    lastKeyRef.current = fetchKey;

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const run = async () => {
      setLoading(true);
      setErrMsg("");
      const myReq = ++reqIdRef.current;
      try {
        const res = await ListingDetailService(
          { asin, marketplaceId },
          { signal: controller.signal },
        );
        if (myReq !== reqIdRef.current) return;

        if (res?.success === false) {
          const err = new Error(res?.message || "Request failed");
          err.status = res?.status ?? 404;
          err.payload = res;
          throw err;
        }

        const data = normalizeListing(res);
        if (!data || !data.asin) throw new Error("Malformed listing response");

        setProductData((prev) =>
          sameKey(prev, asin, marketplaceId) ? prev : data,
        );
      } catch (e) {
        if (e?.name === "AbortError") return;

        const status =
          e?.status ??
          e?.response?.status ??
          e?.payload?.status ??
          e?.response?.data?.status;
        const message =
          e?.payload?.message ??
          e?.response?.data?.message ??
          e?.message ??
          "Failed to fetch listing.";
        const friendly = status ? `${status}: ${message}` : message;

        setErrMsg(friendly);
        console.error(e);
        setLoading(false);
      } finally {
        if (myReq === reqIdRef.current) setLoading(false);
      }
    };

    run();
    return () => controller.abort();
  }, [fetchKey, retryTick]);

  useEffect(() => {
    const d = normalizeListing(listingDetail);
    if (!d || !d.asin) return;

    console.log("Normalized listing detail:", d);

    if (sameKey(d, asin, marketplaceId)) {
      if (!sameKey(productData, d.asin, d.marketplaceId)) {
        setProductData(d);
        setLoading(false);
        lastKeyRef.current = `${d.asin}::${d.marketplaceId}`;
        setImgIndex(0);
      }
    }
  }, [listingDetail, asin, marketplaceId]);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      itemName: "",
      productType: "",
      brand: "",
      manufacturer: "",
      price: "",
      listPrice: "",
      formVal: "",
      color: "",
      notes: "",
      productAttributes: {},
      itemAttributes: {},
      highlights: [],
    },
  });

  // FIXED: Only reset form when productData changes AND we're not editing
  useEffect(() => {
    if (!productData || initialDataLoadedRef.current) return;

    console.log("📝 ProductData for form setup:", productData);
    console.log("🔍 Available keys:", Object.keys(productData));

    // Extract data with better fallbacks
    const summaries = productData.summaries || [];
    const rawSummary = summaries[0] || {};

    const attributes = productData.attributes || {};
    const productAttr = Array.isArray(attributes)
      ? attributes[0] || {}
      : attributes;

    const items = productData.items || [];
    const item = items[0] || {};
    const attrItem = item.attributes || {};

    const images = productData.images || [];
    const productTypes = productData.productTypes || [];
    const salesRanks = productData.salesRanks || [];
    const identifiers = productData.identifiers || [];

    console.log("📊 Extracted data:", {
      summariesCount: summaries.length,
      attributesCount: Object.keys(productAttr).length,
      itemsCount: items.length,
      imagesCount: images.length,
      productTypes: productTypes.length,
      salesRanks: salesRanks.length,
      identifiers: identifiers.length,
    });

    const safeSummary = {
      ...rawSummary,
      status: Array.isArray(rawSummary.status)
        ? rawSummary.status
        : rawSummary.status
          ? [rawSummary.status]
          : [],
      itemName: rawSummary.itemName || productData.normalized?.itemName || "",
      mainImage:
        rawSummary.mainImage?.link ||
        images[0]?.link ||
        (images[0]?.images && images[0].images[0]?.link) ||
        null,
      marketplaceId:
        rawSummary.marketplaceId || productData.marketplaceId || "",
      productType:
        rawSummary.productType ||
        (productTypes[0] && productTypes[0].productType) ||
        "",
    };

    // Extract highlights from bullet points
    const highlightsArr = (productAttr.bullet_point || [])
      .map((bullet) => {
        if (typeof bullet === "string") return bullet;
        if (bullet && typeof bullet === "object") return bullet.value;
        return null;
      })
      .filter(Boolean);

    console.log("🌟 Highlights extracted:", highlightsArr);

    // Prepare form values
    const formValues = {
      itemName:
        safeSummary.itemName ||
        (productAttr.item_name && productAttr.item_name[0]?.value) ||
        "",
      productType: safeSummary.productType || "",
      brand:
        getAttr(productAttr, "brand") ||
        safeSummary.brand ||
        productData.normalized?.brand ||
        "",
      manufacturer:
        getAttr(productAttr, "manufacturer") || safeSummary.manufacturer || "",
      price:
        getAttr(attrItem, "purchasable_offer") ||
        (item.offers && item.offers[0]?.price?.amount) ||
        "",
      listPrice:
        getAttr(productAttr, "list_price") ||
        (productAttr.list_price && productAttr.list_price[0]?.value) ||
        "",
      formVal:
        getAttr(productAttr, "item_form") ||
        (productAttr.item_form && productAttr.item_form[0]?.value) ||
        "",
      color:
        getAttr(productAttr, "color") ||
        safeSummary.color ||
        productData.normalized?.color ||
        "",
      notes: productData.notesMessage || "",
      productAttributes: attrsToSimpleMap(productAttr),
      itemAttributes: attrsToSimpleMap(attrItem),
      highlights: highlightsArr,
    };

    console.log("✅ Final form values:", formValues);

    reset(formValues);
    latestFormValuesRef.current = formValues;
    setProductData((prev) => ({ ...prev, __safeSummary: safeSummary }));

    // MARK: Set flag to indicate initial data is loaded
    initialDataLoadedRef.current = true;
  }, [productData, reset]); // Only run when productData changes

  // NEW: Reset the flag when editing mode changes or component unmounts
  useEffect(() => {
    return () => {
      initialDataLoadedRef.current = false;
    };
  }, []);

  // Improved payload preparation
  const prepareEditPayload = (formData) => {
    const payload = {
      updates: {},
    };

    console.log("🔄 Preparing edit payload...");

    // Helper to check if value changed
    const hasChanged = (field, newValue) => {
      const oldValue = latestFormValuesRef.current?.[field];
      return JSON.stringify(newValue) !== JSON.stringify(oldValue);
    };

    // Update core fields
    const coreFields = {
      itemName: "item_name",
      brand: "brand",
      manufacturer: "manufacturer",
      color: "color",
      formVal: "item_form",
      listPrice: "list_price",
      notes: "notes",
    };

    Object.entries(coreFields).forEach(([formField, updateField]) => {
      if (
        formData[formField] !== undefined &&
        hasChanged(formField, formData[formField])
      ) {
        payload.updates[updateField] = formData[formField];
        console.log(`📝 Updating ${updateField}:`, formData[formField]);
      }
    });

    // Update highlights/bullet points
    if (formData.highlights && hasChanged("highlights", formData.highlights)) {
      payload.updates.bullet_point = formData.highlights.filter(Boolean);
      console.log("📝 Updating bullet_point:", formData.highlights);
    }

    // Update product attributes
    if (
      formData.productAttributes &&
      Object.keys(formData.productAttributes).length > 0
    ) {
      const changedAttrs = {};
      Object.entries(formData.productAttributes).forEach(([key, value]) => {
        const oldValue = latestFormValuesRef.current?.productAttributes?.[key];
        if (value !== oldValue) {
          changedAttrs[key] = value;
        }
      });

      if (Object.keys(changedAttrs).length > 0) {
        payload.updates.productAttributes = changedAttrs;
        console.log("📝 Updating productAttributes:", changedAttrs);
      }
    }

    // Update item attributes
    if (
      formData.itemAttributes &&
      Object.keys(formData.itemAttributes).length > 0
    ) {
      const changedAttrs = {};
      Object.entries(formData.itemAttributes).forEach(([key, value]) => {
        const oldValue = latestFormValuesRef.current?.itemAttributes?.[key];
        if (value !== oldValue) {
          changedAttrs[key] = value;
        }
      });

      if (Object.keys(changedAttrs).length > 0) {
        payload.updates.itemAttributes = changedAttrs;
        console.log("📝 Updating itemAttributes:", changedAttrs);
      }
    }

    console.log("✅ Final payload:", payload);
    return payload;
  };

  const onSubmit = async (form) => {
    setSaving(true);
    setErrMsg("");

    try {
      const payload = prepareEditPayload(form);

      if (Object.keys(payload.updates).length === 0) {
        setIsEditing(false);
        setSaving(false);
        return;
      }

      console.log("🚀 Sending update request...");

      const result = await EditListingService(asin, payload, marketplaceId);

      if (result?.success) {
        console.log("✅ Backend response:", result);

        // Refresh data
        const freshData = await ListingDetailService({ asin, marketplaceId });

        if (freshData?.success) {
          const normalizedData = normalizeListing(freshData);
          setProductData(normalizedData);
          latestFormValuesRef.current = form;
          // MARK: Keep the flag as true since we want to preserve the form state
        } else if (result.updatedListing) {
          setProductData(result.updatedListing);
          latestFormValuesRef.current = form;
        }

        setIsEditing(false);
      } else {
        throw new Error(result?.message || "Failed to save listing");
      }
    } catch (e) {
      console.error("❌ Save error:", e);
      const errorMessage = e?.message || "Failed to save listing.";
      setErrMsg(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (latestFormValuesRef.current) {
      reset(latestFormValuesRef.current);
    }
    setIsEditing(false);
  };

  // Enhanced data extraction for render
  const summaries = productData?.summaries || [];
  const summary = productData?.__safeSummary || summaries[0] || {};

  const items = productData?.items || [];
  const item =
    items.find((i) => i?.summaries?.[0]?.status?.includes("BUYABLE")) ||
    items[0] ||
    {};
  const attrItem = item?.attributes || {};

  const attributes = productData?.attributes || {};
  const productAttr = Array.isArray(attributes)
    ? attributes[0] || {}
    : attributes;

  const offers = item?.offers || [];
  const offer = offers[0];

  console.log("🎯 Render data:", {
    summary,
    item,
    productAttr: Object.keys(productAttr),
    offer,
  });

  const restrictedWords = useMemo(
    () => extractRestrictedWords(productData?.violations || []),
    [productData?.violations],
  );

  const { sliderImages, imageRows } = useMemo(() => {
    const galleryTop =
      Array.isArray(productData?.images?.[0]?.images) &&
      productData.images[0].images.length > 0
        ? productData.images[0].images.map((g) => ({
            url: g.link || g.url || g.src,
            variant: g.variant,
            marketplace_id: productData.images[0].marketplaceId,
          }))
        : Array.isArray(productData?.images) &&
            productData.images.length > 0 &&
            productData.images[0].link
          ? [
              {
                url: productData.images[0].link,
                variant: "MAIN",
                marketplace_id: productData.images[0].marketplaceId,
              },
            ]
          : [];

    const byMkt =
      Array.isArray(productData?.imagesByMarketplace?.[0]?.images) &&
      productData.imagesByMarketplace[0].images.length > 0
        ? productData.imagesByMarketplace[0].images.map((g) => ({
            url: g.link || g.url || g.src,
            variant: g.variant,
            marketplace_id: productData.imagesByMarketplace[0].marketplaceId,
          }))
        : [];

    const locatorKeys = Object.keys(attrItem || {}).filter((k) =>
      /^other_product_image_locator_\d+$/.test(k),
    );
    const locators = [];
    if (Array.isArray(attrItem?.main_product_image_locator)) {
      const m = attrItem.main_product_image_locator[0];
      if (m?.media_location) {
        locators.push({
          media_location: m.media_location,
          marketplace_id: m.marketplace_id || summary.marketplaceId,
        });
      }
    }
    locatorKeys.forEach((k) => {
      const v = attrItem[k]?.[0];
      if (v?.media_location)
        locators.push({
          media_location: v.media_location,
          marketplace_id: v.marketplace_id || summary.marketplaceId,
        });
    });

    const _slider =
      galleryTop.length > 0
        ? galleryTop
        : byMkt.length > 0
          ? byMkt
          : locators.map((l) => ({
              url: l.media_location,
              label: "IMG",
              marketplace_id: l.marketplace_id,
            }));

    const _imageRows =
      locators.length > 0
        ? locators
        : galleryTop.length > 0
          ? galleryTop.map((g) => ({
              media_location: g.url || g.src || g.link,
              marketplace_id: g.marketplace_id,
            }))
          : byMkt.map((g) => ({
              media_location: g.url || g.src || g.link,
              marketplace_id: g.marketplace_id,
            }));

    return {
      sliderImages: Array.isArray(_slider) ? _slider : [],
      imageRows: _imageRows || [],
    };
  }, [listingDetail, summary?.marketplaceId]);

  useEffect(() => {
    if (!Array.isArray(sliderImages)) return;
    setImgIndex((i) => {
      if (sliderImages.length === 0) return 0;
      return Math.min(i, Math.max(0, sliderImages.length - 1));
    });
  }, [sliderImages.length]);

  const handleKey = useCallback(
    (e) => {
      if (!Array.isArray(sliderImages) || sliderImages.length === 0) return;
      if (e.key === "ArrowLeft") goPrev(sliderImages.length);
      if (e.key === "ArrowRight") goNext(sliderImages.length);
    },
    [sliderImages],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  const copyToClipboard = async (text) => {
    if (!text) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
    } catch (e) {}
  };

  if (errMsg) {
    return (
      <div
        className="min-h-screen p-8"
        style={{
          backgroundColor: "var(--color-bg)",
          color: "var(--color-text)",
        }}
      >
        <Card
          sx={{
            maxWidth: 720,
            mx: "auto",
            backgroundColor: "var(--color-surface)",
            color: "var(--color-text)",
            boxShadow: "0 10px 24px var(--color-shadow-light)",
            borderRadius: "16px",
            border: "none",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              height: 6,
              background:
                "linear-gradient(90deg, var(--color-primary) 0%, rgba(59,130,246,0.6) 50%, rgba(59,130,246,0.25) 100%)",
            }}
          />
          <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
            <Alert
              severity="error"
              icon={<AlertTriangle size={18} />}
              sx={{
                mb: 2,
                background: "rgba(239, 68, 68, 0.08)",
                color: "var(--color-text)",
                border: "none",
                boxShadow: "0 6px 18px var(--color-shadow-light)",
              }}
            >
              <strong>Failed to load listing.</strong>
              <Box sx={{ mt: 1 }}>{errMsg}</Box>
            </Alert>
            <Box sx={{ display: "flex", gap: 1.5, justifyContent: "flex-end" }}>
              <ThemeButton
                variant="outline"
                size="sm"
                onClick={() => navigate(-1)}
              >
                Go Back
              </ThemeButton>
              <ThemeButton size="sm" onClick={retry}>
                Retry
              </ThemeButton>
            </Box>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading || listingLoading || !productData) {
    return <ThemeLoader message="Loading..." />;
  }

  const overview = [
    { key: "ASIN", value: productData.asin },
    { key: "SKU", value: item.sku || item.sellerSku || "" },
    {
      key: "Marketplace",
      value: productData.marketplaceName || productData.marketplaceCode,
    },
    {
      key: "Brand",
      value:
        getAttr(productAttr, "brand") ||
        productData.normalized?.brand ||
        summary.brand,
    },
    {
      key: "Manufacturer",
      value: getAttr(productAttr, "manufacturer") || summary.manufacturer,
    },
    { key: "Form", value: getAttr(productAttr, "item_form") },
    {
      key: "Color",
      value:
        getAttr(productAttr, "color") ||
        productData.normalized?.color ||
        summary.color,
    },
    { key: "Size", value: getAttr(productAttr, "size") || summary.size },
    { key: "Style", value: getAttr(productAttr, "style") || summary.style },
    { key: "Number of Items", value: getAttr(productAttr, "number_of_items") },
    {
      key: "List Price",
      value:
        humanizeValue(
          pickFirst(productAttr?.list_price) || pickFirst(attrItem?.list_price),
        ) || "",
    },
    {
      key: "Product Type",
      value:
        summary.productType ||
        (productData.productTypes && productData.productTypes[0]?.productType),
    },
    { key: "Status", value: productData.status },
  ].filter((r) => r.value && r.value !== "");

  const productAttrRows = attrObjectToRows(productAttr);
  const itemAttrRows = attrObjectToRows(attrItem);

  const highlightsData =
    (watch("highlights") || []).map((t, i) => ({ idx: i + 1, text: t })) || [];

  const overviewColumns = () => [
    { id: "key", label: "Key", minWidth: 140 },
    {
      id: "value",
      label: "Value",
      minWidth: 240,
      render: (row) =>
        isEditing &&
        ["Brand", "Manufacturer", "Form", "Color", "List Price"].includes(
          row.key,
        ) ? (
          <ThemeTextField
            isController
            control={control}
            name={
              row.key === "Brand"
                ? "brand"
                : row.key === "Manufacturer"
                  ? "manufacturer"
                  : row.key === "Form"
                    ? "formVal"
                    : row.key === "Color"
                      ? "color"
                      : "listPrice"
            }
            placeholder={row.key}
            rules={{
              validate: (v) =>
                containsRestricted(v, restrictedWords)
                  ? "Contains restricted word"
                  : true,
            }}
          />
        ) : (
          <Highlighted text={row.value} words={restrictedWords} />
        ),
    },
  ];

  const attrColumns = (formKey) => [
    { id: "key", label: "Key", minWidth: 220 },
    {
      id: "value",
      label: "Value",
      minWidth: 320,
      render: (row) =>
        isEditing ? (
          <ThemeTextField
            isController
            control={control}
            name={`${formKey}.${row.key}`}
            placeholder={row.key}
            rules={{
              validate: (v) =>
                containsRestricted(v, restrictedWords)
                  ? "Contains restricted word"
                  : true,
            }}
          />
        ) : (
          <Highlighted text={row.value} words={restrictedWords} />
        ),
    },
  ];

  const highlightsColumns = [
    { id: "idx", label: "#", minWidth: 40 },
    {
      id: "text",
      label: "Highlight",
      minWidth: 420,
      render: (row) =>
        isEditing ? (
          <ThemeTextField
            isController
            control={control}
            name={`highlights.${row.idx - 1}`}
            placeholder={`Highlight ${row.idx}`}
            rules={{
              validate: (v) =>
                containsRestricted(v, restrictedWords)
                  ? "Contains restricted word"
                  : true,
            }}
          />
        ) : (
          <Highlighted text={row.text} words={restrictedWords} />
        ),
    },
  ];

  return (
    <div
      className="mx-auto mb-12 mt-8 min-h-screen max-w-7xl px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: "var(--color-bg)", color: "var(--color-text)" }}
    >
      <Card
        sx={{
          maxWidth: 1280,
          mx: "auto",
          backgroundColor: "var(--color-surface)",
          color: "var(--color-text)",
          boxShadow: "0 10px 24px var(--color-shadow-light)",
          borderRadius: "16px",
          border: "none",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            height: 6,
            background:
              "linear-gradient(90deg, var(--color-primary) 0%, rgba(59,130,246,0.6) 50%, rgba(59,130,246,0.25) 100%)",
          }}
        />

        <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
              <Globe2 size={18} style={{ opacity: 0.8 }} />
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                Product Details
              </Typography>
              {productData?.asin && (
                <Tooltip title="Copy ASIN">
                  <IconButton
                    size="small"
                    onClick={() => copyToClipboard(productData.asin)}
                    sx={{ ml: 0.5 }}
                    aria-label="Copy ASIN"
                  >
                    <Copy size={16} />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
            <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
              <ThemeSelectField
                label="Country"
                name="countryFilter"
                multiple={false}
                value={selectedCountry}
                onChange={onMarketplaceChange}
                options={CountryOptions}
                placeholder="Select country"
                width="240px"
              />
              <ThemeButton
                onClick={() => setIsEditing((p) => !p)}
                size="sm"
                variant={isEditing ? "outline" : "solid"}
                tone={"primary"}
                startIcon={isEditing ? <X size={16} /> : <Save size={16} />}
              >
                {isEditing ? "CANCEL" : "EDIT"}
              </ThemeButton>
              {isEditing && (
                <ThemeButton
                  size="sm"
                  sx={{ bgcolor: "var(--color-primary)", color: "#fff" }}
                  onClick={handleSubmit(onSubmit)}
                  disabled={saving || !isDirty}
                  startIcon={<Save size={16} />}
                >
                  {saving ? "SAVING..." : "SAVE CHANGES"}
                </ThemeButton>
              )}
            </Box>
          </Box>

          <Divider sx={{ my: 3, borderColor: "transparent" }} />

          {/* Product Header */}
          <Box
            sx={{
              borderRadius: 2,
              p: 2.25,
              mb: 3,
              background:
                "linear-gradient(180deg, rgba(59,130,246,0.12) 0%, rgba(59,130,246,0.05) 100%)",
              border: "none",
              boxShadow: "inset 0 0 0 1px var(--color-shadow-light)",
            }}
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="md:w-auto">
                <Badge
                  color="primary"
                  overlap="circular"
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  badgeContent={
                    productData.marketplaceCode && (
                      <Chip size="small" label={productData.marketplaceCode} />
                    )
                  }
                >
                  <Box
                    sx={{
                      width: 96,
                      height: 96,
                      p: 1,
                      borderRadius: 2,
                      border: "none",
                      bgcolor: "var(--color-surface)",
                      boxShadow: "0 6px 14px var(--color-shadow-light)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <img
                      src={
                        summary?.mainImage ||
                        sliderImages[0].url ||
                        "/no-image.png"
                      }
                      alt={summary?.itemName || "No image"}
                      style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        objectFit: "contain",
                      }}
                    />
                  </Box>
                </Badge>
              </div>

              <div className="min-w-0 flex-1">
                {!isEditing ? (
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 900, lineHeight: 1.2 }}
                  >
                    <Highlighted
                      text={summary.itemName || "—"}
                      words={restrictedWords}
                    />
                  </Typography>
                ) : (
                  <ThemeTextField
                    isController
                    control={control}
                    name="itemName"
                    label="Product Name"
                    rules={{
                      required: "Product name is required",
                      validate: (v) =>
                        containsRestricted(v, restrictedWords)
                          ? "Contains restricted word"
                          : true,
                    }}
                    error={!!errors.itemName}
                    helperText={errors.itemName?.message}
                  />
                )}

                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ mt: 1, flexWrap: "wrap" }}
                >
                  {summary.productType && (
                    <Chip
                      size="small"
                      color="primary"
                      variant="outlined"
                      icon={<Tag size={14} />}
                      label={`Product Type: ${summary.productType}`}
                    />
                  )}
                  {Array.isArray(summary.status) &&
                    summary.status.map((s) => (
                      <Chip
                        key={s}
                        size="small"
                        color={statusColor(s)}
                        variant="filled"
                        label={s}
                      />
                    ))}
                </Stack>
              </div>

              <div className="text-right md:w-auto">
                <Typography
                  variant="caption"
                  sx={{ color: "var(--color-text-secondary)" }}
                >
                  Current Price
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 900 }}>
                  {money(
                    pickFirst(
                      attrItem?.purchasable_offer?.[0]?.our_price?.[0]
                        ?.schedule,
                    )?.value_with_tax || offer?.price?.amount,
                    offer?.price?.currencyCode ||
                      (productData.marketplaceCode === "CA" ? "CAD" : "USD"),
                  )}
                </Typography>
              </div>
            </div>
          </Box>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
            {/* Overview Section */}
            <div className="order-2 min-w-0 md:order-1  md:col-span-2">
              <SectionCard title="Overview">
                <Box sx={{ width: "100%", overflowX: "auto" }}>
                  <CustomTable
                    columns={overviewColumns()}
                    data={overview}
                    totalCount={overview.length}
                    pagination={false}
                    loading={false}
                  />
                </Box>
              </SectionCard>
            </div>

            {/* Images Section */}
            <div className="order-1 min-w-0 md:order-2 md:col-span-3">
              {sliderImages.length > 0 && (
                <SectionCard
                  title="Images"
                  action={
                    <Typography
                      variant="body2"
                      sx={{ color: "var(--color-text-secondary)" }}
                    >
                      {imgIndex + 1} / {sliderImages.length}
                    </Typography>
                  }
                >
                  <Box
                    sx={{
                      position: "relative",
                      width: "100%",
                      height: { xs: 240, sm: 285 },
                      borderRadius: 2,
                      overflow: "hidden",
                      boxShadow: "0 10px 24px var(--color-shadow-light)",
                      background: "var(--color-surface)",
                      p: 1,
                    }}
                  >
                    {sliderImages[imgIndex] ? (
                      <img
                        src={sliderImages[imgIndex].url}
                        alt={sliderImages[imgIndex].label || `img-${imgIndex}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          cursor: "zoom-in",
                        }}
                        onClick={() => setLightboxOpen(true)}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Typography variant="body2">No image</Typography>
                      </Box>
                    )}

                    <Tooltip title="Previous (←)">
                      <IconButton
                        onClick={() => goPrev(sliderImages.length)}
                        sx={{
                          position: "absolute",
                          top: "50%",
                          left: 8,
                          transform: "translateY(-50%)",
                          background: "rgba(0,0,0,0.25)",
                          color: "#fff",
                          "&:hover": { background: "rgba(0,0,0,0.35)" },
                        }}
                        size="small"
                        aria-label="Previous image"
                      >
                        <ChevronLeft size={18} />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Next (→)">
                      <IconButton
                        onClick={() => goNext(sliderImages.length)}
                        sx={{
                          position: "absolute",
                          top: "50%",
                          right: 8,
                          transform: "translateY(-50%)",
                          background: "rgba(0,0,0,0.25)",
                          color: "#fff",
                          "&:hover": { background: "rgba(0,0,0,0.35)" },
                        }}
                        size="small"
                        aria-label="Next image"
                      >
                        <ChevronRight size={18} />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Open full screen">
                      <IconButton
                        onClick={() => setLightboxOpen(true)}
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          bgcolor: "rgba(0,0,0,0.35)",
                          color: "#fff",
                        }}
                        size="small"
                        aria-label="Open image preview"
                      >
                        <Maximize size={16} />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  {sliderImages.length > 1 && (
                    <div className="mt-1.5 flex gap-1 overflow-x-auto pb-1">
                      {sliderImages.map((img, i) => (
                        <div
                          key={img.url || img.label || i}
                          onClick={() => setImgIndex(i)}
                          className={`h-16 w-16 flex-none cursor-pointer overflow-hidden rounded shadow ${i === imgIndex ? "ring-2 ring-[var(--color-primary)]" : "ring-1 ring-[var(--color-shadow-light)]"}`}
                          title={img.label}
                        >
                          <img
                            src={img.url}
                            alt={img.label || `thumb-${i}`}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </SectionCard>
              )}
            </div>
          </div>

          {/* Attributes Sections */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-1">
            {productAttrRows.length > 0 && (
              <div>
                <SectionCard title="Product Attributes">
                  <CustomTable
                    columns={attrColumns("productAttributes")}
                    data={productAttrRows}
                    totalCount={productAttrRows.length}
                    pagination={false}
                    loading={false}
                  />
                </SectionCard>
              </div>
            )}
            {itemAttrRows.length > 0 && (
              <div>
                <SectionCard
                  title="Item Attributes"
                  subtitle="Sourced from your offer/listing"
                >
                  <CustomTable
                    columns={attrColumns("itemAttributes")}
                    data={itemAttrRows}
                    totalCount={itemAttrRows.length}
                    pagination={false}
                    loading={false}
                  />
                </SectionCard>
              </div>
            )}
          </div>

          {/* Highlights Section */}
          {highlightsData.length > 0 && (
            <SectionCard title="Highlights" dense>
              <CustomTable
                columns={highlightsColumns}
                data={highlightsData}
                totalCount={highlightsData.length}
                loading={false}
                pagination={false}
              />
            </SectionCard>
          )}

          {/* Offers & Identifiers */}
          {offer && (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <SectionCard
                title="Offers"
                action={
                  offer?.price?.amount ? (
                    <Chip
                      size="small"
                      color="secondary"
                      icon={<DollarSign size={14} />}
                      label={money(
                        offer?.price?.amount,
                        offer?.price?.currencyCode || "USD",
                      )}
                    />
                  ) : null
                }
              >
                <div className="grid grid-cols-1 gap-2 md:auto-cols-fr md:grid-flow-col">
                  {offer?.offerType && (
                    <div>
                      <Typography variant="body2">
                        <b>Type:</b> {offer.offerType}
                      </Typography>
                    </div>
                  )}
                  {offer?.price?.amount && (
                    <div>
                      <Typography variant="body2">
                        <b>Price:</b>{" "}
                        {money(
                          offer.price.amount,
                          offer?.price?.currencyCode || "USD",
                        )}
                      </Typography>
                    </div>
                  )}
                  {offer?.audience?.displayName && (
                    <div>
                      <Typography variant="body2">
                        <b>Audience:</b> {offer.audience.displayName}
                      </Typography>
                    </div>
                  )}
                </div>
              </SectionCard>

              <div className="grid grid-cols-1  md:grid-cols-1">
                {Array.isArray(productData.identifiers) &&
                  productData.identifiers.length > 0 && (
                    <SectionCard title="Identifiers">
                      <div className="grid grid-cols-1 gap-3 overflow-x-auto md:auto-cols-max md:grid-flow-col">
                        {productData.identifiers.map((mkt) =>
                          (mkt.identifiers || []).map((id) => (
                            <div key={`${mkt.marketplaceId}-${id.identifier}`}>
                              <Typography variant="body2">
                                <b>{id.identifierType}</b>: {id.identifier}
                              </Typography>
                            </div>
                          )),
                        )}
                      </div>
                    </SectionCard>
                  )}
              </div>
            </div>
          )}

          {/* Sales Ranks */}
          {Array.isArray(productData.salesRanks) &&
            productData.salesRanks.length > 0 && (
              <SectionCard title="Sales Ranks">
                <div className="space-y-2">
                  {productData.salesRanks.map((sr, idx) => (
                    <div key={idx} className="flex flex-wrap gap-2">
                      {(sr.classificationRanks || []).map((c) => (
                        <Chip
                          key={`${c.title}-${c.rank}`}
                          size="small"
                          color="info"
                          variant="outlined"
                          label={`${c.title}: #${c.rank}`}
                        />
                      ))}
                      {(sr.displayGroupRanks || []).map((d) => (
                        <Chip
                          key={`${d.title}-${d.rank}`}
                          size="small"
                          color="primary"
                          variant="outlined"
                          label={`${d.title}: #${d.rank}`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

          {/* Violations */}
          {Array.isArray(productData.violations) &&
            productData.violations.length > 0 && (
              <SectionCard dense>
                <Alert
                  severity="warning"
                  icon={<AlertTriangle size={18} />}
                  sx={{
                    background: "rgba(245, 158, 11, 0.08)",
                    color: "var(--color-text)",
                    border: "none",
                    boxShadow: "0 6px 18px var(--color-shadow-light)",
                  }}
                >
                  <strong>
                    {productData.violations.length} restriction(s) found:
                  </strong>
                  <Box sx={{ mt: 1 }}>
                    {productData.violations.map((v) => (
                      <Typography
                        key={v._id || v.errorMessage}
                        variant="body2"
                        sx={{ mt: 0.5 }}
                      >
                        • {v.errorMessage}
                      </Typography>
                    ))}
                  </Box>
                </Alert>
              </SectionCard>
            )}

          {/* Notes Section */}
          <SectionCard title="Notes">
            {!isEditing ? (
              <Typography variant="body2">
                <Highlighted
                  text={productData.notesMessage || "—"}
                  words={restrictedWords}
                />
              </Typography>
            ) : (
              <ThemeTextField
                isController
                control={control}
                name="notes"
                label="Notes Message"
                multiline
                rows={3}
                rules={{
                  validate: (v) =>
                    containsRestricted(v, restrictedWords)
                      ? "Contains restricted word"
                      : true,
                }}
              />
            )}
          </SectionCard>

          {/* Edit Mode Actions */}
          {isEditing && (
            <Box
              sx={{
                position: "sticky",
                bottom: 0,
                mt: 2,
                pt: 2,
                display: "flex",
                gap: 2,
                justifyContent: "flex-end",
                background:
                  "linear-gradient(180deg, rgba(0,0,0,0) 0%, var(--color-bg) 60%)",
              }}
            >
              <ThemeButton
                variant="outline"
                size="sm"
                onClick={handleCancel}
                startIcon={<X size={16} />}
              >
                CANCEL
              </ThemeButton>
              <ThemeButton
                size="sm"
                sx={{ bgcolor: "var(--color-primary)", color: "#fff" }}
                onClick={handleSubmit(onSubmit)}
                disabled={saving || !isDirty}
                startIcon={<Save size={16} />}
              >
                {saving ? "SAVING..." : "SAVE CHANGES"}
              </ThemeButton>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Lightbox Dialog */}
      <Dialog
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Image Preview</DialogTitle>
        <DialogContent dividers>
          {sliderImages.length > 0 && sliderImages[imgIndex] ? (
            <Box sx={{ width: "100%", height: { xs: 360, sm: 480 } }}>
              <img
                src={sliderImages[imgIndex].url}
                alt={sliderImages[imgIndex].label || `img-${imgIndex}`}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </Box>
          ) : (
            <Typography variant="body2">No image available.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <ThemeButton
            variant="outline"
            size="sm"
            onClick={() => goPrev(sliderImages.length)}
            disabled={sliderImages.length === 0}
            startIcon={<ChevronLeft size={16} />}
          >
            Prev
          </ThemeButton>
          <ThemeButton
            variant="outline"
            size="sm"
            onClick={() => goNext(sliderImages.length)}
            disabled={sliderImages.length === 0}
            endIcon={<ChevronRight size={16} />}
          >
            Next
          </ThemeButton>
          <ThemeButton size="sm" onClick={() => setLightboxOpen(false)}>
            Close
          </ThemeButton>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
