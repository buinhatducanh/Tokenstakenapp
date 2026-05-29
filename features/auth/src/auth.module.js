"use strict";
// import { Module } from '@nestjs/common';
// import { AuthController } from './auth.controller';
// import { AuthService } from './auth.service';
// import { JwtModule } from '@nestjs/jwt';
// import { PassportModule } from '@nestjs/passport';
// import { JwtStrategy } from './strategies/jwt.strategy';
// import { PrismaService } from '@tokens-taken/db';
// import { MailService } from './utils/mail.service';
// import { ConfigModule } from '@nestjs/config'; // 👈 THÊM
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
// @Module({
//   imports: [
//     ConfigModule, // 👈 THÊM CÁI NÀY
//     PassportModule,
//     JwtModule.register({
//       secret: process.env.JWT_SECRET || 'secret',
//       signOptions: { expiresIn: '1d' },
//     }),
//   ],
//   controllers: [AuthController],
//   providers: [
//     AuthService,
//     JwtStrategy,
//     PrismaService,
//     MailService,
//   ],
// })
// export class AuthModule {}
const common_1 = require("@nestjs/common");
const auth_controller_1 = require("./auth.controller");
const auth_service_1 = require("./auth.service");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const jwt_strategy_1 = require("./strategies/jwt.strategy");
const db_1 = require("../../../packages/db/src");
const mail_service_1 = require("./utils/mail.service");
const config_1 = require("@nestjs/config");
const roles_guard_1 = require("./guards/roles.guard");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            passport_1.PassportModule,
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET || 'secret',
                signOptions: {
                    expiresIn: '1d',
                },
            }),
        ],
        controllers: [auth_controller_1.AuthController],
        providers: [
            auth_service_1.AuthService,
            jwt_strategy_1.JwtStrategy,
            db_1.PrismaService,
            mail_service_1.MailService,
            roles_guard_1.RolesGuard,
        ],
        exports: [jwt_1.JwtModule],
    })
], AuthModule);
