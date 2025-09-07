import { ServerUraryCallAdapter } from "./ServerUraryCallAdapter";
import { LoggingService } from '@minimum-hourly-wage-in-japan/usecase/src/LoggingService';
import { Interactor } from '@minimum-hourly-wage-in-japan/usecase/src/Interactor';
import { ChannelCredentials, sendUnaryData, Server, ServerCredentials, ServerUnaryCall } from "@grpc/grpc-js";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { HealthCheckRequest, HealthCheckResponse } from "./gen/grpc/health/v1/health_pb";
import { HealthClient, HealthService } from "./gen/grpc/health/v1/health_grpc_pb";

type DummyInput = object;
type DummyOutput = object;
class DummyAdapter extends ServerUraryCallAdapter<DummyInput, DummyOutput, HealthCheckRequest, HealthCheckResponse> {
    interactor: Interactor<DummyInput, DummyOutput>; // 後でinvokeを上書きできるようにpublic
    constructor(props: {
        loggingService: LoggingService;
        interactor: Interactor<DummyInput, DummyOutput>;
    }) {
        super(props);
        this.interactor = props.interactor;
    }
    override createInput() {
        return {};
    }
    override sendResponse() {

    }
}

describe('ServerUraryCallAdapter', () => {
    const loggingService: LoggingService = {
        info: jest.fn(),
        error: jest.fn(),
    };
    const mockOfInvoke = jest.fn();
    const interactor = {
        invoke: mockOfInvoke,
    };
    const host = 'localhost:3000';
    const server = new Server();
    const dummyAdapter = new DummyAdapter({loggingService, interactor});
    beforeAll(() => {
        server.addService(HealthService, {
            check: (
                call: ServerUnaryCall<HealthCheckRequest, HealthCheckResponse>,
                callback: sendUnaryData<HealthCheckResponse>,
            ): void => {
                dummyAdapter.invoke(call, callback);
            }
        });
        server.bindAsync(host, ServerCredentials.createInsecure(), (error) => {
            if (error) {
                throw error;
            }
        });
    });
    afterAll(() => {
        server.forceShutdown();
    });
    describe('error handling', () => {
        const client = new HealthClient(host, ChannelCredentials.createInsecure());
        it('エラー発生時にはINTERNAL応答', async () => {
            dummyAdapter.interactor.invoke = jest.fn().mockRejectedValueOnce(new Error());
            const serviceError = await new Promise<HealthCheckResponse>((resolve, reject) => {
                const request = new HealthCheckRequest();
                client.check(request, (error, response) => {
                    if(response) {
                        resolve(response)
                    } else {
                        reject(error);
                    }
                });
            }).catch((error) => error);
            expect(serviceError.code).toBe(Status.INTERNAL);
        });
    });
})