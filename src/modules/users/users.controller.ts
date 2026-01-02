import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from './decorators/roles.decorator';
import { RolesGuard } from './guards/roles.guard';
import { AuthenticatedRequest } from './constants/users.constant';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('create')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async createUser(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get('me')
  async getMe(@Req() req: AuthenticatedRequest) {
    return this.usersService.getMe(req.user.userId);
  }

  @Patch('me')
  async updateProfile(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(req.user.userId, dto);
  }

  @Patch('me/password')
  async changePassword(
    @Req() req: AuthenticatedRequest,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(req.user.userId, dto);
  }

  @Get()
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async getAllUsers() {
    return this.usersService.getAllUser();
  }

  @Get(':id')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async getByUserId(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getUserById(id);
  }
}
