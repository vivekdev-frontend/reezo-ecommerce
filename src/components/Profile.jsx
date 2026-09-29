import { useState } from "react";
import { useNavigate } from "react-router-dom";

function readSavedList(key) {
  try {
    const saved = localStorage.getItem(key);
    const parsed = saved === null ? [] : JSON.parse(saved);

    return Array.isArray(parsed)
      ? { items: parsed, error: false }
      : { items: [], error: true };
  } catch {
    return { items: [], error: true };
  }
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

function isValidOrder(order) {
  return (
    order &&
    typeof order === "object" &&
    !Array.isArray(order) &&
    typeof order.orderId === "string" &&
    order.orderId.trim() !== "" &&
    parsePrice(order.total) !== null &&
    Array.isArray(order.items) &&
    order.items.length > 0 &&
    order.items.every(
      (item) =>
        isValidProduct(item) &&
        typeof item.name === "string" &&
        item.name.trim() !== "" &&
        parsePrice(item.price) !== null &&
        (typeof item.quantity === "number" ||
          typeof item.quantity === "string") &&
        Number.isSafeInteger(Number(item.quantity)) &&
        Number(item.quantity) > 0 &&
        Number.isFinite(
          parsePrice(item.price) * Number(item.quantity)
        )
    )
  );
}

function loadDashboard() {
  const savedOrders = readSavedList("reezoOrders");
  const savedWishlist = readSavedList("reezoWishlist");

  const seenOrderIds = new Set();

  const orders = savedOrders.items.filter((order) => {
    if (!isValidOrder(order) || seenOrderIds.has(order.orderId)) {
      return false;
    }

    seenOrderIds.add(order.orderId);
    return true;
  });

  const wishlist = savedWishlist.items.filter(isValidProduct);

  return {
    orders,
    wishlistCount: wishlist.length,
    ordersError:
      savedOrders.error ||
      orders.length !== savedOrders.items.length,
    wishlistError:
      savedWishlist.error ||
      wishlist.length !== savedWishlist.items.length,
  };
}

const unavailableMenuItems = [
  { icon: "📍", label: "Saved Addresses" },
  { icon: "👤", label: "Personal Information" },
  { icon: "💳", label: "Payment Methods" },
  { icon: "🔔", label: "Notifications" },
  { icon: "🎧", label: "Help & Support" },
];

function Profile() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(loadDashboard);

  const {
    orders,
    wishlistCount,
    ordersError,
    wishlistError,
  } = dashboard;

  // Checkout stores the newest order first.
  const recentOrders = orders.slice(0, 3);

  const openOrder = (order) => {
    navigate(
      `/order-success?orderId=${encodeURIComponent(order.orderId)}`,
      { state: { order } }
    );
  };

  return (
    <main className="account-page">
      <div className="account-dashboard">
        <aside className="account-sidebar">
          <h2>My Account</h2>

          <nav className="account-menu" aria-label="Account">
            <button
              type="button"
              className="account-menu-item active"
              aria-current="page"
              onClick={() => navigate("/profile")}
            >
              <span aria-hidden="true">🏠</span>
              Overview
            </button>

            <button
              type="button"
              className="account-menu-item"
              onClick={() => navigate("/orders")}
            >
              <span aria-hidden="true">📦</span>
              My Orders
            </button>

            <button
              type="button"
              className="account-menu-item"
              onClick={() => navigate("/wishlist")}
            >
              <span aria-hidden="true">❤️</span>
              My Wishlist
            </button>

            {unavailableMenuItems.map((item) => (
              <button
                type="button"
                className="account-menu-item"
                key={item.label}
                disabled
                title="Coming soon"
              >
                <span aria-hidden="true">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>

          <button
            type="button"
            className="account-logout-btn"
            disabled
            title="You are not signed in"
          >
            <span aria-hidden="true">↪</span>
            Logout
          </button>
        </aside>

        <section className="account-main">
          <div className="account-profile-hero">
            <div className="account-profile-info">
              <div className="account-avatar" aria-hidden="true">
                G
              </div>

              <div>
                <p>Hello,</p>
                <h1>Guest</h1>
                <span>Welcome to Reezo</span>
              </div>
            </div>

            <button
              type="button"
              className="account-edit-btn"
              disabled
              title="Account editing is coming soon"
            >
              ✎ Edit Profile
            </button>
          </div>

          <p>
            You are browsing as a guest. Demo orders and wishlist
            items are saved only in this browser. Account sign-in
            is not available yet.
          </p>

          {(ordersError || wishlistError) && (
            <div role="alert">
              <p>
                Some saved data could not be read. Affected
                counts are unavailable; readable orders appear below.
              </p>
            </div>
          )}

          <div className="account-stats">
            <button
              type="button"
              className="account-stat-card"
              onClick={() => navigate("/orders")}
              style={{ textAlign: "left" }}
            >
              <span className="account-stat-icon orders" aria-hidden="true">
                📦
              </span>

              <span>
                <strong>
                  {ordersError ? "—" : orders.length}
                </strong>
                <span>Total Orders</span>
              </span>

              <b aria-hidden="true">›</b>
            </button>

            <button
              type="button"
              className="account-stat-card"
              onClick={() => navigate("/wishlist")}
              style={{ textAlign: "left" }}
            >
              <span
                className="account-stat-icon wishlist"
                aria-hidden="true"
              >
                ❤️
              </span>

              <span>
                <strong>
                  {wishlistError ? "—" : wishlistCount}
                </strong>
                <span>Wishlist Items</span>
              </span>

              <b aria-hidden="true">›</b>
            </button>

            <div className="account-stat-card">
              <div className="account-stat-icon address" aria-hidden="true">
                📍
              </div>
              <div>
                <strong>—</strong>
                <span>Saved Addresses · Coming soon</span>
              </div>
            </div>

            <div className="account-stat-card">
              <div className="account-stat-icon offers" aria-hidden="true">
                🎁
              </div>
              <div>
                <strong>—</strong>
                <span>Saved Offers · Coming soon</span>
              </div>
            </div>
          </div>

          <section className="account-section">
            <div className="account-section-heading">
              <h2>Quick Access</h2>

              <button
                type="button"
                onClick={() => setDashboard(loadDashboard())}
              >
                Refresh Data
              </button>
            </div>

            <div className="account-quick-grid">
              <button
                type="button"
                className="account-quick-card"
                onClick={() => navigate("/orders")}
              >
                <span className="quick-icon blue" aria-hidden="true">
                  📦
                </span>
                <strong>My Orders</strong>
                <span style={{ display: "block" }}>
                  View your saved demo orders
                </span>
                <b aria-hidden="true">→</b>
              </button>

              <button
                type="button"
                className="account-quick-card wishlist-card"
                onClick={() => navigate("/wishlist")}
              >
                <span className="quick-icon pink" aria-hidden="true">
                  ❤️
                </span>
                <strong>My Wishlist</strong>
                <span style={{ display: "block" }}>
                  View your saved products
                </span>
                <b aria-hidden="true">→</b>
              </button>

              <button
                type="button"
                className="account-quick-card address-card"
                disabled
              >
                <span className="quick-icon green" aria-hidden="true">
                  📍
                </span>
                <strong>Saved Addresses</strong>
                <span style={{ display: "block" }}>Coming soon</span>
              </button>

              <button
                type="button"
                className="account-quick-card personal-card"
                disabled
              >
                <span className="quick-icon orange" aria-hidden="true">
                  👤
                </span>
                <strong>Personal Information</strong>
                <span style={{ display: "block" }}>Coming soon</span>
              </button>
            </div>
          </section>

          <section className="account-section recent-orders-section">
            <div className="account-section-heading">
              <h2>Recent Orders</h2>

              <button
                type="button"
                onClick={() => navigate("/orders")}
              >
                View All Orders →
              </button>
            </div>

            {recentOrders.length === 0 ? (
              <p>
                {ordersError
                  ? "Saved orders could not be displayed."
                  : "No orders yet. Demo checkout orders will appear here."}
              </p>
            ) : (
              <div className="account-orders-list">
                {recentOrders.map((order) => {
                  const product = order.items[0];

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
                      ? product.name
                      : `${product.name} + ${
                          order.items.length - 1
                        } more`;

                  return (
                    <div
                      className="account-order-row"
                      key={order.orderId}
                    >
                      <div className="account-order-product">
                        <div className="account-order-image">
                          {typeof product.image === "string" &&
                          product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
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

                        <div style={{ minWidth: 0 }}>
                          <h3>{title}</h3>
                          <p style={{ overflowWrap: "anywhere" }}>
                            Order #{order.orderId}
                            <span aria-hidden="true"> • </span>
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`account-order-status ${statusClass}`}
                      >
                        <span aria-hidden="true">● </span>
                        {status}
                      </span>

                      <strong className="account-order-price">
                        {formatMoney(order.total)}
                      </strong>

                      <button
                        type="button"
                        className="account-order-action"
                        onClick={() => openOrder(order)}
                      >
                        View Details
                      </button>

                      <button
                        type="button"
                        className="account-order-arrow"
                        aria-label={`Track order ${order.orderId}`}
                        onClick={() =>
                          navigate(
                            `/track-order?orderId=${encodeURIComponent(
                              order.orderId
                            )}`,
                            { state: { order } }
                          )
                        }
                      >
                        ›
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </section>

        <aside className="account-right-sidebar">
          <section className="account-side-card">
            <h2>Account Details</h2>

            <div className="account-detail-row">
              <span className="account-detail-icon" aria-hidden="true">
                👤
              </span>
              <div>
                <p>Guest</p>
                <span>Not signed in</span>
              </div>
            </div>

            <div className="account-detail-row">
              <span className="account-detail-icon" aria-hidden="true">
                ✉
              </span>
              <div>
                <p>Email not connected</p>
                <span>Not verified</span>
              </div>
            </div>

            <div className="account-detail-row">
              <span className="account-detail-icon" aria-hidden="true">
                ☎
              </span>
              <div>
                <p>Mobile not connected</p>
                <span>Not verified</span>
              </div>
            </div>
          </section>

          <section className="account-side-card account-offers">
            <h2>🎁 Offers</h2>
            <p>Account offers are coming soon.</p>
          </section>

          <section className="account-side-card account-help">
            <h2>🎧 Need Help?</h2>
            <p>Customer support is not available in this demo.</p>

            <button type="button" disabled>
              💬 Contact Support
            </button>
          </section>
        </aside>
      </div>
    </main>
  );
}

export default Profile;