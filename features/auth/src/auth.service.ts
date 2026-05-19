
// import {
//   Injectable,
//   BadRequestException,
// } from '@nestjs/common';

// import { JwtService } from '@nestjs/jwt';

// import { randomUUID } from 'crypto';

// import { PrismaService } from '@tokens-taken/db';

// import { MailService } from './utils/mail.service';

// @Injectable()
// export class AuthService {
//   constructor(
//     private prisma: PrismaService,

//     private mailService: MailService,

//     private jwtService: JwtService,
//   ) {}

//   async sendMagicLink(email: string) {
//     const token = randomUUID();

//     let user = await this.prisma.user.findUnique({
//       where: { email },
//     });

//     if (!user) {
//       user = await this.prisma.user.create({
//         data: { email },
//       });
//     }

//     await this.prisma.user.update({
//       where: { email },

//       data: {
//         magicLinkToken: token,

//         magicLinkExpires: new Date(
//           Date.now() + 10 * 60 * 1000,
//         ),
//       },
//     });

//     await this.mailService.sendMagicLinkEmail(
//       email,
//       token,
//     );

//     return {
//       message: 'Magic link sent',
//     };
//   }

//   async verifyMagicLink(
//     email: string,
//     token: string,
//   ) {
//     const user = await this.prisma.user.findUnique({
//       where: { email },
//     });

//     if (!user) {
//       throw new BadRequestException(
//         'User not found',
//       );
//     }

//     if (user.magicLinkToken !== token) {
//       throw new BadRequestException(
//         'Invalid token',
//       );
//     }

//     const member =
//       await this.prisma.organizationMember.findFirst(
//         {
//           where: {
//             userId: user.id,
//           },
//         },
//       );

//     const payload = {
//       sub: user.id,

//       email: user.email,

//       role: member?.role,
//     };

//     const accessToken =
//       await this.jwtService.signAsync(payload);

//     return {
//       accessToken,

//       user: {
//         id: user.id,

//         email: user.email,

//         role: member?.role,
//       },
//     };
//   }
// }
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

    if (
      user.magicLinkToken !== token
    ) {
      throw new BadRequestException(
        'Invalid token',
      );
    }

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