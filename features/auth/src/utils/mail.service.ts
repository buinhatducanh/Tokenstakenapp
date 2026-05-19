import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get('SMTP_HOST'),
      port: Number(this.config.get('SMTP_PORT')),
      secure: false,
      auth: {
        user: this.config.get('SMTP_USER'),
        pass: this.config.get('SMTP_PASS'),
      },
    });
  }

  // async sendMagicLinkEmail(email: string, token: string) {

  //   const link = `${this.config.get('FRONTEND_URL')}/verify?token=${token}&email=${email}`;
  // console.log("ENV FRONTEND_URL =", this.config.get("FRONTEND_URL"));
  //   await this.transporter.sendMail({
  //     from: this.config.get('SMTP_USER'),
  //     to: email,
  //     subject: 'Magic Link',
  //     html: `<a href="${link}">Login</a>`,
  //   });
  // }

  async sendMagicLinkEmail(email: string, token: string) {
    const front = this.config.get('FRONTEND_URL');

    console.log("FRONTEND_URL RAW =", front);
    console.log("ENV FRONTEND_URL =", this.config.get("FRONTEND_URL"));

    const link = `${front}/verify?token=${token}&email=${email}`;

    await this.transporter.sendMail({
      from: this.config.get('SMTP_USER'),
      to: email,
      subject: 'Magic Link',
      html: `<a href="${link}">Login</a>`,
    });
  }
}