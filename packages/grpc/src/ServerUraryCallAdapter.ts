import { InvalidArgumentError, UnexpectedError } from "@minimum-hourly-wage-in-japan/usecase/src/UseCaseError";
import { Interactor } from "@minimum-hourly-wage-in-japan/usecase/src/Interactor";
import { LoggingService } from "@minimum-hourly-wage-in-japan/usecase/src/LoggingService";
import { sendUnaryData, ServerUnaryCall} from "@grpc/grpc-js";
import { Metadata, ServiceError } from '@grpc/grpc-js';
import { Status } from "@grpc/grpc-js/build/src/constants";

export abstract class ServerUraryCallAdapter<Input, Output, Request, Response> {
    protected readonly loggingService: LoggingService;
    protected abstract readonly interactor: Interactor<Input,Output>;
    protected abstract createInput(request: Request): Input;
    protected abstract sendResponse(output: Output, callback: sendUnaryData<Response>): void;
    constructor(props: {
        loggingService: LoggingService;
    }) {
        this.loggingService = props.loggingService;
    }
    async invoke(call: ServerUnaryCall<Request, Response>, callback: sendUnaryData<Response>): Promise<void> {
        try {
            const input = this.createInput(call.request);
            const output = await this.interactor.invoke(input);
            this.sendResponse(output, callback);
        } catch (error: unknown) {
            callback(this.convertError(error));
        }
    }
    protected convertError(error: unknown): ServiceError {
        if (error instanceof InvalidArgumentError) {
            // TODO: violationsをMetadataに変換
            return this.createServiceError(Status.INVALID_ARGUMENT);
        } else if (error instanceof UnexpectedError) {
            this.loggingService.error(error.original);
            return this.createServiceError(Status.INTERNAL);
        } else {
            this.loggingService.error(error);
            return this.createServiceError(Status.INTERNAL);
        }
    }
    protected createServiceError(status: Status, metadata?: Metadata): ServiceError {
        return {
            // StatusObject
            code: status,
            details: Status[status],
            metadata: metadata ? metadata : new Metadata(),
            // Error
            name: Status[status],
            message: Status[status],
        };
    }
}