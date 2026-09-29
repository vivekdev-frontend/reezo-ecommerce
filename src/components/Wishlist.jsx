import { useNavigate } from "react-router-dom";

function parsePrice(value) {
  if (typeof value !== "string" && typeof value !== "number") {
    return null;
  }

  const cleaned =
    typeof value === "string"
      ? value.replace(/[₹,\s]/g, "")
      : value;

  if (cleaned === "") return null;

  const number = Number(cleaned);

  return Number.isFinite(number) && number >= 0
    ? number
    : null;
}

function formatMoney(value) {
  return `₹${value.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

function isValidProduct(product) {
  return (
    product &&
    typeof product === "object" &&
    !Array.isArray(product) &&
    ((typeof product.id === "string" &&
      product.id.trim() !== "") ||
      (typeof product.id === "number" &&
        Number.isFinite(product.id)))
  );
}

function Wishlist({
  wishlist = [],
  addToCart,
  removeFromWishlist,
}) {
  const navigate = useNavigate();

  const wishlistIsArray = Array.isArray(wishlist);

  const products = wishlistIsArray
    ? wishlist.filter(isValidProduct)
    : [];

  const hasInvalidEntries =
    !wishlistIsArray || products.length !== wishlist.length;

  const canAddToCart = typeof addToCart === "function";
  const canRemove = typeof removeFromWishlist === "function";

  const openProduct = (productId) => {
    navigate(`/product/${encodeURIComponent(String(productId))}`);
  };

  return (
    <main className="wishlist-page">
      <div className="wishlist-header">
        <h2>My Wishlist ❤️</h2>

        <p>
          {products.length}{" "}
          {products.length === 1 ? "product" : "products"}
        </p>
      </div>

      {hasInvalidEntries && (
        <p className="form-error" role="alert">
          Some saved wishlist items could not be displayed
          because their details are incomplete.
        </p>
      )}

      {products.length === 0 ? (
        <div className="empty-wishlist">
          <div className="empty-wishlist-icon" aria-hidden="true">
            ♡
          </div>

          <h2>
            {hasInvalidEntries
              ? "Wishlist items unavailable"
              : "Your wishlist is empty"}
          </h2>

          <p>
            {hasInvalidEntries
              ? "Return to shopping to find and save your products again."
              : "Save products you like and find them here later."}
          </p>

          <button
            type="button"
            className="view-all"
            onClick={() => navigate("/")}
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <>
          <div className="wishlist-products">
            {products.map((product, index) => {
              const hasValidName =
                typeof product.name === "string" &&
                product.name.trim() !== "";

              const name = hasValidName
                ? product.name
                : "Product";

              const image =
                typeof product.image === "string"
                  ? product.image
                  : "";

              const price = parsePrice(product.price);
              const oldPrice = parsePrice(product.oldPrice);

              const discount =
                typeof product.discount === "string"
                  ? product.discount
                  : typeof product.discount === "number" &&
                      Number.isFinite(product.discount)
                    ? `${product.discount}% off`
                    : "";

              const canAddProduct =
                canAddToCart && hasValidName && price !== null;

              return (
                <div
                  className="wishlist-item"
                  key={`${product.id}-${index}`}
                >
                  <button
                    type="button"
                    className="wishlist-item-image"
                    onClick={() => openProduct(product.id)}
                    aria-label={`View ${name}`}
                    style={{
                      border: "none",
                      padding: 0,
                      color: "inherit",
                    }}
                  >
                    {image ? (
                      <img
                        src={image}
                        alt=""
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <span>Image unavailable</span>
                    )}
                  </button>

                  <div className="wishlist-item-info">
                    <h3>
                      <button
                        type="button"
                        onClick={() => openProduct(product.id)}
                        style={{
                          display: "block",
                          width: "100%",
                          border: "none",
                          padding: 0,
                          background: "transparent",
                          color: "inherit",
                          font: "inherit",
                          textAlign: "inherit",
                        }}
                      >
                        {name}
                      </button>
                    </h3>

                    <div className="price">
                      {price !== null
                        ? formatMoney(price)
                        : "Price unavailable"}
                    </div>

                    {(oldPrice !== null || discount !== "") && (
                      <div className="wishlist-price-row">
                        {oldPrice !== null && (
                          <span className="old-price">
                            {formatMoney(oldPrice)}
                          </span>
                        )}

                        {discount !== "" && (
                          <span className="discount">
                            {discount}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="wishlist-buttons">
                      <button
                        type="button"
                        className="add-cart"
                        disabled={!canAddProduct}
                        onClick={() => {
                          if (canAddProduct) {
                            addToCart(product);
                          }
                        }}
                      >
                        <span aria-hidden="true">🛒</span>{" "}
                        Add to Cart
                      </button>

                      <button
                        type="button"
                        className="remove-wishlist-btn"
                        disabled={!canRemove}
                        aria-label={`Remove ${name} from wishlist`}
                        onClick={() => {
                          if (canRemove) {
                            removeFromWishlist(product.id);
                          }
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            className="wishlist-back-btn"
            onClick={() => navigate("/")}
          >
            ← Continue Shopping
          </button>
        </>
      )}
    </main>
  );
}

export default Wishlist;