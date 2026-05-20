
"use client";

import { useState } from "react";
import { sendMagicLink } from "@/lib/api/auth";
import { Mail, Loader2 } from "lucide-react";

export default function LoginView() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSend = async () => {
    if (!isValidEmail(email) || isLoading) return;

    try {
      setIsLoading(true);

      await sendMagicLink(email);

      // ✔ success state
      setSent(true);

      // ✔ clear input sau khi gửi
      setEmail("");
    } catch (error) {
      alert("Có lỗi xảy ra khi gửi Magic Link!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* ICON */}
        <div className="top-icon">
          <div className="icon-box">
            <Mail size={28} strokeWidth={2.5} />
          </div>
        </div>

        {/* HEADER */}
        <div className="login-header">
          <h1>Chào mừng trở lại</h1>
          <p>Đăng nhập bằng Magic Link</p>
        </div>

        {/* INPUT */}
        {/* <div className="input-group">
          <label>Email</label>

          <div className="input-wrapper">
            <Mail className="input-icon" size={20} />

            <input
              type="email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@gmail.com"
              disabled={isLoading} // ✔ khóa input khi gửi
            />
          </div>
        </div> */}
        <div className="input-group">
          <label>Email</label>

          <div className="input-wrapper">
            <Mail className="input-icon" size={20} />

            <input
              type="email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@gmail.com"
              disabled={isLoading}
            />
          </div>

          {/*  validate email */}
          {email && !isValidEmail(email) && (
            <p
              style={{
                color: "#ef4444",
                fontSize: "14px",
                marginTop: "8px",
                marginLeft: "5px",
              }}
            >
              Email không đúng định dạng
            </p>
          )}
        </div>

        {/* BUTTON */}
        <button
          className="login-button"
          disabled={!isValidEmail(email) || isLoading} // ✔ chống spam click
          onClick={handleSend}
        >
          {isLoading ? (
            <>
              <Loader2 className="spin" size={22} />
              Đang gửi...
            </>
          ) : (
            "Gửi Magic Link"
          )}
        </button>

        {/* SUCCESS MESSAGE */}
        {sent && (
          <p className="success-text">
            Magic Link đã được gửi!<br />
            Vui lòng kiểm tra email của bạn.
          </p>
        )}
      </div>



      {/* ==================== CSS ==================== */}
      <style jsx global>{`
        .login-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a, #1e3a8a);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          font-family: system-ui, -apple-system, sans-serif;
        }

        .login-card {
          width: 100%;
          max-width: 400px;
          background: #1f2937;
          border-radius: 28px;
          padding: 40px 32px;
          box-shadow: 0 30px 60px -15px rgb(0 0 0 / 0.6);
        }

        .top-icon {
          display: flex;
          justify-content: center;
          margin-bottom: 28px;
        }

        .icon-box {
          width: 68px;
          height: 68px;
          background: #3b82f6;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .login-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .login-header h1 {
          color: white;
          font-size: 27px;
          font-weight: 700;
          margin: 0 0 8px;
        }

        .login-header p {
          color: #94a3b8;
          font-size: 15.5px;
          margin: 0;
        }

        .input-group {
          margin-bottom: 24px;
        }

        .input-group label {
          display: block;
          color: #cbd5e1;
          font-size: 14.5px;
          margin-bottom: 8px;
          font-weight: 500;
        }

        .input-wrapper {
          position: relative;
        }

        .input-field {
          width: 100%;
          padding: 16px 20px 16px 48px;
          background: #334155;
          border: 2px solid #475569;
          border-radius: 9999px;
          font-size: 16px;
          color: white;
          outline: none;
          box-sizing: border-box;
        }

        .input-field:focus {
          border-color: #60a5fa;
        }

        .input-icon {
          position: absolute;
          left: 18px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }

        .login-button {
          width: 100%;
          padding: 16px;
          font-size: 17px;
          font-weight: 600;
          border: none;
          border-radius: 9999px;
          background: linear-gradient(90deg, #3b82f6, #60a5fa);
          color: white;
          cursor: pointer;
          margin-top: 8px;
        }

        .login-button:hover:not(:disabled) {
          transform: translateY(-2px);
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .success-text {
          margin-top: 20px;
          text-align: center;
          color: #4ade80;
          font-size: 15px;
          background: rgba(16, 185, 129, 0.15);
          padding: 12px;
          border-radius: 12px;
        }
      `}</style>
    </div>
  );
}