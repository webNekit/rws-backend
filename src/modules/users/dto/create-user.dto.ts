import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail({}, { message: 'Некорректный email' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Пароль должен быть не менее 6 символов' })
  password: string;

  @IsString()
  @IsOptional()
  roleName?: 'USER' | 'ADMIN';
}
