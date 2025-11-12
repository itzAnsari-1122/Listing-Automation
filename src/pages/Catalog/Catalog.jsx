import { useEffect, useState, useMemo, useRef } from "react";
import {
  Search,
  Upload,
  Package,
  DollarSign,
  Star,
  Folder,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useCatalog } from "../../context/CatalogContext";
import { GrCatalog } from "react-icons/gr";
import { themeToast } from "../../components/ui/ThemeToaster";

// --- START: CatalogDetail Component (New component for details view) ---

// Helper component for detail rows
const DetailRow = ({ label, value, valueStyle = {} }) => (
  <div
    className="flex justify-between border-b py-2"
    style={{ borderColor: "#e2e8f0" }}
  >
    <span className="font-medium" style={{ color: "gray" }}>
      {label}:
    </span>
    <span
      className="font-semibold"
      style={{ color: "var(--color-text)", ...valueStyle }}
    >
      {value || "N/A"}
    </span>
  </div>
);

// CatalogDetail Component
const CatalogDetail = ({ product, onBack }) => {
  if (!product) return null;

  const truncateText = (text, maxLength) =>
    text?.length > maxLength ? text.substring(0, maxLength) + "..." : text;

  return (
    <div
      className="mx-auto mb-12 mt-8 min-h-screen max-w-7xl px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <div className="mb-6 flex items-center justify-between pt-4">
        <h1
          className="flex items-center gap-4 text-3xl font-bold"
          style={{ color: "var(--color-text)" }}
        >
          <button
            onClick={onBack}
            className="rounded-full p-2 transition hover:bg-gray-200 dark:hover:bg-gray-700"
            style={{ color: "var(--color-primary)" }}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          Product Details: {truncateText(product.itemName, 40)}
        </h1>
      </div>

      <div
        className="rounded-lg p-6 shadow-xl"
        style={{ backgroundColor: "var(--color-surface)" }}
      >
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Image Column */}
          <div className="md:col-span-1">
            <img
              src={product.image}
              alt={product.itemName}
              className="w-full rounded-lg object-cover shadow-md"
              style={{ maxHeight: "400px" }}
            />
          </div>

          {/* Details Column */}
          <div className="md:col-span-2">
            <h2
              className="mb-4 text-2xl font-bold"
              style={{ color: "var(--color-primary)" }}
            >
              {product.itemName}
            </h2>

            <div className="space-y-4">
              <DetailRow label="ASIN" value={product.asin} />
              <DetailRow label="Brand" value={product.brand} />
              <DetailRow
                label="Price"
                value={`$${product.price.toFixed(2)}`}
                valueStyle={{ color: "var(--color-success)" }}
              />
              <DetailRow label="Size" value={product.size} />
              <DetailRow label="Color" value={product.color} />
              <DetailRow label="Style" value={product.style} />
              <DetailRow label="Part Number" value={product.partNumber} />
              <DetailRow label="Category" value={product.category} />
              <DetailRow
                label="Best Rank"
                value={`#${product.rank}`}
                valueStyle={{ color: "var(--color-warning)" }}
              />
            </div>
          </div>
        </div>

        {/* Description & Features */}
        <div className="mt-8 pt-6">
          <h3
            className="mb-3 text-xl font-semibold"
            style={{ color: "var(--color-text)" }}
          >
            Product Description
          </h3>
          <p className="whitespace-pre-wrap" style={{ color: "gray" }}>
            {product.description || "No detailed description available."}
          </p>

          <h3
            className="mb-3 mt-6 text-xl font-semibold"
            style={{ color: "var(--color-text)" }}
          >
            Key Features
          </h3>
          <ul className="list-disc space-y-1 pl-5" style={{ color: "gray" }}>
            {product.features?.length > 0 ? (
              product.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))
            ) : (
              <li>No key features listed.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

// --- END: CatalogDetail Component ---

function Catalog() {
  const {
    allCatalog,
    getAllCatalogsService,
    catalogPagination,
    setCatalogPagination,
  } = useCatalog();

  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // NEW STATE: To manage the detail view
  const [selectedProduct, setSelectedProduct] = useState(null);
  const observer = useRef();

  const fetchCatalogProductData = async (page, limit) => {
    try {
      setLoading(true);
      const { data, pagination } = await getAllCatalogsService(page, limit);
      setProducts(data || []);
      setCatalogPagination(pagination);
    } catch (err) {
      console.error("Failed to load catalog data:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalogProductData(
      catalogPagination?.currentPage,
      catalogPagination?.pageSize,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalogPagination?.currentPage, catalogPagination?.pageSize]);

  const handlePageChange = (newPage) => {
    setCatalogPagination((prev) => ({
      ...prev,
      currentPage: newPage + 1,
    }));
  };

  const handleRowsPerPageChange = (newRowsPerPage) => {
    setCatalogPagination((prev) => ({
      ...prev,
      pageSize: newRowsPerPage,
      currentPage: 1,
    }));
  };

  useEffect(() => {
    if (allCatalog && Array.isArray(allCatalog)) {
      const mappedProducts = allCatalog.map((item, index) => {
        const attr = item.attributes?.[0] || {};
        const dimensions = attr.item_dimensions?.[0] || {};
        return {
          asin: item.asin || `TEMP-ASIN-${index}`,
          itemName: attr.item_name?.[0]?.value || "No Title",
          brand: attr.brand?.[0]?.value || "Unknown Brand",
          price: parseFloat(attr.list_price?.[0]?.value) || 0,
          size: attr.size?.[0]?.value || "N/A",
          category: attr.item_type_keyword?.[0]?.value || "Uncategorized",
          rank: item.rank || 0,
          features: attr.bullet_point?.map((bp) => bp.value) || [],
          image:
            item.images?.[0]?.images?.find((img) => img.variant === "MAIN")
              ?.link || "/no-image.png",
          color: attr.color?.[0]?.value || "N/A",
          style: attr.model_name?.[0]?.value || "N/A",
          partNumber: attr.part_number?.[0]?.value || "N/A",
          dimensions: `${dimensions.length?.value || "N/A"} x ${dimensions.width?.value || "N/A"} x ${dimensions.height?.value || "N/A"} ${dimensions.length?.unit || ""}`,
          weight: attr.item_package_weight?.[0]?.value || 0,
          description: attr.product_description?.[0]?.value || "",
        };
      });

      setProducts(mappedProducts);
    }
  }, [allCatalog]);

  const filteredData = products.filter(
    (product) =>
      product.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.asin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.color?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const truncateText = (text, maxLength) =>
    text?.length > maxLength ? text.substring(0, maxLength) + "..." : text;

  const stats = useMemo(() => {
    const totalProducts = products.length;
    const totalPrice = products.reduce((sum, p) => sum + (p.price || 0), 0);
    const bestRank =
      products.length > 0
        ? Math.min(...products.map((p) => p.rank || Infinity))
        : 0;
    const uniqueCategories = new Set(products.map((p) => p.category)).size;
    return { totalProducts, totalPrice, bestRank, uniqueCategories };
  }, [products]);

  const convertToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
    });

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const base64String = await convertToBase64(file);
      themeToast.success("File converted to Base64 and ready to upload!");
      setShowUploadModal(false);
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Failed to convert file.");
    }
  };

  const totalItems = catalogPagination?.totalItems || filteredData.length;
  const currentPage = catalogPagination?.currentPage || 1;
  const pageSize = catalogPagination?.pageSize || 25;
  const startItem = Math.min((currentPage - 1) * pageSize + 1, totalItems || 0);
  const endItem = Math.min(currentPage * pageSize, totalItems || 0);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    (currentPage - 1) * pageSize + pageSize,
  );

  // Function to handle opening the detail view
  const handleViewDetails = (product) => {
    setSelectedProduct(product);
  };

  // Function to handle closing the detail view
  const handleBackToCatalog = () => {
    setSelectedProduct(null);
  };

  // Conditionally render the detail view if a product is selected
  if (selectedProduct) {
    return (
      <CatalogDetail product={selectedProduct} onBack={handleBackToCatalog} />
    );
  }

  // Render the main catalog view
  return (
    <div
      className="mx-auto mb-12 mt-8 min-h-screen max-w-7xl px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <div className="mb-6 flex items-center justify-between pt-4">
        <h1
          className="flex items-center gap-4 text-3xl font-bold"
          style={{ color: "var(--color-text)" }}
        >
          <GrCatalog size={30} style={{ color: "var(--color-primary)" }} />
          Catalog
        </h1>
        <div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow transition"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            <Upload className="h-4 w-4" />
            <span>Upload Catalog</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
        <div
          className="flex items-center gap-4 rounded-lg p-5 shadow-sm"
          style={{ backgroundColor: "var(--color-surface)" }}
        >
          <div
            className="flex h-12 w-12 items-center justify-center rounded-lg"
            style={{ backgroundColor: "rgba(59,130,246,0.15)" }}
          >
            <Package style={{ color: "var(--color-primary)" }} />
          </div>
          <div>
            <p className="text-sm" style={{ color: "gray" }}>
              Total Products
            </p>
            <h2
              className="text-2xl font-bold"
              style={{ color: "var(--color-text)" }}
            >
              {stats.totalProducts}
            </h2>
          </div>
        </div>

        <div
          className="flex items-center gap-4 rounded-lg p-5 shadow-sm"
          style={{ backgroundColor: "var(--color-surface)" }}
        >
          <div
            className="flex h-12 w-12 items-center justify-center rounded-lg"
            style={{ backgroundColor: "rgba(22,163,74,0.15)" }}
          >
            <DollarSign style={{ color: "var(--color-success)" }} />
          </div>
          <div>
            <p className="text-sm" style={{ color: "gray" }}>
              Total Price
            </p>
            <h2
              className="text-2xl font-bold"
              style={{ color: "var(--color-text)" }}
            >
              ${stats.totalPrice.toFixed(2)}
            </h2>
          </div>
        </div>

        <div
          className="flex items-center gap-4 rounded-lg p-5 shadow-sm"
          style={{ backgroundColor: "var(--color-surface)" }}
        >
          <div
            className="flex h-12 w-12 items-center justify-center rounded-lg"
            style={{ backgroundColor: "rgba(217,119,6,0.15)" }}
          >
            <Star style={{ color: "var(--color-warning)" }} />
          </div>
          <div>
            <p className="text-sm" style={{ color: "gray" }}>
              Best Rank
            </p>
            <h2
              className="text-2xl font-bold"
              style={{ color: "var(--color-text)" }}
            >
              #{stats.bestRank}
            </h2>
          </div>
        </div>

        <div
          className="flex items-center gap-4 rounded-lg p-5 shadow-sm"
          style={{ backgroundColor: "var(--color-surface)" }}
        >
          <div
            className="flex h-12 w-12 items-center justify-center rounded-lg"
            style={{ backgroundColor: "rgba(147,51,234,0.15)" }}
          >
            <Folder style={{ color: "purple" }} />
          </div>
          <div>
            <p className="text-sm" style={{ color: "gray" }}>
              Categories
            </p>
            <h2
              className="text-2xl font-bold"
              style={{ color: "var(--color-text)" }}
            >
              {stats.uniqueCategories}
            </h2>
          </div>
        </div>
      </div>

      {/* Table */}
      <div
        className="overflow-hidden rounded-lg shadow"
        style={{ backgroundColor: "var(--color-surface)" }}
      >
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div className="relative w-96">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
              style={{ color: "gray" }}
            />
            <input
              type="text"
              placeholder="Search products, brands, ASIN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border py-2 pl-10 pr-4 text-sm outline-none focus:ring-2"
              style={{
                borderColor: "#e2e8f0",
                color: "var(--color-text)",
                backgroundColor: "var(--color-surface)",
                focusRingColor: "var(--color-primary)",
              }}
            />
          </div>

          <div
            className="flex items-center space-x-4 text-sm"
            style={{ color: "gray" }}
          >
            <div className="flex items-center space-x-2">
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) =>
                  handleRowsPerPageChange(Number(e.target.value))
                }
                className="rounded border px-2 py-1 text-sm outline-none"
                style={{
                  borderColor: "#e2e8f0",
                  color: "var(--color-text)",
                  backgroundColor: "var(--color-surface)",
                }}
              >
                {[10, 25, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            <div>
              {startItem}-{endItem} of {totalItems}
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(Math.max(0, currentPage - 2))}
                disabled={currentPage <= 1}
                className="rounded p-2 hover:bg-gray-100 disabled:opacity-50"
              >
                <ChevronLeft style={{ color: "var(--color-text)" }} />
              </button>
              <button
                onClick={() =>
                  handlePageChange(
                    Math.min(Math.ceil(totalItems / pageSize) - 1, currentPage),
                  )
                }
                disabled={currentPage >= Math.ceil(totalItems / pageSize)}
                className="rounded p-2 hover:bg-gray-100 disabled:opacity-50"
              >
                <ChevronRight style={{ color: "var(--color-text)" }} />
              </button>
            </div>
          </div>
        </div>

        <div className="max-h-[520px] overflow-y-auto">
          <table
            className="min-w-full divide-y"
            style={{ divideColor: "#e2e8f0" }}
          >
            <thead
              className="sticky top-0 shadow-sm"
              style={{ backgroundColor: "var(--color-surface)" }}
            >
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium"
                  style={{ color: "gray" }}
                >
                  Product
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium"
                  style={{ color: "gray" }}
                >
                  Brand & ASIN
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium"
                  style={{ color: "gray" }}
                >
                  Price & Size
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium"
                  style={{ color: "gray" }}
                >
                  Category & Rank
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium"
                  style={{ color: "gray" }}
                >
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="py-10 text-center">
                    <div
                      className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-t-transparent"
                      style={{
                        borderColor: "var(--color-primary)",
                        borderTopColor: "transparent",
                      }}
                    ></div>
                  </td>
                </tr>
              )}

              {!loading && paginatedData.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center"
                    style={{ color: "gray" }}
                  >
                    No products found.
                  </td>
                </tr>
              )}

              {!loading &&
                paginatedData.map((row, idx) => (
                  <tr key={row.asin || idx}>
                    <td className="px-6 py-4 align-top">
                      <div className="flex items-start space-x-3">
                        <img
                          src={row.image}
                          alt={row.itemName}
                          className="h-16 w-16 rounded-lg border object-cover"
                        />
                        <div>
                          <div
                            className="font-medium"
                            style={{ color: "var(--color-text)" }}
                          >
                            {truncateText(row.itemName, 70)}
                          </div>
                          <div className="text-xs" style={{ color: "gray" }}>
                            Colors: {row.color}
                          </div>
                          <div className="text-xs" style={{ color: "gray" }}>
                            Style: {row.style}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 align-top">
                      <div
                        className="font-medium"
                        style={{ color: "var(--color-text)" }}
                      >
                        {row.brand}
                      </div>
                      <div
                        className="cursor-pointer text-sm hover:underline"
                        style={{ color: "var(--color-primary)" }}
                      >
                        {row.asin}
                      </div>
                      <div className="text-xs" style={{ color: "gray" }}>
                        Part: {row.partNumber}
                      </div>
                    </td>

                    <td className="px-6 py-4 align-top">
                      <div
                        className="font-bold"
                        style={{ color: "var(--color-success)" }}
                      >
                        ${row.price}
                      </div>
                      <div className="text-sm" style={{ color: "gray" }}>
                        {row.size}
                      </div>
                    </td>

                    <td className="px-6 py-4 align-top">
                      <div
                        className="font-medium"
                        style={{ color: "var(--color-text)" }}
                      >
                        {row.category}
                      </div>
                      <div
                        className="mt-1"
                        style={{ color: "var(--color-warning)" }}
                      >
                        ⭐ Rank #{row.rank}
                      </div>
                    </td>

                    <td className="px-6 py-4 align-top">
                      <button
                        onClick={() => handleViewDetails(row)}
                        className="rounded px-4 py-2 text-sm font-medium text-white shadow transition"
                        style={{ backgroundColor: "var(--color-primary)" }}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal (Unchanged) */}
      {showUploadModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-40 px-4"
          style={{ backgroundColor: "rgba(30,41,59,0.8)" }}
        >
          <div
            className="w-full max-w-md rounded-lg p-6 shadow-lg"
            style={{ backgroundColor: "var(--color-surface)" }}
          >
            <h2
              className="mb-2 text-lg font-semibold"
              style={{ color: "var(--color-text)" }}
            >
              Upload Catalog File
            </h2>

            <input
              type="file"
              onChange={handleFileUpload}
              className="mb-4 w-full"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowUploadModal(false)}
                className="rounded border px-4 py-2 text-sm font-medium"
                style={{
                  borderColor: "#e2e8f0",
                  color: "var(--color-text)",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => alert("Upload triggered")}
                className="rounded px-4 py-2 text-sm font-medium text-white"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Catalog;
