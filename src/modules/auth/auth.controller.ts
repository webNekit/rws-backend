import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { AuthenticatedRequest } from './constants/auth.constants';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.login(dto, res);
  }

  @Get('logout')
  @UseGuards(AuthGuard('jwt'))
  async logout(@Req() req: AuthenticatedRequest, @Res({ passthrough: true }) res: Response) {
    const userId = req.user.userId;
    return this.authService.logaut(userId, res);
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response ) {
    const refreshToken = req.cookies?.refresh_token || null;
    return this.authService.refresh(refreshToken, res);
  }
}
