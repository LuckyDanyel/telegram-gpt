import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.enableCors({
        origin: ['http://127.0.0.1:5173'],
    });
    app.use(cookieParser());
    await app.listen(3002);
}
bootstrap();
