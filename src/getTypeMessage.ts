import TelegramBot from "node-telegram-bot-api";

export default function(msg: TelegramBot.Message): 'message' | 'image' | 'audio' | '' {
    if(msg.text) return 'message';
    if(msg.photo?.length) return 'image';

    return '';

}