"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = require("nodemailer");
let MailService = class MailService {
    constructor(config) {
        this.config = config;
        this.transporter =
            nodemailer.createTransport({
                host: this.config.get('SMTP_HOST'),
                port: Number(this.config.get('SMTP_PORT')),
                secure: false,
                auth: {
                    user: this.config.get('SMTP_USER'),
                    pass: this.config.get('SMTP_PASS'),
                },
            });
    }
    async sendMagicLinkEmail(email, token) {
        await this.transporter.sendMail({
            from: this.config.get('SMTP_USER'),
            to: email,
            subject: 'Mã đăng nhập Magic Link',
            // html: `
            //   <div style="
            //     font-family: Arial, sans-serif;
            //     padding: 20px;
            //     line-height: 1.6;
            //   ">
            //     <h2 style="
            //       color: #7e22ce;
            //     ">
            //       Đăng nhập hệ thống
            //     </h2>
            //     <p>
            //       Mã đăng nhập của bạn là:
            //     </p>
            //     <div style="
            //       font-size: 32px;
            //       font-weight: bold;
            //       letter-spacing: 5px;
            //       color: #7e22ce;
            //       margin: 20px 0;
            //     ">
            //       ${token}
            //     </div>
            //     <p>
            //       Mã có hiệu lực trong
            //       <strong>10 phút</strong>.
            //     </p>
            //     <p>
            //       Không chia sẻ mã này
            //       cho bất kỳ ai.
            //     </p>
            //   </div>
            // `,
            html: `
  <div style="
    font-family: Arial, sans-serif;
    padding: 20px;
    line-height: 1.6;
    color: #111827;
  ">
    <h2 style="
      color: #2563eb;
      margin-bottom: 16px;
    ">
      Đăng nhập hệ thống
    </h2>

    <p>
      Mã đăng nhập của bạn là:
    </p>

    <div style="
      font-size: 24px;
      font-weight: bold;
      color: #2563eb;
      margin: 20px 0;
    ">
      ${token}
    </div>

    <p>
      Mã có hiệu lực trong
      <strong>10 phút</strong>.
    </p>

    <p>
      Không chia sẻ mã này
      cho bất kỳ ai.
    </p>
  </div>
`,
        });
    }
};
exports.MailService = MailService;
exports.MailService = MailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MailService);
