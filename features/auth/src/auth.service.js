"use strict";
// import {
//   Injectable,
//   BadRequestException,
// } from '@nestjs/common';
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
exports.AuthService = void 0;
// import { JwtService }
//   from '@nestjs/jwt';
// import { randomUUID }
//   from 'crypto';
// import { PrismaService }
//   from '@tokens-taken/db';
// import { MailService }
//   from './utils/mail.service';
// @Injectable()
// export class AuthService {
//   constructor(
//     private prisma: PrismaService,
//     private jwtService: JwtService,
//     private mailService: MailService,
//   ) { }
//   // ==================================================
//   // GỬI MAGIC TOKEN
//   // ==================================================
//   async sendMagicLink(email: string) {
//     // ==========================================
//     // Tạo token random
//     // ==========================================
//     const token = randomUUID();
//     // ==========================================
//     // Tìm user theo email
//     // ==========================================
//     let user =
//       await this.prisma.user.findUnique({
//         where: { email },
//       });
//     // ==========================================
//     // Nếu chưa có user
//     // → tự tạo tài khoản mới
//     // ==========================================
//     if (!user) {
//       user =
//         await this.prisma.user.create({
//           data: {
//             email,
//             // số lần nhập sai token
//             failedAttempts: 0,
//           },
//         });
//     }
//     // ==========================================
//     // Gửi token mới
//     //
//     // Token cũ sẽ tự mất hiệu lực
//     // vì bị ghi đè token mới
//     // ==========================================
//     await this.prisma.user.update({
//       where: { email },
//       data: {
//         // token mới
//         magicLinkToken: token,
//         // hết hạn sau 10 phút
//         magicLinkExpires:
//           new Date(
//             Date.now() +
//             1 * 60 * 1000,
//           ),
//         // reset số lần nhập sai
//         failedAttempts: 0,
//       },
//     });
//     // ==========================================
//     // Gửi email
//     // ==========================================
//     await this.mailService
//       .sendMagicLinkEmail(
//         email,
//         token,
//       );
//     return {
//       message: 'Magic link sent',
//     };
//   }
//   async verifyMagicLink(email: string, token: string) {
//     const user = await this.prisma.user.findUnique({
//       where: { email },
//     });
//     console.log("EMAIL:", email);
//     console.log("TOKEN:", token);
//     console.log("DB:", user?.magicLinkToken);
//     console.log("EXPIRES:", user?.magicLinkExpires);
//     if (!user) {
//       throw new BadRequestException('User not found');
//     }
//     if (!token || !token.trim()) {
//       throw new BadRequestException('Token is required');
//     }
//     if (!user.magicLinkToken) {
//       throw new BadRequestException('Token not found');
//     }
//     if (user.failedAttempts >= 3) {
//       throw new BadRequestException('Too many failed attempts');
//     }
//     //  1. CHECK EXPIRE TRƯỚC (chuẩn hơn UX)
//     if (!user.magicLinkExpires || user.magicLinkExpires < new Date()) {
//       throw new BadRequestException('Token expired');
//     }
//     //  2. CHECK TOKEN SAU
//     if (user.magicLinkToken.trim() !== token.trim()) {
//       await this.prisma.user.update({
//         where: { email },
//         data: {
//           failedAttempts: { increment: 1 },
//         },
//       });
//       throw new BadRequestException('Invalid token');
//     }
//     const member = await this.prisma.organizationMember.findFirst({
//       where: { userId: user.id },
//     });
//     const role = member?.role || 'MEMBER';
//     const accessToken = this.jwtService.sign({
//       sub: user.id,
//       email: user.email,
//       role,
//     });
//     await this.prisma.user.update({
//       where: { email },
//       data: {
//         magicLinkToken: null,
//         magicLinkExpires: null,
//         failedAttempts: 0,
//       },
//     });
//     return { accessToken, role };
//   }
// }
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const crypto_1 = require("crypto");
const db_1 = require("../../../packages/db/src");
const mail_service_1 = require("./utils/mail.service");
let AuthService = class AuthService {
    constructor(prisma, jwtService, mailService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.mailService = mailService;
    }
    // ==========================================
    // SEND MAGIC LINK
    // ==========================================
    async sendMagicLink(email) {
        const token = (0, crypto_1.randomUUID)();
        let user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    email,
                    failedAttempts: 0,
                },
            });
        }
        await this.prisma.user.update({
            where: { email },
            data: {
                magicLinkToken: token,
                magicLinkExpires: new Date(Date.now() + 1 * 60 * 1000),
                failedAttempts: 0,
            },
        });
        await this.mailService.sendMagicLinkEmail(email, token);
        return {
            message: 'Magic link sent',
        };
    }
    // ==========================================
    // VERIFY MAGIC LINK
    // ==========================================
    async verifyMagicLink(email, token) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            throw new common_1.BadRequestException('User not found');
        }
        if (!token || !token.trim()) {
            throw new common_1.BadRequestException('Token is required');
        }
        if (!user.magicLinkToken) {
            throw new common_1.BadRequestException('Token not found');
        }
        if (user.failedAttempts >= 3) {
            throw new common_1.BadRequestException('Too many failed attempts');
        }
        if (!user.magicLinkExpires || user.magicLinkExpires < new Date()) {
            throw new common_1.BadRequestException('Token expired');
        }
        if (user.magicLinkToken.trim() !== token.trim()) {
            await this.prisma.user.update({
                where: { email },
                data: {
                    failedAttempts: { increment: 1 },
                },
            });
            throw new common_1.BadRequestException('Invalid token');
        }
        const member = await this.prisma.organizationMember.findFirst({
            where: { userId: user.id },
        });
        const role = member?.role || 'MEMBER';
        const accessToken = this.jwtService.sign({
            sub: user.id,
            email: user.email,
            role,
        });
        await this.prisma.user.update({
            where: { email },
            data: {
                magicLinkToken: null,
                magicLinkExpires: null,
                failedAttempts: 0,
            },
        });
        return {
            accessToken,
            role,
            userId: user.id,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [db_1.PrismaService,
        jwt_1.JwtService,
        mail_service_1.MailService])
], AuthService);
