import { Request, Response } from "express";
import { InvalidArgumentError, UnexpectedError } from "../../usecase/UseCaseError";
import { Interactor } from "../../usecase/Interactor";

export abstract class RestfulAdapter<Input,Output> {
    protected abstract readonly interactor: Interactor<Input,Output>
    protected abstract createInput(req: Request): Input
    protected abstract sendResponse(output: Output, res: Response): void
    async invoke(req: Request, res: Response): Promise<void> {
        try {
            const input = this.createInput(req);
            const output = await this.interactor.invoke(input);
            this.sendResponse(output, res);
        } catch (error: unknown) {
            this.handleError(error, res);
        }
    }
    protected handleError(error: unknown, res: Response): void {
        if (error instanceof InvalidArgumentError) {
            res.status(400).send({violations: error.violations});
        } else if (error instanceof UnexpectedError) {
            res.status(500);
        } else {
            res.status(500);
        }
    }
}