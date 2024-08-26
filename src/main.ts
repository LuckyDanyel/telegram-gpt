import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const allowsDomains = JSON.parse(process.env.ALLOWS_DOMAINS);
    app.enableCors({
        origin: allowsDomains,
        credentials: true,
        allowedHeaders: ['Content-type', 'Accept-language'],
        maxAge: 31536000,
        methods: ['GET', 'POST'],
    });
    app.use(cookieParser());
    await app.listen(3002);
}
bootstrap();
