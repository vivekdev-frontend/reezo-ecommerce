import { useNavigate, useParams } from "react-router-dom";

function ProductDetails({ products = [], addToCart }) {
  const navigate = useNavigate();
  const { id } = useParams();

  const product =
    typeof id === "string" && Array.isArray(products)
      ? products.find(
          (item) =>
            item &&
            typeof item === "object" &&
            !Array.isArray(item) &&
            (typeof item.id === "string" ||
              (typeof item.id === "number" &&
                Number.isFinite(item.id))) &&
            String(item.id) === id
        )
      : undefined;

  const displayValue = (value) => {
    if (typeof value === "string") return value;

    if (
      typeof value === "number" &&
      Number.isFinite(value)
    ) {
      return value;
    }

    return "";
  };

  const formatPrice = (value) => {
    if (
      typeof value === "number" &&
      Number.isFinite(value)
    ) {
      return `₹${value.toLocaleString("en-IN")}`;
    }

    return displayValue(value);
  };

  if (!product) {
    return (
      <main className="product-details-page">
        <h2>Product not found</h2>

        <button
          type="button"
          className="back-btn"
          onClick={() => navigate("/")}
        >
          ← Back to Home
        </button>
      </main>
    );
  }

  const name = displayValue(product.name) || "Product";
  const image =
    typeof product.image === "string"
      ? product.image
      : "";

  const price = formatPrice(product.price);
  const oldPrice = formatPrice(product.oldPrice);

  const discount =
    typeof product.discount === "number" &&
    Number.isFinite(product.discount)
      ? `${product.discount}% off`
      : displayValue(product.discount);

  const numericPrice =
    typeof product.price === "number"
      ? product.price
      : typeof product.price === "string" &&
          product.price.replace(/[₹,\s]/g, "") !== ""
        ? Number(product.price.replace(/[₹,\s]/g, ""))
        : NaN;

  const hasValidPrice =
    Number.isFinite(numericPrice) && numericPrice >= 0;

  const canPurchase =
    typeof addToCart === "function" && hasValidPrice;

  const handleAddToCart = () => {
    if (canPurchase) {
      addToCart(product);
    }
  };

  const handleBuyNow = () => {
    if (!canPurchase) return;

    addToCart(product);
    navigate("/cart");
  };

  return (
    <main className="product-details-page">
      <button
        type="button"
        className="back-btn"
        onClick={() => navigate("/")}
      >
        ← Back
      </button>

      <div className="product-details-container">
        <div className="product-details-image">
          {image ? (
            <img
              src={image}
              alt={String(name)}
              decoding="async"
            />
          ) : (
            <p>Image unavailable</p>
          )}
        </div>

        <div className="product-details-info">
          <h1>{name}</h1>

          {/* Existing demo rating and offers. */}
          <div className="product-rating">
            ⭐ 4.4
          </div>

          <div className="details-price">
            {hasValidPrice ? price : "Price unavailable"}
          </div>

          {oldPrice !== "" && (
            <div className="details-old-price">
              MRP: {oldPrice}
            </div>
          )}

          {discount !== "" && (
            <div className="details-discount">
              {discount}
            </div>
          )}

          <p>Inclusive of all taxes</p>

          <hr />

          <h3>Available Offers</h3>

          <p>
            🏷️ Special Price — Get extra savings on this product
          </p>

          <p>
            🏦 Bank Offer — Additional discount on selected cards
          </p>

          <p>
            🚚 Free Delivery on eligible orders
          </p>

          <hr />

          <h3>Product Description</h3>

          <p>
            High-quality product available at a great price on
            Reezo. Product specifications and detailed information
            will be added here.
          </p>

          <div className="product-details-buttons">
            <button
              type="button"
              className="details-cart-btn"
              onClick={handleAddToCart}
              disabled={!canPurchase}
            >
              <span aria-hidden="true">🛒</span> Add to Cart
            </button>

            <button
              type="button"
              className="buy-now-btn"
              onClick={handleBuyNow}
              disabled={!canPurchase}
            >
              <span aria-hidden="true">⚡</span> Buy Now
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default ProductDetails;