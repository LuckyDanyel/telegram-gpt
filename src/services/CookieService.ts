import { Injectable } from '@nestjs/common';
import { Response } from 'express';

@Injectable()
export default class CookieService {
    constructor() {
    }

    public set(response: Response, key: string, value: string, options: { expires: number }) {
        response.cookie(key, value, { 
            domain: process.env.SERVER_DOMAIN,
            secure: true,
            httpOnly: true,
            sameSite: 'strict',
            expires: new Date(Date.now() + options.expires)
        });
    }

}
