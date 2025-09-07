import { RestfulAdapter } from "./RestfulAdapter";
import express, { Request, Response } from "express";
import { InvalidArgumentError, UnexpectedError } from "@minimum-hourly-wage-in-japan/usecase/src/UseCaseError";
import { Interactor } from "@minimum-hourly-wage-in-japan/usecase/src/Interactor";
import { LoggingService } from "@minimum-hourly-wage-in-japan/usecase/src/LoggingService";
import request from "supertest";

type DummyInput = object;
type DummyOutput = object;

class DummyAdapter extends RestfulAdapter<DummyInput, DummyOutput> {
    interactor: Interactor<DummyInput, DummyOutput>;

    constructor(props: {
        loggingService: LoggingService;
        interactor: Interactor<DummyInput, DummyOutput>;
    }) {
        super(props);
        this.interactor = props.interactor;
    }

    override createInput(): DummyInput {
        return {};
    }
    override sendResponse(output: DummyOutput, res: Response): void {
        res.status(200).send(output);
    }
}

describe('RestfulAdapter', () => {

    describe('handleError', () => {
        const app = express();
        const loggingService: LoggingService = {
            info: jest.fn(),
            error: jest.fn(),
        };
        it('InvalidArgumentError発生時には400応答する', async () => {
            app.get('/usecase_error/invalid_argument', (req: Request, res: Response) => {
                const interactor = {
                    invoke: jest.fn().mockRejectedValue(new InvalidArgumentError({violations: [{property: 'arg', message: 'エラー'}]})),
                };
                new DummyAdapter({loggingService, interactor}).invoke(req, res);
            });
            const response = await request(app).get('/usecase_error/invalid_argument');
            expect(response.statusCode).toBe(400);
            expect(response.body).toStrictEqual({violations: [{property: 'arg', message: 'エラー'}]});
        });
        it('UnexpectedError発生時には500応答する', async () => {
            app.get('/usecase_error/unexpected', (req: Request, res: Response) => {
                const interactor = {
                    invoke: jest.fn().mockRejectedValue(new UnexpectedError({original: new Error()})),
                };
                new DummyAdapter({loggingService, interactor}).invoke(req, res);
            });
            const response = await request(app).get('/usecase_error/unexpected');
            expect(response.statusCode).toBe(500);
        });
        it('ユースケースで適切に変換できてないエラー発生時には500応答する', async () => {
            app.get('/error', (req: Request, res: Response) => {
                const interactor = {
                    invoke: jest.fn().mockRejectedValue(new Error()),
                };
                new DummyAdapter({loggingService, interactor}).invoke(req, res);
            });
            const response = await request(app).get('/error');
            expect(response.statusCode).toBe(500);
        });
    });
});