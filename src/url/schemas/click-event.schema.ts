import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Url } from './url.schema';

export type ClickEventDocument = ClickEvent & Document;

@Schema({ timestamps: { createdAt: 'timestamp', updatedAt: false } })
export class ClickEvent {
    @Prop({
        type: MongooseSchema.Types.ObjectId,
        ref: 'Url',
        required: true,
        index: true,
    })
    urlId: Url;

    @Prop()
    ipAddress?: string;

    @Prop()
    userAgent?: string;

    @Prop()
    browser?: string;

    @Prop()
    os?: string;

    @Prop()
    deviceType?: string;

    @Prop()
    referrer?: string;

    @Prop()
    country?: string;

    @Prop()
    city?: string;
}

export const ClickEventSchema = SchemaFactory.createForClass(ClickEvent);
