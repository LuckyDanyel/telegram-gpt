import TelegramBot from "node-telegram-bot-api";
import OpenAI from "openai";

let messages = [];
let lateDate = new Date();

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
            size: '1024x1024',
        });
        clearInterval(interval);
        bot.sendChatAction(userMsg.chat.id, 'upload_photo');
        const url = data.data[0].url;
        bot.sendPhoto(userMsg.chat.id, url);
    } catch (error) {
        console.log(error);
        bot.sendMessage(userMsg.chat.id, 'Превышен лимит');
    }
}

function generateText(message: OpenAI.ChatCompletion.Choice['message'], userMsg: TelegramBot.Message, bot: TelegramBot, client: OpenAI): void {
    if(message?.content) {
        messages.push({ role: 'assistant', content: message.content });
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

    const messageDate = new Date();
        
    const differenceInMilliseconds = Math.abs(messageDate.getTime() - lateDate.getTime());
    const differenceInHours = differenceInMilliseconds / (1000 * 60 * 60);

    if (differenceInHours === 1) {
        lateDate = new Date();
        messages = [];
    }
    const chatId = msg.chat.id;
    messages.push({ role: 'user', content: msg.text });

    await bot.sendChatAction(chatId, 'typing');
    const chatCompletion = await client.chat.completions.create({
        messages: messages,
        model: 'gpt-4o',
        functions: modelFunctions(),
    });
    generateAnswer(chatCompletion.choices[0].message, msg, bot, client);

}