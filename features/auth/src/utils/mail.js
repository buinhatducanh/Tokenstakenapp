"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mailTransport = void 0;
exports.sendMagicLinkEmail = sendMagicLinkEmail;
const nodemailer = require("nodemailer");
/**
 * DEBUG ENV (quan trọng để bắt lỗi 127.0.0.1)
 */
console.log("SMTP_HOST =", process.env.SMTP_HOST);
console.log("SMTP_PORT =", process.env.SMTP_PORT);
console.log("SMTP_USER =", process.env.SMTP_USER);
console.log("SMTP_PASS =", process.env.SMTP_PASS); // thêm cái này luôn
exports.mailTransport = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com", // fallback tránh 127.0.0.1
    port: Number(process.env.SMTP_PORT || 587),
    secure: false, // Gmail dùng TLS STARTTLS
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});
/**
 * Gửi magic link login
 */
async function sendMagicLinkEmail(email, token) {
    const link = `${process.env.APP_URL}/auth/verify?token=${token}&email=${email}`;
    try {
        await exports.mailTransport.sendMail({
            from: `"Tokens App" <${process.env.SMTP_USER}>`,
            to: email,
            subject: "Your Magic Login Link",
            html: `
        <div style="font-family: Arial, sans-serif">
          <h2>🔐 Magic Login Link</h2>
          <p>Bấm vào link bên dưới để đăng nhập:</p>

          <a href="${link}" style="
            display:inline-block;
            padding:10px 15px;
            background:#6b46c1;
            color:white;
            border-radius:8px;
            text-decoration:none;
          ">
            Login Now
          </a>

          <p style="margin-top:20px;color:red">
            Link sẽ hết hạn sau 10 phút
          </p>

          <p style="font-size:12px;color:#666">
            Nếu bạn không yêu cầu đăng nhập, hãy bỏ qua email này.
          </p>
        </div>
      `,
        });
        console.log("📧 Magic link sent to:", email);
    }
    catch (err) {
        console.error("❌ EMAIL ERROR FULL:", err);
        throw err;
    }
}
