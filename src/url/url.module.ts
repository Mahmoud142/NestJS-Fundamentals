import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UrlController } from './url.controller';
import { UrlService } from './url.service';
import { Url, UrlSchema } from './schemas/url.schema';
import { ClickEvent, ClickEventSchema } from './schemas/click-event.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Url.name, schema: UrlSchema },
            { name: ClickEvent.name, schema: ClickEventSchema },
        ]),
    ],
    controllers: [UrlController],
    providers: [UrlService],
    exports: [UrlService],
})
export class UrlModule {}
