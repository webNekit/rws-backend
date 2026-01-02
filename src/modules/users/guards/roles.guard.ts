import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly prismaService: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.userId) {
      return false;
    }

    const dbUser = await this.prismaService.user.findUnique({
      where: { id: user.userId },
      select: { role: { select: { name: true } } },
    });

    if (!dbUser || !dbUser.role) {
      return false;
    }

    return requiredRoles.includes(dbUser.role.name);
  }
}
