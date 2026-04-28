import {
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';

export class SignupDto {
    @IsNotEmpty({ message: 'Email cannot be empty' })
    @IsEmail({}, { message: 'Invalid email format' })
    email!: string;

    @IsNotEmpty({ message: 'Password cannot be empty' })
    @IsString({ message: 'Password must be a string' })
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    @MaxLength(32, { message: 'Password must be at most 32 characters long' })
    password!: string;

    @IsNotEmpty({ message: 'Phone cannot be empty' })
    @MinLength(10, { message: 'Phone must be at least 10 characters long' })
    @MaxLength(15, { message: 'Phone must be at most 15 characters long' })
    phone!: string;

    @IsOptional()
    profilePicUrl?: string; // Optional, defaults to undefined if not provided
}
