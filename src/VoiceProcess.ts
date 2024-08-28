import * as TelegramBot from 'node-telegram-bot-api';
import * as fs from 'fs';
import OpenAI from 'openai';
import GPTCache from './GPTCache';

const gptCache = new GPTCache();

export default async function(msg: TelegramBot.Message, bot: TelegramBot, client: OpenAI) {
    const name = `${msg.chat.id}_${msg.date}_temp_audio.mp3`;
    const userAudioPath = `./user_${name}`;
    const assistantAudioPath = `./assistant_${name}`;

    try {
        const stream = bot.getFileStream(msg.voice.file_id);
        const writeStream = fs.createWriteStream(userAudioPath);
        stream.pipe(writeStream);
    
        await new Promise((resolve, reject) => {
            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
        });
        const audioFile = fs.createReadStream(userAudioPath);
        const transcriptions = client.audio.transcriptions;
        const speech = client.audio.speech;
        const userData = await transcriptions.create({ file: audioFile, model: 'whisper-1', response_format: 'json', language: 'ru' });
        gptCache.addMessage(msg.chat.id, { role: 'user', content: userData.text });
        bot.sendChatAction(msg.chat.id, 'record_voice');
        const assistantData = await client.chat.completions.create({
            messages: gptCache.getMessages(msg.chat.id),
            model: 'gpt-4o',
        })
        bot.sendChatAction(msg.chat.id, 'record_voice');
        gptCache.addMessage(msg.chat.id, { role: 'user', content: assistantData.choices[0]?.message?.content });
        const spechAudio = await speech.create(
            {          
                input: assistantData.choices[0]?.message?.content || '', 
                model: 'tts-1-hd', 
                voice: 'echo', 
                response_format: 'mp3',
            }
        );
        bot.sendChatAction(msg.chat.id, 'record_voice');
        const buffer = Buffer.from(await spechAudio.arrayBuffer());
        fs.writeFileSync(assistantAudioPath, buffer);
        const assistantAudioFile = fs.createReadStream(assistantAudioPath);
        await bot.sendVoice(msg.chat.id, assistantAudioFile);   
        fs.unlinkSync(assistantAudioPath);
        fs.unlinkSync(userAudioPath);
    } catch (error) {
        console.log(error);
        if(fs.existsSync(assistantAudioPath)) {
            fs.unlinkSync(assistantAudioPath);
        }
        if(fs.existsSync(userAudioPath)) {
            fs.unlinkSync(userAudioPath);  
        }
    }
}