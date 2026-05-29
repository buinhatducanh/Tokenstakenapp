"use strict";
// import {
//   Body,
//   Controller,
//   Post,
//   Res,
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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
// import { Response } from 'express';
// import { AuthService }
//   from './auth.service';
// @Controller('auth')
// export class AuthController {
//   constructor(
//     private readonly authService:
//       AuthService,
//   ) { }
//   @Post('magic-link')
//   async sendMagicLink(
//     @Body('email') email: string,
//   ) {
//     return this.authService
//       .sendMagicLink(email);
//   }
//   @Post('verify')
//   async verifyMagicLink(
//     @Body()
//     body: {
//       email: string;
//       token: string;
//     },
//     @Res({ passthrough: true })
//     res: Response,
//   ) {
//     const result =
//       await this.authService
//         .verifyMagicLink(
//           body.email,
//           body.token,
//         );
//     res.cookie(
//       'token',
//       result.accessToken,
//       {
//         httpOnly: true,
//         secure: false,
//         sameSite: 'lax',
//         // maxAge:
//         //   7 *
//         //   24 *
//         //   60 *
//         //   60 *
//         //   1000,
//         maxAge: 24 * 60 * 60 * 1000,
//       },
//     );
//     res.cookie(
//       'role',
//       result.role,
//       {
//         httpOnly: false,
//         secure: false,
//         sameSite: 'lax',
//         maxAge:
//           7 *
//           24 *
//           60 *
//           60 *
//           1000,
//       },
//     );
//     res.cookie('userId', result.userId, {
//       httpOnly: false,
//       secure: false,
//       sameSite: 'lax',
//       maxAge: 24 * 60 * 60 * 1000,
//     });
//     //   return {
//     //     success: true,
//     //     role: result.role,
//     //   };
//     // }
//     return {
//       accessToken: result.accessToken,
//       role: result.role,
//     };
//   }
//   @Post('logout')
//   logout(@Res({ passthrough: true }) res: Response) {
//     res.clearCookie('token', {
//       httpOnly: true,
//       sameSite: 'lax',
//       secure: false,
//       path: '/', // 👈 QUAN TRỌNG
//     });
//     return {
//       success: true,
//     };
//   }
// }
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    // ==========================================
    // SEND MAGIC LINK
    // ==========================================
    async sendMagicLink(email) {
        const result = await this.authService.sendMagicLink(email);
        return result;
    }
    // ==========================================
    // VERIFY MAGIC LINK
    // ==========================================
    async verifyMagicLink(body, res) {
        const result = await this.authService.verifyMagicLink(body.email, body.token);
        // COOKIE TOKEN
        res.cookie('token', result.accessToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000,
        });
        // COOKIE ROLE
        res.cookie('role', result.role, {
            httpOnly: false,
            secure: false,
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000,
        });
        // COOKIE USER ID
        res.cookie('userId', result.userId, {
            httpOnly: false,
            secure: false,
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000,
        });
        return {
            accessToken: result.accessToken,
            role: result.role,
            userId: result.userId,
        };
    }
    // ==========================================
    // LOGOUT
    // ==========================================
    logout(res) {
        res.clearCookie('token', {
            httpOnly: true,
            sameSite: 'lax',
            secure: false,
            path: '/',
        });
        return {
            success: true,
        };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('magic-link'),
    __param(0, (0, common_1.Body)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "sendMagicLink", null);
__decorate([
    (0, common_1.Post)('verify'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyMagicLink", null);
__decorate([
    (0, common_1.Post)('logout'),
    __param(0, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "logout", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
