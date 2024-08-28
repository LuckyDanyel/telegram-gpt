import TelegramBot from "node-telegram-bot-api";
import OpenAI from "openai";



export default async function MessageProcess(msg: TelegramBot.Message, bot: TelegramBot, client: OpenAI) {

    const photo = msg.photo[msg.photo.length - 1];
    const caption = msg.caption;
    const path = await bot.getFileLink(photo.file_id)
    const chatId = msg.chat.id;
    bot.sendChatAction(chatId, 'typing');
    const chatCompletion = await client.chat.completions.create({
        messages: [{
            role: 'user',
            content: [
                {
                    type: 'image_url',
                    image_url: {
                        url: path,
                        detail: 'auto',
                    }
                },
                {
                    type: 'text',
                    text: caption || '',
                }
            ]
        }],
        model: 'gpt-4o',
    });

    if(chatCompletion.choices[0]?.message?.content) {
        bot.sendMessage(chatId, chatCompletion.choices[0]?.message?.content);
    } else {
        bot.sendMessage(chatId, 'Ошибка загрузки картинки - Подвиссссс.....');
    }

}