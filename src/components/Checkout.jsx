import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import phonepeLogo from "../assets/phonepe-logo.svg";
import gpayLogo from "../assets/gpay-logo.svg";
import paytmLogo from "../assets/paytm-logo.svg";
import visaLogo from "../assets/visa-logo.svg";
import mastercardLogo from "../assets/mastercard-logo.png";
import rupayLogo from "../assets/rupay-logo.png";

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

const addressFields = [
  {
    name: "fullName",
    label: "Full Name",
    placeholder: "Full Name",
    autoComplete: "name",
  },
  {
    name: "mobile",
    label: "Mobile Number",
    placeholder: "10-digit Mobile Number",
    autoComplete: "tel",
    type: "tel",
    inputMode: "tel",
  },
  {
    name: "street",
    label: "Street Address",
    placeholder: "House No., Building, Street",
    autoComplete: "street-address",
  },
  {
    name: "city",
    label: "City / District",
    placeholder: "City / District",
    autoComplete: "address-level2",
  },
  {
    name: "state",
    label: "State",
    placeholder: "State",
    autoComplete: "address-level1",
  },
  {
    name: "pinCode",
    label: "PIN Code",
    placeholder: "6-digit PIN Code",
    autoComplete: "postal-code",
    inputMode: "numeric",
    maxLength: 6,
  },
];

function Checkout({ cart = [], setCart }) {
  const navigate = useNavigate();
  const submissionLock = useRef(false);

  const [address, setAddress] = useState({
    fullName: "",
    mobile: "",
    street: "",
    city: "",
    state: "",
    pinCode: "",
  });

  const [errors, setErrors] = useState({});
  const [addressVerified, setAddressVerified] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [orderError, setOrderError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cartIsArray = Array.isArray(cart);

  const items = cartIsArray
    ? cart.filter(
        (item) =>
          item &&
          typeof item === "object" &&
          !Array.isArray(item) &&
          ((typeof item.id === "string" && item.id.trim() !== "") ||
            (typeof item.id === "number" && Number.isFinite(item.id))) &&
          typeof item.name === "string" &&
          item.name.trim() !== ""
      )
    : [];

  const rows = items.map((item) => {
    const price = parsePrice(item.price);
    const quantity = parseQuantity(item.quantity);
    const subtotal =
      price !== null && quantity !== null
        ? price * quantity
        : null;

    return {
      item,
      price,
      quantity,
      subtotal,
      valid: subtotal !== null && Number.isFinite(subtotal),
    };
  });

  const totalPrice = rows.reduce(
    (sum, row) => sum + (row.valid ? row.subtotal : 0),
    0
  );

  const totalQuantity = rows.reduce(
    (sum, row) => sum + (row.quantity ?? 0),
    0
  );

  const hasInvalidCart =
    !cartIsArray ||
    items.length !== cart.length ||
    rows.some((row) => !row.valid) ||
    !Number.isFinite(totalPrice) ||
    !Number.isSafeInteger(totalQuantity);

  const canPlaceOrder =
    !hasInvalidCart &&
    items.length > 0 &&
    addressVerified &&
    paymentMethod === "cod" &&
    typeof setCart === "function" &&
    !isSubmitting;

  const handleChange = (event) => {
    const { name, value } = event.target;
    let nextValue = value;

    if (name === "mobile") {
      nextValue = value.replace(/\D/g, "");

      // Accept a pasted Indian number with its country code.
      if (nextValue.length === 12 && nextValue.startsWith("91")) {
        nextValue = nextValue.slice(2);
      }
    }

    if (name === "pinCode") {
      nextValue = value.replace(/\D/g, "").slice(0, 6);
    }

    setAddress((current) => ({
      ...current,
      [name]: nextValue,
    }));

    setErrors((current) => ({
      ...current,
      [name]: "",
    }));

    setAddressVerified(false);
    setPaymentMethod("");
    setOrderError("");
  };

  const validateAddress = () => {
    const nextErrors = {};

    if (address.fullName.trim().length < 2) {
      nextErrors.fullName = "Enter your full name";
    }

    if (!/^\d{10}$/.test(address.mobile)) {
      nextErrors.mobile = "Enter a valid 10-digit mobile number";
    }

    if (!address.street.trim()) {
      nextErrors.street = "Address is required";
    }

    if (!address.city.trim()) {
      nextErrors.city = "City / District is required";
    }

    if (!address.state.trim()) {
      nextErrors.state = "State is required";
    }

    if (!/^[1-9]\d{5}$/.test(address.pinCode)) {
      nextErrors.pinCode = "Enter a valid 6-digit PIN code";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleContinue = (event) => {
    event.preventDefault();
    setAddressVerified(validateAddress());
  };

  const handlePlaceOrder = () => {
    if (submissionLock.current || !canPlaceOrder) return;

    if (!validateAddress()) {
      setAddressVerified(false);
      setPaymentMethod("");
      return;
    }

    submissionLock.current = true;
    setIsSubmitting(true);
    setOrderError("");

    let order;

    try {
      const saved = localStorage.getItem(ORDERS_KEY);
      const existingOrders = saved === null ? [] : JSON.parse(saved);

      // Preserve existing data if the saved order list is damaged.
      if (
        !Array.isArray(existingOrders) ||
        existingOrders.some(
          (entry) =>
            !entry ||
            typeof entry !== "object" ||
            typeof entry.orderId !== "string" ||
            !Array.isArray(entry.items)
        )
      ) {
        throw new Error("Invalid saved order data");
      }

      const suffix =
        typeof globalThis.crypto?.randomUUID === "function"
          ? globalThis.crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

      order = {
        orderId: `REEZO-${suffix}`,
        createdAt: new Date().toISOString(),
        status: "Placed",
        address: Object.fromEntries(
          Object.entries(address).map(([key, value]) => [
            key,
            value.trim(),
          ])
        ),
        items: rows.map(({ item, quantity }) => ({
          ...item,
          quantity,
        })),
        total: totalPrice,
        paymentMethod: "cod",
        paymentStatus: "Pay on Delivery",
      };

      localStorage.setItem(
        ORDERS_KEY,
        JSON.stringify([order, ...existingOrders])
      );
    } catch {
      submissionLock.current = false;
      setIsSubmitting(false);
      setOrderError(
        "Your order could not be saved in this browser. Your cart has been kept. Please check browser storage and try again."
      );
      return;
    }

    setCart([]);

    navigate("/order-success", {
      replace: true,
      state: { order },
    });
  };

  if (cartIsArray && cart.length === 0) {
    return (
      <main className="checkout-page">
        <div className="checkout-empty">
          <h2>Your cart is empty</h2>
          <p>Add some products before checkout.</p>

          <button
            type="button"
            className="checkout-shopping-btn"
            onClick={() => navigate("/")}
          >
            ← Continue Shopping
          </button>
        </div>
      </main>
    );
  }

  if (hasInvalidCart) {
    return (
      <main className="checkout-page">
        <div className="checkout-empty">
          <h2>Check your cart</h2>
          <p role="alert">
            Some products have invalid prices or quantities.
            Remove and re-add those products before checkout.
          </p>

          <button
            type="button"
            className="back-to-cart-btn"
            onClick={() => navigate("/cart")}
          >
            ← Back to Cart
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <div className="checkout-heading-area">
        <div className="checkout-breadcrumb">
          <span aria-hidden="true">⌂</span>
          <span>Home</span>
          <span aria-hidden="true">›</span>
          <span>Cart</span>
          <span aria-hidden="true">›</span>
          <span>Checkout</span>
        </div>

        <h1 className="checkout-title">Checkout</h1>
      </div>

      <div className="checkout-layout">
        <div className="checkout-left-column">
          <section className="checkout-card delivery-card">
            <div className="checkout-card-heading">
              <span className="checkout-heading-icon" aria-hidden="true">
                🚚
              </span>
              <h2>Delivery Address</h2>
            </div>

            <form onSubmit={handleContinue} noValidate>
              <div className="checkout-form">
                {addressFields.map((field) => (
                  <div
                    className="checkout-field checkout-field-full"
                    key={field.name}
                  >
                    <label htmlFor={`checkout-${field.name}`}>
                      {field.label}
                    </label>

                    <input
                      id={`checkout-${field.name}`}
                      type={field.type || "text"}
                      name={field.name}
                      placeholder={field.placeholder}
                      value={address[field.name]}
                      onChange={handleChange}
                      autoComplete={field.autoComplete}
                      inputMode={field.inputMode}
                      maxLength={field.maxLength}
                      disabled={isSubmitting}
                      required
                      aria-invalid={Boolean(errors[field.name])}
                      aria-describedby={
                        errors[field.name]
                          ? `checkout-${field.name}-error`
                          : undefined
                      }
                    />

                    {errors[field.name] && (
                      <p
                        id={`checkout-${field.name}-error`}
                        className="form-error"
                        role="alert"
                      >
                        {errors[field.name]}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {!addressVerified ? (
                <button
                  type="submit"
                  className="continue-order-btn"
                  disabled={isSubmitting}
                >
                  Continue →
                </button>
              ) : (
                <div className="address-success" role="status">
                  ✓ Address details checked
                </div>
              )}
            </form>
          </section>

          <section className="checkout-back-card">
            <button
              type="button"
              className="back-to-cart-btn"
              onClick={() => navigate("/cart")}
              disabled={isSubmitting}
            >
              ← Back to Cart
            </button>
          </section>
        </div>

        <div className="checkout-right-column">
          <section className="checkout-card order-summary-card">
            <div className="checkout-card-heading">
              <span className="checkout-heading-icon" aria-hidden="true">
                🛒
              </span>
              <h2>Order Summary</h2>
            </div>

            <div className="checkout-order-list">
              {rows.map(({ item, quantity, subtotal }) => (
                <div className="checkout-order-item" key={item.id}>
                  <div className="checkout-order-product">
                    <div className="checkout-order-image">
                      {typeof item.image === "string" && item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          decoding="async"
                        />
                      ) : (
                        <span>Image unavailable</span>
                      )}
                    </div>

                    <div className="checkout-order-info">
                      <h4>{item.name}</h4>
                      <p>Qty: {quantity}</p>
                    </div>
                  </div>

                  <strong className="checkout-item-total">
                    {formatMoney(subtotal)}
                  </strong>
                </div>
              ))}
            </div>

            <div className="checkout-summary-total">
              <div className="checkout-total-line">
                <span>Total Items:</span>
                <strong>{totalQuantity}</strong>
              </div>

              <div className="checkout-total-line">
                <span>Total Price:</span>
                <strong>{formatMoney(totalPrice)}</strong>
              </div>

              <div className="checkout-grand-total">
                <span>Grand Total:</span>
                <strong>{formatMoney(totalPrice)}</strong>
              </div>
            </div>
          </section>

          <section className="checkout-card payment-card">
            <div className="checkout-card-heading">
              <span className="checkout-heading-icon" aria-hidden="true">
                💳
              </span>
              <h2 id="checkout-payment-heading">Payment Method</h2>
            </div>

            <div
              className="payment-options"
              role="radiogroup"
              aria-labelledby="checkout-payment-heading"
            >
              <label className="payment-option payment-option-disabled">
                <div className="payment-option-left">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="upi"
                    disabled
                  />

                  <div className="payment-option-text">
                    <strong>UPI</strong>
                    <small>Currently unavailable</small>
                  </div>
                </div>

                <div className="payment-brand-logos">
                  <img
                    src={phonepeLogo}
                    alt="PhonePe"
                    className="payment-brand-logo phonepe-payment-logo"
                  />
                  <img
                    src={gpayLogo}
                    alt="Google Pay"
                    className="payment-brand-logo gpay-payment-logo"
                  />
                  <img
                    src={paytmLogo}
                    alt="Paytm"
                    className="payment-brand-logo paytm-payment-logo"
                  />
                </div>
              </label>

              <label className="payment-option payment-option-disabled">
                <div className="payment-option-left">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    disabled
                  />

                  <div className="payment-option-text">
                    <strong>Credit / Debit Card</strong>
                    <small>Currently unavailable</small>
                  </div>
                </div>

                <div className="payment-brand-logos">
                  <img
                    src={visaLogo}
                    alt="Visa"
                    className="payment-brand-logo visa-payment-logo"
                  />
                  <img
                    src={mastercardLogo}
                    alt="Mastercard"
                    className="payment-brand-logo mastercard-payment-logo"
                  />
                  <img
                    src={rupayLogo}
                    alt="RuPay"
                    className="payment-brand-logo rupay-payment-logo"
                  />
                </div>
              </label>

              <label
                className={`payment-option ${
                  paymentMethod === "cod"
                    ? "payment-option-selected"
                    : ""
                } ${
                  !addressVerified || isSubmitting
                    ? "payment-option-disabled"
                    : ""
                }`}
              >
                <div className="payment-option-left">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={() => {
                      if (addressVerified && !isSubmitting) {
                        setPaymentMethod("cod");
                        setOrderError("");
                      }
                    }}
                    disabled={!addressVerified || isSubmitting}
                  />

                  <div className="payment-option-text">
                    <strong>Cash on Delivery</strong>
                    <small>Pay when your order is delivered.</small>
                  </div>
                </div>

                <span className="cod-payment-icon" aria-hidden="true">
                  📦
                </span>
              </label>
            </div>

            {!addressVerified && (
              <div className="payment-help-message">
                Complete your delivery address and select Continue
                to choose a payment method.
              </div>
            )}

            {addressVerified && paymentMethod === "cod" && (
              <div className="cod-message" role="status">
                ✓ Cash on Delivery selected.
              </div>
            )}

            <p className="online-payment-message">
              Demo checkout: orders are saved only in this browser.
              No delivery request is sent.
            </p>

            {orderError && (
              <p className="form-error" role="alert">
                {orderError}
              </p>
            )}

            {typeof setCart !== "function" && (
              <p className="form-error" role="alert">
                Checkout is currently unavailable.
              </p>
            )}

            <button
              type="button"
              className="place-order-btn"
              onClick={handlePlaceOrder}
              disabled={!canPlaceOrder}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? "Saving Order…" : "Place Demo Order"}
            </button>
          </section>
        </div>
      </div>
    </main>
  );
}

export default Checkout;