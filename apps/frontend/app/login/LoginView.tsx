
"use client";

import { useState } from "react";

import {
  sendMagicLink,
  verifyMagicLink,
} from "@/lib/api/auth";

import {
  Mail,
  Loader2,
  KeyRound,
} from "lucide-react";

import { useRouter } from "next/navigation";

export default function LoginView() {
  const router = useRouter();

  const [email, setEmail] =
    useState("");

  const [token, setToken] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(false);

  const [sent, setSent] =
    useState(false);

  const isValidEmail = (
    email: string,
  ) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      email,
    );
  };

  const [errorMessage, setErrorMessage] =
    useState("");


  // const handleSend = async () => {
  //   if (
  //     !isValidEmail(email) ||
  //     isLoading
  //   )
  //     return;

  //   try {
  //     setIsLoading(true);

  //     await sendMagicLink(email);

  //     setSent(true);
  //   } catch (error) {
  //     alert(
  //       "Có lỗi xảy ra khi gửi Magic Link!",
  //     );
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };
  const handleSend = async () => {

    if (
      !isValidEmail(email) ||
      isLoading
    ) return;

    try {

      setErrorMessage("");

      setIsLoading(true);

      await sendMagicLink(email);

      setSent(true);

    } catch (error: any) {

      setErrorMessage(
        error?.response?.data?.message ||
        "Có lỗi xảy ra khi gửi Magic Link!"
      );

    } finally {

      setIsLoading(false);
    }
  };
  // const handleLogin = async () => {
  //   if (!token) return;

  //   try {
  //     setIsLoading(true);

  //     const res =
  //       await verifyMagicLink(
  //         email,
  //         token,
  //       );

  //     if (res?.accessToken) {
  //       router.replace(
  //         res.role === "ADMIN" ||
  //           res.role === "OWNER"
  //           ? "/admin"
  //           : "/user",
  //       );
  //     } else {
  //       alert(
  //         "Token không hợp lệ!",
  //       );
  //     }
  //   } catch (err) {
  //     alert(
  //       "Đăng nhập thất bại!",
  //     );
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };
  const handleLogin = async () => {

    if (!token) {
      setErrorMessage("Token is required");
      return;
    }

    try {

      setErrorMessage("");
      setIsLoading(true);

      const res = await verifyMagicLink(email, token);

      router.replace(
        res.role === "ADMIN" || res.role === "OWNER"
          ? "/admin"
          : "/user"
      );

    } catch (err: any) {
      console.log("LOGIN ERROR:", err?.response?.data);
     setErrorMessage(
  err?.message ||
  err?.error ||
  "Đăng nhập thất bại!"
);

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
            <Mail
              size={28}
              strokeWidth={2.5}
            />
          </div>
        </div>

        {/* HEADER */}
        <div className="login-header">
          <h1>
            Chào mừng trở lại
          </h1>

          <p>
            Đăng nhập bằng Magic
            Link
          </p>
        </div>

        {/* EMAIL */}
        <div className="input-group">
          <label>Email</label>

          <div className="input-wrapper">
            <Mail
              className="input-icon"
              size={20}
            />

            <input
              type="email"
              className="input-field"
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value,
                )
              }
              placeholder="example@gmail.com"
              disabled={
                isLoading || sent
              }
            />
          </div>

          {/* VALIDATE EMAIL */}
          {email &&
            !isValidEmail(email) && (
              <p
                style={{
                  color: "#ef4444",
                  fontSize: "14px",
                  marginTop: "8px",
                  marginLeft: "5px",
                }}
              >
                Email không đúng
                định dạng
              </p>
            )}
        </div>

        {/* BUTTON SEND */}
        {!sent && (
          <button
            className="login-button"
            disabled={
              !isValidEmail(
                email,
              ) || isLoading
            }
            onClick={handleSend}
          >
            {isLoading ? (
              <>
                <Loader2
                  className="spin"
                  size={22}
                />
                Đang gửi...
              </>
            ) : (
              "Gửi Magic Link"
            )}
          </button>
        )}

        {/* SUCCESS */}
        {sent && (
          <>
            <p className="success-text">
              Mã đăng nhập đã được
              gửi tới email của
              bạn.
            </p>

            {/* TOKEN */}
            {/*  <div className="input-group">
              <label>
                Nhập Token
              </label>

              <div className="input-wrapper">
                <KeyRound
                  className="input-icon"
                  size={20}
                />

                <input
                  type="text"
                  className="input-field"
                  value={token}
                  onChange={(e) =>

                    setToken(
                      e.target.value.trim(),
                    )


                  }
                  placeholder="Nhập token"
                />
              </div>
            </div>*/}

            <div className="input-group">

              <label>
                Nhập Token
              </label>

              <div className="input-wrapper">

                <KeyRound
                  className="input-icon"
                  size={20}
                />

                <input
                  type="text"
                  className="input-field"
                  value={token}
                  onChange={(e) =>
                    setToken(
                      e.target.value.trim(),
                    )
                  }
                  placeholder="Nhập token"
                />
              </div>

              {/* ERROR MESSAGE */}
              {
                errorMessage && (
                  <p
                    style={{
                      color: "#ef4444",
                      fontSize: "14px",
                      marginTop: "8px",
                      marginLeft: "5px",
                    }}
                  >
                    {errorMessage}
                  </p>
                )
              }

            </div>
            {/* LOGIN BUTTON */}
            {/* <button
              className="login-button"
              disabled={
                !token || isLoading
              }
              onClick={
                handleLogin
              }
            >
              {isLoading ? (
                <>
                  <Loader2
                    className="spin"
                    size={22}
                  />
                  Đang xác thực...
                </>
              ) : (
                "Đăng nhập"
              )}
            </button> */}

            <button
              className="login-button"
              disabled={isLoading}
              onClick={handleLogin}
            >
              {isLoading ? (
                <>
                  <Loader2
                    className="spin"
                    size={22}
                  />
                  Đang xác thực...
                </>
              ) : (
                "Đăng nhập"
              )}
            </button>
          </>
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
          to {
            transform: rotate(360deg);
          }
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