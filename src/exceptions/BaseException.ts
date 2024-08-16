import { HttpException } from "@nestjs/common";

interface BaseErrorParams {
    message: string,
    error: string,
    status: number,
};

export default class BaseException extends HttpException {
    public error: string;

    constructor(options: BaseErrorParams ) {
        super(null, options.status);
        this.message = options.message;
        this.error = options.error;
    }
}