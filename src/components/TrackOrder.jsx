import { useLocation, useNavigate } from "react-router-dom";
import reezoDeliveryTruck from "../assets/reezo-delivery-truck.png";

const ORDERS_KEY = "reezoOrders";

function safeText(value, fallback = "") {
  return typeof value === "string" && value.trim()
    ? value
    : fallback;
}

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
  const number = parsePrice(value);

  return number === null
    ? "Unavailable"
    : `₹${number.toLocaleString("en-IN", {
        maximumFractionDigits: 2,
      })}`;
}

function formatDate(value) {
  if (typeof value !== "string" || !value.trim()) {
    return "Unavailable";
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "Unavailable"
    : date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
}

function isValidOrder(order) {
  return (
    order &&
    typeof order === "object" &&
    !Array.isArray(order) &&
    typeof order.orderId === "string" &&
    order.orderId.trim() !== "" &&
    Array.isArray(order.items) &&
    order.items.length > 0 &&
    order.items.every(
      (item) =>
        item &&
        typeof item === "object" &&
        !Array.isArray(item) &&
        typeof item.name === "string" &&
        item.name.trim() !== "" &&
        (typeof item.quantity === "number" ||
          typeof item.quantity === "string") &&
        Number.isSafeInteger(Number(item.quantity)) &&
        Number(item.quantity) > 0
    )
  );
}

function resolveOrder(location) {
  const stateOrder = location.state?.order;

  const requestedId =
    new URLSearchParams(location.search).get("orderId") ||
    (isValidOrder(stateOrder) ? stateOrder.orderId : "") ||
    safeText(location.state?.orderId);

  if (!requestedId) return null;

  try {
    const saved = JSON.parse(
      localStorage.getItem(ORDERS_KEY) || "[]"
    );

    if (Array.isArray(saved)) {
      const match = saved.find(
        (entry) =>
          isValidOrder(entry) &&
          entry.orderId === requestedId
      );

      if (match) return match;
    }
  } catch {
    // Use the selected order from navigation state when available.
  }

  return isValidOrder(stateOrder) &&
    stateOrder.orderId === requestedId
    ? stateOrder
    : null;
}

const trackingSteps = [
  { label: "Order Saved", icon: "✓" },
  { label: "Packed", icon: "◇" },
  { label: "Shipped", icon: "🚚" },
  { label: "Out for Delivery", icon: "⌂" },
  { label: "Delivered", icon: "✓" },
];

const statusPositions = {
  Placed: 0,
  Confirmed: 0,
  Packed: 1,
  Shipped: 2,
  "Out for Delivery": 3,
  Delivered: 4,
};

const unavailableActions = [
  {
    title: "Change Delivery Address",
    icon: "📍",
    color: "blue",
  },
  {
    title: "Contact Support",
    icon: "🎧",
    color: "cyan",
  },
  {
    title: "Cancel Order",
    icon: "×",
    color: "red",
  },
  {
    title: "Return or Replace",
    icon: "↻",
    color: "green",
  },
];

function TrackOrder() {
  const navigate = useNavigate();
  const location = useLocation();

  const order = resolveOrder(location);

  if (!order) {
    return (
      <main className="premium-track-page">
        <div className="premium-track-container">
          <h1>Order Details Not Available</h1>

          <p>
            Open an order from My Orders to view its saved status.
            The requested order may be missing or incomplete.
          </p>

          <button
            type="button"
            className="orders-action-btn"
            onClick={() => navigate("/orders")}
          >
            ← My Orders
          </button>
        </div>
      </main>
    );
  }

  const status = safeText(order.status, "Placed");

  const activeStep = Object.prototype.hasOwnProperty.call(
    statusPositions,
    status
  )
    ? statusPositions[status]
    : -1;

  const completedWidth =
    activeStep < 0
      ? 0
      : (activeStep / (trackingSteps.length - 1)) * 100;

  const address =
    order.address &&
    typeof order.address === "object" &&
    !Array.isArray(order.address)
      ? order.address
      : {};

  const destination = [
    safeText(address.city),
    safeText(address.state),
    safeText(address.pinCode),
  ]
    .filter(Boolean)
    .join(", ");

  const totalQuantity = order.items.reduce(
    (sum, item) => sum + Number(item.quantity),
    0
  );

  const shipmentDetails = [
    {
      label: "Courier Partner",
      icon: "🚚",
      value: safeText(order.courier, "Not assigned"),
    },
    {
      label: "Tracking ID",
      icon: "▥",
      value: safeText(order.trackingId, "Not assigned"),
    },
    {
      label: "Last Update",
      icon: "◷",
      value: formatDate(order.updatedAt || order.createdAt),
    },
    {
      label: "From",
      icon: "📍",
      value: safeText(order.from, "Not assigned"),
    },
    {
      label: "To",
      icon: "⚑",
      value: destination || "Address unavailable",
    },
  ];

  return (
    <main className="premium-track-page">
      <div className="premium-track-container">
        <nav
          className="premium-track-breadcrumb"
          aria-label="Breadcrumb"
        >
          <button type="button" onClick={() => navigate("/")}>
            Home
          </button>

          <span aria-hidden="true">›</span>

          <button
            type="button"
            onClick={() => navigate("/orders")}
          >
            My Orders
          </button>

          <span aria-hidden="true">›</span>
          <strong aria-current="page">Track Order</strong>
        </nav>

        <section className="premium-track-top">
          <div className="premium-track-title">
            <h1>
              Track <span>Your Order</span>
            </h1>
            <p>
              Saved demo order status. Live delivery tracking
              is not available.
            </p>
          </div>

          <div className="premium-order-summary">
            <div style={{ minWidth: 0 }}>
              <h2 style={{ overflowWrap: "anywhere" }}>
                Order #{order.orderId}
              </h2>
              <p>Placed on {formatDate(order.createdAt)}</p>
            </div>

            <div className="premium-shipped-badge">
              <span aria-hidden="true">📦</span>
              <span>{status}</span>
            </div>
          </div>
        </section>

        <section className="premium-product-card">
          <div style={{ flex: 1, minWidth: 0 }}>
            {order.items.map((item, index) => (
              <div
                className="premium-product-left"
                key={`${item.id ?? "item"}-${index}`}
                style={{
                  marginBottom:
                    index < order.items.length - 1 ? 16 : 0,
                }}
              >
                <div className="premium-product-image">
                  {typeof item.image === "string" && item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      loading="lazy"
                      decoding="async"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                      }}
                    />
                  ) : (
                    <span
                      className="premium-headphone-icon"
                      aria-label="Product image unavailable"
                    >
                      📦
                    </span>
                  )}
                </div>

                <div className="premium-product-details">
                  <h2>{item.name}</h2>
                  <p>Quantity: {Number(item.quantity)}</p>

                  <div className="premium-product-price">
                    <strong>{formatMoney(item.price)}</strong>
                  </div>
                  <p>Unit price</p>
                </div>
              </div>
            ))}
          </div>

          <div className="premium-product-meta">
            <div>
              <span>Total Items</span>
              <strong>
                {Number.isSafeInteger(totalQuantity)
                  ? totalQuantity
                  : "Unavailable"}
              </strong>
            </div>

            <div>
              <span>Order Total</span>
              <strong>{formatMoney(order.total)}</strong>
            </div>

            <div>
              <span>Expected Delivery</span>
              <strong className="delivery-date">
                {safeText(order.expectedDelivery, "Not scheduled")}
              </strong>
            </div>
          </div>
        </section>

        <section
          className="premium-tracking-section"
          aria-label="Saved order progress"
        >
          <div className="premium-progress-line" aria-hidden="true">
            <div
              className="premium-progress-completed"
              style={{ width: `${completedWidth}%` }}
            />
          </div>

          <div className="premium-tracking-steps">
            {trackingSteps.map((step, index) => {
              const stepClass =
                activeStep < 0 || index > activeStep
                  ? "pending"
                  : index === activeStep && status !== "Delivered"
                    ? "active"
                    : "completed";

              return (
                <div
                  key={step.label}
                  className={`premium-track-step ${stepClass}`}
                  aria-current={
                    index === activeStep ? "step" : undefined
                  }
                >
                  <div className="premium-step-circle" aria-hidden="true">
                    {step.icon}
                  </div>

                  <h3>{step.label}</h3>

                  <p>
                    {index === 0
                      ? formatDate(order.createdAt)
                      : activeStep >= index
                        ? "Recorded in saved status"
                        : "No update"}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="premium-track-info-grid">
          <div className="premium-current-status">
            <div className="premium-status-content">
              <div className="premium-current-label">
                <span aria-hidden="true" />
                Saved Status
              </div>

              <h2>
                Order status: <strong>{status}</strong>
              </h2>

              <p>
                This is a demo order stored in your browser.
                No courier booking or delivery request has been sent.
              </p>

              <button type="button" disabled>
                📍 Live Location Unavailable
              </button>
            </div>

           <div className="premium-truck-visual" aria-hidden="true">

  <div className="reezo-road-scene">

    <div className="reezo-city-layer"></div>

    <div className="reezo-highway">
      <div className="reezo-road-lines"></div>
    </div>

    <div className="reezo-truck-layer">

      <img
        src={reezoDeliveryTruck}
        alt="Reezo delivery truck"
        className="reezo-moving-truck"
        decoding="async"
      />

    </div>

  </div>

</div>
          </div>

          <div className="premium-shipment-card">
            <h2>Shipment Details</h2>
            <div className="premium-shipment-divider" />

            {shipmentDetails.map((detail) => (
              <div
                className="premium-shipment-row"
                key={detail.label}
              >
                <span
                  className="premium-shipment-icon"
                  aria-hidden="true"
                >
                  {detail.icon}
                </span>

                <p>{detail.label}</p>

                <strong style={{ overflowWrap: "anywhere" }}>
                  {detail.value}
                </strong>
              </div>
            ))}
          </div>
        </section>

        <section
          className="premium-track-actions"
          aria-label="Order actions"
        >
          {unavailableActions.map((action) => (
            <button
              type="button"
              key={action.title}
              disabled
            >
              <span
                className={`premium-action-icon ${action.color}`}
                aria-hidden="true"
              >
                {action.icon}
              </span>

              <span>
                <strong>{action.title}</strong>
                <span>Unavailable for demo orders</span>
              </span>

              <b aria-hidden="true">›</b>
            </button>
          ))}
        </section>
      </div>
    </main>
  );
}

export default TrackOrder;