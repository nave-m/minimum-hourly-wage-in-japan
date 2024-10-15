import { InvalidArgumentError, UnexpectedError, Violation } from "@minimum-hourly-wage-in-japan/usecase/src/UseCaseError";
import { Interactor } from "@minimum-hourly-wage-in-japan/usecase/src/Interactor";
import { LoggingService } from "@minimum-hourly-wage-in-japan/usecase/src/LoggingService";
import { sendUnaryData, ServerUnaryCall} from "@grpc/grpc-js";
import { Metadata, ServiceError } from '@grpc/grpc-js';
import { Status } from "@grpc/grpc-js/build/src/constants";
import { BadRequest } from "./gen/google/rpc/error_details_pb";

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
            return this.createServiceError(Status.INVALID_ARGUMENT, this.createMetadata(error.violations));
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
    protected createMetadata(violations: Violation[]): Metadata {
        const metadata = new Metadata();
        const badRequest = new BadRequest();
        badRequest.setFieldViolationsList(violations.map((violation) => {
            const fieldViolation = new BadRequest.FieldViolation();
            fieldViolation.setField(violation.property);
            fieldViolation.setDescription(violation.message);
            return fieldViolation;
        }));
        metadata.add('google.rpc.BadRequest-bin', Buffer.from(badRequest.serializeBinary()));
        return metadata;
    }
}