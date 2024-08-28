import TelegramBot from "node-telegram-bot-api";

export default function(msg: TelegramBot.Message): 'message' | 'image' | 'voice' | '' {
    if(msg.text) return 'message';
    if(msg.photo?.length) return 'image';
    if(msg.voice) return 'voice';
    return '';

}