import { Controller, Post, HttpStatus, HttpCode, Req, Res, } from '@nestjs/common';
import { Request, Response } from 'express';
import AssistantService from 'src/services/AssistantService';
import OpenAI from 'openai';

@Controller('api/assistant')
export default class AssistantController {
    constructor(
        private readonly assistantService: AssistantService,
    ) {}

    @HttpCode(HttpStatus.OK)
    @Post('/answer')
    public async getAnswer(
        @Req() request: Request, 
        @Res({ passthrough: true }) response: Response
    ): Promise<OpenAI.Beta.Threads.Messages.Message> {
        try {
            const answer = await this.assistantService.getAnswer(request);
            return answer;
        } catch (error: any) {
            response.status(error?.status || 500).send(error);
        }
    }
}
