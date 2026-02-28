import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { isAuthenticated, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/admin" replace />;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      const to = location.state?.from?.pathname || "/admin";
      navigate(to, { replace: true });
    } catch (e) {
      setError(e?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#edf0f4] flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md ql-form-shell p-8 space-y-5 bg-[#f7f3eb]"
      >
        <div className="pb-2 border-b border-[#e4dac8]">
          <p className="ql-form-subtitle">Admin Access</p>
          <h1 className="text-2xl font-semibold text-[#1f2833] mt-1">Admin Login</h1>
          <p className="text-sm text-[#6b6458] mt-1">Use your dashboard credentials.</p>
        </div>

        <label>
          <span className="ql-label">Email</span>
        <input
          type="email"
          required
          placeholder="Email"
          className="ql-input"
          value={form.email}
          onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
        />
        </label>

        <label>
          <span className="ql-label">Password</span>
        <input
          type="password"
          required
          placeholder="Password"
          className="ql-input"
          value={form.password}
          onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
        />
        </label>

        {error && <p className="text-sm text-rose-600 font-semibold">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="ql-btn-primary w-full"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
};

export default Login;
