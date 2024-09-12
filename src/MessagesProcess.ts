import TelegramBot from "node-telegram-bot-api";
import OpenAI from "openai";
import GPTCache from "./GPTCache";

const gptCache = new GPTCache();

function modelFunctions(): OpenAI.ChatCompletionCreateParams.Function[] {
    return [
        {
            name: 'generate_image',
            description: 'Сгенерируй картинку',
            parameters: {
                type: 'object',
                properties: {
                    prompt: {
                        type: 'string',
                        description: "Параметры для генерации картинки",
                    }
                },
            },
        }
    ]
}
async function generateImage(message: OpenAI.ChatCompletion.Choice['message'], userMsg: TelegramBot.Message, bot: TelegramBot, client: OpenAI): Promise<void> {
    try {
        const interval = setInterval(() => {
            bot.sendChatAction(userMsg.chat.id, 'upload_photo');
        }, 500);
        const data = await client.images.generate({
            prompt: message.function_call.arguments,
            model: 'dall-e-3',
            response_format: 'url',
            quality: 'standard',
            size: '1024x1024',
        });
        const url = data.data[0].url;
        gptCache.addMessage(userMsg.chat.id, { role: 'assistant', content: url })
        clearInterval(interval);
        bot.sendChatAction(userMsg.chat.id, 'upload_photo');
        bot.sendPhoto(userMsg.chat.id, url);
    } catch (error) {
        console.log(error);
        bot.sendMessage(userMsg.chat.id, 'Превышен лимит');
    }
}

function generateText(message: OpenAI.ChatCompletion.Choice['message'], userMsg: TelegramBot.Message, bot: TelegramBot, client: OpenAI): void {
    if(message?.content) {
        
        gptCache.addMessage(userMsg.chat.id, { role: 'assistant', content: message.content })
        bot.sendMessage( userMsg.chat.id, message.content);
    } else {
        bot.sendMessage( userMsg.chat.id, 'Генерация текста - Подвиссссс.....');
    }
}

function generateAnswer(message: OpenAI.ChatCompletion.Choice['message'], userMsg: TelegramBot.Message, bot: TelegramBot, client: OpenAI) {
    if(message?.function_call?.name === 'generate_image') {
        generateImage(message, userMsg, bot, client);
    } else {
        generateText(message, userMsg, bot, client);
    }
}



export default async function MessageProcess(msg: TelegramBot.Message, bot: TelegramBot, client: OpenAI) {

    const chatId = msg.chat.id;
    gptCache.addMessage(chatId, { role: 'user', content: msg.text });

    bot.sendChatAction(chatId, 'typing');
    const chatCompletion = await client.chat.completions.create({
        messages: gptCache.getMessages(chatId),
        model: 'gpt-4o-mini-2024-07-18',
        functions: modelFunctions(),
    });
    generateAnswer(chatCompletion.choices[0].message, msg, bot, client);

}