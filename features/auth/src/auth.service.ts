
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

  async sendMagicLink(email: string) {
    const token = randomUUID();

    let user =
      await this.prisma.user.findUnique({
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

        magicLinkExpires:
          new Date(
            Date.now() +
            10 * 60 * 1000,
          ),
      },
    });

    await this.mailService
      .sendMagicLinkEmail(
        email,
        token,
      );

    return {
      message: 'Magic link sent',
    };
  }


  async verifyMagicLink(
    email: string,
    token: string,
  ) {
    const user =
      await this.prisma.user.findUnique({
        where: { email },
      });

    if (!user) {
      throw new BadRequestException(
        'User not found',
      );
    }

    console.log(
      'DB TOKEN =',
      user.magicLinkToken,
    );

    console.log(
      'INPUT TOKEN =',
      token,
    );

    // ✔ check token
    if (
      user.magicLinkToken?.trim() !==
      token.trim()
    ) {
      throw new BadRequestException(
        'Invalid token',
      );
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

    const member =
      await this.prisma.organizationMember.findFirst(
        {
          where: {
            userId: user.id,
          },
        },
      );

    const role =
      member?.role || 'MEMBER';

    const accessToken =
      this.jwtService.sign({
        sub: user.id,

        email: user.email,

        role,
      });

    return {
      accessToken,
      role,
    };
  }
}
