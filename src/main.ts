import { NestFactory } from '@nestjs/core';
import OpenAI from 'openai';
import * as TelegramBot from 'node-telegram-bot-api';
import { AppModule } from './app.module';

async function bootstrap() {

    const client = new OpenAI({
        apiKey: process.env.OPEN_AI_KEY,
    });
    const bot = new TelegramBot(process.env.BOT_TOKEN, {polling: true});
    let messages = [];
    let lateDate = new Date();
    const app = await NestFactory.create(AppModule);
    await app.listen(3010);

    bot.on('message', async (msg) => {

        if(msg.from.username.includes('belletoille')) {
            console.log(msg.from.username );

            const messageDate = new Date();
    
            const differenceInMilliseconds = Math.abs(messageDate.getTime() - lateDate.getTime());
            const differenceInHours = differenceInMilliseconds / (1000 * 60 * 60);
    
            if (differenceInHours === 1) {
                lateDate = new Date();
                messages = [];
            }
            const chatId = msg.chat.id;
            messages.push({ role: 'user', content: msg.text });
    
            bot.sendChatAction(chatId, 'typing')
            const chatCompletion = await client.chat.completions.create({
                messages: messages,
                model: 'gpt-4o',
            });
    
            messages.push({ role: 'assistant', content: chatCompletion.choices[0].message.content });
            await bot.sendMessage(chatId, chatCompletion.choices[0].message.content);
        }
    });
}
bootstrap();
