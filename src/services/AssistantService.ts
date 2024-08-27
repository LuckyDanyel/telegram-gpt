import { Injectable, HttpStatus } from '@nestjs/common';
import BaseException from 'src/exceptions/BaseException';
import OpenAI from 'openai';
import DialogService from 'src/services/DialogService';
import ThreadService from 'src/services/ThreadService';
import { DialogDTO } from 'src/DTO';

@Injectable()
export default class AssistantService {
    constructor(
        private readonly dialogService: DialogService,
        private readonly threadService: ThreadService,
    ) {}

    public async getAnswer(dialog: DialogDTO): Promise<OpenAI.Beta.Threads.Messages.Message> {
        const cacheDialog = await this.dialogService.getDialog(dialog);
        if(!cacheDialog) throw new BaseException({ error: 'Диалог не был найден', status: HttpStatus.BAD_REQUEST, message: 'getAnswer AssistantService' })
        this.dialogService.checkDialogLimits(cacheDialog);
        const answer = await this.threadService.runThread(cacheDialog.threadId);
        await this.dialogService.increaseAnswerCount(cacheDialog.id);
        return answer;
    }
}
