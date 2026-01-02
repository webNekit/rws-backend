import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Некорректный email' })
  email?: string;

  // Роль можно изменить — принимаем имя роли
  @IsOptional()
  @IsString()
  roleName?: 'USER' | 'ADMIN';
}
