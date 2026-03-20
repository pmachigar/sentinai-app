import { RawBodyRequest } from '@nestjs/common';
import { Request, Response } from 'express';
export declare class BillingController {
    handleWebhook(req: RawBodyRequest<Request>, res: Response, signature: string): Promise<Response<any, Record<string, any>> | undefined>;
}
