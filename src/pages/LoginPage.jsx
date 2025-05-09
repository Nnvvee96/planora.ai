// src/pages/LoginPage.jsx
import React from "react";
import Footer from "../components/Footer";
import { LOGIN_PAGE_CLASSES } from "../utils/constants";
import { useLogin } from "../hooks/useLogin";

function LoginPage() {
  const { email, setEmail, password, setPassword, error, handleLogin } = useLogin();

  return (
    <div className={LOGIN_PAGE_CLASSES.container}>
      <main className={LOGIN_PAGE_CLASSES.main}>
        <div className={LOGIN_PAGE_CLASSES.card}>
          <h2 className={LOGIN_PAGE_CLASSES.title}>Login to Planora Travel Agent</h2>
          {error && (
            <div className={LOGIN_PAGE_CLASSES.error}>
              {error}
            </div>
          )}
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label htmlFor="email" className={LOGIN_PAGE_CLASSES.label}>
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={LOGIN_PAGE_CLASSES.input}
                placeholder="Enter your email"
              />
            </div>
            <div className="mb-6">
              <label htmlFor="password" className={LOGIN_PAGE_CLASSES.label}>
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={LOGIN_PAGE_CLASSES.input}
                placeholder="Enter your password"
              />
            </div>
            <button
              type="submit"
              className={LOGIN_PAGE_CLASSES.button}
            >
              Login
            </button>
          </form>
          <p className={LOGIN_PAGE_CLASSES.footerText}>
            Don’t have an account?{" "}
            <a href="/signup" className={LOGIN_PAGE_CLASSES.link}>
              Sign up
            </a>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default LoginPage;