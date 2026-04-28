import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
@Module({
    imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                // Explicitly define type and enforce strict checking
                const jwtSecret: string | undefined =
                    configService.get<string>('JWT_SECRET');

                const jwtExpiration: string | undefined =
                    configService.get<string>('JWT_EXPIRATION');
                if (!jwtSecret) {
                    throw new Error(
                        'CRITICAL ERROR: JWT_SECRET is not defined in your .env file!',
                    );
                }
                if (!jwtExpiration) {
                    throw new Error(
                        'CRITICAL ERROR: JWT_EXPIRATION is not defined in your .env file!',
                    );
                }

                return {
                    secret: jwtSecret,
                    signOptions: {
                        expiresIn: jwtExpiration,
                    },
                } as import('@nestjs/jwt').JwtModuleOptions;
            },
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService],
})
export class AuthModule {}
