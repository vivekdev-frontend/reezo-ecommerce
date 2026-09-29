import { useState } from "react";
import { useNavigate } from "react-router-dom";

import reezoLogo from "../assets/reezo-logo.png";
import reezoBags from "../assets/reezo-hero-bags.png";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    emailOrMobile: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: "",
    }));

    setMessage("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextErrors = {};
    const loginId = formData.emailOrMobile.trim();

    const isEmail =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginId);

    const isMobile =
      /^(?:\+91[\s-]?)?\d{10}$/.test(loginId);

    if (!loginId) {
      nextErrors.emailOrMobile =
        "Email or mobile number is required";
    } else if (!isEmail && !isMobile) {
      nextErrors.emailOrMobile =
        "Enter a valid email or 10-digit mobile number";
    }

    // Preserve the password exactly as entered.
    if (!formData.password) {
      nextErrors.password = "Password is required";
    }

    setErrors(nextErrors);
    setMessage("");

    if (Object.keys(nextErrors).length > 0) return;

    setMessage(
      "Sign-in is not available yet. Your details have not been sent, and you are not logged in."
    );
  };

  return (
    <main className="login-page">
      <div className="login-container">
        <div className="login-left">
          <img
            src={reezoLogo}
            alt="Reezo"
            className="login-reezo-logo"
          />

          <h1>Welcome Back!</h1>

          <p>
            Get access to your Orders, Wishlist
            <br />
            and exclusive recommendations.
          </p>

          <div className="login-shopping-art" aria-hidden="true">
            <img
              src={reezoBags}
              alt=""
              className="login-bag-image"
              decoding="async"
            />

            <div className="login-glow" />
          </div>
        </div>

        <div className="login-right">
          <form
            className="login-form"
            onSubmit={handleSubmit}
            noValidate
          >
            <h2>Login to Continue Shopping</h2>

            <p className="login-subtitle">
              Account sign-in is coming soon. You can continue
              browsing the store.
            </p>

            <label htmlFor="login-email-mobile">
              Email or Mobile Number
            </label>

            <div className="login-input-wrapper">
              <span className="login-input-icon" aria-hidden="true">
                ✉
              </span>

              <input
                id="login-email-mobile"
                type="text"
                name="emailOrMobile"
                placeholder="Enter email or mobile number"
                value={formData.emailOrMobile}
                onChange={handleChange}
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                required
                aria-invalid={Boolean(errors.emailOrMobile)}
                aria-describedby={
                  errors.emailOrMobile
                    ? "login-email-mobile-error"
                    : undefined
                }
              />
            </div>

            {errors.emailOrMobile && (
              <p
                id="login-email-mobile-error"
                className="login-error"
                role="alert"
              >
                {errors.emailOrMobile}
              </p>
            )}

            <label htmlFor="login-password">
              Password
            </label>

            <div className="login-input-wrapper">
              <span className="login-input-icon" aria-hidden="true">
                🔒
              </span>

              <input
                id="login-password"
                type="password"
                name="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
                aria-invalid={Boolean(errors.password)}
                aria-describedby={
                  errors.password
                    ? "login-password-error"
                    : undefined
                }
              />
            </div>

            {errors.password && (
              <p
                id="login-password-error"
                className="login-error"
                role="alert"
              >
                {errors.password}
              </p>
            )}

            <button
              type="button"
              className="forgot-password"
              onClick={() => navigate("/forgot-password")}
              style={{
                display: "block",
                marginLeft: "auto",
                border: "none",
                padding: 0,
                background: "transparent",
                fontFamily: "inherit",
              }}
            >
              Forgot Password?
            </button>

            {message && (
              <p role="status" aria-live="polite">
                {message}
              </p>
            )}

            <button
              type="submit"
              className="login-submit-btn"
            >
              Login
            </button>

            <div className="login-divider">
              <span>OR</span>
            </div>

            <button
              type="button"
              className="create-account-btn"
              onClick={() => navigate("/signup")}
            >
              Create New Account
            </button>

            <button
              type="button"
              className="back-home-btn"
              onClick={() => navigate("/")}
            >
              ← Back to Home
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

export default Login;