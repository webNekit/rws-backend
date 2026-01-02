import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RegisterDto } from './dto/register.dto';
import * as argon2 from 'argon2';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';
import { COOKIE_NAMES, COOKIE_OPTIONS_BASE } from './constants/cookie.constants';

@Injectable()
export class AuthService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
    ) {}

    async register(dto: RegisterDto) {
        const existingUser = await this.prismaService.user.findUnique({
            where: { email: dto.email },
        });

        if (existingUser) { throw new BadRequestException('Пользователь с таким email уже существует'); }

        const userRole = await this.prismaService.role.findUnique({
            where: { name: 'USER' },
        });

        if (!userRole) {
            throw new BadRequestException('Роль USER не существует');
        }

        const user = await this.prismaService.user.create({
            data: {
                name: dto.name,
                email: dto.email,
                password: await argon2.hash(dto.password),
                role: { connect: { id: userRole.id } },
            },
        });

        return { userId: user.id };
    }

    async logaut(userId: number, res: Response) {
        await this.prismaService.user.update({
            where: { id: userId },
            data: { refreshToken: null },
        });

        this.clearTokensFromCookies(res);
        return { message: 'Успешный выход' };
    }

    async login(dto: LoginDto, res: Response) {
        const user = await this.prismaService.user.findUnique({
            where: { email: dto.email },
            include: { role: true },
        });

        if (!user || !(await argon2.verify(user.password, dto.password))) {
            throw new UnauthorizedException('Неверный email и/или пароль');
        }

        const { accessToken, refreshToken } = await this.generateTokens(user.id);

        await this.prismaService.user.update({
            where: { id: user.id },
            data: { refreshToken: await argon2.hash(refreshToken) },
        });

        this.setTokensToCookies(res, accessToken, refreshToken);
        return { message: 'Успешный вход' } as const;
    }

    async refresh(refreshToken: string, res: Response) {
        if (!refreshToken) {
            throw new UnauthorizedException('Refresh-токен отсутствует!');
        }

        let userId: number;

        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
            });
            userId = payload.sub;
        } catch {
            throw new UnauthorizedException('Невалидный refresh-токен');
        }

        const user = await this.prismaService.user.findUnique({
            where: { id: userId },
        });

        if (!user || !user.refreshToken) {
            throw new UnauthorizedException('Пользователь не найден и/или токен отозван');
        }

        const isValid = await argon2.verify(user.refreshToken, refreshToken);
        if (!isValid) {
            throw new UnauthorizedException('Невалидный refresh-токен');
        }

        const { accessToken, refreshToken: newRefreshToken } = await this.generateTokens(user.id);

        await this.prismaService.user.update({
            where: { id: user.id },
            data: { refreshToken: await argon2.hash(newRefreshToken) },
        });

        this.setTokensToCookies(res, accessToken, newRefreshToken);
        return { message: 'Токены обновлены' };
    }

    private async generateTokens(userId: number) {
        const accessToken = this.jwtService.sign(
            { sub: userId },
            {
                secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
                expiresIn: this.configService.getOrThrow<string>('JWT_ACCESS_EXPIRES_IN') as any,
            });
        const refreshToken = this.jwtService.sign(
            { sub: userId },
            {
                secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
                expiresIn: this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRES_IN') as any,
            });

         return { accessToken, refreshToken };
    }

    private setTokensToCookies(res: Response, access: string, refresh: string) {
        const secure = this.configService.getOrThrow<boolean>('COOKIE_SECURE');
        const sameSite = this.configService.get<'lax' | 'strict' | 'none'>('COOKIE_SAME_SITE');

        const accessCookieOptions = {
            ...COOKIE_OPTIONS_BASE,
            secure,
            sameSite,
            maxAge: 15 * 60 * 1000, // 15 минут
        };
    
        const refreshCookieOptions = {
            ...COOKIE_OPTIONS_BASE,
            secure,
            sameSite,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней
        };
    
        res.cookie(COOKIE_NAMES.ACCESS_TOKEN, access, accessCookieOptions);
        res.cookie(COOKIE_NAMES.REFRESH_TOKEN, refresh, refreshCookieOptions);
    }

    private clearTokensFromCookies(res: Response) {
        res.clearCookie(COOKIE_NAMES.ACCESS_TOKEN, COOKIE_OPTIONS_BASE);
        res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN, COOKIE_OPTIONS_BASE);
    } 
}
