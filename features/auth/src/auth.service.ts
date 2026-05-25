

import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';

import { JwtService }
  from '@nestjs/jwt';

import { randomUUID }
  from 'crypto';

import { PrismaService }
  from '@tokens-taken/db';

import { MailService }
  from './utils/mail.service';

@Injectable()
export class AuthService {

  constructor(
    private prisma: PrismaService,

    private jwtService: JwtService,

    private mailService: MailService,
  ) { }

  // ==================================================
  // GỬI MAGIC TOKEN
  // ==================================================

  async sendMagicLink(email: string) {

    // ==========================================
    // Tạo token random
    // ==========================================

    const token = randomUUID();

    // ==========================================
    // Tìm user theo email
    // ==========================================

    let user =
      await this.prisma.user.findUnique({
        where: { email },
      });

    // ==========================================
    // Nếu chưa có user
    // → tự tạo tài khoản mới
    // ==========================================

    if (!user) {
      user =
        await this.prisma.user.create({
          data: {

            email,

            // số lần nhập sai token
            failedAttempts: 0,
          },
        });
    }

    // ==========================================
    // Gửi token mới
    //
    // Token cũ sẽ tự mất hiệu lực
    // vì bị ghi đè token mới
    // ==========================================

    await this.prisma.user.update({
      where: { email },

      data: {

        // token mới
        magicLinkToken: token,

        // hết hạn sau 10 phút
        magicLinkExpires:
          new Date(
            Date.now() +
            1 * 60 * 1000,
          ),

        // reset số lần nhập sai
        failedAttempts: 0,
      },
    });

    // ==========================================
    // Gửi email
    // ==========================================

    await this.mailService
      .sendMagicLinkEmail(
        email,
        token,
      );

    return {
      message: 'Magic link sent',
    };
  }

  // ==================================================
  // VERIFY TOKEN
  // ==================================================

  // async verifyMagicLink(
  //   email: string,
  //   token: string,
  // ) {

  //   // ==========================================
  //   // 1. CHECK USER TỒN TẠI
  //   // ==========================================

  //   const user =
  //     await this.prisma.user.findUnique({
  //       where: { email },
  //     });

  //   if (!user) {
  //     throw new BadRequestException(
  //       'User not found',
  //     );
  //   }

  //   // ==========================================
  //   // 2. TOKEN RỖNG / NULL
  //   // ==========================================

  //   if (!token || !token.trim()) {
  //     throw new BadRequestException(
  //       'Token is required',
  //     );
  //   }

  //   // ==========================================
  //   // 3. TOKEN KHÔNG TỒN TẠI DB
  //   // ==========================================

  //   if (!user.magicLinkToken) {
  //     throw new BadRequestException(
  //       'Token not found',
  //     );
  //   }

  //   // ==========================================
  //   // 4. QUÁ SỐ LẦN NHẬP TOKEN
  //   // chống spam/bruteforce
  //   // ==========================================

  //   if (
  //     user.failedAttempts >= 3
  //   ) {
  //     throw new BadRequestException(
  //       'Too many failed attempts'
  //     );
  //   }

  //   // ==========================================
  //   // DEBUG TOKEN
  //   // ==========================================

  //   console.log(
  //     'DB TOKEN =',
  //     user.magicLinkToken,
  //   );

  //   console.log(
  //     'INPUT TOKEN =',
  //     token,
  //   );

  //   // ==========================================
  //   // 5 + 6.
  //   // TOKEN SAI / TOKEN BỊ SỬA
  //   // ==========================================

  //   if (
  //     user.magicLinkToken.trim() !==
  //     token.trim()
  //   ) {

  //     // tăng số lần nhập sai
  //     await this.prisma.user.update({
  //       where: { email },

  //       data: {
  //         failedAttempts: {
  //           increment: 1,
  //         },
  //       },
  //     });

  //     throw new BadRequestException(
  //       'Invalid token',
  //     );
  //   }

  //   // ==========================================
  //   // 7. TOKEN HẾT HẠN
  //   // ==========================================

  //   if (
  //     !user.magicLinkExpires ||

  //     user.magicLinkExpires <
  //     new Date()
  //   ) {
  //     throw new BadRequestException(
  //       'Token expired',
  //     );
  //   }

  //   // ==========================================
  //   // 8. TOKEN KHÔNG ĐÚNG EMAIL
  //   //
  //   // token phải thuộc đúng user
  //   // ==========================================

  //   if (
  //     user.email !== email
  //   ) {
  //     throw new BadRequestException(
  //       'Token does not match email',
  //     );
  //   }

  //   // ==========================================
  //   // TÌM ROLE USER
  //   // ==========================================

  //   const member =
  //     await this.prisma.organizationMember.findFirst(
  //       {
  //         where: {
  //           userId: user.id,
  //         },
  //       },
  //     );

  //   const role =
  //     member?.role || 'MEMBER';

  //   // ==========================================
  //   // TẠO ACCESS TOKEN
  //   // ==========================================

  //   const accessToken =
  //     this.jwtService.sign({

  //       sub: user.id,

  //       email: user.email,

  //       role,
  //     });

  //   // ==========================================
  //   // TOKEN ĐÃ DÙNG RỒI
  //   //
  //   // login xong phải xóa token
  //   // không cho dùng lại
  //   // ==========================================

  //   await this.prisma.user.update({
  //     where: { email },

  //     data: {

  //       // xóa token
  //       magicLinkToken: null,

  //       // xóa thời gian hết hạn
  //       magicLinkExpires: null,

  //       // reset số lần nhập sai
  //       failedAttempts: 0,
  //     },
  //   });

  //   // ==========================================
  //   // LOGIN THÀNH CÔNG
  //   // ==========================================

  //   return {
  //     accessToken,
  //     role,
  //   };
  // }

  async verifyMagicLink(email: string, token: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    console.log("EMAIL:", email);
    console.log("TOKEN:", token);
    console.log("DB:", user?.magicLinkToken);
    console.log("EXPIRES:", user?.magicLinkExpires);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (!token || !token.trim()) {
      throw new BadRequestException('Token is required');
    }

    if (!user.magicLinkToken) {
      throw new BadRequestException('Token not found');
    }

    if (user.failedAttempts >= 3) {
      throw new BadRequestException('Too many failed attempts');
    }

    //  1. CHECK EXPIRE TRƯỚC (chuẩn hơn UX)
    if (!user.magicLinkExpires || user.magicLinkExpires < new Date()) {
      throw new BadRequestException('Token expired');
    }

    //  2. CHECK TOKEN SAU
    if (user.magicLinkToken.trim() !== token.trim()) {
      await this.prisma.user.update({
        where: { email },
        data: {
          failedAttempts: { increment: 1 },
        },
      });

      throw new BadRequestException('Invalid token');
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

    return { accessToken, role };
  }
}