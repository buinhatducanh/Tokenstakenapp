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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const crypto_1 = require("crypto");
const db_1 = require("@tokens-taken/db");
const mail_service_1 = require("./utils/mail.service");
let AuthService = class AuthService {
    constructor(prisma, jwtService, mailService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.mailService = mailService;
    }
    async sendMagicLink(email) {
        const token = (0, crypto_1.randomUUID)();
        let user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            user =
                await this.prisma.user.create({
                    data: { email },
                });
        }
        await this.prisma.user.update({
            where: { email },
            data: {
                magicLinkToken: token,
                magicLinkExpires: new Date(Date.now() +
                    10 * 60 * 1000),
            },
        });
        await this.mailService
            .sendMagicLinkEmail(email, token);
        return {
            message: 'Magic link sent',
        };
    }
    async verifyMagicLink(email, token) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            throw new common_1.BadRequestException('User not found');
        }
        console.log('DB TOKEN =', user.magicLinkToken);
        console.log('INPUT TOKEN =', token);
        // ✔ check token
        if (user.magicLinkToken?.trim() !==
            token.trim()) {
            throw new common_1.BadRequestException('Invalid token');
        }
        // ✔ check expired
        // if (
        //   !user.magicLinkExpires ||
        //   user.magicLinkExpires <
        //   new Date()
        // ) {
        //   throw new BadRequestException(
        //     'Token expired',
        //   );
        // }
        const member = await this.prisma.organizationMember.findFirst({
            where: {
                userId: user.id,
            },
        });
        const role = member?.role || 'MEMBER';
        const accessToken = this.jwtService.sign({
            sub: user.id,
            email: user.email,
            role,
        });
        return {
            accessToken,
            role,
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
