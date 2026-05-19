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
    async sendMagicLinkEmail(email, token) {
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
};
exports.MailService = MailService;
exports.MailService = MailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MailService);
