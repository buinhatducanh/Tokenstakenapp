
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function VerifyPage() {
  const params = useSearchParams();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  // useEffect(() => {
  //   const t = params.get("token");
  //   const e = params.get("email");

  //   if (t) setToken(t);
  //   if (e) setEmail(e);
  // }, [params]);
  useEffect(() => {
    const t = params.get("token");
    const e = params.get("email");

    if (t) setToken(t);
    if (e) setEmail(e);

    // 🚀 xoá query khỏi URL
    if (window.location.search) {
      window.history.pushState(
        {},
        "",
        "/verify"
      );
    }
  }, []);


  const handleVerify = async () => {
    try {
      setLoading(true);

      const res = await fetch("http://localhost:3000/auth/verify", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token }),
      });

      const data = await res.json();

      if (!data.role) {
        alert("Token không hợp lệ hoặc đã hết hạn!");
        return;
      }

      setRole(data.role);

      if (data.role === "ADMIN" || data.role === "OWNER") {
        router.replace("/admin");
      } else {
        router.replace("/user");
      }
    } catch (err) {
      alert("Có lỗi xảy ra khi xác thực!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verify-container">
      <div className="verify-card">
        {/* Header */}
        <div className="verify-header">
          <div className="icon-wrapper">
            🔐
          </div>
          <h1>Xác thực Magic Link</h1>
          <p>Nhấn nút bên dưới để hoàn tất đăng nhập</p>
        </div>

        {/* Content */}
        <div className="verify-content">
          <div className="info-group">
            <label>Email</label>
            <div className="info-box">{email || "Không có email"}</div>
          </div>

          {/* <div className="info-group">
            <label>Token</label>
            <div className="info-box token-box">{token || "Không có token"}</div>
          </div> */}

          <button
            onClick={handleVerify}
            disabled={loading || !token || !email}
            className="verify-button"
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Đang xác thực...
              </>
            ) : (
              " Xác nhận đăng nhập"
            )}
          </button>

          {role && (
            <div className="success-message">
              Đăng nhập thành công • Role: <strong>{role}</strong>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="verify-footer">
          Magic Link chỉ có hiệu lực trong một thời gian ngắn
        </div>
      </div>

      {/* ==================== CSS ==================== */}
      <style jsx>{`
  .verify-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #0f172a, #1e3a8a, #1e40af);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    font-family: system-ui, -apple-system, sans-serif;
  }

  .verify-card {
    width: 100%;
    max-width: 440px;
    background: rgba(15, 23, 42, 0.95);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(59, 130, 246, 0.3);
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.4);
  }

  .verify-header {
    text-align: center;
    padding: 40px 32px 30px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .icon-wrapper {
    width: 70px;
    height: 70px;
    margin: 0 auto 20px;
    background: linear-gradient(135deg, #2563eb, #3b82f6);
    border-radius: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    box-shadow: 0 10px 15px -3px rgb(59 130 246 / 0.3);
  }

  .verify-header h1 {
    color: white;
    font-size: 28px;
    font-weight: 700;
    margin: 0 0 8px 0;
  }

  .verify-header p {
    color: #94a3b8;
    margin: 0;
    font-size: 15.5px;
  }

  .verify-content {
    padding: 32px;
  }

  .info-group {
    margin-bottom: 20px;
  }

  .info-group label {
    display: block;
    color: #94a3b8;
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 6px;
  }

  .info-box {
    background: #1e2937;
    border: 1px solid #334155;
    border-radius: 16px;
    padding: 16px 20px;
    color: white;
    word-break: break-all;
  }

  .token-box {
    font-family: ui-monospace, monospace;
    font-size: 14px;
    color: #cbd5e1;
  }

  .verify-button {
    width: 100%;
    padding: 18px;
    margin-top: 10px;
    background: linear-gradient(to right, #2563eb, #3b82f6);
    color: white;
    font-size: 17px;
    font-weight: 600;
    border: none;
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
  }

  .verify-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 15px 25px -5px rgb(59 130 246 / 0.4);
  }

  .verify-button:disabled {
    background: #334155;
    cursor: not-allowed;
  }

  .spinner {
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 3px solid rgba(255,255,255,0.3);
    border-top: 3px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .success-message {
    margin-top: 20px;
    padding: 16px;
    background: rgba(16, 185, 129, 0.1);
    border: 1px solid rgba(16, 185, 129, 0.3);
    border-radius: 16px;
    color: #4ade80;
    text-align: center;
    font-size: 15px;
  }

  .verify-footer {
    text-align: center;
    padding: 20px 32px;
    color: #64748b;
    font-size: 13px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }
`}</style>
    </div>
  );
}