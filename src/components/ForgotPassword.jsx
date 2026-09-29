import { useState } from "react";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleChange = (event) => {
    setEmail(event.target.value);
    setError("");
    setMessage("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setMessage("");

    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setError("Email address is required");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Enter a valid email address");
      return;
    }

    setError("");
    setMessage(
      "Password reset is not available yet. No reset email has been sent."
    );
  };

  return (
    <main className="forgot-page">
      <div className="forgot-card">
        <h1>Forgot Password?</h1>

        <p id="forgot-help">
          Password reset is coming soon. Reset emails cannot
          be sent yet.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="forgot-email">
            Email Address
          </label>

          <input
            id="forgot-email"
            type="email"
            name="email"
            placeholder="Enter your email address"
            value={email}
            onChange={handleChange}
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            required
            aria-invalid={Boolean(error)}
            aria-describedby={
              error
                ? "forgot-help forgot-email-error"
                : "forgot-help"
            }
          />

          {error && (
            <p
              id="forgot-email-error"
              className="forgot-error"
              role="alert"
            >
              {error}
            </p>
          )}

          {message && (
            <p role="status" aria-live="polite">
              {message}
            </p>
          )}

          <button
            type="submit"
            className="forgot-submit-btn"
          >
            Send Reset Link →
          </button>
        </form>

        <button
          type="button"
          className="forgot-back-btn"
          onClick={() => navigate("/login")}
        >
          ← Back to Login
        </button>
      </div>
    </main>
  );
}

export default ForgotPassword;