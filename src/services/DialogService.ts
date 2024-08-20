import { Injectable, Inject, HttpStatus } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { v4 } from 'uuid';
import { Request, Response } from 'express';
import OpenAI from 'openai';
import DialogEntitiy from 'src/entities/DialogEntitiy';
import BaseException from 'src/exceptions/BaseException';
import ThreadService from 'src/services/ThreadService';
import { MessageDTO } from 'src/DTO';

@Injectable()
export default class DialogService {

    cacheTime: number;

    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private readonly threadService: ThreadService,
    ) {
        const dayMilliseconds = 24 * 60 * 60 * 1000
        this.cacheTime = dayMilliseconds;
    }

    public async createDialog(request: Request, response: Response): Promise<DialogEntitiy> {
        try {
            const cacheDialog = await this.getDialog(request);
            if(cacheDialog) return cacheDialog;

            const threadId = await this.threadService.createThread();
    
            const uuid = v4();

            const newDialog = {
                id: `dialog_${uuid}`,
                threadId: threadId,
                answerCount: 0,
            }

            await this.cacheManager.set(newDialog.id, JSON.stringify(newDialog), this.cacheTime);
            response.cookie('dialogId', newDialog.id, { httpOnly: true, domain: 'luckydanyel.ru', sameSite: 'none' });
            return newDialog;
        } catch (error) {
            throw new BaseException({
                error: 'Service: DialogService method: createDialog',
                message: 'Ошибка создания Диалога',
                status: HttpStatus.BAD_REQUEST,
            })
        }
    }

    public async getDialog(request: Request): Promise<null | DialogEntitiy> {
        try {
            const dialogId = request.cookies['dialogId'];
            const cacheDialog = await this.cacheManager.get<string>(dialogId);
            if(cacheDialog) {
                return JSON.parse(cacheDialog);
            }
            return null;
        } catch (error) {
            return null;
        }
    };

    public checkDialogLimits(dialog: DialogEntitiy): boolean {
        const dialogAnswersLimit = 5;
        const hasDialogAnswersLimitted = dialog.answerCount >= dialogAnswersLimit;

        if(hasDialogAnswersLimitted) throw new BaseException({
            error: 'Service: DialogService method checkDialogLimits',
            message: 'Превышено количество ответов бота',
            status: HttpStatus.UNPROCESSABLE_ENTITY,
        });

        return true;
    }

    public async increaseAnswerCount(dialogId: DialogEntitiy['id']): Promise<boolean> {
        try {
            const dialog: string = await this.cacheManager.get(dialogId);
            if(dialog) {
                const parsedDialog: DialogEntitiy = JSON.parse(dialog);
                const updatedDialog: DialogEntitiy = {
                    ...parsedDialog,
                    answerCount: parsedDialog.answerCount + 1,
                }
                await this.cacheManager.set(dialogId, JSON.stringify(updatedDialog), this.cacheTime);

                return true;
            }
            throw new BaseException({
                error: 'Service: DialogService method increaseAnswerCount',
                message: 'Диалог не был найден',
                status: HttpStatus.BAD_REQUEST
            })
        } catch (error) {
            throw new BaseException({
                error: 'Service: DialogService method increaseAnswerCount',
                message: 'Ошибка увеличения количества полученных ответов',
                status: HttpStatus.BAD_REQUEST
            })
        }
    }

    public async getDialogMessages(request: Request): Promise<OpenAI.Beta.Threads.Messages.Message[]> {
        const dialogId = request.cookies['dialogId'];
        const dialog: string = await this.cacheManager.get(dialogId);
        if(!dialog) {
            return [];
        }

        const parsedDialog: DialogEntitiy = JSON.parse(dialog);

        return this.threadService.getMessages(parsedDialog.threadId);   
    }

    public async sendMessage(request: Request, response: Response, messages: MessageDTO[]): Promise<OpenAI.Beta.Threads.Messages.Message> {
        try {
            const dialog = await this.createDialog(request, response);
            const message = await this.threadService.sendMessage(dialog.threadId, messages);
            return message;
        } catch (error) {
            throw error;
        }
    }
}
