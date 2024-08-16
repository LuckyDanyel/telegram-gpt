import { Injectable, HttpStatus } from '@nestjs/common';
import BaseException from 'src/exceptions/BaseException';
import { Request } from 'express';
import OpenAI from 'openai';
import DialogService from 'src/services/DialogService';
import ThreadService from 'src/services/ThreadService';
@Injectable()
export default class AssistantService {
    constructor(
        private readonly dialogService: DialogService,
        private readonly threadService: ThreadService,
    ) {}

    public async getAnswer(request: Request): Promise<OpenAI.Beta.Threads.Messages.Message> {
        const dialog = await this.dialogService.getDialog(request);
        if(!dialog) throw new BaseException({ error: 'Диалог не был найден', status: HttpStatus.BAD_REQUEST, message: 'getAnswer AssistantService' })
        this.dialogService.checkDialogLimits(dialog);
        const answer = await this.threadService.runThread(dialog.threadId);
        await this.dialogService.increaseAnswerCount(dialog.id);
        return answer;
    }
}
