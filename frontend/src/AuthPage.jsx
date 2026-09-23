import { useState } from "react";
import axios from "axios";

const BACKEND = "http://localhost:8080";

function AuthPage({ onLogin }) {
  const [mode, setMode] = useState("login");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setMessage("");

    setForm({
      name: "",
      email: "",
      password: "",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");

    if (!form.email.trim() || !form.password.trim()) {
      setMessage("Please enter your email and password.");
      setMessageType("error");
      return;
    }

    if (mode === "register" && !form.name.trim()) {
      setMessage("Please enter your full name.");
      setMessageType("error");
      return;
    }

    try {
      setLoading(true);

      const endpoint =
        mode === "login"
          ? `${BACKEND}/api/auth/login`
          : `${BACKEND}/api/auth/register`;

      const payload =
        mode === "login"
          ? {
              email: form.email,
              password: form.password,
            }
          : {
              name: form.name,
              email: form.email,
              password: form.password,
            };

      const response = await axios.post(
        endpoint,
        payload
      );

      if (mode === "login") {
        const token = response.data.token;

        localStorage.setItem(
          "resumehub_token",
          token
        );

        localStorage.setItem(
          "resumehub_user",
          JSON.stringify(
            response.data.user || {
              name: form.name || "User",
              email: form.email,
            }
          )
        );

        onLogin(response.data);

        return;
      }

      setMessage(
        "Account created successfully. Please login."
      );

      setMessageType("success");

      setMode("login");

      setForm({
        name: "",
        email: form.email,
        password: "",
      });
    } catch (error) {
      console.error("Authentication error:", error);

      const errorData = error.response?.data;

      let errorMessage = "Something went wrong.";

      if (typeof errorData === "string") {
        errorMessage = errorData;
      } else if (errorData?.message) {
        errorMessage = errorData.message;
      } else if (errorData?.error) {
        errorMessage =
          typeof errorData.error === "string"
            ? errorData.error
            : "Authentication failed.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      setMessage(errorMessage);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-background-shape shape-one" />
      <div className="auth-background-shape shape-two" />

      <div className="auth-container">

        {/* LEFT SIDE */}

        <div className="auth-brand-panel">

          <div className="auth-brand">

            <div className="auth-brand-icon">
              💼
            </div>

            <div>
              <strong>ResumeHub</strong>
              <span>Career Portal</span>
            </div>

          </div>

          <div className="auth-brand-content">

            <span className="auth-eyebrow">
              YOUR CAREER, ORGANIZED
            </span>

            <h1>
              Find opportunities.
              <br />
              Build your future.
            </h1>

            <p>
              Manage your resume, discover job opportunities,
              and keep your career search organized in one place.
            </p>

            <div className="auth-features">

              <div>
                <span>✓</span>
                <p>Secure resume management</p>
              </div>

              <div>
                <span>✓</span>
                <p>Discover external job listings</p>
              </div>

              <div>
                <span>✓</span>
                <p>Save jobs for later</p>
              </div>

            </div>

          </div>

          <div className="auth-footer-text">
            ResumeHub · Resume & Job Portal
          </div>

        </div>

        {/* RIGHT SIDE */}

        <div className="auth-form-panel">

          <div className="auth-form-wrapper">

            <div className="mobile-auth-brand">

              <div className="auth-brand-icon">
                💼
              </div>

              <strong>ResumeHub</strong>

            </div>

            <div className="auth-heading">

              <span className="auth-small-title">
                {mode === "login"
                  ? "WELCOME BACK"
                  : "GET STARTED"}
              </span>

              <h2>
                {mode === "login"
                  ? "Welcome back!"
                  : "Create your account"}
              </h2>

              <p>
                {mode === "login"
                  ? "Sign in to continue to your career dashboard."
                  : "Create your ResumeHub account to get started."}
              </p>

            </div>

            <div className="auth-tabs">

              <button
                className={
                  mode === "login"
                    ? "auth-tab active"
                    : "auth-tab"
                }
                onClick={() => switchMode("login")}
                type="button"
              >
                Login
              </button>

              <button
                className={
                  mode === "register"
                    ? "auth-tab active"
                    : "auth-tab"
                }
                onClick={() =>
                  switchMode("register")
                }
                type="button"
              >
                Create Account
              </button>

            </div>

            {message && (
              <div
                className={
                  messageType === "success"
                    ? "auth-message success"
                    : "auth-message error"
                }
              >
                <span>
                  {messageType === "success"
                    ? "✓"
                    : "!"}
                </span>

                {message}
              </div>
            )}

            <form
              className="auth-form"
              onSubmit={handleSubmit}
            >

              {mode === "register" && (
                <div className="auth-input-group">

                  <label>Full Name</label>

                  <div className="auth-input-wrapper">

                    <span>◉</span>

                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      autoComplete="name"
                    />

                  </div>

                </div>
              )}

              <div className="auth-input-group">

                <label>Email Address</label>

                <div className="auth-input-wrapper">

                  <span>✉</span>

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />

                </div>

              </div>

              <div className="auth-input-group">

                <div className="password-label-row">

                  <label>Password</label>

                  {mode === "login" && (
                    <button
                      type="button"
                      className="forgot-password"
                      onClick={() =>
                        setMessage(
                          "Password reset will be added soon."
                        )
                      }
                    >
                      Forgot password?
                    </button>
                  )}

                </div>

                <div className="auth-input-wrapper">

                  <span>🔒</span>

                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete={
                      mode === "login"
                        ? "current-password"
                        : "new-password"
                    }
                  />

                </div>

              </div>

              {mode === "register" && (
                <p className="password-hint">
                  Use at least 8 characters for your password.
                </p>
              )}

              <button
                type="submit"
                className="auth-submit-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner" />
                    {mode === "login"
                      ? "Signing in..."
                      : "Creating account..."}
                  </>
                ) : (
                  <>
                    {mode === "login"
                      ? "Sign In"
                      : "Create Account"}

                    <span>→</span>
                  </>
                )}
              </button>

            </form>

            <div className="auth-switch">

              {mode === "login" ? (
                <>
                  Don't have an account?

                  <button
                    type="button"
                    onClick={() =>
                      switchMode("register")
                    }
                  >
                    Create Account
                  </button>
                </>
              ) : (
                <>
                  Already have an account?

                  <button
                    type="button"
                    onClick={() =>
                      switchMode("login")
                    }
                  >
                    Login
                  </button>
                </>
              )}

            </div>

            <div className="auth-security">

              <span>🔐</span>

              <p>
                Your account will be protected using
                secure authentication.
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default AuthPage;