function ProductListCard({
  product,
  addToCart,
  onProductClick,
  isWishlisted = false,
  onWishlistClick,
}) {
  if (
    !product ||
    typeof product !== "object" ||
    Array.isArray(product) ||
    product.id == null
  ) {
    return null;
  }

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

  const canOpenProduct =
    typeof onProductClick === "function";
  const canAddToCart =
    typeof addToCart === "function";
  const canToggleWishlist =
    typeof onWishlistClick === "function";

  const handleWishlist = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (canToggleWishlist) {
      onWishlistClick(product);
    }
  };

  const handleProductClick = () => {
    if (canOpenProduct) {
      onProductClick(product);
    }
  };

  const handleAddToCart = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (canAddToCart) {
      addToCart(product);
    }
  };

  return (
    <div className="product-list-card">
      {/* PRODUCT IMAGE */}

      <div className="product-list-left">
        <button
          type="button"
          className={`product-list-wishlist ${
            isWishlisted ? "wishlisted" : ""
          }`}
          onClick={handleWishlist}
          disabled={!canToggleWishlist}
          aria-pressed={Boolean(isWishlisted)}
          aria-label={
            isWishlisted
              ? `Remove ${name} from wishlist`
              : `Add ${name} to wishlist`
          }
          title={
            isWishlisted
              ? "Remove from Wishlist"
              : "Add to Wishlist"
          }
        >
          <span aria-hidden="true">
            {isWishlisted ? "♥" : "♡"}
          </span>
        </button>

        <button
          type="button"
          className="product-list-image"
          onClick={handleProductClick}
          disabled={!canOpenProduct}
          aria-label={`View ${name}`}
          style={{
            border: "none",
            padding: 0,
            background: "transparent",
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
      </div>

      {/* PRODUCT INFORMATION */}

      <div className="product-list-info">
        <h3>
          <button
            type="button"
            onClick={handleProductClick}
            disabled={!canOpenProduct}
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

        {/* Existing demo rating and specifications. */}
        <div className="product-list-rating-row">
          <span className="product-list-rating">
            4.4 ★
          </span>

          <span className="product-list-reviews">
            1,250 Ratings & Reviews
          </span>
        </div>

        <ul className="product-list-features">
          {product.category === "Mobiles" && (
            <>
              <li>8 GB RAM | 256 GB Storage</li>
              <li>6.7 inch Full HD+ Display</li>
              <li>50MP Camera</li>
              <li>5000 mAh Battery</li>
              <li>1 Year Manufacturer Warranty</li>
            </>
          )}

          {product.category === "Electronics" && (
            <>
              <li>Premium Quality Product</li>
              <li>High Performance</li>
              <li>Latest Technology</li>
              <li>1 Year Manufacturer Warranty</li>
            </>
          )}

          {product.category === "Fashion" && (
            <>
              <li>Comfortable Fit</li>
              <li>Premium Material</li>
              <li>Lightweight Design</li>
              <li>Latest Style</li>
            </>
          )}

          {!["Mobiles", "Electronics", "Fashion"].includes(
            product.category
          ) && (
            <>
              <li>Premium Quality</li>
              <li>Great Value</li>
              <li>Trusted Product</li>
            </>
          )}
        </ul>
      </div>

      {/* PRICE */}

      <div className="product-list-price">
        <div className="product-list-current-price">
          {price !== "" ? price : "Price unavailable"}
        </div>

        {(oldPrice !== "" || discount !== "") && (
          <div className="product-list-price-row">
            {oldPrice !== "" && (
              <span className="product-list-old-price">
                {oldPrice}
              </span>
            )}

            {discount !== "" && (
              <span className="product-list-discount">
                {discount}
              </span>
            )}
          </div>
        )}

        <p className="product-list-delivery">
          Free Delivery
        </p>

        <p className="product-list-offer">
          Bank Offer
        </p>

        <button
          type="button"
          className="product-list-cart-btn"
          onClick={handleAddToCart}
          disabled={!canAddToCart || price === ""}
        >
          <span aria-hidden="true">🛒</span> Add to Cart
        </button>
      </div>
    </div>
  );
}

export default ProductListCard;