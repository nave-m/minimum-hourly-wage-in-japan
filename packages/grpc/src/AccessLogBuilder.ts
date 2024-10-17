import { Metadata } from "@grpc/grpc-js";
import { Message } from "google-protobuf";
import { PartialStatusObject } from "@grpc/grpc-js/build/src/call-interface";
import { BadRequest } from "./gen/google/rpc/error_details_pb";

export class AccessLogBuilder {
    private readonly path: string;
    private requestMessage?: Message;
    private responseMessage?: Message;
    private responseStatus?: PartialStatusObject;
    constructor(props: {
        path: string;
    }) {
        this.path = props.path;
    }
    setRequestMesssage(message: unknown): AccessLogBuilder {
        if (message instanceof Message) {
            this.requestMessage = message;
        }
        return this;
    }
    setResponseMessage(message: unknown): AccessLogBuilder {
        if (message instanceof Message) {
            this.responseMessage = message;
        }
        return this;
    }
    setResponseStatus(status: PartialStatusObject): AccessLogBuilder {
        this.responseStatus = status;
        return this;
    }
    build(): object {
        return {
            message: 'access-log',
            request: {
                path: this.path,
                message: this.requestMessage?.toObject() || undefined,
            },
            response: {
                status: this.responseStatus ? {
                    code: this.responseStatus.code,
                    details: this.responseStatus.details,
                    metadata: this.responseStatus.metadata,
                    badrequest: this.extractBadRequest(this.responseStatus.metadata)?.toObject(),
                } : undefined,
                message: this.responseMessage?.toObject(),
            },
        }
    }
    private extractBadRequest(mayBeMetadata?: Metadata | null): BadRequest | undefined {
        if (mayBeMetadata == null) {
            return undefined;
        }
        const metadataValues = mayBeMetadata.get('google.rpc.BadRequest-bin');
        if (metadataValues.length === 0) {
            return undefined
        }
        const mayBeBuffer = metadataValues[0];
        if (mayBeBuffer instanceof Buffer) {
            return BadRequest.deserializeBinary(mayBeBuffer);
        } else {
            return undefined;
        }   
    }
}