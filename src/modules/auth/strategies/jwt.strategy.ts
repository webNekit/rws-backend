import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { COOKIE_NAMES } from "../constants/cookie.constants";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly configService: ConfigService) {
        super({
           jwtFromRequest: ExtractJwt.fromExtractors([
            (request: Request) => {
                return request?.cookies?.[COOKIE_NAMES.ACCESS_TOKEN] || null;
            },
           ]),
           ignoreExpiration: true,
           secretOrKey: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        });
    }

    async validate(payload: { sub: number }) {
        return { userId: payload.sub };
    }
}