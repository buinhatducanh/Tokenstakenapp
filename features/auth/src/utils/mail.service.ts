
import { Injectable } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;

  constructor(
    private config: ConfigService,
  ) {
    this.transporter =
      nodemailer.createTransport({
        host: this.config.get('SMTP_HOST'),

        port: Number(
          this.config.get('SMTP_PORT'),
        ),

        secure: false,

        auth: {
          user: this.config.get('SMTP_USER'),

          pass: this.config.get('SMTP_PASS'),
        },
      });
  }

  async sendMagicLinkEmail(
    email: string,
    token: string,
  ) {
    await this.transporter.sendMail({
      from: this.config.get('SMTP_USER'),

      to: email,

      subject:
        'Mã đăng nhập Magic Link',

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
}