const CatalogDetail = ({ product, onBack }) => {
  if (!product) return null;

  const truncateText = (text, maxLength) =>
    text?.length > maxLength ? text.substring(0, maxLength) + "..." : text;

  return (
    <div className="mx-auto mb-12 mt-8 min-h-screen max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between pt-4">
        <h1
          className="flex items-center gap-4 text-3xl font-bold"
          style={{ color: "var(--color-text)" }}
        >
          <button
            onClick={onBack}
            className="rounded-full p-2 transition hover:bg-gray-100"
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
          <div className="md:col-span-1">
            <img
              src={product.image}
              alt={product.itemName}
              className="w-full rounded-lg object-cover shadow-md"
              style={{ maxHeight: "400px" }}
            />
          </div>

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
