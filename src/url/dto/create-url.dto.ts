import { IsNotEmpty, IsUrl, IsOptional, IsDateString } from 'class-validator';

export class CreateUrlDto {
    @IsNotEmpty()
    @IsUrl()
    originalUrl: string;

    @IsOptional()
    @IsDateString()
    expiresAt?: Date;
}
