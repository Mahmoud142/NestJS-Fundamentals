import {
    ConflictException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { Model, Types } from 'mongoose';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
export interface SignupResponse {
    status: 'success' | 'error';
    message: string;
    data: {
        user: {
            _id: Types.ObjectId;
            email: string;
            role: string;
            profilePicUrl?: string;
        };
    };
}
export interface LoginResponse {
    status: 'success' | 'error';
    message: string;
    data: {
        user: {
            _id: Types.ObjectId;
            email: string;
            role: string;
            profilePicUrl?: string;
        };
        token: string;
    };
}
export interface JwtPayload {
    sub: Types.ObjectId;
    email: string;
    role: string;
}
@Injectable()
export class AuthService {
    [x: string]: any;
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        private jwtService: JwtService,
    ) {}

    async signup(signupDto: SignupDto): Promise<SignupResponse> {
        const { email, password, phone, profilePicUrl } = signupDto;

        //1- Check if the user already exists
        const existingUser: UserDocument | null = await this.userModel
            .findOne({ email })
            .exec();
        if (existingUser) {
            throw new ConflictException('Email is already registered');
        }

        // 2. Hash the password before saving
        const saltRounds: number = 10;
        const hashedPassword: string = await bcrypt.hash(password, saltRounds);
        const safeProfilePicUrl: string | undefined =
            typeof profilePicUrl === 'string' ? profilePicUrl : undefined;

        // 3. Create and save the new user
        const newUser: UserDocument = new this.userModel({
            email,
            password: hashedPassword,
            phone,
            profilePicUrl: safeProfilePicUrl,
        });
        const savedUser: UserDocument = await newUser.save();

        return {
            status: 'success',
            message: 'User registered successfully',
            data: {
                user: {
                    _id: savedUser._id,
                    email: savedUser.email,
                    role: savedUser.role,
                    profilePicUrl: savedUser.profilePicUrl,
                },
            },
        };
    }

    async login(loginDto: LoginDto): Promise<LoginResponse> {
        const { email, password } = loginDto;
        // 1. Find the user by email
        const user: UserDocument | null = await this.userModel
            .findOne({ email })
            .exec();
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // 2. Compare passwords
        const isPasswordValid: boolean = await bcrypt.compare(
            password,
            user.password,
        );
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // 3. Generate JWT Payload and Sign Token
        const payload: JwtPayload = {
            sub: user._id,
            email: user.email,
            role: user.role,
        };
        const accessToken: string = this.jwtService.sign(payload);

        return {
            status: 'success',
            message: 'Login successful',
            data: {
                user: {
                    _id: user._id,
                    email: user.email,
                    role: user.role,
                    profilePicUrl: user.profilePicUrl,
                },
                token: accessToken,
            },
        };
    }
}
