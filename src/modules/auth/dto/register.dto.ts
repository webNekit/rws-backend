import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
    @IsNotEmpty({ message: 'Поле name является обязательным' })
    @IsString({ message: 'Поле password должно являться строкой' })
    name: string;

    @IsNotEmpty({ message: 'Поле email явялется обязательным' })
    @IsEmail({}, { message: 'Введите корректный email адрес' })
    email: string;

    @IsNotEmpty({ message: 'Поле password является обязательным' })
    @IsString({ message: 'Поле password должно являться строкой' })
    @MinLength(6, { message: 'Минимальная длина поля password 6 символов' })
    password: string;
}