import { Request, Response } from "express";
import { InvalidArgumentError, UnexpectedError } from "@minimum-hourly-wage-in-japan/usecase/src/UseCaseError";
import { Interactor } from "@minimum-hourly-wage-in-japan/usecase/src/Interactor";
import { LoggingService } from "@minimum-hourly-wage-in-japan/usecase/src/LoggingService";
import { components } from "./gen/schema";

type BadRequestResponseBodyType = components["schemas"]["BadRequestResponseBody"];

export abstract class RestfulAdapter<Input,Output> {
    protected readonly loggingService: LoggingService;
    protected abstract readonly interactor: Interactor<Input,Output>;
    protected abstract createInput(req: Request): Input;
    protected abstract sendResponse(output: Output, res: Response): void;
    constructor(props: {
        loggingService: LoggingService;
    }) {
        this.loggingService = props.loggingService;
    }
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
            const responseBody: BadRequestResponseBodyType = {violations: error.violations};
            res.status(400).send(responseBody);
        } else if (error instanceof UnexpectedError) {
            this.loggingService.error(error.original);
            res.status(500);
        } else {
            this.loggingService.error(error);
            res.status(500);
        }
    }
}