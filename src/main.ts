import { NestFactory } from '@nestjs/core';
import OpenAI from 'openai';
import * as TelegramBot from 'node-telegram-bot-api';
import getTypeMessage from './getTypeMessage';
import MessageProcess from './MessagesProcess';
import ImagesProcess from './ImagesProcess';
import { AppModule } from './app.module';

async function bootstrap() {
    try {
        const client = new OpenAI({
            apiKey: process.env.OPEN_AI_KEY,
            maxRetries: 2,
        });
        const bot = new TelegramBot(process.env.BOT_TOKEN, {polling: true});
        const app = await NestFactory.create(AppModule);
        await app.listen(3010);
    
        bot.on('message', async (msg) => {
            if(msg.from.username.includes('belletoille')) {
                if(getTypeMessage(msg) === 'message') MessageProcess(msg, bot, client);
                if(getTypeMessage(msg) === 'image') ImagesProcess(msg, bot, client);
            }
        });        
    } catch (error) {
        console.log('erorr');
        // console.log(error);
    }

}
bootstrap();
