import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  @IsEmail({}, { message: 'Введите корректный email адрес' })
  email?: string;
}
