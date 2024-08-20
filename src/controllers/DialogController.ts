import { Controller, Get, HttpStatus, HttpCode, Req, Res, Post, Body } from '@nestjs/common';
import { Request, Response } from 'express';
import { MessageDTO } from 'src/DTO';
import OpenAI from 'openai';
import DialogService from 'src/services/DialogService';

@Controller('api/dialog')
export default class DialogController {
    constructor(
        private readonly dialogService: DialogService,
    ) {}

    @HttpCode(HttpStatus.OK)
    @Get('/messages')
    public async getAnswer(@Req() request: Request,  @Res({ passthrough: true }) response: Response): Promise<OpenAI.Beta.Threads.Messages.Message[]> {
        try {
            const messages = await this.dialogService.getDialogMessages(request);
            return messages;   
        } catch (error) {
            response.status(error?.status || 500).send(error);
        }
    }

    @HttpCode(HttpStatus.OK)
    @Post('/messages')
    public async sendMessage(
        @Body() messages: MessageDTO[],
        @Req() request: Request,  
        @Res({ passthrough: true }) response: Response
    ): Promise<{ dialogId: string, message: OpenAI.Beta.Threads.Messages.Message }> {
        try {
            const dialogMessages = await this.dialogService.sendMessage(request, response, messages);
            return dialogMessages;   
        } catch (error) {
            response.status(error?.status || 500).send(error);
        }
    }
}
