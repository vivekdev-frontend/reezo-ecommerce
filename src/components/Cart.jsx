import { useNavigate } from "react-router-dom";

function Cart({
  cart = [],
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
}) {
  const navigate = useNavigate();

  const getNumericPrice = (price) => {
    if (typeof price === "number") {
      return Number.isFinite(price) && price >= 0
        ? price
        : null;
    }

    if (typeof price !== "string") return null;

    const cleaned = price.replace(/[₹,\s]/g, "");
    if (!cleaned) return null;

    const parsed = Number(cleaned);

    return Number.isFinite(parsed) && parsed >= 0
      ? parsed
      : null;
  };

  const getQuantity = (quantity) => {
    if (
      typeof quantity !== "number" &&
      typeof quantity !== "string"
    ) {
      return null;
    }

    const parsed = Number(quantity);

    return Number.isSafeInteger(parsed) && parsed > 0
      ? parsed
      : null;
  };

  const formatMoney = (amount) =>
    `₹${amount.toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;

  const isValidItem = (item) =>
    item &&
    typeof item === "object" &&
    !Array.isArray(item) &&
    ((typeof item.id === "string" &&
      item.id.trim() !== "") ||
      (typeof item.id === "number" &&
        Number.isFinite(item.id)));

  const cartIsArray = Array.isArray(cart);
  const items = cartIsArray ? cart.filter(isValidItem) : [];

  const hasInvalidEntries =
    !cartIsArray || items.length !== cart.length;

  const rows = items.map((item) => {
    const price = getNumericPrice(item.price);
    const quantity = getQuantity(item.quantity);

    const subtotal =
      price !== null && quantity !== null
        ? price * quantity
        : null;

    return {
      item,
      price,
      quantity,
      subtotal,
      valid:
        subtotal !== null &&
        Number.isFinite(subtotal),
    };
  });

  const totalPrice = rows.reduce(
    (total, row) => total + (row.valid ? row.subtotal : 0),
    0
  );

  const totalQuantity = rows.reduce(
    (total, row) => total + (row.quantity ?? 0),
    0
  );

  const hasInvalidData =
    hasInvalidEntries ||
    rows.some((row) => !row.valid) ||
    !Number.isFinite(totalPrice) ||
    !Number.isSafeInteger(totalQuantity);

  const canIncrease = typeof increaseQuantity === "function";
  const canDecrease = typeof decreaseQuantity === "function";
  const canRemove = typeof removeFromCart === "function";

  return (
    <main className="cart-page">
      <h2 className="cart-title">My Cart</h2>

      {hasInvalidData && (
        <p role="alert" className="form-error">
          Some cart details are invalid. Remove and re-add the
          affected products before checkout.
        </p>
      )}

      {items.length === 0 ? (
        <div className="empty-cart">
          <h3>
            {hasInvalidData
              ? "Your cart could not be loaded correctly"
              : "Your cart is empty"}
          </h3>

          <p>
            {hasInvalidData
              ? "Return to shopping and try adding your products again."
              : "Add some products to continue shopping."}
          </p>
        </div>
      ) : (
        <>
          <div className="cart-products">
            {rows.map(({ item, price, quantity }) => {
              const name =
                typeof item.name === "string" &&
                item.name.trim()
                  ? item.name
                  : "Product";

              const image =
                typeof item.image === "string"
                  ? item.image
                  : "";

              return (
                <div className="cart-item" key={item.id}>
                  <div className="cart-item-image">
                    {image ? (
                      <img
                        src={image}
                        alt={name}
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <span>Image unavailable</span>
                    )}
                  </div>

                  <div className="cart-item-info">
                    <h3>{name}</h3>

                    <p className="cart-item-price">
                      {price !== null
                        ? formatMoney(price)
                        : "Price unavailable"}
                    </p>

                    <div className="quantity-controls">
                      <button
                        type="button"
                        className="quantity-btn"
                        aria-label={`Decrease quantity of ${name}`}
                        disabled={
                          !canDecrease ||
                          quantity === null ||
                          quantity <= 1
                        }
                        onClick={() => {
                          if (
                            canDecrease &&
                            quantity !== null &&
                            quantity > 1
                          ) {
                            decreaseQuantity(item.id);
                          }
                        }}
                      >
                        −
                      </button>

                      <span aria-live="polite" aria-atomic="true">
                        {quantity ?? "Invalid quantity"}
                      </span>

                      <button
                        type="button"
                        className="quantity-btn"
                        aria-label={`Increase quantity of ${name}`}
                        disabled={
                          !canIncrease ||
                          quantity === null ||
                          quantity >= Number.MAX_SAFE_INTEGER
                        }
                        onClick={() => {
                          if (
                            canIncrease &&
                            quantity !== null &&
                            quantity < Number.MAX_SAFE_INTEGER
                          ) {
                            increaseQuantity(item.id);
                          }
                        }}
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      className="remove-btn"
                      disabled={!canRemove}
                      aria-label={`Remove ${name} from cart`}
                      onClick={() => {
                        if (canRemove) {
                          removeFromCart(item.id);
                        }
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="price-summary">
            <h3>Price Details</h3>

            <div className="price-summary-row">
              <span>Total Items:</span>
              <strong>
                {hasInvalidData ? "Unavailable" : totalQuantity}
              </strong>
            </div>

            <div className="price-summary-row">
              <span>Total Price:</span>
              <strong>
                {hasInvalidData
                  ? "Unavailable"
                  : formatMoney(totalPrice)}
              </strong>
            </div>

            <hr />

            <div className="cart-total-row">
              <h2>Grand Total:</h2>
              <h2>
                {hasInvalidData
                  ? "Unavailable"
                  : formatMoney(totalPrice)}
              </h2>
            </div>

            <button
              type="button"
              className="checkout-btn"
              disabled={hasInvalidData}
              onClick={() => {
                if (!hasInvalidData && items.length > 0) {
                  navigate("/checkout");
                }
              }}
            >
              Proceed to Checkout →
            </button>
          </div>
        </>
      )}

      <button
        type="button"
        className="continue-shopping-btn"
        onClick={() => navigate("/")}
      >
        ← Continue Shopping
      </button>
    </main>
  );
}

export default Cart;