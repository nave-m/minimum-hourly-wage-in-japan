import { Server, ServerCredentials, ServerInterceptingCall } from "@grpc/grpc-js";
import { configure } from "./app";
import { WinstonLoggingService } from '@minimum-hourly-wage-in-japan/winston/src/WinstonLoggingService';
import { addReflection } from 'grpc-server-reflection'
import { Message } from "google-protobuf";
import { PartialStatusObject } from "@grpc/grpc-js/build/src/call-interface";

const getPort = (mayBePortText: string | undefined): number => {
    const DEFAULT_PORT = 3000;
    if (mayBePortText == null) {
        return DEFAULT_PORT;
    }
    const mayBePortNumber = Number(mayBePortText);
    if (Number.isNaN(mayBePortNumber)) {
        return DEFAULT_PORT;
    } else {
        return mayBePortNumber;
    }
}
const port = getPort(process.env.GRPC_API_PORT);
const host = `localhost:${port}`;

const loggingService = new WinstonLoggingService({service: 'minimum-hourly-wage-in-japan-grpc-api'})
type AccessLoggingContext = {
    request?: object;
    response?: object;
    status?: PartialStatusObject;
};

const server = new Server({
    interceptors: [
        (methodDescriptor, call) => {
            const context: AccessLoggingContext = {};
            return new ServerInterceptingCall(call, {
                start: (next) => {
                    next({
                        onReceiveMetadata: (metadata, mdNext) => {
                            mdNext(metadata);
                        },
                        onReceiveMessage: (message, messageNext) => {
                            context.request = (message as Message).toObject();
                            messageNext(message);
                        },
                        onReceiveHalfClose: (hcNext) => {
                            hcNext();
                        },
                    });
                },
                sendMetadata: (metadata, mdNext) => {
                    mdNext(metadata);
                },
                sendMessage: (message, messageNext) => {
                    context.response = (message as Message).toObject();
                    messageNext(message);
                },
                sendStatus: (status, statusNext) => {
                    context.status = status;
                    if (methodDescriptor.path != "/grpc.reflection.v1alpha.ServerReflection/ServerReflectionInfo") {
                        loggingService.info({
                            message: 'access-log',
                            path: methodDescriptor.path,
                            ...context,
                        });
                    }
                    statusNext(status);
                },
            })
        }
    ],
});
addReflection(server, process.cwd() + '/src/gen/descriptor_set.bin');
configure({
    server,
    loggingService
}).bindAsync(host, ServerCredentials.createInsecure(), (error) => {
    if (error) {
        loggingService.error(error);
    } else {
        loggingService.info({message: `listening port: ${port}`});
    }
});