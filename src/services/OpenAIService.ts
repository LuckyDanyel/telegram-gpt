import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export default class OpenAIService {
    public getClient(): OpenAI {
        const { OPEN_AI_API_KEY } = process.env;
        return new OpenAI({
            apiKey: OPEN_AI_API_KEY,
        });          
    }
}
