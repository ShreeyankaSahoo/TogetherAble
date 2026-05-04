import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "@/lib/api";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail || !password) {
      alert("Email and password are required");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(apiUrl("/login"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: trimmedEmail,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Login failed");
        return;
      }

      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      window.dispatchEvent(new Event("auth-change"));
      navigate("/messages");
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      alert("Unable to reach the server. Please make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10">
      <section className="w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-card">
        <h1 className="font-heading text-2xl font-bold mb-6">Login</h1>

        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="input-field mb-4"
          autoComplete="email"
        />

        <label htmlFor="password" className="block text-sm font-medium mb-1">
          Password
        </label>
        <input
          id="password"
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") handleLogin();
          }}
          className="input-field mb-5"
          autoComplete="current-password"
        />

        <button
          type="button"
          onClick={handleLogin}
          disabled={loading}
          className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </section>
    </main>
  );
};

export default LoginPage;
