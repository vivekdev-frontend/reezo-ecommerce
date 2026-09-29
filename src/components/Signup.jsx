import { useState } from "react";
import { useNavigate } from "react-router-dom";

import reezoLogo from "../assets/reezo-logo.png";
import reezoShoppingBag from "../assets/reezo-signup-shopping-art.png";

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    mobile: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    let nextValue = value;

    if (name === "mobile") {
      nextValue = value.replace(/\D/g, "");

      // Accept a pasted number containing the Indian country code.
      if (
        nextValue.length === 12 &&
        nextValue.startsWith("91")
      ) {
        nextValue = nextValue.slice(2);
      }
    }

    setFormData((current) => ({
      ...current,
      [name]: nextValue,
    }));

    setErrors((current) => ({
      ...current,
      [name]: "",
      ...(name === "password" ? { confirmPassword: "" } : {}),
    }));

    setMessage("");
  };

  const validateForm = () => {
    const nextErrors = {};
    const fullName = formData.fullName.trim();
    const email = formData.email.trim();

    if (!fullName) {
      nextErrors.fullName = "Full name is required";
    } else if (fullName.length < 2) {
      nextErrors.fullName = "Enter a valid full name";
    }

    if (!formData.mobile) {
      nextErrors.mobile = "Mobile number is required";
    } else if (!/^\d{10}$/.test(formData.mobile)) {
      nextErrors.mobile =
        "Enter a valid 10-digit mobile number";
    }

    if (!email) {
      nextErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = "Enter a valid email address";
    }

    // Keep passwords exactly as entered.
    if (!formData.password) {
      nextErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      nextErrors.password =
        "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      nextErrors.confirmPassword =
        "Please confirm your password";
    } else if (
      formData.password !== formData.confirmPassword
    ) {
      nextErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setMessage("");

    if (!validateForm()) return;

    setMessage(
      "Account creation is not available yet. Your details have not been sent or saved, and no account has been created."
    );
  };

  return (
    <main className="signup-page">
      <div className="signup-container">
        <section className="signup-brand-panel">
          <div className="signup-brand-content">
            <div className="signup-smart-tagline">
              <span>Shop Smarter with</span>

              <img
                src={reezoLogo}
                alt="Reezo"
                className="signup-tagline-logo"
              />
            </div>

            <h1>
              Create Your
              <br />
              Shopping{" "}
              <span className="signup-heading-highlight">
                Account
              </span>
            </h1>

            <p className="signup-brand-text">
              Sign up to save your wishlist, manage orders
              and enjoy a better shopping experience.
            </p>
          </div>

          <div className="signup-shopping-art" aria-hidden="true">
            <div className="signup-art-glow" />

            <img
              src={reezoShoppingBag}
              alt=""
              className="signup-bag-image"
              decoding="async"
            />
          </div>
        </section>

        <section className="signup-form-panel">
          <div className="signup-form-header">
            <h2>
              Create{" "}
              <span className="signup-form-heading-highlight">
                Account
              </span>
            </h2>

            <p>
              Account registration is coming soon. You can
              continue browsing the store.
            </p>
          </div>

          <form
            className="signup-form"
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="signup-field">
              <label htmlFor="signup-full-name">
                Full Name
              </label>

              <div className="signup-input-box">
                <span className="signup-input-icon" aria-hidden="true">
                  👤
                </span>

                <input
                  id="signup-full-name"
                  type="text"
                  name="fullName"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  autoComplete="name"
                  required
                  aria-invalid={Boolean(errors.fullName)}
                  aria-describedby={
                    errors.fullName
                      ? "signup-full-name-error"
                      : undefined
                  }
                />
              </div>

              {errors.fullName && (
                <p
                  id="signup-full-name-error"
                  className="signup-error"
                  role="alert"
                >
                  {errors.fullName}
                </p>
              )}
            </div>

            <div className="signup-field">
              <label htmlFor="signup-mobile">
                Mobile Number
              </label>

              <div className="signup-input-box">
                <span className="signup-input-icon" aria-hidden="true">
                  📱
                </span>

                <span
                  id="signup-country-code"
                  className="signup-country-code"
                >
                  +91
                </span>

                <input
                  id="signup-mobile"
                  type="tel"
                  inputMode="tel"
                  name="mobile"
                  placeholder="10-digit mobile number"
                  value={formData.mobile}
                  onChange={handleChange}
                  autoComplete="tel-national"
                  required
                  aria-invalid={Boolean(errors.mobile)}
                  aria-describedby={
                    errors.mobile
                      ? "signup-country-code signup-mobile-error"
                      : "signup-country-code"
                  }
                />
              </div>

              {errors.mobile && (
                <p
                  id="signup-mobile-error"
                  className="signup-error"
                  role="alert"
                >
                  {errors.mobile}
                </p>
              )}
            </div>

            <div className="signup-field">
              <label htmlFor="signup-email">
                Email Address
              </label>

              <div className="signup-input-box">
                <span className="signup-input-icon" aria-hidden="true">
                  ✉️
                </span>

                <input
                  id="signup-email"
                  type="email"
                  name="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  required
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={
                    errors.email ? "signup-email-error" : undefined
                  }
                />
              </div>

              {errors.email && (
                <p
                  id="signup-email-error"
                  className="signup-error"
                  role="alert"
                >
                  {errors.email}
                </p>
              )}
            </div>

            <div className="signup-field">
              <label htmlFor="signup-password">
                Password
              </label>

              <div className="signup-input-box">
                <span className="signup-input-icon" aria-hidden="true">
                  🔒
                </span>

                <input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                  minLength={6}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={
                    errors.password
                      ? "signup-password-error"
                      : undefined
                  }
                />

                <button
                  type="button"
                  className="signup-password-toggle"
                  onClick={() =>
                    setShowPassword((current) => !current)
                  }
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                  aria-controls="signup-password"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              {errors.password && (
                <p
                  id="signup-password-error"
                  className="signup-error"
                  role="alert"
                >
                  {errors.password}
                </p>
              )}
            </div>

            <div className="signup-field">
              <label htmlFor="signup-confirm-password">
                Confirm Password
              </label>

              <div className="signup-input-box">
                <span className="signup-input-icon" aria-hidden="true">
                  🔐
                </span>

                <input
                  id="signup-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Enter password again"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                  aria-invalid={Boolean(errors.confirmPassword)}
                  aria-describedby={
                    errors.confirmPassword
                      ? "signup-confirm-password-error"
                      : undefined
                  }
                />

                <button
                  type="button"
                  className="signup-password-toggle"
                  onClick={() =>
                    setShowConfirmPassword((current) => !current)
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                  aria-controls="signup-confirm-password"
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>

              {errors.confirmPassword && (
                <p
                  id="signup-confirm-password-error"
                  className="signup-error"
                  role="alert"
                >
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {message && (
              <p role="status" aria-live="polite">
                {message}
              </p>
            )}

            <button
              type="submit"
              className="signup-submit-btn"
            >
              Create Account →
            </button>
          </form>

          <div className="signup-or-divider">
            <span />
            <p>OR</p>
            <span />
          </div>

          <div className="signup-login-link">
            <span>Already have an account?</span>

            <button
              type="button"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          </div>

          <button
            type="button"
            className="signup-home-btn"
            onClick={() => navigate("/")}
          >
            ← Back to Home
          </button>
        </section>
      </div>
    </main>
  );
}

export default Signup;