import OpenAi from 'openai';

export default class GPTCache {

    static cache: Record<string, Array<OpenAi.ChatCompletionMessageParam>> = {};
    static lateDate: Date = new Date();

    constructor() {
    
    }

    addMessage(id: number, message: OpenAi.ChatCompletionMessageParam): void {
        const messageDate = new Date();
        
        const differenceInMilliseconds = Math.abs(messageDate.getTime() - GPTCache.lateDate.getTime());
        const differenceInHours = differenceInMilliseconds / (1000 * 60 * 60);
    
        if (differenceInHours === 1) {
            GPTCache.lateDate = new Date();
            GPTCache.cache[id] = [];
        }
        if(GPTCache.cache[id]) {
            GPTCache.cache[id].push(message);
        } else {
            GPTCache.cache[id] = [];
            GPTCache.cache[id].push(message);
        }
    }

    getMessages(id: number):  Array<OpenAi.ChatCompletionMessageParam> {
        return GPTCache.cache[id];
    }
}