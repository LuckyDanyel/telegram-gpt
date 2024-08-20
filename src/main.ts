import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.enableCors({
        origin: ['https://test-luckydanyel.ru'],
    });
    app.use(cookieParser());
    await app.listen(3002);
}
bootstrap();
