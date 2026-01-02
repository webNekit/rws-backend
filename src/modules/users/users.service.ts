import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async getMe(userId: number) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        role: { select: { name: true } },
      },
    });

    if (!user) throw new NotFoundException('Пользователь не найден');
    return user;
  }

  async create(dto: CreateUserDto) {
    const existing = await this.prismaService.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new BadRequestException(
        'Пользователь с таким email уже существует',
      );
    }

    const roleName = dto.roleName || 'USER';
    const role = await this.prismaService.role.findUnique({
      where: { name: roleName },
    });

    if (!role) throw new BadRequestException(`Роль ${roleName} не найдена`);

    const user = await this.prismaService.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: await argon2.hash(dto.password),
        role: { connect: { id: role.id } },
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    return user;
  }

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    if (dto.email) {
      const existing = await this.prismaService.user.findUnique({
        where: { email: dto.email },
      });
      if (existing && existing.id !== userId)
        throw new BadRequestException('Email уже существует');
    }

    return this.prismaService.user.update({
      where: { id: userId },
      data: {
        name: dto.name,
        email: dto.email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async changePassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!user) throw new NotFoundException('Пользователь не найден');

    const isValid = await argon2.verify(user.password, dto.currentPassword);
    if (!isValid) throw new UnauthorizedException('Неверный текущий пароль');

    await this.prismaService.user.update({
      where: { id: userId },
      data: { password: await argon2.hash(dto.newPassword) },
    });

    return { message: 'Пароль успешно изменен' };
  }

  async getAllUser() {
    return this.prismaService.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        role: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUserById(userId: number) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        role: { select: { name: true } },
      },
    });

    if (!user) throw new NotFoundException('Пользователь не найден');
    return user;
  }
}
