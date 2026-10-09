import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole } from "lucide-react";
import "../styles/admin-brand.css";
import Loader from "../components/spinner/Loader";
import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "@/lib/router";
import { useAuth } from "../context/useAuth";
import { getApiErrorMessage } from "../lib/apiError";

const Login = () => {
  const { isAuthenticated, loading: authLoading, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (authLoading) {
    return <Loader fullPage label="Checking session" />;
  }

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
      setError(getApiErrorMessage(e, "Login failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="admin-login-page">
      <Link to="/" className="admin-login-back"><ArrowLeft size={14} />Back to website</Link>
      <div className="admin-login-shell">
        <aside className="admin-login-brand">
          <div className="admin-login-logo"><img src="/logo-dark.png" alt="North Luxe" /></div>
          <div><p className="admin-login-eyebrow">North Luxe workspace</p><h2>Everything for your next journey.</h2><p>Manage bookings, content and your team in one place.</p></div>
          <span><LockKeyhole size={14} />Team access</span>
        </aside>
        <form onSubmit={handleSubmit} className="admin-login-form" aria-labelledby="login-title" aria-busy={loading}>
          <div><h1 id="login-title">Welcome back</h1><p>Sign in to your admin or editor account.</p></div>
          <label htmlFor="admin-login-email">Email address</label>
          <input id="admin-login-email" type="email" autoComplete="username" required placeholder="name@northluxe.com" value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} disabled={loading} />
          <label htmlFor="admin-login-password">Password</label>
          <div className="admin-login-password"><input id="admin-login-password" type={showPassword ? "text" : "password"} autoComplete="current-password" required placeholder="Enter your password" value={form.password} onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))} disabled={loading} /><button type="button" aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} onClick={() => setShowPassword((prev) => !prev)}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div>
          {error && <p className="admin-login-error" role="alert">{error}</p>}
          <button type="submit" disabled={loading} className="admin-login-submit">{loading ? "Signing in..." : "Sign in"}<ArrowRight size={15} /></button>
        </form>
      </div>
    </main>
  );
};

export default Login;
