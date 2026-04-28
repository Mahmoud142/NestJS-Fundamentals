import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    // Enable Global validation pipe
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true, // Strips out properties that don't have decorators
            forbidNonWhitelisted: true, // Throws an error if extra properties are sent
            transform: true, // Automatically transforms payloads to be objects typed according to their DTO classes
        }),
    );
    await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((err) => {
    console.error(err);
    process.exit(1);
});
