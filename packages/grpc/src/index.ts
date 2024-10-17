import { Server, ServerCredentials, ServerInterceptingCall } from "@grpc/grpc-js";
import { configure } from "./app";
import { AccessLogBuilder } from "./AccessLogBuilder";
import { WinstonLoggingService } from '@minimum-hourly-wage-in-japan/winston/src/WinstonLoggingService';
import { addReflection } from 'grpc-server-reflection'

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

const loggingService = new WinstonLoggingService({service: 'minimum-hourly-wage-in-japan-grpc-api'});
const server = new Server({
    interceptors: [
        (methodDescriptor, call) => {
            const builder = new AccessLogBuilder({path: methodDescriptor.path});
            return new ServerInterceptingCall(call, {
                start: (next) => {
                    next({
                        onReceiveMessage: (message, messageNext) => {
                            builder.setRequestMesssage(message);
                            messageNext(message);
                        },
                    });
                },
                sendMessage: (message, messageNext) => {
                    builder.setResponseMessage(message);
                    messageNext(message);
                },
                sendStatus: (status, statusNext) => {
                    builder.setResponseStatus(status)
                    if (methodDescriptor.path != "/grpc.reflection.v1alpha.ServerReflection/ServerReflectionInfo") {
                        loggingService.info(builder.build());
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