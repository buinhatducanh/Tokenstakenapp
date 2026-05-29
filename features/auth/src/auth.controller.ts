
// import {
//   Body,
//   Controller,
//   Post,
//   Res,
// } from '@nestjs/common';

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

import {
  Body,
  Controller,
  Post,
  Res,
} from '@nestjs/common';

import { Response } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  // ==========================================
  // SEND MAGIC LINK
  // ==========================================
  @Post('magic-link')
  async sendMagicLink(
    @Body('email') email: string,
  ) {
    const result = await this.authService.sendMagicLink(email);
    return result;
  }

  // ==========================================
  // VERIFY MAGIC LINK
  // ==========================================
  @Post('verify')
  async verifyMagicLink(
    @Body()
    body: {
      email: string;
      token: string;
    },

    @Res({ passthrough: true })
    res: Response,
  ) {
    const result = await this.authService.verifyMagicLink(
      body.email,
      body.token,
    );

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
  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
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
}