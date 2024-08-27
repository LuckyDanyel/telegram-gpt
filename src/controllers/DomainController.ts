import { Controller, Get, HttpStatus, HttpCode, Req, Res, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

@Controller('/api')
export default class DomainController {

    @HttpCode(HttpStatus.OK)
    @Get('')
    public async getAnswer(@Req() request: Request,  @Res({ passthrough: true }) response: Response): Promise<string> {
        
        try {
            return `
            <script>
                            
            function init() {
            console.log('init');
                    async function getData(url, requestInit) {
                        try {
                          const data = await fetch(url, {
                            ...requestInit
                          });
                          return data.json();
                        } catch (error) {
                          throw error;
                        }
                    }
        window.parent.postMessage({ type: "init", domain: '${process.env.SERVER_URL}' }, "*");
        window.addEventListener("message", async (event) => {
            const message = event.data;
            if (message.domain === '${process.env.SERVER_URL}' && message.type === "request") {
                try {
                  const data = await getData(message.url, message.options);
                  const req = {
                    data,
                    domain: '${process.env.SERVER_URL}',
                    id: message.id,
                    type: "response"
                  };
                  window.parent.postMessage(req, "*");
                } catch (error) {
                const errorReq = {
                  data: null,
                  domain: '${process.env.SERVER_URL}',
                  id: message.id,
                  error: error?.error,
                  status: error?.status,
                  type: "response"
                };
                window.parent.postMessage(errorReq, "*");
            }
          }
        });
        }
        init();
            </script>
            `
        } catch (error) {
            
        }
    }
}
