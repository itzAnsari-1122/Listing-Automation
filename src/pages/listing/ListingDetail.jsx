import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useListing } from "../../context/ListingContext";
import { useParams, useSearchParams } from "react-router-dom";
import ThemeLoader from "../../components/ui/ThemeLoader";
import MainCard from "../../components/ui/MainCard";
import ThemeChip from "../../components/ui/ThemeChip";
import ThemeButton from "../../components/ui/ThemeButton";
import CustomTable from "../../components/ui/CustomTable";
import ThemeTextField from "../../components/ui/ThemeTextField";
import { themeToast } from "../../components/ui/ThemeToaster";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  ExternalLink,
  Image as ImageIcon,
  Package,
  Tag,
  Scale,
  Ruler,
  Battery,
  Calendar,
  User,
  Edit3,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Shield,
  AlertCircle,
  FileText,
  Edit,
  Copy,
  Download,
  Share2,
  Trash2,
  Plus,
} from "lucide-react";
import { Box } from "@mui/material";
import { RiFileList3Fill } from "react-icons/ri";
import ThemeSelectField from "../../components/ui/ThemeSelectField";
import { CountryOptions } from "../../utils";

// Policy Violations Card Component
const PolicyViolationsCard = React.memo(({ violations }) => {
  const [isCardExpanded, setIsCardExpanded] = useState(false);

  const toggleCardExpansion = useCallback(() => {
    setIsCardExpanded((prev) => !prev);
  }, []);

  const extractRestrictedWords = useCallback((errorMessage) => {
    if (!errorMessage) return [];
    const match = errorMessage.match(/restricted word\(s\): (.+)$/);
    return match ? match[1].split(", ") : [];
  }, []);

  const extractASIN = useCallback((errorMessage) => {
    if (!errorMessage) return "";
    const match = errorMessage.match(/For ASIN (.+?),/);
    return match ? match[1] : "";
  }, []);

  const lastDetectedDate = useMemo(() => {
    return violations[0]?.createdAt
      ? new Date(violations[0].createdAt).toLocaleDateString()
      : "Unknown date";
  }, [violations]);

  if (violations.length === 0) return null;

  return (
    <MainCard radius="12px" bgColor="var(--color-surface)" className="mb-6">
      {/* Compact Header - Always Visible */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-[var(--color-danger-200)] p-2">
            <AlertTriangle className="h-5 w-5 text-[var(--color-danger)]" />
          </div>
          <div>
            <h3 className="font-semibold text-[var(--color-text)]">
              Attention Required
            </h3>
            <p className="mt-1 text-[var(--color-text-muted)]">
              {violations.length} policy violation
              {violations.length !== 1 ? "s" : ""} detected
            </p>
          </div>
        </div>

        {/* Expand/Collapse Button */}
        <ThemeButton
          buttonType="icon"
          size="sm"
          tone="danger"
          onClick={toggleCardExpansion}
          aria-label={
            isCardExpanded ? "Collapse violations" : "Expand violations"
          }
        >
          {isCardExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </ThemeButton>
      </div>

      {/* Expanded Content */}
      {isCardExpanded && (
        <div className="mt-6 space-y-4 border-t border-[var(--color-border)] pt-4">
          {/* Header with count */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h4 className="text-lg font-semibold text-[var(--color-text)]">
                Policy Violations
              </h4>
              <ThemeChip
                label={`${violations.length} issue${violations.length !== 1 ? "s" : ""}`}
                tone="danger"
                size="sm"
              />
            </div>
          </div>

          {/* Violations List */}
          <div className="mt-4 max-h-96 space-y-3 overflow-y-auto">
            {violations.map((violation, index) => {
              const restrictedWords = extractRestrictedWords(
                violation.errorMessage,
              );
              const asin = extractASIN(violation.errorMessage);
              const fieldName = violation.errorKey.replace(
                "root.attributes.",
                "",
              );

              return (
                <div
                  key={violation._id || index}
                  className="rounded-lg border border-[var(--color-danger-200)] bg-[var(--color-danger-200)] p-4 transition-colors hover:border-[var(--color-danger)]"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-3">
                        <div className="mb-2 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-[var(--color-danger)]" />
                          <code className="rounded bg-[var(--color-danger-200)] px-2 py-1 text-xs font-semibold text-[var(--color-danger)]">
                            {fieldName}
                          </code>
                        </div>

                        {/* Error Message */}
                        <p className="text-sm text-[var(--color-danger)]">
                          {asin && (
                            <>
                              For ASIN{" "}
                              <strong className="font-mono">{asin}</strong>, the
                              key <strong>"{fieldName}"</strong> contains
                              restricted word
                              {restrictedWords.length !== 1 ? "s" : ""}:{" "}
                            </>
                          )}
                          <strong className="text-[var(--color-danger)]">
                            {restrictedWords.join(", ")}
                          </strong>
                        </p>

                        {/* Current Value */}
                        {violation.errorValue && (
                          <div className="mt-2 rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-2 text-xs">
                            <div className="text-[var(--color-text-muted)]">
                              Current value:
                            </div>
                            <div className="mt-1 font-mono text-[var(--color-text)]">
                              {violation.errorValue}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-4 flex items-center justify-between border-t border-[var(--color-border)] pt-4">
            <p className="text-xs text-[var(--color-text-muted)]">
              Last detected: {lastDetectedDate}
            </p>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-[var(--color-text-muted)]" />
              <span className="text-xs text-[var(--color-text-muted)]">
                {violations.length} violation
                {violations.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>
      )}
    </MainCard>
  );
});

// Image Gallery Component
const ImageGallery = React.memo(({ images, title }) => {
  const [activeImage, setActiveImage] = useState(0);
  const mainImages = useMemo(
    () => images.filter((img) => img.variant === "MAIN"),
    [images],
  );

  if (mainImages.length === 0) {
    return (
      <MainCard radius="16px" bgColor="var(--color-surface)">
        <div className="flex aspect-square items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-bg)] to-[var(--color-surface)]">
          <div className="text-center text-[var(--color-text-muted)]">
            <ImageIcon className="mx-auto mb-2 h-12 w-12 opacity-50" />
            <p className="text-sm">No image available</p>
          </div>
        </div>
      </MainCard>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image Card */}
      <MainCard radius="16px" bgColor="var(--color-surface)">
        <div className="flex aspect-square items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-bg)] to-[var(--color-surface)] p-4">
          <img
            src={mainImages[activeImage].link}
            alt={`${title} - View ${activeImage + 1}`}
            className="max-h-full max-w-full rounded-lg object-contain shadow-lg transition-opacity duration-300"
            loading="lazy"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "block";
            }}
          />
          <div className="hidden text-center text-[var(--color-text-muted)]">
            <ImageIcon className="mx-auto mb-2 h-12 w-12 opacity-50" />
            <p className="text-sm">Failed to load image</p>
          </div>
        </div>
      </MainCard>

      {/* Image Thumbnails */}
      {mainImages.length > 1 && (
        <MainCard radius="16px" bgColor="var(--color-surface)">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--color-text)]">
            <ImageIcon size={16} className="text-[var(--color-primary)]" />
            Product Images ({mainImages.length})
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {mainImages.map((img, index) => (
              <button
                key={index}
                onClick={() => setActiveImage(index)}
                className={`aspect-square rounded-xl border-2 bg-gradient-to-br from-[var(--color-bg)] to-[var(--color-surface)] p-2 transition-all duration-200 ${
                  activeImage === index
                    ? "scale-105 border-[var(--color-primary)] shadow-lg"
                    : "border-transparent hover:border-[var(--color-primary)] hover:shadow-md"
                }`}
                aria-label={`View image ${index + 1}`}
              >
                <img
                  src={img.link}
                  alt={`Thumbnail ${index + 1}`}
                  className="h-full w-full rounded-lg object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </MainCard>
      )}
    </div>
  );
});

// Status Indicator Component
const StatusIndicator = React.memo(({ status, lastUpdated }) => {
  const statusConfig = useMemo(() => {
    const config = {
      Danger: {
        tone: "danger",
        icon: <AlertTriangle size={14} />,
        color: "text-[var(--color-danger)]",
        bgColor: "bg-[var(--color-danger-200)]",
      },
      Warning: {
        tone: "warn",
        icon: <AlertTriangle size={14} />,
        color: "text-[var(--color-warning)]",
        bgColor: "bg-[var(--color-warning-200)]",
      },
      Success: {
        tone: "success",
        icon: <CheckCircle size={14} />,
        color: "text-[var(--color-success)]",
        bgColor: "bg-[var(--color-success-200)]",
      },
      Info: {
        tone: "primary",
        icon: <Info size={14} />,
        color: "text-[var(--color-primary)]",
        bgColor: "bg-[var(--color-primary-200)]",
      },
    };
    return config[status] || config.Info;
  }, [status]);

  return (
    <div className="flex items-center gap-3">
      <div className={`rounded-full p-2 ${statusConfig.bgColor}`}>
        {React.cloneElement(statusConfig.icon, {
          className: statusConfig.color,
        })}
      </div>
      <div>
        <div className="text-sm font-medium text-[var(--color-text)]">
          Status: {status}
        </div>
        <div className="text-xs text-[var(--color-text-muted)]">
          Updated {new Date(lastUpdated).toLocaleString()}
        </div>
      </div>
    </div>
  );
});

// Bulk Edit Modal Component with React Hook Form
const BulkEditModal = React.memo(
  ({
    isOpen,
    onClose,
    onSave,
    productData,
    loading,
    violations,
    restrictedWords,
  }) => {
    const {
      register,
      handleSubmit,
      formState: { errors },
      reset,
      watch,
    } = useForm();

    // Check if text contains restricted words
    const containsRestrictedWords = (text) => {
      if (!text || !restrictedWords || restrictedWords.length === 0)
        return false;
      const lowerText = text.toLowerCase();
      return restrictedWords.some((word) =>
        lowerText.includes(word.toLowerCase()),
      );
    };

    // Custom validation for restricted words
    const validateNoRestrictedWords = (value) => {
      if (!value) return true;
      if (containsRestrictedWords(value)) {
        return "This field contains restricted words that violate policy";
      }
      return true;
    };

    useEffect(() => {
      if (productData && isOpen) {
        const initialValues = {};

        // Basic Information
        if (productData.summaries) {
          initialValues.item_name = productData.summaries.itemName || "";
          initialValues.brand = productData.summaries.brand || "";
          initialValues.manufacturer = productData.summaries.manufacturer || "";
          initialValues.model_number = productData.summaries.modelNumber || "";
          initialValues.part_number = productData.summaries.partNumber || "";
          initialValues.color = productData.summaries.color || "";
          initialValues.size = productData.summaries.size || "";
          initialValues.style = productData.summaries.style || "";
        }

        // Specifications
        if (productData.attributes) {
          initialValues.item_weight =
            productData.attributes.item_weight?.[0]?.value || "";
          initialValues.batteries_required =
            productData.attributes.batteries_required?.[0]?.value || "";
          initialValues.batteries_included =
            productData.attributes.batteries_included?.[0]?.value || "";

          // Additional specification fields
          initialValues.item_dimensions_length =
            productData.attributes.item_dimensions?.[0]?.length?.value || "";
          initialValues.item_dimensions_width =
            productData.attributes.item_dimensions?.[0]?.width?.value || "";
          initialValues.item_dimensions_height =
            productData.attributes.item_dimensions?.[0]?.height?.value || "";
          initialValues.manufacturer_minimum_age =
            productData.attributes.manufacturer_minimum_age?.[0]?.value || "";
          initialValues.manufacturer_maximum_age =
            productData.attributes.manufacturer_maximum_age?.[0]?.value || "";
          initialValues.product_site_launch_date =
            productData.attributes.product_site_launch_date?.[0]?.value || "";

          // Restricted word fields from violations
          initialValues.scent = productData.attributes.scent?.[0]?.value || "";
          initialValues.pattern =
            productData.attributes.pattern?.[0]?.value || "";
          initialValues.material_composition =
            productData.attributes.material_composition?.[0]?.value || "";
          initialValues.item_shape =
            productData.attributes.item_shape?.[0]?.value || "";
        }

        // Features
        if (productData.attributes?.bullet_point) {
          initialValues.bullet_point = productData.attributes.bullet_point
            .map((bp) => bp.value)
            .join("\n");
        }

        reset(initialValues);
      }
    }, [productData, isOpen, reset]);

    const onSubmit = (data) => {
      const updates = {};

      // Process all fields
      Object.keys(data).forEach((field) => {
        if (data[field] !== getOriginalValue(field)) {
          updates[field] = data[field];
        }
      });

      if (Object.keys(updates).length > 0) {
        onSave(updates);
      } else {
        themeToast.info("No changes detected");
      }
    };

    const getOriginalValue = (field) => {
      if (!productData) return "";

      switch (field) {
        case "item_name":
          return productData.summaries?.itemName || "";
        case "brand":
          return productData.summaries?.brand || "";
        case "manufacturer":
          return productData.summaries?.manufacturer || "";
        case "model_number":
          return productData.summaries?.modelNumber || "";
        case "part_number":
          return productData.summaries?.partNumber || "";
        case "color":
          return productData.summaries?.color || "";
        case "size":
          return productData.summaries?.size || "";
        case "style":
          return productData.summaries?.style || "";
        case "item_weight":
          return productData.attributes?.item_weight?.[0]?.value || "";
        case "batteries_required":
          return productData.attributes?.batteries_required?.[0]?.value || "";
        case "batteries_included":
          return productData.attributes?.batteries_included?.[0]?.value || "";
        case "item_dimensions_length":
          return (
            productData.attributes?.item_dimensions?.[0]?.length?.value || ""
          );
        case "item_dimensions_width":
          return (
            productData.attributes?.item_dimensions?.[0]?.width?.value || ""
          );
        case "item_dimensions_height":
          return (
            productData.attributes?.item_dimensions?.[0]?.height?.value || ""
          );
        case "manufacturer_minimum_age":
          return (
            productData.attributes?.manufacturer_minimum_age?.[0]?.value || ""
          );
        case "manufacturer_maximum_age":
          return (
            productData.attributes?.manufacturer_maximum_age?.[0]?.value || ""
          );
        case "product_site_launch_date":
          return (
            productData.attributes?.product_site_launch_date?.[0]?.value || ""
          );
        case "bullet_point":
          return (
            productData.attributes?.bullet_point
              ?.map((bp) => bp.value)
              .join("\n") || ""
          );
        case "scent":
          return productData.attributes?.scent?.[0]?.value || "";
        case "pattern":
          return productData.attributes?.pattern?.[0]?.value || "";
        case "material_composition":
          return productData.attributes?.material_composition?.[0]?.value || "";
        case "item_shape":
          return productData.attributes?.item_shape?.[0]?.value || "";
        default:
          return "";
      }
    };

    // Watch for restricted words in real-time
    const watchItemName = watch("item_name");
    const watchBrand = watch("brand");
    const watchFeatures = watch("bullet_point");
    const watchScent = watch("scent");
    const watchPattern = watch("pattern");
    const watchMaterialComposition = watch("material_composition");
    const watchItemShape = watch("item_shape");

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
        <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-2xl">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[var(--color-text)]">
              Edit Listing Details
            </h3>
            <button
              onClick={onClose}
              className="rounded-full p-1 transition-colors duration-200 hover:bg-[var(--color-hover)]"
              disabled={loading}
            >
              <X size={20} className="text-[var(--color-text)]" />
            </button>
          </div>

          {/* Restricted Words Warning */}
          {restrictedWords.length > 0 && (
            <div className="mb-4 rounded-lg border border-[var(--color-warning-200)] bg-[var(--color-warning-200)] p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 text-[var(--color-warning)]" />
                <div className="flex-1">
                  <h4 className="font-semibold text-[var(--color-warning)]">
                    Restricted Words Detected
                  </h4>
                  <p className="mt-1 text-sm text-[var(--color-warning)]">
                    Avoid using these restricted words:{" "}
                    <strong>{restrictedWords.join(", ")}</strong>
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h4 className="mb-4 text-lg font-semibold text-[var(--color-text)]">
                Basic Information
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="mb-2 block text-sm font-medium text-[var(--color-text-muted)]">
                    Item Name *
                  </label>
                  <input
                    {...register("item_name", {
                      required: "Item name is required",
                      validate: validateNoRestrictedWords,
                    })}
                    type="text"
                    className={`w-full rounded-lg border px-3 py-2 text-[var(--color-text)] focus:outline-none focus:ring-2 ${
                      errors.item_name
                        ? "border-[var(--color-danger)] bg-[var(--color-danger-200)] focus:border-[var(--color-danger)] focus:ring-[var(--color-danger)]"
                        : containsRestrictedWords(watchItemName)
                          ? "border-[var(--color-warning)] bg-[var(--color-warning-200)] focus:border-[var(--color-warning)] focus:ring-[var(--color-warning)]"
                          : "border-[var(--color-border)] bg-[var(--color-bg)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                    }`}
                    placeholder="Enter item name..."
                  />
                  {errors.item_name && (
                    <p className="mt-1 text-sm text-[var(--color-danger)]">
                      {errors.item_name.message}
                    </p>
                  )}
                  {!errors.item_name &&
                    containsRestrictedWords(watchItemName) && (
                      <p className="mt-1 text-sm text-[var(--color-warning)]">
                        ⚠️ This field contains restricted words
                      </p>
                    )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--color-text-muted)]">
                    Brand
                  </label>
                  <input
                    {...register("brand", {
                      validate: validateNoRestrictedWords,
                    })}
                    type="text"
                    className={`w-full rounded-lg border px-3 py-2 text-[var(--color-text)] focus:outline-none focus:ring-2 ${
                      errors.brand
                        ? "border-[var(--color-danger)] bg-[var(--color-danger-200)] focus:border-[var(--color-danger)] focus:ring-[var(--color-danger)]"
                        : containsRestrictedWords(watchBrand)
                          ? "border-[var(--color-warning)] bg-[var(--color-warning-200)] focus:border-[var(--color-warning)] focus:ring-[var(--color-warning)]"
                          : "border-[var(--color-border)] bg-[var(--color-bg)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                    }`}
                    placeholder="Enter brand..."
                  />
                  {errors.brand && (
                    <p className="mt-1 text-sm text-[var(--color-danger)]">
                      {errors.brand.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--color-text-muted)]">
                    Manufacturer
                  </label>
                  <input
                    {...register("manufacturer")}
                    type="text"
                    className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    placeholder="Enter manufacturer..."
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--color-text-muted)]">
                    Model Number
                  </label>
                  <input
                    {...register("model_number")}
                    type="text"
                    className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    placeholder="Enter model number..."
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--color-text-muted)]">
                    Part Number
                  </label>
                  <input
                    {...register("part_number")}
                    type="text"
                    className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    placeholder="Enter part number..."
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--color-text-muted)]">
                    Color
                  </label>
                  <input
                    {...register("color")}
                    type="text"
                    className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    placeholder="Enter color..."
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--color-text-muted)]">
                    Size
                  </label>
                  <input
                    {...register("size")}
                    type="text"
                    className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    placeholder="Enter size..."
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--color-text-muted)]">
                    Style
                  </label>
                  <input
                    {...register("style")}
                    type="text"
                    className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    placeholder="Enter style..."
                  />
                </div>
              </div>
            </div>

            {/* Specifications */}
            <div>
              <h4 className="mb-4 text-lg font-semibold text-[var(--color-text)]">
                Specifications
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--color-text-muted)]">
                    Weight
                  </label>
                  <input
                    {...register("item_weight")}
                    type="text"
                    className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    placeholder="Enter weight..."
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--color-text-muted)]">
                    Batteries Required
                  </label>
                  <input
                    {...register("batteries_required")}
                    type="text"
                    className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    placeholder="Enter batteries required..."
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--color-text-muted)]">
                    Batteries Included
                  </label>
                  <input
                    {...register("batteries_included")}
                    type="text"
                    className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    placeholder="Enter batteries included..."
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--color-text-muted)]">
                    Dimensions Length
                  </label>
                  <input
                    {...register("item_dimensions_length")}
                    type="text"
                    className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    placeholder="Enter length..."
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--color-text-muted)]">
                    Dimensions Width
                  </label>
                  <input
                    {...register("item_dimensions_width")}
                    type="text"
                    className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    placeholder="Enter width..."
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--color-text-muted)]">
                    Dimensions Height
                  </label>
                  <input
                    {...register("item_dimensions_height")}
                    type="text"
                    className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    placeholder="Enter height..."
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--color-text-muted)]">
                    Minimum Age (months)
                  </label>
                  <input
                    {...register("manufacturer_minimum_age")}
                    type="number"
                    className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    placeholder="Enter minimum age..."
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--color-text-muted)]">
                    Maximum Age (months)
                  </label>
                  <input
                    {...register("manufacturer_maximum_age")}
                    type="number"
                    className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    placeholder="Enter maximum age..."
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--color-text-muted)]">
                    Launch Date
                  </label>
                  <input
                    {...register("product_site_launch_date")}
                    type="date"
                    className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                </div>
              </div>
            </div>

            {/* Restricted Word Fields */}
            <div>
              <h4 className="mb-4 text-lg font-semibold text-[var(--color-text)]">
                Additional Attributes
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--color-text-muted)]">
                    Scent
                  </label>
                  <input
                    {...register("scent", {
                      validate: validateNoRestrictedWords,
                    })}
                    type="text"
                    className={`w-full rounded-lg border px-3 py-2 text-[var(--color-text)] focus:outline-none focus:ring-2 ${
                      errors.scent
                        ? "border-[var(--color-danger)] bg-[var(--color-danger-200)] focus:border-[var(--color-danger)] focus:ring-[var(--color-danger)]"
                        : containsRestrictedWords(watchScent)
                          ? "border-[var(--color-warning)] bg-[var(--color-warning-200)] focus:border-[var(--color-warning)] focus:ring-[var(--color-warning)]"
                          : "border-[var(--color-border)] bg-[var(--color-bg)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                    }`}
                    placeholder="Enter scent..."
                  />
                  {errors.scent && (
                    <p className="mt-1 text-sm text-[var(--color-danger)]">
                      {errors.scent.message}
                    </p>
                  )}
                  {!errors.scent && containsRestrictedWords(watchScent) && (
                    <p className="mt-1 text-sm text-[var(--color-warning)]">
                      ⚠️ This field contains restricted words
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--color-text-muted)]">
                    Pattern
                  </label>
                  <input
                    {...register("pattern", {
                      validate: validateNoRestrictedWords,
                    })}
                    type="text"
                    className={`w-full rounded-lg border px-3 py-2 text-[var(--color-text)] focus:outline-none focus:ring-2 ${
                      errors.pattern
                        ? "border-[var(--color-danger)] bg-[var(--color-danger-200)] focus:border-[var(--color-danger)] focus:ring-[var(--color-danger)]"
                        : containsRestrictedWords(watchPattern)
                          ? "border-[var(--color-warning)] bg-[var(--color-warning-200)] focus:border-[var(--color-warning)] focus:ring-[var(--color-warning)]"
                          : "border-[var(--color-border)] bg-[var(--color-bg)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                    }`}
                    placeholder="Enter pattern..."
                  />
                  {errors.pattern && (
                    <p className="mt-1 text-sm text-[var(--color-danger)]">
                      {errors.pattern.message}
                    </p>
                  )}
                  {!errors.pattern && containsRestrictedWords(watchPattern) && (
                    <p className="mt-1 text-sm text-[var(--color-warning)]">
                      ⚠️ This field contains restricted words
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--color-text-muted)]">
                    Material Composition
                  </label>
                  <input
                    {...register("material_composition", {
                      validate: validateNoRestrictedWords,
                    })}
                    type="text"
                    className={`w-full rounded-lg border px-3 py-2 text-[var(--color-text)] focus:outline-none focus:ring-2 ${
                      errors.material_composition
                        ? "border-[var(--color-danger)] bg-[var(--color-danger-200)] focus:border-[var(--color-danger)] focus:ring-[var(--color-danger)]"
                        : containsRestrictedWords(watchMaterialComposition)
                          ? "border-[var(--color-warning)] bg-[var(--color-warning-200)] focus:border-[var(--color-warning)] focus:ring-[var(--color-warning)]"
                          : "border-[var(--color-border)] bg-[var(--color-bg)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                    }`}
                    placeholder="Enter material composition..."
                  />
                  {errors.material_composition && (
                    <p className="mt-1 text-sm text-[var(--color-danger)]">
                      {errors.material_composition.message}
                    </p>
                  )}
                  {!errors.material_composition &&
                    containsRestrictedWords(watchMaterialComposition) && (
                      <p className="mt-1 text-sm text-[var(--color-warning)]">
                        ⚠️ This field contains restricted words
                      </p>
                    )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--color-text-muted)]">
                    Item Shape
                  </label>
                  <input
                    {...register("item_shape", {
                      validate: validateNoRestrictedWords,
                    })}
                    type="text"
                    className={`w-full rounded-lg border px-3 py-2 text-[var(--color-text)] focus:outline-none focus:ring-2 ${
                      errors.item_shape
                        ? "border-[var(--color-danger)] bg-[var(--color-danger-200)] focus:border-[var(--color-danger)] focus:ring-[var(--color-danger)]"
                        : containsRestrictedWords(watchItemShape)
                          ? "border-[var(--color-warning)] bg-[var(--color-warning-200)] focus:border-[var(--color-warning)] focus:ring-[var(--color-warning)]"
                          : "border-[var(--color-border)] bg-[var(--color-bg)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                    }`}
                    placeholder="Enter item shape..."
                  />
                  {errors.item_shape && (
                    <p className="mt-1 text-sm text-[var(--color-danger)]">
                      {errors.item_shape.message}
                    </p>
                  )}
                  {!errors.item_shape &&
                    containsRestrictedWords(watchItemShape) && (
                      <p className="mt-1 text-sm text-[var(--color-warning)]">
                        ⚠️ This field contains restricted words
                      </p>
                    )}
                </div>
              </div>
            </div>

            {/* Features */}
            <div>
              <h4 className="mb-4 text-lg font-semibold text-[var(--color-text)]">
                Product Features
              </h4>
              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--color-text-muted)]">
                  Features (one per line)
                </label>
                <textarea
                  {...register("bullet_point", {
                    validate: validateNoRestrictedWords,
                  })}
                  className={`w-full rounded-lg border px-3 py-2 text-[var(--color-text)] focus:outline-none focus:ring-2 ${
                    errors.bullet_point
                      ? "border-[var(--color-danger)] bg-[var(--color-danger-200)] focus:border-[var(--color-danger)] focus:ring-[var(--color-danger)]"
                      : containsRestrictedWords(watchFeatures)
                        ? "border-[var(--color-warning)] bg-[var(--color-warning-200)] focus:border-[var(--color-warning)] focus:ring-[var(--color-warning)]"
                        : "border-[var(--color-border)] bg-[var(--color-bg)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                  }`}
                  placeholder="Enter features, one per line..."
                  rows={6}
                />
                {errors.bullet_point && (
                  <p className="mt-1 text-sm text-[var(--color-danger)]">
                    {errors.bullet_point.message}
                  </p>
                )}
                {!errors.bullet_point &&
                  containsRestrictedWords(watchFeatures) && (
                    <p className="mt-1 text-sm text-[var(--color-warning)]">
                      ⚠️ This field contains restricted words
                    </p>
                  )}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <ThemeButton
                type="button"
                buttonType="button"
                variant="outline"
                tone="neutral"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </ThemeButton>
              <ThemeButton
                type="submit"
                buttonType="button"
                tone="primary"
                loading={loading}
                disabled={loading}
              >
                Save All Changes
              </ThemeButton>
            </div>
          </form>
        </div>
      </div>
    );
  },
);

export default function ListingDetail() {
  const { listingDetail, ListingDetailService, EditListingService } =
    useListing();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCountry, setSelectedCountry] = useState();
  const { asin } = useParams();
  const marketplaceId = searchParams.get("id");

  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [bulkEditModalOpen, setBulkEditModalOpen] = useState(false);
  const [restrictedWords, setRestrictedWords] = useState([]);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await ListingDetailService({ asin, marketplaceId });
      } catch (error) {
        themeToast.error("Failed to load listing details");
        console.error("Error fetching listing details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [asin, marketplaceId]);
  const onMarketplaceChange = (val) => {
    if ((val || "") === (marketplaceId || "")) return;
    setSelectedCountry(val || "");
    const next = new URLSearchParams(searchParams);
    if (val) next.set("id", val);
    else next.delete("id");
    setSearchParams(next, { replace: true });
  };
  // Memoized product data
  const productData = useMemo(() => {
    if (!listingDetail?.success || !listingDetail?.data) return null;

    const { data: product } = listingDetail;
    return {
      ...product,
      data: product.data,
      attributes: product.data?.attributes || {},
      summaries: product.data?.summaries?.[0] || {},
      images: product.data?.images?.[0]?.images || [],
      violations: product.violations || [],
      salesRanks: product.data?.salesRanks?.[0] || null,
    };
  }, [listingDetail]);

  // Extract restricted words from violations
  useEffect(() => {
    if (productData?.violations) {
      const allWords = new Set();
      productData.violations.forEach((violation) => {
        const words = violation.errorMessage?.match(
          /restricted word\(s\): (.+)$/,
        );
        if (words && words[1]) {
          words[1]
            .split(", ")
            .forEach((word) => allWords.add(word.trim().toLowerCase()));
        }
      });
      setRestrictedWords(Array.from(allWords));
    }
    setSelectedCountry(productData?.marketplaceId);
  }, [productData]);

  // Handle bulk save using EditListingService
  const handleBulkSave = async (updates) => {
    try {
      setLoading(true);

      // Prepare payload for EditListingService
      const payload = {
        updates: updates,
      };

      // Call the EditListingService API
      await EditListingService(asin, payload, marketplaceId);

      themeToast.success("Listing updated successfully");
      setBulkEditModalOpen(false);

      // Refresh the data
      await ListingDetailService({ asin, marketplaceId });
    } catch (error) {
      themeToast.error("Failed to update listing");
      console.error("Error updating listing:", error);
    } finally {
      setLoading(false);
    }
  };

  // Basic info table configuration
  const basicInfoColumns = useMemo(
    () => [
      { id: "attribute", label: "Attribute", minWidth: 150 },
      { id: "value", label: "Value", minWidth: 200 },
    ],
    [],
  );

  const basicInfoData = useMemo(() => {
    if (!productData) return [];

    const { summaries } = productData;

    return [
      {
        attribute: "ASIN",
        value: productData.asin,
      },
      {
        attribute: "Marketplace",
        value: `${productData.marketplaceName} (${productData.marketplaceCode})`,
      },
      {
        attribute: "Item Name",
        value: summaries?.itemName || "N/A",
      },
      {
        attribute: "Brand",
        value: summaries?.brand || "N/A",
      },
      {
        attribute: "Manufacturer",
        value: summaries?.manufacturer || "N/A",
      },
      {
        attribute: "Model Number",
        value: summaries?.modelNumber || "N/A",
      },
      {
        attribute: "Part Number",
        value: summaries?.partNumber || "N/A",
      },
      {
        attribute: "Color",
        value: summaries?.color || "N/A",
      },
      {
        attribute: "Size",
        value: summaries?.size || "N/A",
      },
      {
        attribute: "Style",
        value: summaries?.style || "N/A",
      },
    ].filter((item) => item.value !== "N/A");
  }, [productData]);

  // Loading state
  if (loading && !productData) {
    return <ThemeLoader type="fullpage" message="Loading product details..." />;
  }

  // Error state
  if (!productData) {
    return (
      <div className="mx-auto mb-12 mt-8 min-h-screen max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <XCircle className="mx-auto mb-4 h-16 w-16 text-[var(--color-danger)]" />
            <h2 className="text-xl font-semibold text-[var(--color-text)]">
              Product Not Found
            </h2>
            <p className="mt-2 text-[var(--color-text-muted)]">
              Unable to load product details for ASIN: {asin}
            </p>
            <ThemeButton
              buttonType="button"
              tone="primary"
              onClick={() => window.location.reload()}
              className="mt-4"
            >
              Try Again
            </ThemeButton>
          </div>
        </div>
      </div>
    );
  }

  const { summaries, images, violations, salesRanks, attributes } = productData;

  return (
    <div className="mx-auto mb-12 mt-8 min-h-screen max-w-7xl px-4 sm:px-6 lg:px-0">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between pt-4">
        <div className="flex items-center gap-4">
          <RiFileList3Fill
            size={30}
            style={{ color: "var(--color-primary)" }}
          />
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-text)]">
              Listing Detail
            </h1>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              ASIN: {asin} • Marketplace: {productData.marketplaceName}
            </p>
          </div>
        </div>

        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <ThemeSelectField
            countriesFlags
            label="Country"
            name="countryFilter"
            multiple={false}
            value={selectedCountry}
            onChange={onMarketplaceChange}
            options={CountryOptions}
            placeholder="Select country"
            width="240px"
          />{" "}
          <Box sx={{ justifyContent: "flex-end" }}>
            <ThemeButton
              buttonType="button"
              onClick={() => setBulkEditModalOpen(true)}
              tone="primary"
              size="md"
              variant="filled"
            >
              <Edit size={16} />
              <span className="ml-2">Edit Listing</span>
            </ThemeButton>
          </Box>
        </Box>
      </div>

      <MainCard radius="16px" bgColor="var(--color-surface)">
        {/* Product Header */}
        <div className="mb-6 flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-4 flex items-center gap-4">
              <h1 className="break-words text-3xl font-bold text-[var(--color-text)]">
                {summaries?.itemName || productData.asin}
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <StatusIndicator
                status={productData.status}
                lastUpdated={productData.updatedAt}
              />
              <div className="text-sm text-[var(--color-text-muted)]">
                ASIN: <strong>{productData.asin}</strong>
              </div>
              <div className="text-sm text-[var(--color-text-muted)]">
                Marketplace: <strong>{productData.marketplaceName}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Policy Violations */}
        {violations.length > 0 && (
          <PolicyViolationsCard violations={violations} />
        )}

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Left Column - Images */}
          <div className="space-y-6 lg:col-span-3">
            {/* Basic Information Card */}
            <MainCard radius="16px" bgColor="var(--color-surface)">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-xl font-semibold text-[var(--color-text)]">
                  <div className="rounded-full bg-[var(--color-primary-200)] p-2">
                    <Info size={18} className="text-[var(--color-primary)]" />
                  </div>
                  Basic Information
                </h2>
              </div>
              <CustomTable
                columns={basicInfoColumns}
                data={basicInfoData}
                pagination={false}
                loading={loading}
              />
            </MainCard>

            {/* Sales Ranks Card */}
            {salesRanks && (
              <MainCard radius="16px" bgColor="var(--color-surface)">
                <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-[var(--color-text)]">
                  <div className="rounded-full bg-[var(--color-success-200)] p-2">
                    <Tag size={18} className="text-[var(--color-success)]" />
                  </div>
                  Sales Performance
                </h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {salesRanks.classificationRanks?.map((rank, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-bg)] to-[var(--color-surface)] p-4 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-[var(--color-text-muted)]">
                            {rank.title}
                          </span>
                          <div className="mt-1 text-2xl font-bold text-[var(--color-text)]">
                            #{rank.rank.toLocaleString()}
                          </div>
                        </div>
                        <ThemeChip
                          label={`Rank #${rank.rank.toLocaleString()}`}
                          tone="primary"
                          size="sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </MainCard>
            )}

            {/* Product Specifications */}
            <ProductSpecifications attributes={attributes} />

            {/* Product Features */}
            {attributes.bullet_point?.length > 0 && (
              <MainCard radius="16px" bgColor="var(--color-surface)">
                <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-[var(--color-text)]">
                  <div className="bg-[var(--color-accent)]/20 rounded-full p-2">
                    <FileText
                      size={18}
                      className="text-[var(--color-accent)]"
                    />
                  </div>
                  Product Features
                </h2>
                <div className="grid grid-cols-1 gap-3">
                  {attributes.bullet_point.map((bullet, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 rounded-lg border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-bg)] to-[var(--color-surface)] p-4 shadow-sm"
                    >
                      <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-[var(--color-primary)]" />
                      <span className="text-sm leading-relaxed text-[var(--color-text)]">
                        {bullet.value}
                      </span>
                    </div>
                  ))}
                </div>
              </MainCard>
            )}
          </div>

          {/* Right Column - Details */}
          <div className="space-y-4 lg:col-span-1">
            <ImageGallery images={images} title={summaries?.itemName} />
          </div>
        </div>

        {/* Bulk Edit Modal */}
        <BulkEditModal
          isOpen={bulkEditModalOpen}
          onClose={() => setBulkEditModalOpen(false)}
          onSave={handleBulkSave}
          productData={productData}
          violations={violations}
          restrictedWords={restrictedWords}
          loading={loading}
        />
      </MainCard>
    </div>
  );
}

// Product Specifications Component
const ProductSpecifications = React.memo(({ attributes }) => {
  const specs = useMemo(
    () =>
      [
        {
          key: "item_weight",
          icon: <Scale size={16} className="text-[var(--color-primary)]" />,
          label: "Weight",
          value: attributes.item_weight?.[0]
            ? `${attributes.item_weight[0].value} ${attributes.item_weight[0].unit}`
            : null,
          bgColor: "bg-[var(--color-primary-200)]",
        },
        {
          key: "item_dimensions",
          icon: <Ruler size={16} className="text-[var(--color-success)]" />,
          label: "Dimensions",
          value: attributes.item_dimensions?.[0]
            ? `${attributes.item_dimensions[0].length?.value}×${attributes.item_dimensions[0].width?.value}×${attributes.item_dimensions[0].height?.value} ${attributes.item_dimensions[0].length?.unit}`
            : null,
          bgColor: "bg-[var(--color-success-200)]",
        },
        {
          key: "batteries",
          icon: <Battery size={16} className="text-[var(--color-warning)]" />,
          label: "Batteries",
          value: attributes.batteries_required?.[0]
            ? `Required${attributes.batteries_included?.[0] ? ` • ${attributes.batteries_included[0].value ? "Included" : "Not Included"}` : ""}`
            : null,
          bgColor: "bg-[var(--color-warning-200)]",
        },
        {
          key: "age_range",
          icon: <User size={16} className="text-[var(--color-accent)]" />,
          label: "Age Range",
          value:
            attributes.manufacturer_minimum_age?.[0] ||
            attributes.manufacturer_maximum_age?.[0]
              ? `${attributes.manufacturer_minimum_age?.[0]?.value ? `${attributes.manufacturer_minimum_age[0].value}+ months` : ""}${attributes.manufacturer_maximum_age?.[0]?.value ? ` to ${attributes.manufacturer_maximum_age[0].value} months` : ""}`
              : null,
          bgColor: "bg-[var(--color-accent)]/20",
        },
        {
          key: "launch_date",
          icon: <Calendar size={16} className="text-[var(--color-info)]" />,
          label: "Launch Date",
          value: attributes.product_site_launch_date?.[0]
            ? new Date(
                attributes.product_site_launch_date[0].value,
              ).toLocaleDateString()
            : null,
          bgColor: "bg-[var(--color-info-200)]",
        },
      ].filter((spec) => spec.value),
    [attributes],
  );

  if (specs.length === 0) return null;

  return (
    <MainCard radius="16px" bgColor="var(--color-surface)">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-[var(--color-text)]">
        <div className="bg-[var(--color-accent)]/20 rounded-full p-2">
          <Package size={18} className="text-[var(--color-accent)]" />
        </div>
        Product Specifications
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {specs.map((spec, index) => (
          <div
            key={spec.key}
            className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-bg)] to-[var(--color-surface)] p-4 shadow-sm"
          >
            <div className={`rounded-full p-2 ${spec.bgColor}`}>
              {spec.icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-[var(--color-text-muted)]">
                {spec.label}
              </div>
              <div className="truncate text-sm font-semibold text-[var(--color-text)]">
                {spec.value}
              </div>
            </div>
          </div>
        ))}
      </div>
    </MainCard>
  );
});
