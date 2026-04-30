import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from './auth.service';
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        const secret = process.env.JWT_SECRET;
        const expiresIn = process.env.JWT_EXPIRES_IN;

        if (!secret || !expiresIn) {
            throw new Error('JWT_SECRET or JWT_EXPIRES_IN is not set');
        }

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secret,
            jsonWebTokenOptions: { maxAge: expiresIn },
        });
    }

    validate(payload: JwtPayload) {
        return { userId: payload.sub, email: payload.email };
    }
}
