import { useLocation, useNavigate } from "react-router-dom";

import reezoLogo from "../assets/reezo-logo.png";
import reezoShoppingBag from "../assets/reezo-hero-bags.png";

const ORDERS_KEY = "reezoOrders";

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

function parseQuantity(value) {
  if (typeof value !== "string" && typeof value !== "number") {
    return null;
  }

  const number = Number(value);

  return Number.isSafeInteger(number) && number > 0
    ? number
    : null;
}

function formatMoney(value) {
  return `₹${value.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

function safeText(value, fallback = "") {
  return typeof value === "string" && value.trim()
    ? value
    : fallback;
}

function normalizeOrder(value) {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    typeof value.orderId !== "string" ||
    !value.orderId.trim() ||
    !Array.isArray(value.items) ||
    value.items.length === 0
  ) {
    return null;
  }

  const total = parsePrice(value.total);
  if (total === null) return null;

  const items = [];

  for (const item of value.items) {
    if (
      !item ||
      typeof item !== "object" ||
      Array.isArray(item) ||
      !(
        (typeof item.id === "string" && item.id.trim() !== "") ||
        (typeof item.id === "number" && Number.isFinite(item.id))
      )
    ) {
      return null;
    }

    const price = parsePrice(item.price);
    const quantity = parseQuantity(item.quantity);

    if (price === null || quantity === null) {
      return null;
    }

    const subtotal = price * quantity;
    if (!Number.isFinite(subtotal)) return null;

    items.push({
      ...item,
      name: safeText(item.name, "Product"),
      image: safeText(item.image),
      price,
      quantity,
      subtotal,
    });
  }

  const totalQuantity = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  if (!Number.isSafeInteger(totalQuantity)) return null;

  const address =
    value.address &&
    typeof value.address === "object" &&
    !Array.isArray(value.address)
      ? value.address
      : {};

  return {
    orderId: value.orderId,
    items,
    total,
    totalQuantity,
    paymentMethod: safeText(value.paymentMethod),
    address: {
      fullName: safeText(address.fullName),
      mobile: safeText(address.mobile),
      street: safeText(address.street),
      city: safeText(address.city),
      state: safeText(address.state),
      pinCode: safeText(address.pinCode),
    },
  };
}

function resolveOrder(location) {
  const stateOrder = normalizeOrder(location.state?.order);

  const queryId = new URLSearchParams(location.search).get("orderId");

  const requestedId =
    queryId ||
    stateOrder?.orderId ||
    safeText(location.state?.orderId);

  // Recover only the requested order, never an unrelated latest order.
  if (requestedId) {
    try {
      const saved = JSON.parse(
        localStorage.getItem(ORDERS_KEY) || "[]"
      );

      if (Array.isArray(saved)) {
        const savedOrder = normalizeOrder(
          saved.find(
            (entry) =>
              entry &&
              typeof entry === "object" &&
              entry.orderId === requestedId
          )
        );

        if (savedOrder) return savedOrder;
      }
    } catch {
      // Navigation state can still display the checkout result.
    }
  }

  if (
    stateOrder &&
    (!requestedId || stateOrder.orderId === requestedId)
  ) {
    return stateOrder;
  }

  return null;
}

function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();

  const order = resolveOrder(location);

  if (!order) {
    return (
      <main className="order-success-page">
        <div className="order-success-wrapper">
          <section className="order-success-card order-not-found">
            <div className="order-success-icon" aria-hidden="true">
              !
            </div>

            <h1>Order Details Not Available</h1>

            <p>
              This order could not be found or its saved details
              are incomplete. Check My Orders for your saved orders.
            </p>

            <div className="order-success-actions">
              <button
                type="button"
                className="view-order-btn"
                onClick={() => navigate("/orders")}
              >
                View My Orders
              </button>

              <button
                type="button"
                className="order-home-btn"
                onClick={() => navigate("/")}
              >
                ← Continue Shopping
              </button>
            </div>
          </section>
        </div>
      </main>
    );
  }

  const {
    orderId,
    address,
    items,
    total,
    totalQuantity,
    paymentMethod,
  } = order;

  const paymentNames = {
    cod: "Cash on Delivery",
    upi: "UPI",
    card: "Credit / Debit Card",
  };

  const paymentName =
    Object.prototype.hasOwnProperty.call(paymentNames, paymentMethod)
      ? paymentNames[paymentMethod]
      : "Not Available";

  const addressLines = [
    address.street,
    [address.city, address.state].filter(Boolean).join(", "),
    address.pinCode,
  ].filter(Boolean);

  const hasAddress =
    Boolean(address.fullName || address.mobile) ||
    addressLines.length > 0;

  return (
    <main className="order-success-page">
      <div className="order-success-wrapper">
        <section className="order-success-card order-success-hero">
          <img
            src={reezoLogo}
            alt="Reezo"
            className="success-main-reezo-logo"
          />

          <div className="success-confirmed-line">
            <span className="success-line" aria-hidden="true" />
            <span className="success-confirmed-text">
              DEMO ORDER SUMMARY
            </span>
            <span className="success-line" aria-hidden="true" />
          </div>

          <div className="success-hero-main">
            <div className="success-check-wrapper" aria-hidden="true">
              <div className="success-check-glow">
                <div className="success-check-circle">✓</div>
              </div>
            </div>

            <div className="success-hero-content">
              <h1>
                Your Order <span>Summary</span>
              </h1>

              <div className="success-thank-you">
                <span>Thank you for shopping with</span>
                <img
                  src={reezoLogo}
                  alt="Reezo"
                  className="success-inline-reezo-logo"
                />
              </div>

              <div className="order-id-box">
                <span>Order ID</span>
                <strong style={{ overflowWrap: "anywhere" }}>
                  {orderId}
                </strong>
              </div>
            </div>
          </div>
        </section>

        <div className="order-success-grid">
          <div className="order-success-left">
            <section className="order-success-card success-items-card">
              <div className="success-section-heading">
                <div className="success-shopping-icon-box">
                  <img
                    src={reezoShoppingBag}
                    alt=""
                    className="success-shopping-bag-image"
                  />
                </div>

                <div>
                  <h2>Order Summary</h2>
                  <p>
                    {totalQuantity}{" "}
                    {totalQuantity === 1 ? "item" : "items"} in your order
                  </p>
                </div>
              </div>

              <div className="success-product-list">
                {items.map((item, index) => (
                  <div
                    className="success-product"
                    key={`${item.id}-${index}`}
                  >
                    <div className="success-product-main">
                      <div className="success-product-image">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          <span>Image unavailable</span>
                        )}
                      </div>

                      <div className="success-product-info">
                        <h3>{item.name}</h3>
                        <p>Quantity: {item.quantity}</p>
                        <p>Unit price: {formatMoney(item.price)}</p>
                      </div>
                    </div>

                    <strong
                      className="success-product-price"
                      aria-label={`Subtotal: ${formatMoney(item.subtotal)}`}
                    >
                      {formatMoney(item.subtotal)}
                    </strong>
                  </div>
                ))}
              </div>

              <div className="success-total-section">
                <div className="success-total-row">
                  <span>Total Items</span>
                  <strong>{totalQuantity}</strong>
                </div>

                <div className="success-grand-total">
                  <span>Grand Total</span>
                  <strong>{formatMoney(total)}</strong>
                </div>
              </div>
            </section>
          </div>

          <div className="order-success-right">
            <section className="order-success-card success-address-card">
              <div className="success-section-heading">
                <span className="success-heading-icon" aria-hidden="true">
                  🚚
                </span>

                <div>
                  <h2>Delivery Address</h2>
                  <p>Address entered for this order</p>
                </div>
              </div>

              <div className="success-address-content">
                {!hasAddress ? (
                  <p>Address details unavailable.</p>
                ) : (
                  <>
                    {address.fullName && (
                      <strong className="success-customer-name">
                        {address.fullName}
                      </strong>
                    )}

                    {address.mobile && (
                      <div className="success-address-line">
                        <span
                          className="success-address-icon"
                          aria-hidden="true"
                        >
                          📱
                        </span>
                        <span>{address.mobile}</span>
                      </div>
                    )}

                    {addressLines.map((line, index) => (
                      <div
                        className="success-address-line"
                        key={index}
                      >
                        <span
                          className="success-address-icon"
                          aria-hidden="true"
                        >
                          {index === 0 ? "📍" : ""}
                        </span>
                        <span>{line}</span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </section>

            <section className="order-success-card success-payment-card">
              <div className="success-section-heading">
                <span className="success-heading-icon" aria-hidden="true">
                  💳
                </span>

                <div>
                  <h2>Payment</h2>
                  <p>Payment information</p>
                </div>
              </div>

              <div className="success-payment-info">
                <div className="success-payment-row">
                  <span>Payment Method</span>
                  <strong>{paymentName}</strong>
                </div>

                <div className="success-payment-row">
                  <span>Payment Status</span>
                  <strong className="payment-status-pending">
                    {paymentMethod === "cod"
                      ? "Pay on Delivery"
                      : "Not verified"}
                  </strong>
                </div>

                <div className="success-payment-row">
                  <span>Amount</span>
                  <strong className="success-payment-amount">
                    {formatMoney(total)}
                  </strong>
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className="order-success-info-strip">
          <div className="success-package-icon" aria-hidden="true">
            📦
          </div>

          <div>
            <strong>Demo order — no delivery scheduled</strong>
            <p>
              Orders created by demo checkout are saved only in
              this browser. No payment is collected or delivery
              request sent.
            </p>
          </div>
        </div>

        <div className="order-success-actions">
          <button
            type="button"
            className="order-home-btn"
            onClick={() => navigate("/")}
          >
            ← Continue Shopping
          </button>

          <button
            type="button"
            className="view-order-btn"
            onClick={() => navigate("/orders")}
          >
            📦 View My Orders
          </button>
        </div>
      </div>
    </main>
  );
}

export default OrderSuccess;