import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../user/schemas/user.schema';

export type UrlDocument = Url & Document;

@Schema({ timestamps: true })
export class Url {
    @Prop({ required: true })
    originalUrl: string;

    @Prop({ required: true, unique: true, index: true })
    shortCode: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: false })
    userId?: User;

    @Prop({ default: 0 })
    totalClicks: number;

    @Prop({ type: Date, required: false })
    expiresAt?: Date;

    @Prop({ default: true })
    isActive: boolean;
}

export const UrlSchema = SchemaFactory.createForClass(Url);
