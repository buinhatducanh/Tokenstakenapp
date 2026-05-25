// import { Module } from '@nestjs/common';
// import { AuthController } from './auth.controller';
// import { AuthService } from './auth.service';
// import { JwtModule } from '@nestjs/jwt';
// import { PassportModule } from '@nestjs/passport';
// import { JwtStrategy } from './strategies/jwt.strategy';
// import { PrismaService } from '@tokens-taken/db';
// import { MailService } from './utils/mail.service';
// import { ConfigModule } from '@nestjs/config'; // 👈 THÊM

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
import { Module } from '@nestjs/common';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { JwtStrategy } from './strategies/jwt.strategy';

import { PrismaService } from '@tokens-taken/db';

import { MailService } from './utils/mail.service';

import { ConfigModule } from '@nestjs/config';

import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [
    ConfigModule,

    PassportModule,

    JwtModule.register({
      secret:
        process.env.JWT_SECRET || 'secret',

      signOptions: {
        expiresIn: '1d',
      },
    }),
  ],

  controllers: [AuthController],

  providers: [
    AuthService,
    JwtStrategy,
    PrismaService,
    MailService,
    RolesGuard,
  ],

  exports: [JwtModule],
})
export class AuthModule {}