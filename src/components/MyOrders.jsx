import { useState } from "react";
import { useNavigate } from "react-router-dom";

const ORDERS_KEY = "reezoOrders";

function parsePrice(value) {
  if (typeof value !== "number" && typeof value !== "string") {
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
  const number = parsePrice(value);

  return number === null
    ? "Price unavailable"
    : `₹${number.toLocaleString("en-IN", {
        maximumFractionDigits: 2,
      })}`;
}

function formatDate(value) {
  if (typeof value !== "string" || !value.trim()) {
    return "Date unavailable";
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
}

function isValidProduct(item) {
  return (
    item &&
    typeof item === "object" &&
    !Array.isArray(item) &&
    ((typeof item.id === "string" && item.id.trim() !== "") ||
      (typeof item.id === "number" && Number.isFinite(item.id))) &&
    typeof item.name === "string" &&
    item.name.trim() !== "" &&
    parsePrice(item.price) !== null
  );
}

function isValidOrder(order) {
  if (
    !order ||
    typeof order !== "object" ||
    Array.isArray(order) ||
    typeof order.orderId !== "string" ||
    !order.orderId.trim() ||
    !Array.isArray(order.items) ||
    order.items.length === 0 ||
    parsePrice(order.total) === null
  ) {
    return false;
  }

  return order.items.every((item) => {
    if (!isValidProduct(item)) return false;

    if (
      typeof item.quantity !== "number" &&
      typeof item.quantity !== "string"
    ) {
      return false;
    }

    const quantity = Number(item.quantity);

    return (
      Number.isSafeInteger(quantity) &&
      quantity > 0 &&
      Number.isFinite(parsePrice(item.price) * quantity)
    );
  });
}

function loadOrders() {
  try {
    const saved = localStorage.getItem(ORDERS_KEY);
    const parsed = saved === null ? [] : JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      return {
        orders: [],
        error: "Saved orders could not be read. No saved data was changed.",
      };
    }

    const seenIds = new Set();

    const orders = parsed.filter((order) => {
      if (!isValidOrder(order) || seenIds.has(order.orderId)) {
        return false;
      }

      seenIds.add(order.orderId);
      return true;
    });

    return {
      orders,
      error:
        orders.length !== parsed.length
          ? "Some saved orders have incomplete or duplicate details and could not be displayed. No saved data was changed."
          : "",
    };
  } catch {
    return {
      orders: [],
      error:
        "Orders could not be loaded from this browser. Please check browser storage and try again.",
    };
  }
}

function MyOrders({ addToCart }) {
  const navigate = useNavigate();

  const [savedOrders, setSavedOrders] = useState(loadOrders);
  const [message, setMessage] = useState("");

  const { orders, error } = savedOrders;
  const canAddToCart = typeof addToCart === "function";

  const handleReload = () => {
    setSavedOrders(loadOrders());
    setMessage("");
  };

  const handleViewOrder = (order) => {
    navigate(
      `/order-success?orderId=${encodeURIComponent(order.orderId)}`,
      { state: { order } }
    );
  };

  const handleTrackOrder = (order) => {
    navigate(
      `/track-order?orderId=${encodeURIComponent(order.orderId)}`,
      { state: { order } }
    );
  };

  const handleBuyAgain = (order) => {
    if (!canAddToCart || !isValidOrder(order)) return;

    // Add one of each distinct product; repeated clicks increase quantity.
    const addedIds = new Set();

    for (const item of order.items) {
      const productKey = String(item.id);

      if (addedIds.has(productKey)) continue;
      addedIds.add(productKey);

      addToCart({
        id: item.id,
        name: item.name,
        price: formatMoney(item.price),
        image: typeof item.image === "string" ? item.image : "",
        category:
          typeof item.category === "string" ? item.category : "",
        oldPrice:
          parsePrice(item.oldPrice) !== null
            ? formatMoney(item.oldPrice)
            : "",
        discount:
          typeof item.discount === "string"
            ? item.discount
            : typeof item.discount === "number" &&
                Number.isFinite(item.discount)
              ? `${item.discount}% off`
              : "",
      });
    }

    setMessage(
      `${addedIds.size} ${
        addedIds.size === 1 ? "product" : "products"
      } added to cart, one of each.`
    );
  };

  return (
    <main className="orders-page">
      <div className="orders-container">
        <div className="orders-page-header">
          <div>
            <p>REEZO ACCOUNT</p>
            <h1>My Orders</h1>
            <span>View orders saved in this browser</span>
          </div>

          <button
            type="button"
            onClick={() => navigate("/profile")}
          >
            ← Back to Account
          </button>
        </div>

        <p>
          Demo orders are stored on this browser only.
          No payment or delivery is processed.
        </p>

        {error && (
          <div role="alert">
            <p>{error}</p>
            <button
              type="button"
              className="orders-action-btn"
              onClick={handleReload}
            >
              Try Again
            </button>
          </div>
        )}

        {message && (
          <div role="status">
            <p>{message}</p>
            <button
              type="button"
              className="orders-action-btn"
              onClick={() => navigate("/cart")}
            >
              View Cart
            </button>
          </div>
        )}

        {orders.length === 0 ? (
          <div className="orders-list">
            <h2>
              {error ? "Orders unavailable" : "No orders yet"}
            </h2>

            <p>
              {error
                ? "Your saved order details could not be displayed."
                : "Orders created through demo checkout will appear here."}
            </p>

            <button
              type="button"
              className="orders-action-btn"
              onClick={() => navigate("/")}
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => {
              const firstItem = order.items[0];

              const status =
                typeof order.status === "string" &&
                order.status.trim()
                  ? order.status
                  : "Placed";

              const statusClass =
                status === "Delivered"
                  ? "delivered"
                  : status === "Shipped"
                    ? "shipped"
                    : "";

              const title =
                order.items.length === 1
                  ? firstItem.name
                  : `${firstItem.name} + ${
                      order.items.length - 1
                    } more`;

              const image =
                typeof firstItem.image === "string"
                  ? firstItem.image
                  : "";

              return (
                <div className="orders-card" key={order.orderId}>
                  <div className="orders-product-image">
                    {image ? (
                      <img
                        src={image}
                        alt={firstItem.name}
                        loading="lazy"
                        decoding="async"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                        }}
                      />
                    ) : (
                      <span aria-label="Order">📦</span>
                    )}
                  </div>

                  <div className="orders-product-info">
                    <h3>{title}</h3>

                    <p style={{ overflowWrap: "anywhere" }}>
                      Order #{order.orderId}
                    </p>

                    <span>
                      Ordered on {formatDate(order.createdAt)}
                    </span>
                  </div>

                  <div className={`orders-status ${statusClass}`}>
                    <span aria-hidden="true">● </span>
                    {status}
                  </div>

                  <strong className="orders-price">
                    {formatMoney(order.total)}
                  </strong>

                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 8,
                    }}
                  >
                    <button
                      type="button"
                      className="orders-action-btn"
                      onClick={() => handleViewOrder(order)}
                    >
                      View Details
                    </button>

                    <button
                      type="button"
                      className="orders-action-btn"
                      disabled={!canAddToCart}
                      onClick={() => handleBuyAgain(order)}
                    >
                      Buy Again
                    </button>

                    <button
                      type="button"
                      className="orders-action-btn"
                      onClick={() => handleTrackOrder(order)}
                    >
                      Track Order
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

export default MyOrders;